@echo off
title Gestao Estrategica - Servidor Local
echo ========================================================
echo        GESTAO ESTRATEGICA - SERVIDOR LOCAL
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao foi encontrado no seu computador.
    echo Por favor, instale o Node.js em: https://nodejs.org
    echo.
    pause
    exit /b
)

if not exist node_modules (
    echo [1/2] Instalando dependencias necessarias (aguarde)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRO] Falha ao instalar dependencias com npm install.
        pause
        exit /b
    )
    echo Dependencias instaladas com sucesso!
    echo.
)

echo [2/2] Iniciando aplicacao na porta 3000...
echo.
echo Abra o navegador em: http://localhost:3000
echo.
echo Pressione CTRL+C para encerrar o servidor quando terminar.
echo.

call npm run dev
pause
