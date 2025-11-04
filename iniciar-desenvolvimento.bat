@echo off
echo ========================================
echo  FAZENDO POLITICA - MODO DESENVOLVIMENTO
echo ========================================
echo.
echo Iniciando servidor de desenvolvimento...
echo.

cd /d "%~dp0web_version"

echo Verificando dependencias...
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo.
echo Iniciando aplicacao em modo desenvolvimento...
echo.
echo Acesse: http://localhost:3000
echo Para acessar de outros dispositivos na rede: http://[SEU_IP]:3000
echo.
echo O servidor reiniciara automaticamente quando voce fizer alteracoes
echo Pressione Ctrl+C para parar o servidor
echo.

npm run dev

pause