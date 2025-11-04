@echo off
echo ========================================
echo   Configurando Windows Firewall
echo   Fazendo Politica Web - Porta 3000
echo ========================================
echo.

echo Adicionando regra para porta 3000...
netsh advfirewall firewall add rule name="Fazendo Politica Web - Entrada" dir=in action=allow protocol=TCP localport=3000

echo Adicionando regra para porta 3000 (saida)...
netsh advfirewall firewall add rule name="Fazendo Politica Web - Saida" dir=out action=allow protocol=TCP localport=3000

echo.
echo ========================================
echo   Firewall configurado com sucesso!
echo   Porta 3000 liberada para acesso externo
echo ========================================
echo.
echo Pressione qualquer tecla para continuar...
pause >nul