@echo off
chcp 65001 >nul
echo ========================================
echo   畲族文化平台 - 一键部署脚本
echo ========================================
echo.

REM 检查Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)

REM 检查Maven
where mvn >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到Maven，请先安装Maven
    pause
    exit /b 1
)

echo [1/4] 安装前端依赖...
cd /d "%~dp0"
if not exist "node_modules" (
    call npm install
) else (
    echo 前端依赖已安装，跳过
)

echo.
echo [2/4] 构建前端生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 前端构建失败
    pause
    exit /b 1
)
echo 前端构建完成，文件位于 dist 目录

echo.
echo [3/4] 安装后端依赖...
cd /d "%~dp0\server"
if not exist "node_modules" (
    call npm install
) else (
    echo 后端依赖已安装，跳过
)

echo.
echo [4/4] 构建Spring Boot后台...
cd /d "%~dp0\admin"
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [错误] Spring Boot构建失败
    pause
    exit /b 1
)
echo Spring Boot构建完成，JAR文件位于 admin\target 目录

echo.
echo ========================================
echo   部署构建完成！
echo ========================================
echo.
echo 启动服务：
echo   前端: npm run dev
echo   后端: cd server ^&^& node server.js
echo   后台: cd admin ^&^& mvn spring-boot:run
echo.
echo 或使用PM2守护：
echo   pm2 start server.js --name she-culture-api
echo.
pause
