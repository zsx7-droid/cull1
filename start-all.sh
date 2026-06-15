#!/bin/bash

# 畲族文化平台 - 启动所有服务 (Linux/Mac)

echo "========================================"
echo "  畲族文化平台 - 启动所有服务"
echo "========================================"

# 启动后端API服务
echo "[1/3] 启动后端API服务 (端口: 8080)..."
cd server
node server.js &
SERVER_PID=$!
cd ..

echo "后端API服务已启动 (PID: $SERVER_PID)"

# 等待一下再启动前端
sleep 3

# 启动前端开发服务器
echo "[2/3] 启动前端服务 (端口: 3000)..."
npm run dev &
FRONTEND_PID=$!

echo "前端服务已启动 (PID: $FRONTEND_PID)"

# 等待一下再启动后台
sleep 3

# 启动Spring Boot后台
echo "[3/3] 启动后台管理系统 (端口: 8090)..."
cd admin
mvn spring-boot:run &
ADMIN_PID=$!
cd ..

echo "后台服务已启动 (PID: $ADMIN_PID)"

echo ""
echo "========================================"
echo "  所有服务已启动！"
echo "========================================"
echo ""
echo "访问地址："
echo "  前端页面: http://localhost:3000"
echo "  后端API:  http://localhost:8080"
echo "  后台管理: http://localhost:8090"
echo ""
echo "停止服务: ./stop-all.sh"
echo ""
