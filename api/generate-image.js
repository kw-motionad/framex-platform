import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKET = "motionadrenaline-uploads";

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
  },
});

function falImageSize(aspectRatio) {
  if (aspectRatio === "16:9") return "landscape_16_9";
  if (aspectRatio === "9:16") return "portrait_16_9";
  if (aspectRatio === "1:1") return "square_hd";
  return "landscape_4_3";
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return res.status(503).json({ error: "FAL_KEY not configured in Vercel environment variables." });
  }

  const { prompt, folder = "", aspectRatio = "4:3" } = req.body || {};
  if (!prompt || !prompt.trim()) return res.status(400).json({ error: "prompt required" });

  try {
    const falRes = await fetch("https://fal.run/fal-ai/flux/dev", {
      method: "POST",
      headers: {
        Authorization: `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        image_size: falImageSize(aspectRatio),
        num_images: 1,
      }),
    });
    if (!falRes.ok) {
      const errText = await falRes.text();
      throw new Error(`fal.ai ${falRes.status}: ${errText.slice(0, 300)}`);
    }
    const falData = await falRes.json();
    const falImageUrl = falData?.images?.[0]?.url;
    if (!falImageUrl) throw new Error("fal.ai returned no image");

    // Pull the generated image down and store it in our own bucket, next to
    // every other asset, instead of linking to fal's CDN long-term.
    const imgRes = await fetch(falImageUrl);
    if (!imgRes.ok) throw new Error(`failed to fetch generated image: ${imgRes.status}`);
    const buffer = Buffer.from(await imgRes.arrayBuffer());
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.includes("png") ? "png" : "jpg";
    const key = [folder, `ai_${Date.now()}.${ext}`].filter(Boolean).join("/");

    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buffer, ContentType: contentType }));
    const fileUrl = `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`;

    res.json({ fileUrl, prompt });
  } catch (err) {
    console.error("[generate-image] error:", err.message);
    res.status(500).json({ error: err.message });
  }
}
