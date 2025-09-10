variable "vpc_id" { type = string }
variable "public_subnet_ids" { type = list(string) }

resource "aws_lb" "api" {
  name               = "${var.project}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [] # TODO: pass SGs
  subnets            = var.public_subnet_ids
  tags = { Project = var.project, Environment = var.environment }
}

resource "aws_lb_target_group" "api" {
  name     = "${var.project}-${var.environment}-api-tg"
  port     = 4000
  protocol = "HTTP"
  vpc_id   = var.vpc_id
  health_check {
    path = "/health"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.api.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

output "alb_dns_name" { value = aws_lb.api.dns_name }
