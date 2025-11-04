@echo off
echo 🚀 Preparando ZIP para Deploy no Vercel...
echo.

cd /d "c:\Users\robso\Desktop\nosso_app\fazendo_politica_web"

echo ✅ Criando arquivo ZIP da pasta web_version...
echo.

REM Usar PowerShell para criar o ZIP excluindo arquivos desnecessários
powershell -Command "& {
    $source = 'c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\web_version'
    $destination = 'c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\web_version_vercel.zip'
    
    # Remover ZIP anterior se existir
    if (Test-Path $destination) { Remove-Item $destination -Force }
    
    # Criar ZIP excluindo arquivos desnecessários
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    
    # Criar o arquivo ZIP
    $zip = [System.IO.Compression.ZipFile]::Open($destination, 'Create')
    
    # Função para adicionar arquivos recursivamente
    function Add-FilesToZip($sourcePath, $zipPath, $zip) {
        $items = Get-ChildItem $sourcePath
        foreach ($item in $items) {
            $relativePath = $item.FullName.Substring($source.Length + 1)
            $zipEntryPath = if ($zipPath) { '$zipPath/$relativePath' } else { $relativePath }
            
            # Pular arquivos/pastas desnecessários
            if ($item.Name -eq '.next' -or 
                $item.Name -eq 'node_modules' -or 
                $item.Name -eq '.env.local' -or
                $item.Name -eq 'SERVIDOR_PRODUCAO') {
                continue
            }
            
            if ($item.PSIsContainer) {
                # É uma pasta - processar recursivamente
                Add-FilesToZip $item.FullName '' $zip
            } else {
                # É um arquivo - adicionar ao ZIP
                $entry = $zip.CreateEntry($relativePath.Replace('\', '/'))
                $entryStream = $entry.Open()
                $fileStream = [System.IO.File]::OpenRead($item.FullName)
                $fileStream.CopyTo($entryStream)
                $fileStream.Close()
                $entryStream.Close()
            }
        }
    }
    
    Add-FilesToZip $source '' $zip
    $zip.Dispose()
    
    Write-Host '✅ ZIP criado com sucesso!' -ForegroundColor Green
    Write-Host 'Arquivo: web_version_vercel.zip' -ForegroundColor Yellow
    Write-Host 'Localização: c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\' -ForegroundColor Yellow
}"

echo.
echo 🎉 ZIP pronto para upload no Vercel!
echo 📁 Arquivo: web_version_vercel.zip
echo 📍 Localização: c:\Users\robso\Desktop\nosso_app\fazendo_politica_web\
echo.
echo 🔗 Próximos passos:
echo 1. Acesse https://vercel.com/
echo 2. Faça login com Google/GitHub
echo 3. Clique "New Project" → "Upload"
echo 4. Arraste o arquivo web_version_vercel.zip
echo 5. Configure as variáveis do Supabase
echo.
pause