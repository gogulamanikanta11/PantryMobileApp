@echo off
set PATH=C:\Program Files\nodejs;%PATH%
cd c:\Users\manik\Downloads\PantryMobileApp
call npx expo start --web --non-interactive > server.log 2> server_err.log
