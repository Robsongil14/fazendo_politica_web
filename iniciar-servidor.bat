@echo off
echo ========================================
echo    FAZENDO POLITICA - SERVIDOR LOCAL
echo ========================================
echo.
echo Iniciando servidor...
echo.

cd /d "%~dp0web_version"

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo.
echo Iniciando aplicacao em modo producao...
echo.
echo Acesse: http://localhost:3000
echo Para acessar de outros dispositivos na rede: http://[SEU_IP]:3000
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

npm start

pause