@echo off
chcp 65001 >nul
echo ========================================
echo    STATUS DO SERVIDOR
echo    Fazendo Política Web
echo ========================================
echo.

echo [1] Verificando Node.js...
node --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Node.js: 
    node --version
) else (
    echo ❌ Node.js não encontrado
)

echo.
echo [2] Verificando PM2...
pm2 --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ PM2: 
    pm2 --version
) else (
    echo ❌ PM2 não encontrado
)

echo.
echo [3] Status da Aplicação...
pm2 status 2>nul
if %errorLevel% == 0 (
    echo.
    echo [4] Informações de Rede...
    echo IP Local:
    ipconfig | findstr "IPv4" | findstr "192.168\|10.0\|172."
    
    echo.
    echo Porta 3000:
    netstat -an | findstr :3000
    
    echo.
    echo [5] Teste de Conectividade...
    echo Testando acesso local...
    curl -s -o nul -w "Status: %%{http_code}" http://localhost:3000 2>nul
    echo.
    
) else (
    echo ❌ Nenhuma aplicação rodando no PM2
    echo.
    echo Para iniciar a aplicação:
    echo   C:\FazendoPoliticaWeb\iniciar_servidor.bat
)

echo.
echo ========================================
echo Comandos úteis:
echo - Ver logs: pm2 logs
echo - Reiniciar: pm2 restart fazendo-politica-web
echo - Parar: pm2 stop fazendo-politica-web
echo ========================================
echo.
pause