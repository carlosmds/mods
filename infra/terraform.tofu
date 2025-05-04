terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 3.0"
    }
  }
  encryption {
   key_provider "pbkdf2" "key" {
    passphrase = var.encryption_key
   }
   method "aes_gcm" "secure_method" {
     keys = key_provider.pbkdf2.key
   }
   state {
     method = method.aes_gcm.secure_method
     enforced = true
   }
   plan {
     method = method.aes_gcm.secure_method
     enforced = true
   }
  }
}