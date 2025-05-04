
provider "aws" {
  region = var.aws_region

  dynamic "endpoints" {
    for_each = var.aws_local ? [1] : []
    content {
      acm        = "http://localhost:4566"
      apigateway = "http://localhost:4566"
      cloudfront = "http://localhost:4566"
      dynamodb   = "http://localhost:4566"
      iam        = "http://localhost:4566"
      lambda     = "http://localhost:4566"
      logs       = "http://localhost:4566"
      s3         = "http://localhost:4566"
      ssm        = "http://localhost:4566"
    }
  }

  skip_credentials_validation = var.aws_local
  skip_metadata_api_check     = var.aws_local
  skip_requesting_account_id  = var.aws_local

  default_tags {
    tags = {
      Project     = var.project_name
      Environment = var.environment
    }
  }
}