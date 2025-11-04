@echo off
echo ========================================
echo   TESTANDO SERVIDOR REMOTO
echo ========================================
echo.

echo 1. VERIFICANDO SE O SERVIDOR ESTA RODANDO:
echo ----------------------------------------
netstat -an | findstr :3000
if errorlevel 1 (
    echo ❌ ERRO: Servidor nao esta rodando na porta 3000
    echo Execute: npm run dev
    pause
    exit
) else (
    echo ✅ Servidor esta rodando na porta 3000
)

echo.
echo 2. SUAS INFORMACOES DE REDE:
echo ----------------------------------------
echo IP Local: 10.0.0.66
echo Gateway: 10.0.0.1
echo Porta: 3000

echo.
echo 3. TESTANDO ACESSO LOCAL:
echo ----------------------------------------
echo Testando http://10.0.0.66:3000...
curl -s -o nul -w "Status: %%{http_code}\n" http://10.0.0.66:3000 --connect-timeout 5
if errorlevel 1 (
    echo ❌ Nao foi possivel acessar localmente
    echo Verifique se o firewall esta configurado
) else (
    echo ✅ Acesso local funcionando!
)

echo.
echo 4. TESTANDO ACESSO AO ROTEADOR:
echo ----------------------------------------
ping -n 2 10.0.0.1
if errorlevel 1 (
    echo ❌ Nao foi possivel acessar o roteador
) else (
    echo ✅ Roteador acessivel!
)

echo.
echo ========================================
echo   PROXIMOS PASSOS:
echo ========================================
echo.
echo 1. ✅ Servidor configurado (aceita conexoes externas)
echo 2. ⚠️  Configure o firewall: Execute configurar_firewall.bat como ADMINISTRADOR
echo 3. ⚠️  Configure port forwarding no roteador:
echo    - Acesse: http://10.0.0.1
echo    - Port Forwarding: 3000 → 10.0.0.66:3000
echo 4. ⚠️  Descubra seu IP publico: https://www.whatismyip.com/
echo 5. ⚠️  Teste externamente: http://[SEU_IP_PUBLICO]:3000
echo.
echo ========================================
echo   LINKS UTEIS:
echo ========================================
echo.
echo - Acesso local: http://10.0.0.66:3000
echo - Roteador: http://10.0.0.1
echo - Descobrir IP publico: https://www.whatismyip.com/
echo - Teste de porta: https://www.yougetsignal.com/tools/open-ports/
echo.
pause