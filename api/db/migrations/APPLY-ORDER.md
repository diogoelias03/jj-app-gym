# Migration Apply Order (MVP)

Use este arquivo para aplicar as migracoes na ordem correta em ambientes novos/existentes.

## Banco alvo
- `postgresql://postgres:<SENHA>@localhost:5432/jj_app_gym`

## Ordem
1. `20260327_branch_transfer_and_ibjjf.sql`
2. `20260327_ibjjf_profile_criteria_official.sql`
3. `20260327_students_profile_code.sql`
4. `20260330_class_category.sql`
5. `20260330_checkin_qr_tokens.sql`
6. `20260330_student_goals_and_instructor_feedback.sql`

## Comando (PowerShell)
```powershell
$db='postgresql://postgres:<SENHA>@localhost:5432/jj_app_gym'
$dir='C:\Users\difarias\Documents\codex oracle\api\db\migrations'
Get-ChildItem $dir -File | Sort-Object Name | ForEach-Object {
  Write-Output ("Applying " + $_.Name)
  & "C:\Program Files\PostgreSQL\17\bin\psql.exe" $db -f $_.FullName
}
```
