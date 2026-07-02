import { MediaConvertClient, GetJobCommand } from "@aws-sdk/client-mediaconvert";

const REGION   = process.env.AWS_REGION || "us-east-1";
const ENDPOINT = process.env.AWS_MEDIACONVERT_ENDPOINT;

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  if (req.method !== "GET") return res.status(405).end();

  const { jobId } = req.query;
  if (!jobId) return res.status(400).json({ error: "jobId required" });
  if (!ENDPOINT) return res.status(503).json({ error: "AWS_MEDIACONVERT_ENDPOINT not configured" });

  const client = new MediaConvertClient({
    region: REGION,
    endpoint: ENDPOINT,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      ...(process.env.AWS_SESSION_TOKEN ? { sessionToken: process.env.AWS_SESSION_TOKEN } : {}),
    },
  });

  try {
    const result = await client.send(new GetJobCommand({ Id: jobId }));
    const job = result.Job;
    res.json({
      status:   job.Status,               // SUBMITTED | PROGRESSING | COMPLETE | CANCELED | ERROR
      progress: job.JobPercentComplete || 0,
      error:    job.ErrorMessage || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
