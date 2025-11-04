@echo off
chcp 65001 >nul
title Instalação Servidor Fazendo Política Web
color 0A

echo ========================================
echo    🚀 INSTALAÇÃO SERVIDOR DE PRODUÇÃO
echo    Fazendo Política Web - v2.0
echo ========================================
echo.
echo Este script vai instalar TUDO automaticamente:
echo ✓ Node.js LTS (se necessário)
echo ✓ Dependências do projeto
echo ✓ Configuração do firewall
echo ✓ Configuração de rede
echo ✓ Scripts de gerenciamento
echo.
pause

:: Verificar se está executando como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como administrador
) else (
    echo ❌ ERRO: Execute como administrador!
    echo.
    echo 📋 COMO EXECUTAR COMO ADMINISTRADOR:
    echo 1. Clique com botão direito neste arquivo
    echo 2. Selecione "Executar como administrador"
    echo 3. Clique "Sim" na janela de confirmação
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [1/7] 🔍 Verificando Node.js...
echo ========================================
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Node.js encontrado
    for /f "tokens=*" %%i in ('node --version') do echo    Versão: %%i
) else (
    echo ❌ Node.js não encontrado!
    echo.
    echo 📥 Baixando Node.js LTS v20.10.0...
    
    :: Criar pasta temporária
    if not exist "temp" mkdir temp
    cd temp
    
    :: Baixar Node.js com verificação de erro
    powershell -Command "try { Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi' -OutFile 'nodejs.msi' -UseBasicParsing; Write-Host 'Download concluído' } catch { Write-Host 'Erro no download'; exit 1 }"
    
    if not exist "nodejs.msi" (
        echo ❌ Falha no download do Node.js
        echo Verifique sua conexão com a internet
        pause
        exit /b 1
    )
    
    echo ⚙️ Instalando Node.js (pode demorar alguns minutos)...
    msiexec /i nodejs.msi /quiet /norestart ADDLOCAL=ALL
    
    :: Aguardar instalação
    echo ⏳ Aguardando instalação...
    timeout /t 45 /nobreak >nul
    
    :: Atualizar PATH
    call refreshenv >nul 2>&1
    
    cd ..
    rmdir /s /q temp >nul 2>&1
    
    :: Verificar novamente
    node --version >nul 2>&1
    if %errorLevel% == 0 (
        echo ✅ Node.js instalado com sucesso!
        for /f "tokens=*" %%i in ('node --version') do echo    Versão: %%i
    ) else (
        echo ❌ Falha na instalação do Node.js
        echo.
        echo 🔧 SOLUÇÃO MANUAL:
        echo 1. Baixe: https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi
        echo 2. Execute o instalador
        echo 3. Reinicie o computador
        echo 4. Execute este script novamente
        echo.
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo [2/7] 📦 Verificando NPM e instalando PM2...
echo ========================================
npm --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ NPM encontrado
    for /f "tokens=*" %%i in ('npm --version') do echo    Versão: %%i
) else (
    echo ❌ NPM não encontrado (deveria vir com Node.js)
    pause
    exit /b 1
)

echo.
echo 📥 Instalando PM2 (Process Manager)...
npm install -g pm2
if %errorLevel% == 0 (
    echo ✅ PM2 instalado com sucesso
    for /f "tokens=*" %%i in ('pm2 --version') do echo    Versão: %%i
) else (
    echo ❌ Falha na instalação do PM2
    echo Continuando sem PM2 (modo manual)
)

echo.
echo ========================================
echo [3/7] 📁 Configurando diretório do servidor...
echo ========================================
set SERVIDOR_DIR=C:\FazendoPoliticaWeb
if not exist "%SERVIDOR_DIR%" (
    mkdir "%SERVIDOR_DIR%"
    echo ✅ Diretório criado: %SERVIDOR_DIR%
) else (
    echo ✅ Diretório já existe: %SERVIDOR_DIR%
)

:: Criar subpastas necessárias
if not exist "%SERVIDOR_DIR%\logs" mkdir "%SERVIDOR_DIR%\logs"
if not exist "%SERVIDOR_DIR%\backup" mkdir "%SERVIDOR_DIR%\backup"
echo ✅ Subpastas criadas (logs, backup)

echo.
echo ========================================
echo [4/7] 🔥 Configurando Firewall do Windows...
echo ========================================
echo 🗑️ Removendo regras antigas...
netsh advfirewall firewall delete rule name="Fazendo Politica Web" >nul 2>&1
netsh advfirewall firewall delete rule name="Next.js Fazendo Politica - Entrada" >nul 2>&1
netsh advfirewall firewall delete rule name="Next.js Fazendo Politica - Saida" >nul 2>&1

echo 🔧 Criando novas regras...
netsh advfirewall firewall add rule name="Fazendo Politica Web - Entrada" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="Fazendo Politica Web - Saida" dir=out action=allow protocol=TCP localport=3000

if %errorLevel% == 0 (
    echo ✅ Firewall configurado com sucesso!
    echo    ✓ Porta 3000 TCP (Entrada e Saída)
) else (
    echo ❌ Falha na configuração do firewall
    echo Você pode configurar manualmente depois
)

echo.
echo ========================================
echo [5/7] 🌐 Detectando informações de rede...
echo ========================================
echo 🔍 Obtendo IP local...
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    for /f "tokens=1" %%j in ("%%i") do (
        set LOCAL_IP=%%j
        goto :ip_found
    )
)
:ip_found
if defined LOCAL_IP (
    echo ✅ IP Local detectado: %LOCAL_IP%
) else (
    echo ❌ Não foi possível detectar o IP local
    set LOCAL_IP=localhost
)

echo 🔍 Obtendo Gateway...
for /f "tokens=3" %%i in ('route print ^| findstr "0.0.0.0.*0.0.0.0"') do (
    set GATEWAY=%%i
    goto :gateway_found
)
:gateway_found
if defined GATEWAY (
    echo ✅ Gateway detectado: %GATEWAY%
) else (
    echo ❌ Não foi possível detectar o gateway
    set GATEWAY=192.168.1.1
)

echo.
echo ========================================
echo [6/7] ⚙️ Criando scripts de gerenciamento...
echo ========================================

:: Criar script de inicialização
echo 🔧 Criando iniciar_servidor.bat...
echo @echo off > "%SERVIDOR_DIR%\iniciar_servidor.bat"
echo title Fazendo Politica Web - Servidor >> "%SERVIDOR_DIR%\iniciar_servidor.bat"
echo color 0A >> "%SERVIDOR_DIR%\iniciar_servidor.bat"
echo cd /d "%SERVIDOR_DIR%" >> "%SERVIDOR_DIR%\iniciar_servidor.bat"
echo echo Iniciando servidor Fazendo Politica Web... >> "%SERVIDOR_DIR%\iniciar_servidor.bat"
echo npm run start >> "%SERVIDOR_DIR%\iniciar_servidor.bat"

:: Criar script de parada
echo 🔧 Criando parar_servidor.bat...
echo @echo off > "%SERVIDOR_DIR%\parar_servidor.bat"
echo title Parando Servidor >> "%SERVIDOR_DIR%\parar_servidor.bat"
echo echo Parando servidor... >> "%SERVIDOR_DIR%\parar_servidor.bat"
echo taskkill /f /im node.exe >> "%SERVIDOR_DIR%\parar_servidor.bat"
echo echo Servidor parado! >> "%SERVIDOR_DIR%\parar_servidor.bat"
echo pause >> "%SERVIDOR_DIR%\parar_servidor.bat"

:: Criar script de status
echo 🔧 Criando verificar_status.bat...
echo @echo off > "%SERVIDOR_DIR%\verificar_status.bat"
echo title Status do Servidor >> "%SERVIDOR_DIR%\verificar_status.bat"
echo color 0B >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo ======================================== >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo   STATUS DO SERVIDOR FAZENDO POLITICA >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo ======================================== >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo. >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo Verificando se o servidor esta rodando... >> "%SERVIDOR_DIR%\verificar_status.bat"
echo netstat -an ^| findstr :3000 >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo. >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo Acesso local: http://%LOCAL_IP%:3000 >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo Roteador: http://%GATEWAY% >> "%SERVIDOR_DIR%\verificar_status.bat"
echo echo. >> "%SERVIDOR_DIR%\verificar_status.bat"
echo pause >> "%SERVIDOR_DIR%\verificar_status.bat"

echo ✅ Scripts de gerenciamento criados!

echo.
echo ========================================
echo [7/7] 📋 Criando arquivo de informações...
echo ========================================
echo 🔧 Criando arquivo de informações do servidor...

:: Criar arquivo de informações
echo ======================================== > "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo   FAZENDO POLITICA WEB - SERVIDOR >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo   Instalado em: %date% %time% >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo ======================================== >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo. >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo INFORMACOES DE REDE: >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - IP Local: %LOCAL_IP% >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - Gateway: %GATEWAY% >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - Porta: 3000 >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo. >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo ACESSOS: >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - Local: http://%LOCAL_IP%:3000 >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - Roteador: http://%GATEWAY% >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo. >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo SCRIPTS DISPONIVEIS: >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - iniciar_servidor.bat    (Iniciar o servidor) >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - parar_servidor.bat      (Parar o servidor) >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo - verificar_status.bat    (Ver status) >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo. >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo PROXIMOS PASSOS: >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo 1. Copie a aplicacao para: %SERVIDOR_DIR% >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo 2. Execute: deploy_aplicacao.bat >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo 3. Configure port forwarding no roteador >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"
echo 4. Descubra seu IP publico em: whatismyip.com >> "%SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt"

echo ✅ Arquivo de informações criado!

echo.
echo ========================================
echo ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO! ✅
echo ========================================
echo.
echo 🎉 O servidor foi configurado com sucesso!
echo.
echo 📁 Diretório: %SERVIDOR_DIR%
echo 🌐 IP Local: %LOCAL_IP%
echo 🔗 Gateway: %GATEWAY%
echo 🔥 Firewall: Configurado (porta 3000)
echo.
echo 📋 PRÓXIMOS PASSOS:
echo.
echo 1. 📦 Copie sua aplicação para: %SERVIDOR_DIR%
echo 2. 🚀 Execute: deploy_aplicacao.bat
echo 3. 🌐 Configure port forwarding no roteador:
echo    - Acesse: http://%GATEWAY%
echo    - Port Forwarding: 3000 → %LOCAL_IP%:3000
echo 4. 🔍 Descubra seu IP público: https://whatismyip.com
echo 5. 🧪 Teste: http://[SEU_IP_PUBLICO]:3000
echo.
echo 📄 Todas as informações foram salvas em:
echo    %SERVIDOR_DIR%\INFORMACOES_SERVIDOR.txt
echo.
echo ✨ Instalação finalizada! Pressione qualquer tecla...
pause >nul

:: Abrir pasta do servidor
explorer "%SERVIDOR_DIR%"

exit /b 0