param(
  [string]$BaseUrl = "http://127.0.0.1:3000",
  [string]$Email = "aluno@jjappgym.dev",
  [string]$Password = "123456",
  [string]$AdminKey = "local-admin-key"
)

$ErrorActionPreference = "Stop"

Write-Output "== MVP Smoke Test =="
Write-Output "BaseUrl: $BaseUrl"

# health
$health = Invoke-RestMethod -Method Get -Uri "$BaseUrl/health"
Write-Output ("health.status: " + $health.status)

# login
$loginBody = @{ email = $Email; password = $Password } | ConvertTo-Json
$login = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/auth/login" -ContentType "application/json" -Body $loginBody
$token = $login.access_token
if (-not $token) { throw "Login sem access_token" }
$authHeaders = @{ Authorization = "Bearer $token" }
Write-Output "login: ok"

# classes
$classes = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/classes?branchId=1" -Headers $authHeaders
Write-Output ("classes.count: " + $classes.items.Count)

# dashboard
$dashboard = Invoke-RestMethod -Method Get -Uri "$BaseUrl/api/v1/dashboard" -Headers $authHeaders
Write-Output ("dashboard.currentBelt: " + $dashboard.progress.currentBelt)

# goals
$goalBody = @{ title = "Meta Smoke"; description = "Validação smoke"; targetValue = 5; unit = "aulas" } | ConvertTo-Json
$goal = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/goals" -Headers $authHeaders -ContentType "application/json" -Body $goalBody
Write-Output ("goals.created.id: " + $goal.id)

# feedback (admin)
$fbBody = @{ studentId = 1; instructorId = 1; classSessionId = 1; rating = 5; feedbackText = "Smoke feedback"; visibleToStudent = $true } | ConvertTo-Json
$fb = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/admin/instructor-feedback" -Headers @{ "x-admin-key" = $AdminKey } -ContentType "application/json" -Body $fbBody
Write-Output ("feedback.created.id: " + $fb.id)

# QR flow (admin generate + student redeem)
$futureClassBody = @{
  branchId = 1
  beltId = 1
  instructorId = 1
  title = "Aula QR Smoke"
  classCategory = "fundamentos"
  startsAt = (Get-Date).AddDays(2).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
  endsAt = (Get-Date).AddDays(2).AddHours(1).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
  capacity = 20
} | ConvertTo-Json
$futureClass = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/admin/classes" -Headers @{ "x-admin-key" = $AdminKey } -ContentType "application/json" -Body $futureClassBody

$qrBody = @{ classSessionId = [int]$futureClass.id; expiresInMinutes = 15 } | ConvertTo-Json
$qr = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/admin/checkins/qr-token" -Headers @{ "x-admin-key" = $AdminKey } -ContentType "application/json" -Body $qrBody

$checkQrBody = @{ qrToken = $qr.qrToken } | ConvertTo-Json
$checkQr = Invoke-RestMethod -Method Post -Uri "$BaseUrl/api/v1/checkins/qr" -Headers $authHeaders -ContentType "application/json" -Body $checkQrBody
Write-Output ("checkin.qr.method: " + $checkQr.checkinMethod)

Write-Output "== Smoke completed successfully =="
