@echo off
chcp 65001 >nul
echo ========================================
echo   畲族文化平台 - 停止所有服务
echo ========================================
echo.

echo 停止Node.js进程...
taskkill /F /IM node.exe >nul 2>nul
echo 后端API服务已停止

echo 停止Java进程...
taskkill /F /IM java.exe >nul 2>nul
echo Spring Boot后台已停止

echo.
echo ========================================
echo   所有服务已停止
echo ========================================
pause
