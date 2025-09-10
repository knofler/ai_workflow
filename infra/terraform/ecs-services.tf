variable "api_desired_count" { type = number default = 1 }
variable "api_image" { type = string default = "ghcr.io/owner/repo/api-gateway:main" }

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/${var.project}-${var.environment}-api"
  retention_in_days = 14
}

resource "aws_iam_role" "task_exec" {
  name = "${var.project}-${var.environment}-task-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17",
    Statement = [{ Effect = "Allow", Principal = { Service = "ecs-tasks.amazonaws.com" }, Action = "sts:AssumeRole" }]
  })
}

resource "aws_iam_role_policy_attachment" "task_exec" {
  role       = aws_iam_role.task_exec.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "${var.project}-${var.environment}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.task_exec.arn
  container_definitions    = jsonencode([
    {
      name      = "api-gateway",
      image     = var.api_image,
      essential = true,
      portMappings = [{ containerPort = 4000, hostPort = 4000 }],
      environment = [
        { name = "PORT", value = "4000" },
        { name = "OTEL_EXPORTER_OTLP_ENDPOINT", value = "http://otel-collector:4318" },
        { name = "OTEL_SERVICE_NAME", value = "api-gateway" }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.api.name,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "api" {
  name            = "${var.project}-${var.environment}-api"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = var.api_desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.public_subnet_ids
    assign_public_ip = true
    security_groups = []
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api-gateway"
    container_port   = 4000
  }

  depends_on = [aws_lb_listener.http]
}
