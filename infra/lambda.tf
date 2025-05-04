resource "aws_lambda_function" "content_moderation" {
  filename         = data.local_file.content_moderation_zip.filename
  source_code_hash = data.local_file.content_moderation_zip.content_base64sha256
  function_name    = "${var.project_name}_content_moderation"
  role             = aws_iam_role.lambda_role.arn
  handler          = "index.handler"
  runtime          = "nodejs18.x"
  timeout          = 30

  environment {
    variables = {
      # Sensitive parameters
      GEMINI_API_KEY_PARAMETER     = aws_ssm_parameter.gemini_api_key.name
      MAILJET_API_KEY_PARAMETER    = aws_ssm_parameter.mailjet_api_key.name
      MAILJET_SECRET_KEY_PARAMETER = aws_ssm_parameter.mailjet_secret_key.name
      # Email parameters
      SENDER_EMAIL_PARAMETER  = aws_ssm_parameter.sender_email.name
      SUPPORT_EMAIL_PARAMETER = aws_ssm_parameter.support_email.name
      # AWS
      # AWS_REGION = var.aws_region
      AWS_LOCAL = var.aws_local
    }
  }
}

resource "aws_lambda_function" "backend_api" {
  filename         = data.local_file.backend_api_zip.filename
  source_code_hash = data.local_file.backend_api_zip.content_base64sha256
  function_name    = "${var.project_name}_backend_api"
  role             = aws_iam_role.lambda_role.arn
  handler          = "lambda.handler"
  runtime          = "nodejs18.x"
  timeout          = 30

  environment {
    variables = {
      # AWS
      # AWS_REGION = var.aws_region
      AWS_LOCAL = var.aws_local
      # App
      FRONTEND_URL = var.frontend_url
      NODE_ENV     = "production"
      PORT         = 3000
    }
  }
}