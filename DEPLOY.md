# 畲族文化平台部署指南

## 项目结构

```
cull1/
├── src/                 # 前端Vue源码
├── server/              # 后端Node.js服务
├── admin/               # Spring Boot后台
├── dist/                # 前端构建产物（部署用）
├── package.json         # 前端依赖
├── deploy-build.bat     # 一键构建脚本
├── start-all.bat        # 启动所有服务
└── stop-all.bat         # 停止所有服务
```

## 本地部署

### 方式一：使用脚本（推荐）

1. **构建项目**
```bash
deploy-build.bat
```

2. **启动所有服务**
```bash
start-all.bat
```

3. **停止所有服务**
```bash
stop-all.bat
```

### 方式二：手动启动

```bash
# 终端1：启动后端
cd server
node server.js

# 终端2：启动前端
npm run dev

# 终端3：启动后台
cd admin
mvn spring-boot:run
```

## 服务器部署

### 环境要求

- Node.js >= 16.0
- Maven >= 3.6
- JDK >= 11
- Nginx (可选，用于反向代理)

### 步骤1：上传代码

将整个项目上传到服务器（使用FTP、SCP或Git）

```bash
git clone <你的仓库地址>
cd cull1
```

### 步骤2：安装依赖并构建

```bash
# 安装前端依赖并构建
npm install
npm run build

# 安装后端依赖
cd server
npm install

# 构建Spring Boot
cd ../admin
mvn clean package -DskipTests
```

### 步骤3：配置Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/cull1/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端API
    location /api {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }

    # Spring Boot后台
    location /admin {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
    }
}
```

### 步骤4：使用PM2守护后端

```bash
# 全局安装PM2
npm install -g pm2

# 启动后端服务
cd server
pm2 start server.js --name she-culture-api

# 设置开机自启
pm2 save
pm2 startup
```

### 步骤5：配置Systemd服务（Linux）

创建 `/etc/systemd/system/she-culture.service`:

```ini
[Unit]
Description=She Culture Platform
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/cull1/server
ExecStart=/usr/bin/node /var/www/cull1/server/server.js
Restart=always

[Install]
WantedBy=multi-user.target
```

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable she-culture
sudo systemctl start she-culture
```

## Docker部署（推荐）

### 1. 创建Dockerfile

**前端Dockerfile:**
```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**后端Dockerfile:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

### 2. 创建docker-compose.yml

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  backend:
    build: ./server
    ports:
      - "8080:8080"
    volumes:
      - ./server/data:/app/data

  admin:
    build: ./admin
    ports:
      - "8090:8090"
    volumes:
      - ./admin/data:/app/data
```

### 3. 启动

```bash
docker-compose up -d
```

## 常用命令

| 操作 | 命令 |
|------|------|
| 构建前端 | `npm run build` |
| 启动后端 | `cd server && node server.js` |
| 启动后台 | `cd admin && mvn spring-boot:run` |
| 查看PM2状态 | `pm2 status` |
| 重启后端 | `pm2 restart she-culture-api` |
| 查看日志 | `pm2 logs` |

## 注意事项

1. **数据持久化**：JSON数据文件位于 `server/data/db.json`，请定期备份
2. **端口占用**：确保8080、8090、3000端口未被占用
3. **跨域配置**：如需修改API地址，修改 `src/utils/request.js` 中的baseURL
4. **HTTPS**：生产环境建议配置SSL证书
