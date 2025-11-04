@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
color 0B
title Configuração de Rede - Fazendo Política Web

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                    🌐 CONFIGURAÇÃO DE REDE 🌐                ║
echo ║                     Fazendo Política Web                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🔧 Este script irá:
echo   ✓ Detectar informações de rede
echo   ✓ Testar conectividade local
echo   ✓ Verificar e configurar firewall
echo   ✓ Testar acesso ao servidor
echo   ✓ Fornecer instruções para port forwarding
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
cls

echo.
echo ========================================
echo [1/5] 🔍 Detectando informações de rede...
echo ========================================
echo.

:: Detectar IP local
set "LOCAL_IP="
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr "192.168\|10.0\|172."') do (
    set "LOCAL_IP=%%a"
    set "LOCAL_IP=!LOCAL_IP: =!"
    goto :ip_found
)
:ip_found

:: Detectar Gateway
set "GATEWAY="
for /f "tokens=3" %%i in ('route print ^| findstr "0.0.0.0.*0.0.0.0"') do (
    set "GATEWAY=%%i"
    goto :gateway_found
)
set "GATEWAY=192.168.1.1"
:gateway_found

:: Detectar nome do computador
set "COMPUTER_NAME=%COMPUTERNAME%"

:: Detectar adaptador de rede
for /f "tokens=1,2 delims=:" %%a in ('ipconfig /all ^| findstr /i "Ethernet\|Wi-Fi"') do (
    set "NETWORK_ADAPTER=%%a"
    goto :adapter_found
)
:adapter_found

echo 📊 INFORMAÇÕES DETECTADAS:
echo ┌─────────────────────────────────────────┐
echo │ IP Local:     %LOCAL_IP%                │
echo │ Gateway:      %GATEWAY%                 │
echo │ Computador:   %COMPUTER_NAME%           │
echo │ Adaptador:    %NETWORK_ADAPTER%         │
echo └─────────────────────────────────────────┘

echo.
echo ========================================
echo [2/5] 🔌 Testando conectividade local...
echo ========================================
echo.

echo 🌐 Testando servidor local (porta 3000)...
:: Testar com curl primeiro
curl -s -o nul -w "✅ Servidor local: Status %%{http_code}" http://localhost:3000 2>nul
if %errorLevel% == 0 (
    echo - Servidor respondendo corretamente
) else (
    echo ❌ Servidor local não responde
    echo.
    echo 🔧 POSSÍVEIS SOLUÇÕES:
    echo 1. Verifique se o servidor está rodando: pm2 status
    echo 2. Inicie o servidor: pm2 start ecosystem.config.js
    echo 3. Ou use: npm run start
    echo.
)

echo.
echo 🌐 Testando conectividade com o roteador...
ping -n 1 %GATEWAY% >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Roteador acessível: %GATEWAY%
) else (
    echo ❌ Roteador não acessível: %GATEWAY%
    echo.
    echo 🔧 POSSÍVEIS SOLUÇÕES:
    echo 1. Verifique a conexão de rede
    echo 2. Verifique se o gateway está correto
    echo.
)

echo.
echo 🌐 Testando acesso à internet...
ping -n 1 8.8.8.8 >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Internet acessível
) else (
    echo ❌ Internet não acessível
)

echo.
echo ========================================
echo [3/5] 🛡️ Verificando e configurando firewall...
echo ========================================
echo.

echo 🔍 Verificando regras existentes...
netsh advfirewall firewall show rule name="Fazendo Politica Web - Entrada" >nul 2>&1
set "FIREWALL_IN=%errorLevel%"

netsh advfirewall firewall show rule name="Fazendo Politica Web - Saida" >nul 2>&1
set "FIREWALL_OUT=%errorLevel%"

if %FIREWALL_IN% == 0 (
    echo ✅ Regra de entrada configurada
) else (
    echo ❌ Regra de entrada não encontrada
    echo.
    echo 🔧 Configurando regra de entrada...
    netsh advfirewall firewall add rule name="Fazendo Politica Web - Entrada" dir=in action=allow protocol=TCP localport=3000 >nul 2>&1
    if %errorLevel% == 0 (
        echo ✅ Regra de entrada criada com sucesso
    ) else (
        echo ❌ Falha ao criar regra de entrada
    )
)

if %FIREWALL_OUT% == 0 (
    echo ✅ Regra de saída configurada
) else (
    echo ❌ Regra de saída não encontrada
    echo.
    echo 🔧 Configurando regra de saída...
    netsh advfirewall firewall add rule name="Fazendo Politica Web - Saida" dir=out action=allow protocol=TCP localport=3000 >nul 2>&1
    if %errorLevel% == 0 (
        echo ✅ Regra de saída criada com sucesso
    ) else (
        echo ❌ Falha ao criar regra de saída
    )
)

echo.
echo ========================================
echo [4/5] 🌍 Descobrindo IP público...
echo ========================================
echo.

echo 🔍 Consultando IP público (pode demorar alguns segundos)...
for /f %%i in ('curl -s ifconfig.me 2^>nul') do set "PUBLIC_IP=%%i"
if defined PUBLIC_IP (
    echo ✅ IP Público detectado: %PUBLIC_IP%
) else (
    echo ❌ Não foi possível descobrir o IP público automaticamente
    echo.
    echo 🔧 ALTERNATIVAS:
    echo 1. Acesse: https://whatismyipaddress.com
    echo 2. Acesse: https://www.whatismyip.com
    echo 3. Pergunte ao seu provedor de internet
    echo.
    set "PUBLIC_IP=SEU_IP_PUBLICO_AQUI"
)

echo.
echo ========================================
echo [5/5] 🚀 Testando acesso ao servidor...
echo ========================================
echo.

echo 🔍 Testando acesso local...
curl -s -o nul -w "Status: %%{http_code}" http://localhost:3000 2>nul
if %errorLevel% == 0 (
    echo ✅ Acesso local funcionando
) else (
    echo ❌ Acesso local com problemas
)

echo.
echo 🔍 Testando acesso pela rede local...
curl -s -o nul -w "Status: %%{http_code}" http://%LOCAL_IP%:3000 2>nul
if %errorLevel% == 0 (
    echo ✅ Acesso pela rede local funcionando
) else (
    echo ❌ Acesso pela rede local com problemas
)

echo.
echo ========================================
echo    🎉 CONFIGURAÇÃO CONCLUÍDA! 🎉
echo ========================================
echo.
echo 📊 RESUMO DA CONFIGURAÇÃO:
echo ┌─────────────────────────────────────────────────────────────┐
echo │ 🖥️  Servidor Local:   http://localhost:3000                 │
echo │ 🏠 Rede Local:       http://%LOCAL_IP%:3000                 │
echo │ 🌍 IP Público:       %PUBLIC_IP%                           │
echo │ 🌐 Gateway:          %GATEWAY%                             │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo 🔧 PRÓXIMOS PASSOS PARA ACESSO EXTERNO:
echo.
echo 1️⃣ CONFIGURAR PORT FORWARDING NO ROTEADOR:
echo    ┌─────────────────────────────────────────┐
echo    │ Acesse: http://%GATEWAY%                │
echo    │ Usuário: admin (ou veja etiqueta)       │
echo    │ Senha: admin (ou veja etiqueta)         │
echo    └─────────────────────────────────────────┘
echo.
echo    📋 CONFIGURAÇÕES DO PORT FORWARDING:
echo    ┌─────────────────────────────────────────┐
echo    │ Nome da Regra: Fazendo Politica Web     │
echo    │ Porta Externa: 3000                     │
echo    │ IP Interno:    %LOCAL_IP%               │
echo    │ Porta Interna: 3000                     │
echo    │ Protocolo:     TCP                      │
echo    └─────────────────────────────────────────┘
echo.
echo 2️⃣ TESTAR ACESSO EXTERNO:
echo    Após configurar o port forwarding, teste:
echo    http://%PUBLIC_IP%:3000
echo.
echo 3️⃣ COMANDOS ÚTEIS:
echo    ┌─────────────────────────────────────────┐
echo    │ Ver status:    pm2 status               │
echo    │ Ver logs:      pm2 logs                 │
echo    │ Reiniciar:     pm2 restart all          │
echo    │ Parar:         pm2 stop all             │
echo    └─────────────────────────────────────────┘
echo.
echo 📝 SALVAR INFORMAÇÕES:
echo    Anote estas informações em local seguro!
echo.

:: Salvar informações em arquivo
echo # INFORMAÇÕES DO SERVIDOR - %date% %time% > "INFORMACOES_REDE.txt"
echo. >> "INFORMACOES_REDE.txt"
echo IP Local: %LOCAL_IP% >> "INFORMACOES_REDE.txt"
echo Gateway: %GATEWAY% >> "INFORMACOES_REDE.txt"
echo IP Público: %PUBLIC_IP% >> "INFORMACOES_REDE.txt"
echo Computador: %COMPUTER_NAME% >> "INFORMACOES_REDE.txt"
echo. >> "INFORMACOES_REDE.txt"
echo Acesso Local: http://localhost:3000 >> "INFORMACOES_REDE.txt"
echo Acesso Rede: http://%LOCAL_IP%:3000 >> "INFORMACOES_REDE.txt"
echo Acesso Externo: http://%PUBLIC_IP%:3000 >> "INFORMACOES_REDE.txt"
echo. >> "INFORMACOES_REDE.txt"
echo Port Forwarding: >> "INFORMACOES_REDE.txt"
echo - Porta Externa: 3000 >> "INFORMACOES_REDE.txt"
echo - IP Interno: %LOCAL_IP% >> "INFORMACOES_REDE.txt"
echo - Porta Interna: 3000 >> "INFORMACOES_REDE.txt"
echo - Protocolo: TCP >> "INFORMACOES_REDE.txt"

echo ✅ Informações salvas em: INFORMACOES_REDE.txt
echo.
echo Pressione qualquer tecla para finalizar...
pause >nul