#!/bin/bash
set -e

# Check if required environment variables are set
if [ -z "$BUCKET_NAME" ] || [ -z "$DISTRIBUTION_ID" ]; then
  echo "Error: BUCKET_NAME and DISTRIBUTION_ID environment variables must be set"
  exit 1
fi

# Navigate to frontend directory
cd "$(dirname "$0")/../../frontend"

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Upload to S3
echo "Uploading to S3 bucket: $BUCKET_NAME..."
aws s3 sync dist/ "s3://$BUCKET_NAME/" --delete

# Create CloudFront invalidation
echo "Creating CloudFront invalidation..."
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"

echo "Deployment completed successfully!" 