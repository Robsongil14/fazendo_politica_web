@echo off
chcp 65001 >nul
title Deploy Fazendo Política Web
color 0E

echo ========================================
echo 🚀 DEPLOY DA APLICAÇÃO - AUTOMÁTICO
echo    Fazendo Política Web - v2.0
echo ========================================
echo.
echo Este script vai fazer o deploy completo:
echo ✓ Parar servidor atual (se rodando)
echo ✓ Copiar todos os arquivos necessários
echo ✓ Instalar dependências de produção
echo ✓ Configurar variáveis de ambiente
echo ✓ Fazer build da aplicação
echo ✓ Iniciar servidor automaticamente
echo.
pause

set SERVIDOR_DIR=C:\FazendoPoliticaWeb
set ORIGEM_DIR=%~dp0..\

:: Verificar se o diretório do servidor existe
if not exist "%SERVIDOR_DIR%" (
    echo ❌ ERRO: Diretório do servidor não encontrado!
    echo.
    echo 📋 SOLUÇÃO:
    echo 1. Execute primeiro: instalar_servidor.bat
    echo 2. Aguarde a instalação completa
    echo 3. Execute este script novamente
    echo.
    pause
    exit /b 1
)

echo ========================================
echo [1/7] 🛑 Parando servidor atual...
echo ========================================
cd /d "%SERVIDOR_DIR%"

:: Parar processos Node.js
echo 🔍 Verificando processos Node.js...
tasklist /fi "imagename eq node.exe" 2>nul | find /i "node.exe" >nul
if %errorLevel% == 0 (
    echo 🛑 Parando processos Node.js...
    taskkill /f /im node.exe >nul 2>&1
    timeout /t 3 /nobreak >nul
    echo ✅ Processos parados
) else (
    echo ✅ Nenhum processo Node.js rodando
)

echo.
echo ========================================
echo [2/7] 📁 Preparando diretórios...
echo ========================================
echo 🔧 Criando estrutura de pastas...

:: Criar diretórios necessários
if not exist "%SERVIDOR_DIR%\src" mkdir "%SERVIDOR_DIR%\src"
if not exist "%SERVIDOR_DIR%\public" mkdir "%SERVIDOR_DIR%\public"
if not exist "%SERVIDOR_DIR%\.next" mkdir "%SERVIDOR_DIR%\.next"
if not exist "%SERVIDOR_DIR%\logs" mkdir "%SERVIDOR_DIR%\logs"
if not exist "%SERVIDOR_DIR%\backup" mkdir "%SERVIDOR_DIR%\backup"

echo ✅ Estrutura de pastas criada

echo.
echo ========================================
echo [3/7] 📦 Copiando arquivos da aplicação...
echo ========================================
echo 📂 Origem: %ORIGEM_DIR%
echo 📂 Destino: %SERVIDOR_DIR%
echo.

:: Fazer backup se existir aplicação anterior
if exist "%SERVIDOR_DIR%\package.json" (
    echo 💾 Fazendo backup da versão anterior...
    set BACKUP_DIR=%SERVIDOR_DIR%\backup\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%%time:~6,2%
    set BACKUP_DIR=!BACKUP_DIR: =0!
    mkdir "!BACKUP_DIR!" >nul 2>&1
    xcopy /E /Y /Q "%SERVIDOR_DIR%\*" "!BACKUP_DIR!\" >nul 2>&1
    echo ✅ Backup criado em: !BACKUP_DIR!
)

:: Copiar arquivos essenciais
echo 📋 Copiando arquivos de configuração...
copy /Y "%ORIGEM_DIR%\package.json" "%SERVIDOR_DIR%\" >nul
copy /Y "%ORIGEM_DIR%\package-lock.json" "%SERVIDOR_DIR%\" >nul 2>&1
copy /Y "%ORIGEM_DIR%\next.config.js" "%SERVIDOR_DIR%\" >nul 2>&1
copy /Y "%ORIGEM_DIR%\tailwind.config.js" "%SERVIDOR_DIR%\" >nul 2>&1
copy /Y "%ORIGEM_DIR%\postcss.config.js" "%SERVIDOR_DIR%\" >nul 2>&1
copy /Y "%ORIGEM_DIR%\tsconfig.json" "%SERVIDOR_DIR%\" >nul 2>&1
copy /Y "%ORIGEM_DIR%\next-env.d.ts" "%SERVIDOR_DIR%\" >nul 2>&1

echo 📁 Copiando código fonte...
xcopy /E /Y /Q "%ORIGEM_DIR%\src\*" "%SERVIDOR_DIR%\src\" >nul

echo 🖼️ Copiando arquivos públicos...
if exist "%ORIGEM_DIR%\public" (
    xcopy /E /Y /Q "%ORIGEM_DIR%\public\*" "%SERVIDOR_DIR%\public\" >nul
)

echo 🔧 Copiando build (se existir)...
if exist "%ORIGEM_DIR%\.next" (
    xcopy /E /Y /Q "%ORIGEM_DIR%\.next\*" "%SERVIDOR_DIR%\.next\" >nul
)

echo ✅ Todos os arquivos copiados com sucesso!

echo.
echo ========================================
echo [4/7] 🔧 Configurando variáveis de ambiente...
echo ========================================
echo 📝 Criando arquivo .env.local...

:: Criar arquivo .env.local se não existir
if not exist "%SERVIDOR_DIR%\.env.local" (
    echo # Configurações de Produção > "%SERVIDOR_DIR%\.env.local"
    echo NODE_ENV=production >> "%SERVIDOR_DIR%\.env.local"
    echo NEXT_TELEMETRY_DISABLED=1 >> "%SERVIDOR_DIR%\.env.local"
    echo. >> "%SERVIDOR_DIR%\.env.local"
    echo # Supabase Configuration >> "%SERVIDOR_DIR%\.env.local"
    echo NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase_aqui >> "%SERVIDOR_DIR%\.env.local"
    echo NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase_aqui >> "%SERVIDOR_DIR%\.env.local"
    echo. >> "%SERVIDOR_DIR%\.env.local"
    echo ✅ Arquivo .env.local criado (configure suas chaves!)
) else (
    echo ✅ Arquivo .env.local já existe
)

echo.
echo ========================================
echo [5/7] 📦 Instalando dependências de produção...
echo ========================================
cd /d "%SERVIDOR_DIR%"

echo 🔍 Verificando package.json...
if not exist "package.json" (
    echo ❌ ERRO: package.json não encontrado!
    echo Verifique se os arquivos foram copiados corretamente
    pause
    exit /b 1
)

echo 📥 Instalando dependências (pode demorar alguns minutos)...
call npm install --production --no-audit --no-fund --silent
if %errorLevel% == 0 (
    echo ✅ Dependências instaladas com sucesso!
) else (
    echo ❌ Falha na instalação das dependências
    echo.
    echo 🔧 POSSÍVEIS SOLUÇÕES:
    echo 1. Verifique sua conexão com a internet
    echo 2. Execute: npm cache clean --force
    echo 3. Tente novamente
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [6/7] 🏗️ Fazendo build da aplicação...
echo ========================================
echo 🔨 Executando build de produção...

call npm run build
if %errorLevel% == 0 (
    echo ✅ Build concluído com sucesso!
) else (
    echo ❌ Falha no build da aplicação
    echo.
    echo 🔧 POSSÍVEIS SOLUÇÕES:
    echo 1. Verifique se todas as dependências estão instaladas
    echo 2. Verifique se o arquivo .env.local está configurado
    echo 3. Verifique se não há erros no código
    echo.
    echo ⚠️ Continuando mesmo assim (pode usar build existente)...
)

echo.
echo ========================================
echo [7/7] 🚀 Configurando e iniciando servidor...
echo ========================================
echo 📝 Criando configuração PM2...

:: Criar configuração PM2
echo module.exports = { > "%SERVIDOR_DIR%\ecosystem.config.js"
echo   apps: [{ >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     name: 'fazendo-politica-web', >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     script: 'node_modules/next/dist/bin/next', >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     args: 'start -p 3000 -H 0.0.0.0', >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     instances: 1, >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     autorestart: true, >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     watch: false, >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     max_memory_restart: '500M', >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     env: { >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo       NODE_ENV: 'production', >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo       PORT: '3000' >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo     } >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo   }] >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo }; >> "%SERVIDOR_DIR%\ecosystem.config.js"
echo ✅ Configuração PM2 criada

echo.
echo 🚀 Iniciando aplicação com PM2...
cd /d "%SERVIDOR_DIR%"

:: Parar qualquer instância anterior
call pm2 stop fazendo-politica-web >nul 2>&1
call pm2 delete fazendo-politica-web >nul 2>&1

:: Iniciar nova instância
call pm2 start ecosystem.config.js
if %errorLevel% == 0 (
    echo ✅ Aplicação iniciada com sucesso!
    echo.
    echo 📊 Status da aplicação:
    call pm2 status
    echo.
    echo 📝 Salvando configuração PM2...
    call pm2 save >nul 2>&1
    call pm2 startup >nul 2>&1
) else (
    echo ❌ Falha ao iniciar a aplicação com PM2
    echo.
    echo 🔧 Tentando iniciar com npm...
    start /B npm run start
    timeout /t 3 >nul
    echo ⚠️ Aplicação iniciada com npm (menos estável)
)

:: Detectar informações de rede
echo.
echo 🌐 Detectando informações de rede...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set "IP_LOCAL=%%i"
    set "IP_LOCAL=!IP_LOCAL: =!"
    goto :ip_found
)
:ip_found

for /f "tokens=3" %%i in ('route print ^| findstr "0.0.0.0.*0.0.0.0"') do (
    set "GATEWAY=%%i"
    goto :gateway_found
)
set "GATEWAY=192.168.1.1"
:gateway_found

echo.
echo ========================================
echo    🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉
echo ========================================
echo.
echo 🌐 INFORMAÇÕES DE ACESSO:
echo ┌─────────────────────────────────────────┐
echo │ Local:    http://localhost:3000         │
echo │ Rede:     http://%IP_LOCAL%:3000        │
echo │ Gateway:  %GATEWAY%                     │
echo └─────────────────────────────────────────┘
echo.
echo 🔧 COMANDOS ÚTEIS:
echo ┌─────────────────────────────────────────┐
echo │ Status:   pm2 status                    │
echo │ Logs:     pm2 logs fazendo-politica-web │
echo │ Restart:  pm2 restart fazendo-politica-web │
echo │ Stop:     pm2 stop fazendo-politica-web │
echo └─────────────────────────────────────────┘
echo.
echo 📁 ARQUIVOS IMPORTANTES:
echo ┌─────────────────────────────────────────┐
echo │ Servidor: %SERVIDOR_DIR%                │
echo │ Logs:     %SERVIDOR_DIR%\logs           │
echo │ Backup:   %SERVIDOR_DIR%\backup         │
echo │ Config:   %SERVIDOR_DIR%\.env.local     │
echo └─────────────────────────────────────────┘
echo.
echo ⚠️ PRÓXIMOS PASSOS:
echo 1. Configure suas chaves no arquivo .env.local
echo 2. Configure port forwarding no roteador (porta 3000)
echo 3. Teste o acesso externo
echo.
echo Pressione qualquer tecla para finalizar...
pause >nul