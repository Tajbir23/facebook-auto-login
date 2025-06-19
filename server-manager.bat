@echo off
title Facebook Auto Login Server Manager
:menu
cls
echo ===================================
echo    Server Management Menu
echo ===================================
echo.
echo 1. Start Server
echo 2. Stop Server
echo 3. Update from Git
echo 4. Exit
echo.
echo ===================================
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto stop_server
if "%choice%"=="3" goto update_server
if "%choice%"=="4" goto exit_script

echo Invalid choice. Please try again.
timeout /t 2 >nul
goto menu

:start_server
echo.
echo Starting the server...
start /B npm run dev
echo Server started successfully!
timeout /t 2 >nul
goto menu

:stop_server
echo.
echo Stopping the server...
taskkill /F /IM node.exe
echo Server stopped successfully!
timeout /t 2 >nul
goto menu

:update_server
echo.
echo Updating from Git...
git fetch
git pull
npm install
echo Update completed!
timeout /t 2 >nul
goto menu

:exit_script
echo.
echo Goodbye!
timeout /t 2 >nul
exit 