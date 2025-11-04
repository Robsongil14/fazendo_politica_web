@echo off
echo ========================================
echo   Fazendo Politica Web - Servidor
echo   Iniciando em modo producao...
echo ========================================
echo.

cd /d "%~dp0web_version"

echo Verificando se o build existe...
if not exist ".next" (
    echo Build nao encontrado. Criando build de producao...
    call npm run build
    if errorlevel 1 (
        echo Erro ao criar build!
        pause
        exit /b 1
    )
)

echo.
echo ========================================
echo   Servidor iniciando na porta 3000
echo   Acesso local: http://localhost:3000
echo   Acesso remoto: http://SEU_DOMINIO:3000
echo ========================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

call npm run start