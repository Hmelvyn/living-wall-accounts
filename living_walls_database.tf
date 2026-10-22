terraform {
  required_version = ">= 1.0.0"
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_dynamodb_table" "living_walls" {
  name         = "LivingWalls"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  tags = {
    Name = "LivingWallsTable"
  }
}

