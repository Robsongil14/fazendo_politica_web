@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
color 0C
title Configuração do Firewall - Fazendo Política Web

:: Verificar se está executando como administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo.
    echo ╔══════════════════════════════════════════════════════════════╗
    echo ║                    ⚠️  ATENÇÃO IMPORTANTE ⚠️                 ║
    echo ╚══════════════════════════════════════════════════════════════╝
    echo.
    echo 🔒 Este script precisa ser executado como ADMINISTRADOR
    echo.
    echo 🔧 COMO EXECUTAR COMO ADMINISTRADOR:
    echo    1. Clique com botão direito no arquivo
    echo    2. Selecione "Executar como administrador"
    echo    3. Clique em "Sim" quando solicitado
    echo.
    echo Pressione qualquer tecla para fechar...
    pause >nul
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║                  🛡️ CONFIGURAÇÃO DO FIREWALL 🛡️              ║
echo ║                     Fazendo Política Web                     ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo 🔧 Este script irá:
echo   ✓ Remover regras antigas do firewall
echo   ✓ Criar regras de entrada para porta 3000
echo   ✓ Criar regras de saída para porta 3000
echo   ✓ Verificar se as regras foram aplicadas
echo   ✓ Testar conectividade local
echo.
echo ⚠️ IMPORTANTE: Execute como ADMINISTRADOR
echo.
echo Pressione qualquer tecla para continuar...
pause >nul
cls

echo.
echo ========================================
echo [1/4] 🧹 Limpando regras antigas...
echo ========================================
echo.

echo 🗑️ Removendo regras antigas do firewall...

:: Remover regras antigas com nomes diferentes
netsh advfirewall firewall delete rule name="Fazendo Politica Web" >nul 2>&1
netsh advfirewall firewall delete rule name="Next.js Fazendo Politica" >nul 2>&1
netsh advfirewall firewall delete rule name="Fazendo Politica Web - Entrada" >nul 2>&1
netsh advfirewall firewall delete rule name="Fazendo Politica Web - Saida" >nul 2>&1
netsh advfirewall firewall delete rule name="Node.js Server" >nul 2>&1
netsh advfirewall firewall delete rule name="Port 3000" >nul 2>&1

echo ✅ Regras antigas removidas

echo.
echo ========================================
echo [2/4] 🔓 Criando regras de entrada...
echo ========================================
echo.

echo 📥 Configurando regra de entrada (porta 3000)...
netsh advfirewall firewall add rule name="Fazendo Politica Web - Entrada" dir=in action=allow protocol=TCP localport=3000 profile=any
if %errorLevel% == 0 (
    echo ✅ Regra de entrada criada com sucesso
) else (
    echo ❌ Falha ao criar regra de entrada
    set "ERROR_FOUND=1"
)

echo.
echo ========================================
echo [3/4] 🔓 Criando regras de saída...
echo ========================================
echo.

echo 📤 Configurando regra de saída (porta 3000)...
netsh advfirewall firewall add rule name="Fazendo Politica Web - Saida" dir=out action=allow protocol=TCP localport=3000 profile=any
if %errorLevel% == 0 (
    echo ✅ Regra de saída criada com sucesso
) else (
    echo ❌ Falha ao criar regra de saída
    set "ERROR_FOUND=1"
)

echo.
echo ========================================
echo [4/4] 🔍 Verificando configuração...
echo ========================================
echo.

echo 🔍 Verificando regras criadas...

:: Verificar regra de entrada
netsh advfirewall firewall show rule name="Fazendo Politica Web - Entrada" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Regra de entrada: ATIVA
    set "ENTRADA_OK=1"
) else (
    echo ❌ Regra de entrada: NÃO ENCONTRADA
    set "ENTRADA_OK=0"
    set "ERROR_FOUND=1"
)

:: Verificar regra de saída
netsh advfirewall firewall show rule name="Fazendo Politica Web - Saida" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Regra de saída: ATIVA
    set "SAIDA_OK=1"
) else (
    echo ❌ Regra de saída: NÃO ENCONTRADA
    set "SAIDA_OK=0"
    set "ERROR_FOUND=1"
)

echo.
echo 🔍 Testando conectividade local...
timeout /t 2 >nul

:: Testar se a porta 3000 está sendo usada
netstat -an | findstr ":3000" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Porta 3000: EM USO (servidor provavelmente rodando)
) else (
    echo ⚠️ Porta 3000: LIVRE (servidor não está rodando)
)

echo.
echo ========================================
echo    🎉 CONFIGURAÇÃO CONCLUÍDA! 🎉
echo ========================================
echo.

if defined ERROR_FOUND (
    echo ⚠️ STATUS: CONCLUÍDO COM AVISOS
    echo.
    echo 🔧 PROBLEMAS ENCONTRADOS:
    if "%ENTRADA_OK%"=="0" echo   ❌ Regra de entrada não foi criada
    if "%SAIDA_OK%"=="0" echo   ❌ Regra de saída não foi criada
    echo.
    echo 🔧 POSSÍVEIS SOLUÇÕES:
    echo   1. Execute novamente como administrador
    echo   2. Verifique se o Windows Firewall está ativo
    echo   3. Tente desabilitar temporariamente o antivírus
    echo.
) else (
    echo ✅ STATUS: SUCESSO COMPLETO
    echo.
    echo 🛡️ FIREWALL CONFIGURADO:
    echo ┌─────────────────────────────────────────┐
    echo │ ✅ Regra de Entrada: ATIVA             │
    echo │ ✅ Regra de Saída: ATIVA               │
    echo │ 🌐 Porta: 3000 (TCP)                   │
    echo │ 📋 Perfis: Todos (Público/Privado)     │
    echo └─────────────────────────────────────────┘
)

echo.
echo 🔧 COMANDOS ÚTEIS PARA FIREWALL:
echo ┌─────────────────────────────────────────────────────────────┐
echo │ Ver regras:    netsh advfirewall firewall show rule all     │
echo │ Desativar:     netsh advfirewall set allprofiles state off │
echo │ Ativar:        netsh advfirewall set allprofiles state on  │
echo │ Reset:         netsh advfirewall reset                      │
echo └─────────────────────────────────────────────────────────────┘
echo.
echo 📝 PRÓXIMOS PASSOS:
echo   1. Inicie o servidor: pm2 start ou npm run start
echo   2. Teste localmente: http://localhost:3000
echo   3. Configure port forwarding no roteador
echo.

:: Salvar informações em arquivo
echo # CONFIGURAÇÃO DO FIREWALL - %date% %time% > "FIREWALL_CONFIG.txt"
echo. >> "FIREWALL_CONFIG.txt"
echo Status da Configuração: >> "FIREWALL_CONFIG.txt"
if defined ERROR_FOUND (
    echo - Status: CONCLUÍDO COM AVISOS >> "FIREWALL_CONFIG.txt"
) else (
    echo - Status: SUCESSO COMPLETO >> "FIREWALL_CONFIG.txt"
)
echo - Regra de Entrada: %ENTRADA_OK% >> "FIREWALL_CONFIG.txt"
echo - Regra de Saída: %SAIDA_OK% >> "FIREWALL_CONFIG.txt"
echo - Porta Configurada: 3000 (TCP) >> "FIREWALL_CONFIG.txt"
echo - Perfis: Todos (Público/Privado/Domínio) >> "FIREWALL_CONFIG.txt"
echo. >> "FIREWALL_CONFIG.txt"
echo Comandos para gerenciar: >> "FIREWALL_CONFIG.txt"
echo - Ver regras: netsh advfirewall firewall show rule all >> "FIREWALL_CONFIG.txt"
echo - Desativar firewall: netsh advfirewall set allprofiles state off >> "FIREWALL_CONFIG.txt"
echo - Ativar firewall: netsh advfirewall set allprofiles state on >> "FIREWALL_CONFIG.txt"

echo ✅ Informações salvas em: FIREWALL_CONFIG.txt
echo.
echo Pressione qualquer tecla para finalizar...
pause >nul