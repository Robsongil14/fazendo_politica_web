@echo off
echo ========================================
echo   DuckDNS - Atualizador de IP Automatico
echo ========================================
echo.

REM CONFIGURE AQUI:
REM Substitua "SEU_DOMINIO" pelo seu dominio no DuckDNS
REM Substitua "SEU_TOKEN" pelo seu token do DuckDNS
set DOMINIO=fazendopolitica
set TOKEN=SEU_TOKEN_AQUI

echo Dominio configurado: %DOMINIO%.duckdns.org
echo.

if "%TOKEN%"=="SEU_TOKEN_AQUI" (
    echo ========================================
    echo   CONFIGURACAO NECESSARIA!
    echo ========================================
    echo.
    echo 1. Acesse: https://www.duckdns.org/
    echo 2. Faca login e crie um dominio
    echo 3. Copie seu token
    echo 4. Edite este arquivo e substitua:
    echo    - DOMINIO: pelo nome do seu dominio
    echo    - TOKEN: pelo seu token do DuckDNS
    echo.
    pause
    exit /b 1
)

:loop
echo Atualizando IP para %DOMINIO%.duckdns.org...
curl -s "https://www.duckdns.org/update?domains=%DOMINIO%&token=%TOKEN%&ip=" > nul

if errorlevel 1 (
    echo Erro ao atualizar IP!
) else (
    echo IP atualizado com sucesso! [%date% %time%]
)

echo Aguardando 5 minutos para proxima atualizacao...
timeout /t 300 /nobreak > nul
goto loop