# Terraform Infrastructure (Scaffold)

This directory provides an incremental path to production:

## Included (scaffold only)
- AWS provider
- ECR repositories for each service
- ECS cluster shell

## Not Yet Included
- Task definitions & services
- ALB / listeners / target groups
- VPC / subnets / security groups
- Redis (Elasticache) / Mongo Atlas integration
- IAM roles for GitHub OIDC deploy
- Secrets Manager values

## Next Steps
1. Add VPC networking (or reference existing).  
2. Define task execution + service roles.  
3. Create task definitions per image (parametrized by image tag).  
4. Add ALB for api-gateway + HTTPS (ACM cert).  
5. Wire autoscaling policies and CloudWatch log groups.  
6. Introduce Terraform Cloud or remote state backend before team scaling.

## Apply (example)
```bash
cd infra/terraform
terraform init
terraform plan
terraform apply
```

Use workspaces or `-var environment=staging` for multiple envs.
