@echo off
echo ========================================
echo   Descobrindo IP Local do Computador
echo ========================================
echo.

echo Informacoes de rede:
echo.

for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /i "IPv4"') do (
    set ip=%%i
    set ip=!ip: =!
    if not "!ip!"=="127.0.0.1" (
        echo IP Local encontrado: !ip!
    )
)

echo.
echo ========================================
echo   Configuracao do Roteador
echo ========================================
echo.
echo Para configurar o Port Forwarding:
echo 1. Acesse o painel do seu roteador
echo 2. Procure por "Port Forwarding" ou "Redirecionamento de Porta"
echo 3. Configure:
echo    - IP Interno: [IP mostrado acima]
echo    - Porta Externa: 3000
echo    - Porta Interna: 3000
echo    - Protocolo: TCP
echo.

echo ========================================
echo   IP Publico (para DuckDNS)
echo ========================================
echo.
echo Descobrindo seu IP publico...
for /f %%i in ('curl -s ifconfig.me') do set PUBLIC_IP=%%i
echo Seu IP publico e: %PUBLIC_IP%
echo.
echo Este e o IP que sera usado no DuckDNS automaticamente.
echo.

pause