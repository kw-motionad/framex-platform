import { MediaConvertClient, CreateJobCommand } from "@aws-sdk/client-mediaconvert";

const REGION = process.env.AWS_REGION || "us-east-1";
const INPUT_BUCKET  = "motionadrenaline-uploads";
// Outputs go to the uploads bucket (already public) unless a dedicated media bucket is configured
const OUTPUT_BUCKET = process.env.AWS_MEDIA_BUCKET || "motionadrenaline-uploads";
const ROLE_ARN  = process.env.AWS_MEDIACONVERT_ROLE;
const ENDPOINT  = process.env.AWS_MEDIACONVERT_ENDPOINT;
const CF_DOMAIN = process.env.CLOUDFRONT_DOMAIN; // optional CloudFront distribution

function getRenditions(format, quality) {
  if (quality === "master" || format === "prores") {
    return [{ name: "master", width: 3840, height: 2160, bitrate: 50_000_000 }];
  }
  if (quality === "high") {
    return [
      { name: "2160p", width: 3840, height: 2160, bitrate: 20_000_000 },
      { name: "1080p", width: 1920, height: 1080, bitrate: 8_000_000 },
      { name: "720p",  width: 1280, height: 720,  bitrate: 4_000_000 },
    ];
  }
  // web (default)
  return [
    { name: "1080p", width: 1920, height: 1080, bitrate: 5_000_000 },
    { name: "720p",  width: 1280, height: 720,  bitrate: 3_000_000 },
    { name: "480p",  width: 854,  height: 480,  bitrate: 1_500_000 },
  ];
}

function hlsOutput(r) {
  return {
    NameModifier: `_${r.name}`,
    ContainerSettings: { Container: "M3U8", M3u8Settings: {} },
    VideoDescription: {
      Width: r.width, Height: r.height,
      CodecSettings: {
        Codec: "H_264",
        H264Settings: {
          MaxBitrate: r.bitrate,
          RateControlMode: "QVBR",
          QualityTuningLevel: "MULTI_PASS_HQ",
          SceneChangeDetect: "TRANSITION_DETECTION",
        },
      },
    },
    AudioDescriptions: [{
      AudioSourceName: "Audio Selector 1",
      CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 96000, SampleRate: 48000 } },
    }],
  };
}

function mp4Output(r, codec) {
  const codecKey = codec === "H_265" ? "H265Settings" : "H264Settings";
  return {
    ContainerSettings: { Container: "MP4" },
    VideoDescription: {
      Width: r.width, Height: r.height,
      CodecSettings: {
        Codec: codec,
        [codecKey]: { MaxBitrate: r.bitrate, RateControlMode: "QVBR" },
      },
    },
    AudioDescriptions: [{
      AudioSourceName: "Audio Selector 1",
      CodecSettings: { Codec: "AAC", AacSettings: { Bitrate: 192000, SampleRate: 48000 } },
    }],
  };
}

function proresOutput(r) {
  return {
    ContainerSettings: { Container: "MOV" },
    VideoDescription: {
      Width: r.width, Height: r.height,
      CodecSettings: {
        Codec: "PRORES",
        ProresSettings: { CodecProfile: "APPLE_PRORES_422", FramerateControl: "INITIALIZE_FROM_SOURCE" },
      },
    },
    AudioDescriptions: [{
      AudioSourceName: "Audio Selector 1",
      CodecSettings: { Codec: "PCM", PcmSettings: { BitDepth: 24, Channels: 2, SampleRate: 48000 } },
    }],
  };
}

function buildSettings(inputUri, outputDest, format, quality) {
  const renditions = getRenditions(format, quality);

  let outputGroup;
  if (format === "hls") {
    outputGroup = {
      Name: "HLS",
      OutputGroupSettings: {
        Type: "HLS_GROUP_SETTINGS",
        HlsGroupSettings: {
          Destination: outputDest,
          SegmentLength: 6,
          MinSegmentLength: 0,
          DirectoryStructure: "SINGLE_DIRECTORY",
          ManifestDurationFormat: "INTEGER",
        },
      },
      Outputs: renditions.map(r => hlsOutput(r)),
    };
  } else if (format === "prores") {
    outputGroup = {
      Name: "ProRes",
      OutputGroupSettings: { Type: "FILE_GROUP_SETTINGS", FileGroupSettings: { Destination: outputDest } },
      Outputs: [proresOutput(renditions[0])],
    };
  } else {
    const codec = format === "mp4_h265" ? "H_265" : "H_264";
    outputGroup = {
      Name: "MP4",
      OutputGroupSettings: { Type: "FILE_GROUP_SETTINGS", FileGroupSettings: { Destination: outputDest } },
      Outputs: [mp4Output(renditions[0], codec)],
    };
  }

  return {
    Inputs: [{
      FileInput: inputUri,
      AudioSelectors: { "Audio Selector 1": { DefaultSelection: "DEFAULT" } },
      VideoSelector: {},
    }],
    OutputGroups: [outputGroup],
  };
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  if (!ROLE_ARN || !ENDPOINT) {
    return res.status(503).json({
      error: "AWS_MEDIACONVERT_ROLE and AWS_MEDIACONVERT_ENDPOINT must be set in Vercel environment variables.",
    });
  }

  const { s3Key, format = "hls", quality = "web", outputKey } = req.body || {};
  if (!s3Key) return res.status(400).json({ error: "s3Key required" });

  const client = new MediaConvertClient({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    },
  });

  const inputUri   = `s3://${INPUT_BUCKET}/${s3Key}`;
  const outPrefix  = outputKey || `encoded/${Date.now()}`;
  const outputDest = `s3://${OUTPUT_BUCKET}/${outPrefix}/`;
  const settings   = buildSettings(inputUri, outputDest, format, quality);

  try {
    const result = await client.send(new CreateJobCommand({ Role: ROLE_ARN, Settings: settings }));
    const jobId  = result.Job.Id;
    const hlsBase = CF_DOMAIN
      ? `https://${CF_DOMAIN}/${outPrefix}`
      : `https://${OUTPUT_BUCKET}.s3.${REGION}.amazonaws.com/${outPrefix}`;
    res.json({ jobId, hlsBase, outputKey: outPrefix });
  } catch (err) {
    console.error("[transcode] MediaConvert error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
