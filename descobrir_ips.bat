@echo off
echo ========================================
echo   DESCOBRINDO INFORMACOES DE REDE
echo ========================================
echo.

echo 1. SEU IP LOCAL:
echo ----------------------------------------
ipconfig | findstr /C:"Endereco IPv4" /C:"IPv4 Address"
echo.

echo 2. GATEWAY (IP DO ROTEADOR):
echo ----------------------------------------
ipconfig | findstr /C:"Gateway Padrao" /C:"Default Gateway"
echo.

echo 3. TESTANDO CONECTIVIDADE COM O ROTEADOR:
echo ----------------------------------------
for /f "tokens=2 delims=:" %%i in ('ipconfig ^| findstr /C:"Gateway Padrao" /C:"Default Gateway"') do (
    set gateway=%%i
    set gateway=!gateway: =!
    if not "!gateway!"=="" (
        echo Testando ping para !gateway!...
        ping -n 2 !gateway!
    )
)

echo.
echo 4. PORTAS EM USO:
echo ----------------------------------------
echo Verificando se a porta 3000 esta em uso...
netstat -an | findstr :3000
if errorlevel 1 (
    echo Porta 3000 nao esta em uso
) else (
    echo Porta 3000 esta sendo usada
)

echo.
echo ========================================
echo   PROXIMOS PASSOS:
echo ========================================
echo.
echo 1. Anote seu IP LOCAL (192.168.x.x)
echo 2. Anote o IP do GATEWAY (seu roteador)
echo 3. Acesse o roteador pelo navegador
echo 4. Configure Port Forwarding:
echo    - Porta Externa: 3000
echo    - Porta Interna: 3000  
echo    - IP Interno: [SEU IP LOCAL]
echo.
echo 5. Descubra seu IP publico em: https://www.whatismyip.com/
echo.
pause