# S3 bucket for static website hosting
resource "aws_s3_bucket" "frontend" {
  count         = var.aws_local ? 0 : 1
  bucket        = "${var.project_name}-frontend-${var.environment}"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  count  = var.aws_local ? 0 : 1
  bucket = aws_s3_bucket.frontend[0].id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "frontend" {
  count  = var.aws_local ? 0 : 1
  bucket = aws_s3_bucket.frontend[0].id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Data source for AWS account ID
data "aws_caller_identity" "current" {}

# S3 bucket policy to allow CloudFront OAC access
resource "aws_s3_bucket_policy" "frontend" {
  count  = var.aws_local ? 0 : 1
  bucket = aws_s3_bucket.frontend[0].id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend[0].arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/${aws_cloudfront_distribution.frontend[0].id}"
          }
        }
      }
    ]
  })
}