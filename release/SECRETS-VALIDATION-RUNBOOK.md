# Runbook - Validacao de Secrets (GitHub Environments)

## Objetivo
Validar se os secrets criticos de `dev` e `prod` existem antes de deploys sensiveis.

## Script
- `scripts/validate-github-secrets.ps1`

## Execucao
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-github-secrets.ps1 -Repo "diogoelias03/jj-app-gym"
```

Opcional (caminho customizado):
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\validate-github-secrets.ps1 -Repo "diogoelias03/jj-app-gym" -OutputPath ".\release\reports\secrets-check-manual.md"
```

## Saida esperada
- Relatorio markdown em `release/reports/`.
- Status por ambiente:
  - `PASS`: sem faltas obrigatorias.
  - `FAIL`: existem secrets obrigatorios ausentes.
  - `UNKNOWN`: falha de conectividade/autenticacao no `gh`, sem conclusao sobre faltas.

## Secrets obrigatorios avaliados
- OCI: `OCI_NAMESPACE`, `OCI_USERNAME`, `OCI_AUTH_TOKEN`, `OCI_REGISTRY`, `OCI_IMAGE_REPOSITORY`, `OKE_KUBECONFIG_B64`, `OCI_TENANCY_OCID`, `OCI_USER_OCID`, `OCI_FINGERPRINT`, `OCI_REGION`, `OCI_PRIVATE_KEY_PEM`.
- API: `API_JWT_SECRET`, `API_ADMIN_API_KEY`, `API_POSTGRES_PASSWORD`.
- `dev`: tambem verifica `API_DATABASE_URL`.
- `prod` opcionais monitorados: `API_DATABASE_URL`, `OCI_BACKUP_BUCKET`.
