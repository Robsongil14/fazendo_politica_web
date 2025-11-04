# Script para criar ZIP para deploy no Vercel
Write-Host "🚀 Preparando ZIP para Deploy no Vercel..." -ForegroundColor Green
Write-Host ""

# Definir caminhos
$sourceDir = "c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\web_version"
$zipPath = "c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\web_version_vercel.zip"

# Remover ZIP anterior se existir
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
    Write-Host "✅ ZIP anterior removido" -ForegroundColor Yellow
}

# Lista de arquivos e pastas essenciais
$essentialItems = @(
    "src",
    "package.json", 
    "package-lock.json",
    "next.config.js",
    "tsconfig.json", 
    "tailwind.config.js",
    "postcss.config.js",
    ".env.example",
    "next-env.d.ts",
    "README.md"
)

Write-Host "📁 Criando ZIP com arquivos essenciais..." -ForegroundColor Cyan

# Criar pasta temporária
$tempDir = "c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\temp_vercel"
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copiar arquivos essenciais para pasta temporária
foreach ($item in $essentialItems) {
    $sourcePath = Join-Path $sourceDir $item
    $destPath = Join-Path $tempDir $item
    
    if (Test-Path $sourcePath) {
        if (Test-Path $sourcePath -PathType Container) {
            # É uma pasta
            Copy-Item $sourcePath $destPath -Recurse -Force
            Write-Host "  ✅ Copiado: $item (pasta)" -ForegroundColor Green
        } else {
            # É um arquivo
            Copy-Item $sourcePath $destPath -Force
            Write-Host "  ✅ Copiado: $item (arquivo)" -ForegroundColor Green
        }
    } else {
        Write-Host "  ⚠️  Não encontrado: $item" -ForegroundColor Yellow
    }
}

# Criar ZIP da pasta temporária
Write-Host ""
Write-Host "📦 Criando arquivo ZIP..." -ForegroundColor Cyan
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath -Force

# Limpar pasta temporária
Remove-Item $tempDir -Recurse -Force

# Verificar se ZIP foi criado
if (Test-Path $zipPath) {
    $zipSize = (Get-Item $zipPath).Length / 1MB
    Write-Host ""
    Write-Host "🎉 ZIP criado com sucesso!" -ForegroundColor Green
    Write-Host "📁 Arquivo: web_version_vercel.zip" -ForegroundColor Yellow
    Write-Host "📍 Localização: c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\" -ForegroundColor Yellow
    Write-Host "📏 Tamanho: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔗 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Acesse https://vercel.com/" -ForegroundColor White
    Write-Host "2. Faça login com Google/GitHub" -ForegroundColor White
    Write-Host "3. Clique 'New Project' → 'Upload'" -ForegroundColor White
    Write-Host "4. Arraste o arquivo web_version_vercel.zip" -ForegroundColor White
    Write-Host "5. Configure as variáveis do Supabase" -ForegroundColor White
} else {
    Write-Host "❌ Erro ao criar ZIP" -ForegroundColor Red
}

Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")