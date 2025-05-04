
resource "null_resource" "build_content_moderation_lambda" {
  triggers = {
    always_run = timestamp()
  }
  provisioner "local-exec" {
    command = "./scripts/build-content-moderation.sh"
  }
  lifecycle {
    ignore_changes = [
      triggers # comment this line to re-build after first run
    ]
  }
}

data "local_file" "content_moderation_zip" {
  filename   = "../backend/dist/content-moderation.zip"
  depends_on = [null_resource.build_content_moderation_lambda]
}

resource "null_resource" "build_backend_api" {
  triggers = {
    always_run = timestamp()
  }
  provisioner "local-exec" {
    command = "./scripts/build-backend-api.sh"
  }
  lifecycle {
    ignore_changes = [
      triggers # comment this line to re-build after first run
    ]
  }
}

data "local_file" "backend_api_zip" {
  filename   = "../backend/dist/backend-api.zip"
  depends_on = [null_resource.build_backend_api]
}

# Build and deploy script
resource "null_resource" "build_and_deploy_frontend" {
  triggers = {
    always_run = timestamp()
  }

  provisioner "local-exec" {
    command = <<-EOT
      BUCKET_NAME=${aws_s3_bucket.frontend[0].id} \
      DISTRIBUTION_ID=${aws_cloudfront_distribution.frontend[0].id} \
      bash ${path.module}/scripts/build-and-deploy-frontend.sh
    EOT
  }

  depends_on = [
    aws_s3_bucket.frontend,
    aws_cloudfront_distribution.frontend[0]
  ]

  lifecycle {
    ignore_changes = [
      triggers # comment this line to re-build after first run
    ]
  }
}