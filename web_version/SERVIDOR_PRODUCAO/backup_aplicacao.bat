@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo    BACKUP DA APLICAÇÃO
echo    Fazendo Política Web
echo ========================================
echo.

set SERVIDOR_DIR=C:\FazendoPoliticaWeb
set BACKUP_DIR=C:\Backup_FazendoPolitica
set DATA_HORA=%date:~6,4%-%date:~3,2%-%date:~0,2%_%time:~0,2%-%time:~3,2%-%time:~6,2%
set DATA_HORA=%DATA_HORA: =0%
set BACKUP_COMPLETO=%BACKUP_DIR%\Backup_%DATA_HORA%

echo Data/Hora: %DATA_HORA%
echo Origem: %SERVIDOR_DIR%
echo Destino: %BACKUP_COMPLETO%
echo.

:: Verificar se o diretório do servidor existe
if not exist "%SERVIDOR_DIR%" (
    echo ❌ ERRO: Diretório do servidor não encontrado!
    echo %SERVIDOR_DIR%
    pause
    exit /b 1
)

:: Criar diretório de backup
if not exist "%BACKUP_DIR%" (
    mkdir "%BACKUP_DIR%"
    echo ✓ Diretório de backup criado
)

if not exist "%BACKUP_COMPLETO%" (
    mkdir "%BACKUP_COMPLETO%"
    echo ✓ Pasta do backup criada
)

echo.
echo [1/4] Fazendo backup dos arquivos da aplicação...
xcopy /E /Y /Q "%SERVIDOR_DIR%\*" "%BACKUP_COMPLETO%\" >nul 2>&1
if %errorLevel% == 0 (
    echo ✓ Arquivos copiados com sucesso
) else (
    echo ❌ Erro ao copiar arquivos
    pause
    exit /b 1
)

echo.
echo [2/4] Salvando configuração do PM2...
pm2 save >nul 2>&1
copy "%USERPROFILE%\.pm2\dump.pm2" "%BACKUP_COMPLETO%\pm2_config.json" >nul 2>&1
echo ✓ Configuração PM2 salva

echo.
echo [3/4] Criando arquivo de informações...
echo Backup criado em: %date% %time% > "%BACKUP_COMPLETO%\info_backup.txt"
echo Servidor: %COMPUTERNAME% >> "%BACKUP_COMPLETO%\info_backup.txt"
echo Usuario: %USERNAME% >> "%BACKUP_COMPLETO%\info_backup.txt"
echo Versao Node.js: >> "%BACKUP_COMPLETO%\info_backup.txt"
node --version >> "%BACKUP_COMPLETO%\info_backup.txt" 2>&1
echo Status PM2: >> "%BACKUP_COMPLETO%\info_backup.txt"
pm2 jlist >> "%BACKUP_COMPLETO%\info_backup.txt" 2>&1
echo ✓ Informações salvas

echo.
echo [4/4] Limpando backups antigos (mantendo últimos 5)...
set /a contador=0
for /f "skip=5 delims=" %%d in ('dir /b /ad /o-d "%BACKUP_DIR%\Backup_*" 2^>nul') do (
    rmdir /s /q "%BACKUP_DIR%\%%d" >nul 2>&1
    set /a contador+=1
)
if !contador! gtr 0 (
    echo ✓ !contador! backup(s) antigo(s) removido(s)
) else (
    echo ✓ Nenhum backup antigo para remover
)

echo.
echo ========================================
echo    BACKUP CONCLUÍDO COM SUCESSO!
echo ========================================
echo.
echo Localização: %BACKUP_COMPLETO%
echo.
echo Conteúdo do backup:
dir /b "%BACKUP_COMPLETO%"
echo.
echo Para restaurar:
echo 1. Pare o servidor: pm2 stop all
echo 2. Copie os arquivos de volta para: %SERVIDOR_DIR%
echo 3. Reinicie: pm2 start ecosystem.config.js
echo.
pause