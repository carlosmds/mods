# Get Cloudflare zone
data "cloudflare_zone" "main" {
  name = var.cloudflare_zone_name
}

# ACM validation records in Cloudflare
resource "cloudflare_record" "acm_validation" {
  for_each = var.aws_local ? {} : {
    for dvo in aws_acm_certificate.main[0].domain_validation_options : dvo.domain_name => {
      # remove zone name from record name
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id = data.cloudflare_zone.main.id
  name    = each.value.name
  value   = each.value.record
  type    = each.value.type
  proxied = false
  ttl     = 1

  allow_overwrite = true
}

# API Gateway DNS record
resource "cloudflare_record" "api_gateway" {
  count   = var.aws_local ? 0 : 1
  zone_id = data.cloudflare_zone.main.id
  name    = var.dns_addresses.api_gateway
  value   = local.backend_api_domain
  type    = "CNAME"
  proxied = true
  ttl     = 1
}

# CloudFront DNS record
resource "cloudflare_record" "cloudfront" {
  count   = var.aws_local ? 0 : 1
  zone_id = data.cloudflare_zone.main.id
  name    = var.dns_addresses.cloudfront
  value   = aws_cloudfront_distribution.frontend[0].domain_name
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
