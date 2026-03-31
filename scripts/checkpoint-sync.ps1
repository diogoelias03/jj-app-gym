param(
  [Parameter(Mandatory = $true)]
  [string]$Message,
  [string]$TagSuffix = "wip",
  [switch]$Push
)

$ErrorActionPreference = "Stop"

git add -A

$hasChanges = git diff --cached --name-only
if (-not $hasChanges) {
  Write-Output "Nenhuma alteracao para commit."
} else {
  git commit -m $Message
}

$tag = "checkpoint-{0}-{1}" -f (Get-Date -Format "yyyy-MM-dd-HHmm"), $TagSuffix
git tag $tag
Write-Output "Tag criada: $tag"

if ($Push) {
  git push origin main
  git push origin $tag
  Write-Output "Sincronizacao concluida com push."
} else {
  Write-Output "Commit/tag prontos localmente. Use -Push para sincronizar com remoto."
}

