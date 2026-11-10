@echo off
setlocal EnableDelayedExpansion
title CineStudio Pro - Versione Web Studio
echo =======================================================================
echo   CineStudio Pro - Avvio e Setup Automatico Versione WEB Studio
echo =======================================================================
echo.

:: 1. Verifica e installazione Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js non trovato nel sistema. Installazione automatica in corso...
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        echo [*] Node.js installato. Riavviare lo script per aggiornare il PATH di sistema.
        pause
        exit /b 1
    ) else (
        echo [ERRORE] Installa Node.js LTS manualmente da: https://nodejs.org/
        pause
        exit /b 1
    )
) else (
    echo [OK] Node.js rilevato.
)

:: 2. Spostamento nella cartella Web
cd /d "%~dp0Web"

:: 3. Verifica dipendenze (node_modules)
if not exist "node_modules\" (
    echo.
    echo [*] Prima esecuzione: installazione automatica dei pacchetti web (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRORE] Errore durante l'installazione dei moduli npm.
        pause
        exit /b 1
    )
    echo [OK] Dipendenze web installate con successo.
)

:: 4. Avvio server di sviluppo Vite
echo.
echo =======================================================================
echo   CineStudio Pro - Web Studio in ascolto su http://localhost:5173
echo =======================================================================
call npm run dev
pause
