@echo off
echo ========================================
echo 浙江畲族文化交流与交易平台 - 前端项目
echo ========================================
echo.

echo [1/3] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未检测到Node.js，请先安装Node.js
    pause
    exit /b 1
)
echo Node.js版本: 
node --version
echo.

echo [2/3] 安装依赖...
if not exist node_modules (
    call npm install
    if errorlevel 1 (
        echo 错误: 依赖安装失败
        pause
        exit /b 1
    )
) else (
    echo 依赖已存在，跳过安装
)
echo.

echo [3/3] 启动开发服务器...
echo.
echo ========================================
echo 开发服务器即将启动...
echo 请在浏览器中访问: http://localhost:3000
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

call npm run dev
