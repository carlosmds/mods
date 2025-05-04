variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment (e.g., dev, staging, prod)"
  type        = string
}

# OpenTofu
variable "encryption_key" {
  type      = string
  sensitive = true
}

# AWS
variable "aws_local" {
  type    = bool
  default = true
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

# Parameters
variable "jwt_secret" {
  type      = string
  sensitive = true
}

variable "mailjet_api_key" {
  type      = string
  sensitive = true
}

variable "mailjet_secret_key" {
  type      = string
  sensitive = true
}

variable "stripe_secret_key" {
  type      = string
  sensitive = true
}

variable "stripe_webhook_secret" {
  type      = string
  sensitive = true
}

variable "gemini_api_key" {
  type      = string
  sensitive = true
}

variable "support_email" {
  type = string
}

variable "sender_email" {
  type = string
}

variable "frontend_url" {
  type = string
}

variable "dns_addresses" {
  description = "DNS addresses for API Gateway and CloudFront"
  type = object({
    api_gateway = string
    cloudfront  = string
  })
}

variable "cloudflare_zone_name" {
  description = "The Cloudflare zone name (e.g., example.com)"
  type        = string
}