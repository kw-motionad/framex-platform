#!/bin/bash
set -e

REGION="${AWS_REGION:-us-east-1}"
UPLOADS="motionadrenaline-uploads"
MEDIA="motionadrenaline-media"

echo "==> Creating S3 buckets in $REGION"

for BUCKET in "$UPLOADS" "$MEDIA"; do
  echo "--- $BUCKET"

  if [ "$REGION" = "us-east-1" ]; then
    aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" 2>/dev/null \
      && echo "    Created" || echo "    Already exists"
  else
    aws s3api create-bucket --bucket "$BUCKET" --region "$REGION" \
      --create-bucket-configuration LocationConstraint="$REGION" 2>/dev/null \
      && echo "    Created" || echo "    Already exists"
  fi

  # Allow public reads (presigned PUTs write in; public GETs serve previews)
  aws s3api delete-public-access-block --bucket "$BUCKET"

  aws s3api put-bucket-cors --bucket "$BUCKET" --cors-configuration '{
    "CORSRules": [{
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }]
  }'
  echo "    CORS configured"
done

# Public-read policy so <img src> and <iframe src> work without auth
aws s3api put-bucket-policy --bucket "$UPLOADS" --policy "{
  \"Version\": \"2012-10-17\",
  \"Statement\": [{
    \"Sid\": \"PublicRead\",
    \"Effect\": \"Allow\",
    \"Principal\": \"*\",
    \"Action\": \"s3:GetObject\",
    \"Resource\": \"arn:aws:s3:::${UPLOADS}/*\"
  }]
}"
echo "--- Public-read policy applied to $UPLOADS"

echo ""
echo "==> Done. Add these to Vercel environment variables:"
echo "    AWS_REGION=$REGION"
echo "    AWS_ACCESS_KEY_ID=<your-key>"
echo "    AWS_SECRET_ACCESS_KEY=<your-secret>"
