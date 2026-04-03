$ErrorActionPreference = 'Stop'

$cwd = Get-Location
$outFile = Join-Path $cwd 'inventario_network_visualizer.xlsx'
$tempRoot = Join-Path $cwd '.__xlsx_tmp__'

if (Test-Path $tempRoot) { Remove-Item -Recurse -Force $tempRoot }
New-Item -ItemType Directory -Path $tempRoot | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot '_rels') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot 'xl') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot 'xl\_rels') | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempRoot 'xl\worksheets') | Out-Null

$headers = @('Ambiente','Recurso','Tipo','CIDR/IP','Gateways','Parceiro','Observacoes')
$data = @(
    @('dev','bpr-vcn-dev','VCN (Oracle Cloud)','10.1.40.0/24','NAT; SGW','-','Identificado no mapa regional'),
    @('hml','bpr-vcn-hml','VCN (Oracle Cloud)','10.1.41.0/24','NAT; SGW; IGW','-','Identificado no mapa regional'),
    @('prd','bpr-vcn-prd','VCN (Oracle Cloud)','10.1.42.0/24','NAT; SGW','-','Identificado no mapa regional'),
    @('hub','bpr-hub-drg','DRG','-','-','-','Concentrador de roteamento'),
    @('conectividade','bpr-dr-equinix','Conexao com parceiro (provavel FastConnect)','10.0.0.22/30; 10.0.0.21/30','-','Equinix','Nome e detalhes conforme visibilidade da imagem'),
    @('conectividade','bpr-fc-oci-to-a...','FastConnect (nome truncado)','192.168.0.230/...; 192.168.0.1/30','-','Microsoft Azure','Valores parcialmente legiveis'),
    @('conectividade','bpr-ipsec-vpn-3...','IPSec VPN (nome truncado)','191.236.80.212; 172.29.20.0/25 (aparente)','-','-','Valores parcialmente legiveis'),
    @('conectividade','bpr-ipsec-vpn-...','IPSec VPN (nome truncado)','201.20.17.230','-','-','Demais detalhes nao legiveis'),
    @('externo','CPE','Customer Premises Equipment','191.236.80.212','-','-','Recurso externo associado a VPN'),
    @('externo','CPE','Customer Premises Equipment','201.20.17.230','-','-','Recurso externo associado a VPN')
)

function Escape-Xml([string]$s) {
    if ($null -eq $s) { return '' }
    return [System.Security.SecurityElement]::Escape($s)
}

function ColName([int]$n) {
    $name = ''
    while ($n -gt 0) {
        $n--
        $name = [char](65 + ($n % 26)) + $name
        $n = [math]::Floor($n / 26)
    }
    return $name
}

$rows = @()
$all = @($headers) + $data
for ($r = 0; $r -lt $all.Count; $r++) {
    $rowNum = $r + 1
    $cells = @()
    $rowVals = $all[$r]
    for ($c = 0; $c -lt $rowVals.Count; $c++) {
        $col = ColName($c + 1)
        $ref = "$col$rowNum"
        $val = Escape-Xml([string]$rowVals[$c])
        $cells += "<c r=""$ref"" t=""inlineStr""><is><t>$val</t></is></c>"
    }
    $rows += "<row r=""$rowNum"">$($cells -join '')</row>"
}

$sheetXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    $($rows -join "`n    ")
  </sheetData>
</worksheet>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>
"@

$rels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="/xl/workbook.xml"/>
</Relationships>
"@

$workbook = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Inventario" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
"@

$wbRels = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>
"@

$utf8 = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText((Join-Path $tempRoot '[Content_Types].xml'), $contentTypes, $utf8)
[System.IO.File]::WriteAllText((Join-Path $tempRoot '_rels\.rels'), $rels, $utf8)
[System.IO.File]::WriteAllText((Join-Path $tempRoot 'xl\workbook.xml'), $workbook, $utf8)
[System.IO.File]::WriteAllText((Join-Path $tempRoot 'xl\_rels\workbook.xml.rels'), $wbRels, $utf8)
[System.IO.File]::WriteAllText((Join-Path $tempRoot 'xl\worksheets\sheet1.xml'), $sheetXml, $utf8)

if (Test-Path $outFile) { Remove-Item -Force $outFile }
$zipFile = [System.IO.Path]::ChangeExtension($outFile, '.zip')
if (Test-Path $zipFile) { Remove-Item -Force $zipFile }
Compress-Archive -Path (Join-Path $tempRoot '*') -DestinationPath $zipFile
Move-Item -Path $zipFile -Destination $outFile -Force

Remove-Item -Recurse -Force $tempRoot
Write-Output $outFile
