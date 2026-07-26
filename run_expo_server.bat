@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd c:\Users\manik\Downloads\PantryMobileApp
"C:\Program Files\nodejs\node.exe" node_modules\expo\bin\cli start --web --non-interactive > server.log 2>&1
