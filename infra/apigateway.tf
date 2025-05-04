locals {
  backend_api_domain = "${aws_api_gateway_rest_api.backend_api[0].id}.execute-api.${var.aws_region}.amazonaws.com"
  backend_api_url    = "https://${local.backend_api_domain}/${var.environment}"
}

resource "aws_api_gateway_rest_api" "backend_api" {
  count              = var.aws_local ? 0 : 1
  name               = "${var.project_name}-backend-api"
  description        = "Backend Serverless API for ${var.project_name}"
  binary_media_types = ["application/json"]
}

resource "aws_api_gateway_resource" "proxy" {
  count       = var.aws_local ? 0 : 1
  rest_api_id = aws_api_gateway_rest_api.backend_api[0].id
  parent_id   = aws_api_gateway_rest_api.backend_api[0].root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "proxy" {
  count         = var.aws_local ? 0 : 1
  rest_api_id   = aws_api_gateway_rest_api.backend_api[0].id
  resource_id   = aws_api_gateway_resource.proxy[0].id
  http_method   = "ANY"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "lambda" {
  count       = var.aws_local ? 0 : 1
  rest_api_id = aws_api_gateway_rest_api.backend_api[0].id
  resource_id = aws_api_gateway_method.proxy[0].resource_id
  http_method = aws_api_gateway_method.proxy[0].http_method

  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.backend_api.invoke_arn
}

resource "aws_api_gateway_deployment" "deployment" {
  count = var.aws_local ? 0 : 1
  depends_on = [
    aws_api_gateway_integration.lambda
  ]

  rest_api_id = aws_api_gateway_rest_api.backend_api[0].id
}

resource "aws_api_gateway_stage" "stage" {
  count         = var.aws_local ? 0 : 1
  deployment_id = aws_api_gateway_deployment.deployment[0].id
  rest_api_id   = aws_api_gateway_rest_api.backend_api[0].id
  stage_name    = var.environment

  # cache_cluster_enabled = !var.aws_local # TODO: enable cache cluster. Not included in the free tier.
  # cache_cluster_size    = "0.5"

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw_logs[0].arn

    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  depends_on = [
    aws_api_gateway_account.main
  ]
}

resource "aws_api_gateway_method_settings" "throttling" {
  count       = var.aws_local ? 0 : 1
  rest_api_id = aws_api_gateway_rest_api.backend_api[0].id
  stage_name  = aws_api_gateway_stage.stage[0].stage_name
  method_path = "*/*"

  settings {
    # allowed 100 requests per second
    throttling_burst_limit = 100
    throttling_rate_limit  = 100

    # caching_enabled = true # TODO: enable cache. Not included in the free tier.
    # cache_ttl_in_seconds = 1800 # 30 minutes
  }
}

resource "aws_cloudwatch_log_group" "api_gw_logs" {
  count             = var.aws_local ? 0 : 1
  name              = "/aws/apigateway/${aws_api_gateway_rest_api.backend_api[0].name}"
  retention_in_days = 14
}

resource "aws_lambda_permission" "apigw" {
  count         = var.aws_local ? 0 : 1
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.backend_api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.backend_api[0].execution_arn}/*/*"
}

resource "aws_api_gateway_domain_name" "api" {
  count           = var.aws_local ? 0 : 1
  domain_name     = var.dns_addresses.api_gateway
  certificate_arn = aws_acm_certificate_validation.main[0].certificate_arn

  depends_on = [
    aws_acm_certificate.main,
    aws_acm_certificate_validation.main
  ]
}

resource "aws_api_gateway_base_path_mapping" "api" {
  count       = var.aws_local ? 0 : 1
  api_id      = aws_api_gateway_rest_api.backend_api[0].id
  stage_name  = aws_api_gateway_stage.stage[0].stage_name
  domain_name = aws_api_gateway_domain_name.api[0].domain_name
}