# Script para criar ZIP pequeno para Vercel
Write-Host "🚀 Criando ZIP pequeno para Vercel..." -ForegroundColor Green
Write-Host ""

# Definir caminhos
$sourceDir = "c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\web_version"
$zipPath = "c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\vercel_pequeno.zip"

# Remover ZIP anterior se existir
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "✅ ZIP anterior removido" -ForegroundColor Yellow
}

# Criar pasta temporária
$tempDir = "c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\temp_pequeno"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "📁 Copiando apenas arquivos essenciais..." -ForegroundColor Cyan

# Copiar arquivos de configuração essenciais
$configFiles = @(
    "package.json",
    "package-lock.json", 
    "next.config.js",
    "tsconfig.json",
    "tailwind.config.js",
    "postcss.config.js",
    ".env.example",
    "next-env.d.ts"
)

foreach ($file in $configFiles) {
    $sourcePath = Join-Path $sourceDir $file
    $destPath = Join-Path $tempDir $file
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "  ✅ $file" -ForegroundColor Green
    }
}

# Copiar pasta src (código fonte)
$srcPath = Join-Path $sourceDir "src"
$destSrcPath = Join-Path $tempDir "src"
if (Test-Path $srcPath) {
    Copy-Item $srcPath $destSrcPath -Recurse -Force
    Write-Host "  ✅ src/ (pasta completa)" -ForegroundColor Green
}

# Criar ZIP
Write-Host ""
Write-Host "📦 Criando ZIP pequeno..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Limpar pasta temporária
Remove-Item $tempDir -Recurse -Force

# Verificar resultado
if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host ""
    Write-Host "🎉 ZIP pequeno criado!" -ForegroundColor Green
    Write-Host "📁 Arquivo: vercel_pequeno.zip" -ForegroundColor Yellow
    Write-Host "📏 Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Yellow
    Write-Host ""
    
    if ($zipSize -lt 100) {
        Write-Host "✅ Tamanho OK para Vercel (< 100 MB)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Ainda muito grande para Vercel" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Erro ao criar ZIP" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")