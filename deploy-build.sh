#!/bin/bash

# 畲族文化平台 - 部署构建脚本 (Linux/Mac)

echo "========================================"
echo "  畲族文化平台 - 一键部署脚本"
echo "========================================"

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未检测到Node.js，请先安装Node.js"
    exit 1
fi

# 检查Maven
if ! command -v mvn &> /dev/null; then
    echo "[错误] 未检测到Maven，请先安装Maven"
    exit 1
fi

echo "[1/4] 安装前端依赖..."
npm install

echo ""
echo "[2/4] 构建前端生产版本..."
npm run build
if [ $? -ne 0 ]; then
    echo "[错误] 前端构建失败"
    exit 1
fi
echo "前端构建完成，文件位于 dist 目录"

echo ""
echo "[3/4] 安装后端依赖..."
cd server
npm install
cd ..

echo ""
echo "[4/4] 构建Spring Boot后台..."
cd admin
mvn clean package -DskipTests
if [ $? -ne 0 ]; then
    echo "[错误] Spring Boot构建失败"
    exit 1
fi
echo "Spring Boot构建完成，JAR文件位于 admin/target 目录"

echo ""
echo "========================================"
echo "  部署构建完成！"
echo "========================================"
echo ""
echo "启动服务："
echo "  前端: npm run dev"
echo "  后端: cd server && node server.js"
echo "  后台: cd admin && mvn spring-boot:run"
echo ""
echo "或使用PM2守护："
echo "  pm2 start server.js --name she-culture-api"
echo ""
