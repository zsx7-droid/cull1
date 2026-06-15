@echo off
chcp 65001 >nul
echo ========================================
echo   畲族文化平台 - 启动所有服务
echo ========================================
echo.

REM 启动后端API服务
echo [1/3] 启动后端API服务 (端口: 8080)...
start "SheCulture-API" cmd /k "cd /d %~dp0server && node server.js"

timeout /t 3 /nobreak >nul

REM 启动前端开发服务器
echo [2/3] 启动前端服务 (端口: 3000)...
start "SheCulture-Frontend" cmd /k "cd /d %~dp0 && npm run dev"

timeout /t 3 /nobreak >nul

REM 启动Spring Boot后台
echo [3/3] 启动后台管理系统 (端口: 8090)...
start "SheCulture-Admin" cmd /k "cd /d %~dp0admin && mvn spring-boot:run"

echo.
echo ========================================
echo   所有服务已启动！
echo ========================================
echo.
echo 访问地址：
echo   前端页面: http://localhost:3000
echo   后端API:  http://localhost:8080
echo   后台管理: http://localhost:8090
echo.
echo 提示：关闭命令窗口即可停止对应服务
echo.
pause
