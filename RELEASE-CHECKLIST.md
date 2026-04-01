# Release Checklist (MVP)

## 1) Preparacao
- [ ] Backlog da release congelado
- [ ] Itens de alto risco mapeados
- [ ] Stakeholders alinhados com escopo

## 2) Qualidade tecnica
- [ ] CI verde em `main`
- [ ] API `typecheck` e `build` ok
- [ ] Mobile `typecheck` ok
- [ ] Smoke test MVP executado (`api/scripts/mvp-smoke.ps1`)

## 3) Validacao funcional
- [ ] Checklist manual mobile executado (`mobile/MANUAL-TEST-CHECKLIST.md`)
- [ ] Evidencia E2E registrada (`mobile/evidence/...`)
- [ ] Bugs criticos bloqueantes tratados

## 4) Seguranca e dados
- [ ] Sem secrets no repositorio
- [ ] Variaveis de ambiente revisadas
- [ ] Fluxos de autenticacao e sessao validados

## 5) Go/No-Go
- [ ] Reuniao rapida de go/no-go realizada
- [ ] Rollback definido e testado
- [ ] Tag de checkpoint criada

## 6) Pos-release
- [ ] Monitoramento inicial (primeiras 24h)
- [ ] Registro de incidentes e aprendizados
- [ ] Atualizacao do roadmap

