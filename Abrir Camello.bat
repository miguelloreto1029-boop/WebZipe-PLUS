
@echo off
title WebZipe PLUS - Camello

echo.
echo ========================================
echo       WEBZIPE PLUS - CAMELLO
echo ========================================
echo.

cd /d "%~dp0camello"

if not exist index.html (
    echo ERROR: No se encontro index.html.
    echo Verifica que hayas extraido Camello en la carpeta camello.
    pause
    exit /b 1
)

where python >nul 2>&1

if errorlevel 1 (
    echo ERROR: Python no esta instalado.
    echo Descargalo desde https://www.python.org/
    pause
    exit /b 1
)

echo Iniciando servidor local...
start "Camello - Servidor local" cmd /k python -m http.server 8080

timeout /t 2 /nobreak >nul

echo Abriendo Camello en el navegador...
start "" http://localhost:8080/

exit /b

