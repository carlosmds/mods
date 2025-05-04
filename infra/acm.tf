
# ACM certificate
resource "aws_acm_certificate" "main" {
  count             = var.aws_local ? 0 : 1
  domain_name       = var.cloudflare_zone_name
  validation_method = "DNS"

  subject_alternative_names = [
    var.dns_addresses.api_gateway,
    var.dns_addresses.cloudfront
  ]

  lifecycle {
    create_before_destroy = true
  }
}

# ACM certificate validation
resource "aws_acm_certificate_validation" "main" {
  count                   = var.aws_local ? 0 : 1
  certificate_arn         = aws_acm_certificate.main[0].arn
  validation_record_fqdns = [for record in cloudflare_record.acm_validation : record.hostname]
}
