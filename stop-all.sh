#!/bin/bash

# 畲族文化平台 - 停止所有服务 (Linux/Mac)

echo "========================================"
echo "  畲族文化平台 - 停止所有服务"
echo "========================================"

echo "停止Node.js进程..."
pkill -f "node server.js"
pkill -f "vite"
echo "Node.js进程已停止"

echo "停止Java进程..."
pkill -f "spring-boot"
pkill -f "AdminApplication"
echo "Java进程已停止"

# 如果使用PM2
if command -v pm2 &> /dev/null; then
    echo "停止PM2守护进程..."
    pm2 stop all
    pm2 delete all
fi

echo ""
echo "========================================"
echo "  所有服务已停止"
echo "========================================"
