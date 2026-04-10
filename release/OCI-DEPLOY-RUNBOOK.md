# OCI Deploy Runbook - API

## Objetivo
Publicar imagem da API no OCIR e executar rollout no OKE via GitHub Actions.

## 1) Segredos obrigatorios no GitHub
Configurar no repo em `Settings > Secrets and variables > Actions`:

1. `OCI_REGISTRY`
- Exemplo: `gru.ocir.io`

2. `OCI_NAMESPACE`
- Namespace do tenancy no OCIR.

3. `OCI_USERNAME`
- Usuario OCIR (formato OCI, ex.: `namespace/usuario`).

4. `OCI_AUTH_TOKEN`
- Auth token OCI para push de imagem.

5. `OCI_IMAGE_REPOSITORY`
- Exemplo: `jj-app-gym/jj-gym-api`

6. `OKE_KUBECONFIG_B64` (obrigatorio para rollout)
- Kubeconfig do cluster em base64.
- Gerar com:
```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\prepare-kubeconfig-secret.ps1 -KubeconfigPath "C:\caminho\config"
```

7. `API_DATABASE_URL`
8. `API_JWT_SECRET`
9. `API_ADMIN_API_KEY`
10. `API_POSTGRES_PASSWORD`
 - Usado para o PostgreSQL interno do cluster nos ambientes `dev` e `prod` (modo custo-otimizado).
 - `dev`: aplica `schema + seed`.
 - `prod`: aplica apenas `schema` (sem dados de demo).
 - `API_DATABASE_URL` permanece opcional para futura migracao para banco gerenciado externo.

## 2) Pipeline de deploy
Workflow:
- `.github/workflows/deploy-oci-api.yml`

Execucao:
1. GitHub > `Actions` > `Deploy OCI API`.
2. Escolher:
   - `target_environment`: `dev` ou `prod`
   - `rollout_oke`: `true` para publicar + aplicar no OKE.

## 3) Resultado esperado
1. Job `Build and Publish to OCIR` publica imagem:
- `<OCI_REGISTRY>/<OCI_NAMESPACE>/<OCI_IMAGE_REPOSITORY>:<commit_sha>`
2. Job `Rollout on OKE`:
- garante PostgreSQL interno no namespace `jj-gym` (dev),
- aplica schema/seed automaticamente no `dev`,
- aplica manifests em `deploy/oke/`;
- aplica PDBs de API/PostgreSQL para resiliencia em manutencao;
- aplica NetworkPolicy no PostgreSQL (acesso apenas via API);
- atualiza secret `jj-gym-api-secrets`;
- faz rollout do deployment `jj-gym-api`.

## 4) Validacao pos-deploy
1. Verificar status do deployment:
```bash
kubectl -n jj-gym get deploy,pods,svc
```
2. Validar endpoint da API no ambiente.
3. Rodar smoke de go-live.

## 5) Rollback rapido
1. Reexecutar workflow apontando para commit/tag anterior (novo run).
2. Ou ajustar manualmente a imagem:
```bash
kubectl -n jj-gym set image deployment/jj-gym-api jj-gym-api=<imagem_anterior>
kubectl -n jj-gym rollout status deployment/jj-gym-api
```
