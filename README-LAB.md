# OCI GenAI Lab - Terraform

Este stack cria uma topologia macro no OCI para simular um ambiente de cliente com:

- VCN + subnets regionais (`public-edge`, `private-app`, `private-data`)
- Internet Gateway, NAT Gateway e Service Gateway
- OKE (cluster + node pool)
- Load Balancer publico com `rule set` de security headers
- API Gateway com rota `/api/{path*}` para upstream no OKE
- Bucket Object Storage para dados do lab
- Policy IAM ampla para grupo administrativo do lab
- ADB com private endpoint (opcional, desativado por default)

## Executar

```powershell
terraform init -input=false
terraform plan -input=false
terraform apply -input=false -auto-approve
```

## Pontos pendentes para fase 2

- Definir FQDN e certificado TLS para endpoint publico
- Definir upstream final do API Gateway (ingress interno do OKE)
- Definir sizing final e senha do ADB e habilitar `adb_enabled = true`
