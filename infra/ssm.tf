# SSM Parameters for Lambda
resource "aws_ssm_parameter" "gemini_api_key" {
  name        = "/${var.project_name}/lambda/GEMINI_API_KEY"
  description = "Gemini API Key for content moderation"
  type        = "SecureString"
  value       = var.gemini_api_key
}

# SSM Parameters for Backend API
resource "aws_ssm_parameter" "jwt_secret" {
  name        = "/${var.project_name}/api/JWT_SECRET"
  description = "JWT Secret for authentication"
  type        = "SecureString"
  value       = var.jwt_secret
}

resource "aws_ssm_parameter" "mailjet_api_key" {
  name        = "/${var.project_name}/api/MAILJET_API_KEY"
  description = "Mailjet API Key"
  type        = "SecureString"
  value       = var.mailjet_api_key
}

resource "aws_ssm_parameter" "mailjet_secret_key" {
  name        = "/${var.project_name}/api/MAILJET_SECRET_KEY"
  description = "Mailjet Secret Key"
  type        = "SecureString"
  value       = var.mailjet_secret_key
}

resource "aws_ssm_parameter" "sender_email" {
  name        = "/${var.project_name}/api/SENDER_EMAIL"
  description = "Sender Email"
  type        = "SecureString"
  value       = var.sender_email
}

resource "aws_ssm_parameter" "support_email" {
  name        = "/${var.project_name}/api/SUPPORT_EMAIL"
  description = "Support Email"
  type        = "SecureString"
  value       = var.support_email
}

resource "aws_ssm_parameter" "stripe_secret_key" {
  name        = "/${var.project_name}/api/STRIPE_SECRET_KEY"
  description = "Stripe Secret Key"
  type        = "SecureString"
  value       = var.stripe_secret_key
}

resource "aws_ssm_parameter" "stripe_webhook_secret" {
  name        = "/${var.project_name}/api/STRIPE_WEBHOOK_SECRET"
  description = "Stripe Webhook Secret"
  type        = "SecureString"
  value       = var.stripe_webhook_secret
}
