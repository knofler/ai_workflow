output "ecr_repository_names" { value = [for r in aws_ecr_repository.service_repos : r.name] }
