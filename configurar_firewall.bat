@echo off
echo ========================================
echo   CONFIGURANDO FIREWALL PARA SERVIDOR
echo ========================================
echo.
echo Este script vai configurar o Firewall do Windows
echo para permitir acesso externo na porta 3000
echo.
pause

echo Configurando regra de entrada para porta 3000...
netsh advfirewall firewall add rule name="Next.js Fazendo Politica - Entrada" dir=in action=allow protocol=TCP localport=3000

echo Configurando regra de saida para porta 3000...
netsh advfirewall firewall add rule name="Next.js Fazendo Politica - Saida" dir=out action=allow protocol=TCP localport=3000

echo.
echo ========================================
echo   CONFIGURACAO CONCLUIDA!
echo ========================================
echo.
echo Regras criadas:
echo - Entrada: Porta 3000 TCP
echo - Saida: Porta 3000 TCP
echo.
echo Agora voce pode acessar o servidor externamente!
echo.
pause