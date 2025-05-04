
resource "aws_dynamodb_table" "ads" {
  name             = "Ads"
  billing_mode     = "PAY_PER_REQUEST"
  hash_key         = "id"
  stream_enabled   = true
  stream_view_type = "NEW_AND_OLD_IMAGES"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "userEmail"
    type = "S"
  }

  attribute {
    name = "active"
    type = "N"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  attribute {
    name = "expiresAt"
    type = "N"
  }

  global_secondary_index {
    name            = "userEmailIndex"
    hash_key        = "userEmail"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "ActiveIndex"
    hash_key        = "active"
    range_key       = "expiresAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}

resource "aws_dynamodb_table" "magic_links" {
  name         = "MagicLinks"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "token"

  attribute {
    name = "token"
    type = "S"
  }

  attribute {
    name = "email"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "N"
  }

  global_secondary_index {
    name            = "EmailIndex"
    hash_key        = "email"
    range_key       = "createdAt"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "expiresAt"
    enabled        = true
  }
}


# Lambda permission for DynamoDB Stream
resource "aws_lambda_permission" "allow_dynamodb" {
  statement_id  = "AllowDynamoDBInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.content_moderation.function_name
  principal     = "dynamodb.amazonaws.com"
  source_arn    = aws_dynamodb_table.ads.stream_arn
}

# DynamoDB Stream to Lambda mapping
resource "aws_lambda_event_source_mapping" "dynamodb_stream" {
  event_source_arn  = aws_dynamodb_table.ads.stream_arn
  function_name     = aws_lambda_function.content_moderation.arn
  starting_position = "LATEST"
  batch_size        = 1

  filter_criteria {
    filter {
      pattern = jsonencode({
        eventName : ["MODIFY"],
        dynamodb : {
          NewImage : {
            active : {
              N : ["1"]
            }
          },
          OldImage : {
            active : {
              N : ["0"]
            }
          }
        }
      })
    }
  }
} 