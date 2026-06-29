import {
  S3Client,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  DeletePublicAccessBlockCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";

const REGION = process.env.AWS_REGION || "us-east-1";
const BUCKETS = ["motionadrenaline-uploads", "motionadrenaline-media"];

const s3 = new S3Client({ region: REGION });

async function bucketExists(name) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: name }));
    return true;
  } catch {
    return false;
  }
}

async function createBucket(name) {
  if (await bucketExists(name)) {
    console.log(`  ✓ ${name} already exists`);
    return;
  }
  const cmd =
    REGION === "us-east-1"
      ? new CreateBucketCommand({ Bucket: name })
      : new CreateBucketCommand({
          Bucket: name,
          CreateBucketConfiguration: { LocationConstraint: REGION },
        });
  await s3.send(cmd);
  console.log(`  ✓ ${name} created`);
}

async function removePublicAccessBlock(name) {
  await s3.send(new DeletePublicAccessBlockCommand({ Bucket: name }));
  console.log(`  ✓ ${name} public access block removed`);
}

async function setCors(name) {
  await s3.send(
    new PutBucketCorsCommand({
      Bucket: name,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["*"],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedOrigins: ["*"],
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3000,
          },
        ],
      },
    })
  );
  console.log(`  ✓ ${name} CORS configured`);
}

async function setPublicReadPolicy(name) {
  const policy = JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicRead",
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${name}/*`,
      },
    ],
  });
  await s3.send(new PutBucketPolicyCommand({ Bucket: name, Policy: policy }));
  console.log(`  ✓ ${name} public-read policy applied`);
}

async function main() {
  console.log(`\nSetting up S3 buckets in ${REGION}\n`);

  for (const bucket of BUCKETS) {
    console.log(`--- ${bucket}`);
    await createBucket(bucket);
    await removePublicAccessBlock(bucket);
    await setCors(bucket);
  }

  // Only the uploads bucket needs public read (serves previews in the browser)
  console.log(`\n--- Public-read policy`);
  await setPublicReadPolicy("motionadrenaline-uploads");

  console.log(`
Done. Both buckets are ready.

Next: add these to Vercel environment variables:
  AWS_REGION=${REGION}
  AWS_ACCESS_KEY_ID=<your-key>
  AWS_SECRET_ACCESS_KEY=<your-secret>
`);
}

main().catch((err) => {
  console.error("\n✗ Setup failed:", err.message);
  if (err.name === "CredentialsProviderError" || err.Code === "InvalidAccessKeyId") {
    console.error(
      "  Set AWS credentials first:\n" +
      "  export AWS_ACCESS_KEY_ID=...\n" +
      "  export AWS_SECRET_ACCESS_KEY=...\n" +
      "  export AWS_REGION=us-east-1"
    );
  }
  process.exit(1);
});
