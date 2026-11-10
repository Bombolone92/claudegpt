@echo off
chcp 65001 >nul
title StudioAI VideoCreator - Studio Suite
echo =======================================================
echo    STUDIO AI VIDEOCREATOR - AVVIO IN AMBIENTE LOCALE
echo =======================================================
echo.

cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRORE] Python non e installato o non e nel PATH di Windows!
    echo Installa Python da https://www.python.org/ e spunta Add python.exe to PATH.
    pause
    exit /b
)

REM Creazione ambiente virtuale locale se non esiste
if not exist "%~dp0venv\Scripts\activate.bat" (
    echo [1/3] Creazione ambiente virtuale locale venv in corso...
    python -m venv "%~dp0venv"
)

REM Aggiornamento e installazione dipendenze nel venv
echo [2/3] Verifica e aggiornamento librerie nel venv locale...
"%~dp0venv\Scripts\python.exe" -m pip install --upgrade pip >nul 2>nul
"%~dp0venv\Scripts\pip.exe" install -r "%~dp0requirements.txt"

echo.
echo [3/3] Avvio interfaccia grafica nel browser...
echo.
"%~dp0venv\Scripts\python.exe" -m streamlit run "%~dp0app.py" --server.maxUploadSize=500

pause
