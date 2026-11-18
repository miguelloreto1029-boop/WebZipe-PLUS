@echo off
REM Abre Camello en el navegador usando un servidor local de Python.
REM Requiere Python instalado (python.org). Cierra esta ventana para apagar el servidor.
cd /d "%~dp0"
start "" http://localhost:8080/
python -m http.server 8080
if errorlevel 1 (
  echo.
  echo No se encontro Python. Instalalo desde https://www.python.org o abre la version en linea:
  echo https://webzipe7-byte.github.io/WebZipe/camello/
  pause
)
