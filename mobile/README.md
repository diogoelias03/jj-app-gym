# Mobile (Expo) - JJ App Gym

Aplicativo mobile MVP integrado com a API backend.

## Requisitos
- Node.js 20+
- API rodando localmente em `http://127.0.0.1:3000` (ou outra URL configurada)

## Configuracao
1. Copie `.env.example` para `.env`.
2. Ajuste `EXPO_PUBLIC_API_BASE_URL`.

Exemplo:

```env
EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:3000
```

Se estiver testando no celular fisico, use o IP da sua maquina:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.15.8:3000
```

## Rodando
```bash
npm install
npm run start
```

## Fluxo MVP implementado
- Login (`/api/v1/auth/login`)
- Sessao persistida com armazenamento seguro (`expo-secure-store`)
- Biometria opcional para restaurar sessao (digital/face)
- Telemetria interna de uso (eventos de app, tabs e acoes principais)
- Dashboard (`/api/v1/dashboard`)
- Lista de aulas com `class_category` (`/api/v1/classes`)
- Progresso IBJJF por `profile_code` (`/api/v1/progress`)
- Check-in por botao (`/api/v1/checkins`)
- Check-in por QR token (`/api/v1/checkins/qr`)

## Validacao manual
- Roteiro de QA manual:
  - `MANUAL-TEST-CHECKLIST.md`
- Coleta de evidencias E2E:
  - `E2E-EVIDENCE-GUIDE.md`
  - `scripts/e2e-evidence.ps1`
