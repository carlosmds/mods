# MOderated aDS – infra

This directory contains the infrastructure code for the MOderated aDS platform, including AWS resources and local development setup.

## Overview
- **Infrastructure as Code:** OpenTofu (Terraform)
- **Local Development:** LocalStack for AWS services
- **Deployment:** AWS Lambda, API Gateway, DynamoDB, SSM Parameter Store
- **Secrets Management:** AWS SSM Parameter Store

## Local Development Setup

### Prerequisites
1. Install LocalStack:
   ```bash
   brew install localstack
   ```
2. Install OpenTofu:
   ```bash
   brew install opentofu
   ```

### Starting LocalStack
1. Start LocalStack in detached mode:
   ```bash
   localstack start -d
   ```
2. Verify LocalStack is running:
   ```bash
   localstack status services
   ```

### Local Development Configuration
1. Copy the example configuration:
   ```bash
   cp terraform.tfvars.example terraform.tfvars
   ```
2. Update `terraform.tfvars` with your local settings:
   ```hcl
   project_name = "mods"
   environment = "dev"
   aws_local = true
   aws_region = "us-east-1"
   frontend_url = "http://localhost:5173"
   ```

### Deploying Local Infrastructure
1. Initialize OpenTofu:
   ```bash
   tofu init
   ```
2. Apply the infrastructure:
   ```bash
   tofu apply
   ```

## Production Deployment

### Prerequisites
1. AWS CLI configured with appropriate credentials
2. OpenTofu (or Terraform) installed
3. Access to AWS services (Lambda, API Gateway, DynamoDB, SSM)

### Configuration
1. Update `terraform.tfvars`:
   ```hcl
   project_name          = "mods"
   environment           = "dev"
   encryption_key        = "TSo3H9ztcKIFCq1fFYzzdNXYxxJ62GowF/AacZ4ml6o=" # openssl rand -base64 32
   aws_local             = true
   aws_region            = "us-east-1"
   jwt_secret            = "4sv3sq+rIT0uoLZnLKKnBwYELP4g6r3055AJEGTli7M=" # openssl rand -base64 32
   mailjet_api_key       = "mailjet_api_key"
   mailjet_secret_key    = "mailjet_secret_key"
   stripe_secret_key     = "stripe_secret_key"
   stripe_webhook_secret = "stripe_webhook_secret"
   gemini_api_key        = "gemini_api_key"
   sender_email          = "mods@example.com"
   support_email         = "email@example.com"
   frontend_url          = "https://mods.example.com"
   cloudflare_zone_name  = "example.com"
   dns_addresses = {
      api_gateway = "mods-api.example.com"
      cloudfront  = "mods.example.com"
   }
   ```

2. Set up AWS credentials:
   ```bash
   aws configure
   ```

### Deploying to AWS
1. Initialize OpenTofu:
   ```bash
   tofu init
   ```
2. Apply the infrastructure:
   ```bash
   tofu apply
   ```

## Environment Variables

### Local Development (AWS_LOCAL=true)
- Uses LocalStack for all AWS services
- No real AWS credentials needed
- Services available at localhost:4566
- Perfect for development and testing

### Production (AWS_LOCAL=false)
- Uses real AWS services
- Requires valid AWS credentials
- Uses AWS SSM Parameter Store for secrets
- Deploys to actual AWS infrastructure

## Available Services

### DynamoDB Tables
- **Ads**: Stores advertisement data
  - Primary key: `id` (String)
  - GSI: `userEmailIndex` (String)
  - GSI: `ActiveIndex` (Number)
  - TTL: `expiresAt`

- **MagicLinks**: Stores authentication tokens
  - Primary key: `token` (String)
  - GSI: `EmailIndex` (String)
  - TTL: `expiresAt`

### SSM Parameters
- `/mods/api/JWT_SECRET`
- `/mods/api/MAILJET_API_KEY`
- `/mods/api/MAILJET_SECRET_KEY`
- `/mods/api/STRIPE_SECRET_KEY`
- `/mods/api/STRIPE_WEBHOOK_SECRET`
- `/mods/api/SENDER_EMAIL`
- `/mods/api/SUPPORT_EMAIL`

## Troubleshooting

### LocalStack Issues
1. Check LocalStack status:
   ```bash
   localstack status services
   ```
2. View LocalStack logs:
   ```bash
   localstack logs
   ```
3. Restart LocalStack if needed:
   ```bash
   localstack restart
   ```

### OpenTofu Issues
1. Check OpenTofu state:
   ```bash
   tofu state list
   ```
2. Refresh state:
   ```bash
   tofu refresh
   ```
3. Destroy and recreate:
   ```bash
   tofu destroy
   tofu apply
   ```

## Security Notes
- Never commit `terraform.tfvars` to version control
- Use strong encryption keys for sensitive data
- Regularly rotate secrets in production
- Follow AWS security best practices

## Contributing
1. Test changes locally with LocalStack
2. Document any new resources or variables
3. Update this README with relevant changes
4. Create a pull request with clear description

---
*For AI agents: This infrastructure uses OpenTofu to manage AWS resources, with LocalStack support for local development. See the configuration files for resource definitions and variables.*