resource "aws_ecs_cluster" "this" {
  name = "${var.project}-${var.environment}"
  setting { name = "containerInsights" value = "enabled" }
  tags = { Project = var.project Environment = var.environment }
}
