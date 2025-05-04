# CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "frontend" {
  count                             = var.aws_local ? 0 : 1
  name                              = "${var.project_name}-frontend-oac"
  description                       = "OAC for ${var.project_name}-frontend-${var.environment}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront distribution
resource "aws_cloudfront_distribution" "frontend" {
  count = var.aws_local ? 0 : 1
  origin {
    domain_name              = aws_s3_bucket.frontend[0].bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend[0].id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend[0].id
  }

  enabled             = true
  default_root_object = "index.html"
  aliases             = [var.dns_addresses.cloudfront]

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend[0].id}"

    forwarded_values {
      query_string = true
      cookies {
        forward = "none"
      }
    }
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.main[0].certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }
}