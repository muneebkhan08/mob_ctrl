@echo off
echo ========================================
echo   PC Control Server - Starting...
echo ========================================
echo.

cd /d "%~dp0server"

if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else (
    echo [!] Virtual environment not found.
    echo [!] Run: python -m venv venv
    echo [!] Then: venv\Scripts\activate ^& pip install -r requirements.txt
    pause
    exit /b
)

python server.py
pause
