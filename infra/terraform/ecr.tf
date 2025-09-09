locals {
  service_names = [
    "api-gateway",
    "auth-service",
    "workflow-service",
    "notification-service",
    "frontend"
  ]
}

resource "aws_ecr_repository" "service_repos" {
  for_each             = toset(local.service_names)
  name                 = "${var.project}-${each.key}"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration { scan_on_push = true }
  tags = {
    Project     = var.project
    Environment = var.environment
    Service     = each.key
  }
}
