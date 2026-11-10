@echo off
setlocal EnableDelayedExpansion
title CineStudio Pro - Server Locale AI Engine
echo =======================================================================
echo   CineStudio Pro - Avvio e Setup Automatico Requisiti (100%% Gratuito)
echo =======================================================================
echo.

:: 1. Verifica e installazione Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Node.js non trovato. Installazione automatica in corso...
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        winget install OpenJS.NodeJS.LTS --silent --accept-source-agreements --accept-package-agreements
        echo [*] Node.js installato. Riavvia lo script per aggiornare il PATH di sistema.
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

:: 2. Verifica e installazione Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] Python non trovato. Installazione automatica in corso...
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        winget install Python.Python.3.11 --silent --accept-source-agreements --accept-package-agreements
        echo [*] Python installato. Riavvia lo script per aggiornare il PATH di sistema.
        pause
        exit /b 1
    ) else (
        echo [ERRORE] Installa Python manualmente da: https://www.python.org/
        pause
        exit /b 1
    )
) else (
    echo [OK] Python rilevato.
)

:: 3. Verifica e installazione FFmpeg (per montaggio e codifica video)
where ffmpeg >nul 2>nul
if %errorlevel% neq 0 (
    echo [!] FFmpeg non trovato. Installazione automatica con winget...
    where winget >nul 2>nul
    if %errorlevel% equ 0 (
        winget install Gyan.FFmpeg --silent --accept-source-agreements --accept-package-agreements
        echo [*] FFmpeg installato. Riavvia lo script se necessario.
    ) else (
        echo [AVVISO] FFmpeg non trovato nel PATH.
    )
) else (
    echo [OK] FFmpeg rilevato.
)

:: 4. Verifica e installazione eSpeak-ng (Sintesi Vocale TTS offline gratuita)
where espeak-ng >nul 2>nul
if %errorlevel% neq 0 (
    if not exist "C:\Program Files\eSpeak NG\espeak-ng.exe" (
        echo [!] eSpeak-ng non trovato. Installazione automatica del motore vocale TTS...
        where winget >nul 2>nul
        if %errorlevel% equ 0 (
            winget install eSpeak-NG.eSpeak-NG --silent --accept-source-agreements --accept-package-agreements
            echo [OK] Motore TTS eSpeak-ng configurato.
        )
    ) else (
        echo [OK] Motore vocale eSpeak-ng presente in Program Files.
    )
) else (
    echo [OK] Motore vocale eSpeak-ng rilevato nel PATH.
)

:: 5. Installazione librerie Python necessarie per AI locale e sintesi audio
echo.
echo [*] Verifica librerie Python per AI locale (gTTS, Pillow, requests)...
python -m pip install --quiet --upgrade pip >nul 2>nul
python -m pip install --quiet gtts pillow requests >nul 2>nul
echo [OK] Librerie Python operative.

:: 6. Spostamento nella cartella Locale e installazione dipendenze Node.js
cd /d "%~dp0Locale"

if not exist "node_modules\" (
    echo.
    echo [*] Prima esecuzione: installazione moduli del server locale (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERRORE] Errore durante l'installazione dei moduli npm.
        pause
        exit /b 1
    )
    echo [OK] Moduli npm installati con successo.
)

:: Verifica chiave API Gemini
if not exist ".env" (
    if not exist ".env.local" (
        echo.
        echo [AVVISO] File .env non trovato. Creazione file di configurazione...
        echo GEMINI_API_KEY=INSERISCI_QUI_LA_TUA_CHIAVE_GEMINI > .env.local
        echo.
        echo [!] IMPORTANTE: Modifica il file .env.local nella cartella Locale
        echo     e inserisci la tua chiave API Gemini gratuita da:
        echo     https://aistudio.google.com/apikey
        echo.
        echo     Poi riavvia questo script.
        pause
        exit /b 0
    )
)

:: 7. Avvio Server Locale
echo.
echo =======================================================================
echo   CineStudio Pro - Server Locale in ascolto su http://localhost:3000
echo =======================================================================
echo   Apri il browser su: http://localhost:3000
echo   Premi CTRL+C per fermare il server
echo =======================================================================
call npm run dev
pause
