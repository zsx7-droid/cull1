# 项目部署说明

## 一、环境准备

### 1.1 开发环境
- Node.js: >= 16.0.0
- npm: >= 8.0.0
- 推荐IDE: Visual Studio Code

### 1.2 生产环境
- Web服务器: Nginx >= 1.18 或 Apache >= 2.4
- 操作系统: Linux (Ubuntu/CentOS) 或 Windows Server
- 浏览器: 支持现代浏览器（Chrome, Firefox, Safari, Edge）

## 二、本地开发

### 2.1 安装依赖

```bash
# 进入项目目录
cd d:\cull

# 安装所有依赖
npm install
```

如果安装速度慢，可以使用国内镜像：

```bash
npm install --registry=https://registry.npmmirror.com
```

### 2.2 启动开发服务器

```bash
npm run dev
```

启动成功后，浏览器访问：http://localhost:3000

### 2.3 开发建议

1. **安装Vue DevTools**: 在Chrome或Firefox浏览器中安装Vue DevTools扩展，方便调试
2. **代码提示**: VSCode推荐安装以下插件
   - Vue Language Features (Volar)
   - ESLint
   - Prettier
   - Sass

## 三、生产构建

### 3.1 构建项目

```bash
# 清理之前的构建（可选）
rm -rf dist

# 执行生产构建
npm run build
```

构建完成后，会在项目根目录生成 `dist/` 文件夹，包含所有静态资源文件。

### 3.2 本地预览

```bash
npm run preview
```

可以在本地预览生产构建的效果，访问 http://localhost:5000（端口可能不同）

## 四、部署到服务器

### 方案一：Nginx部署（推荐）

#### 4.1.1 上传文件

将 `dist/` 目录下的所有文件上传到服务器的指定目录，例如：

```bash
# 在服务器上创建目录
mkdir -p /var/www/sheshe-culture

# 上传文件（使用scp或FTP工具）
scp -r dist/* user@your-server:/var/www/sheshe-culture/
```

#### 4.1.2 配置Nginx

创建Nginx配置文件 `/etc/nginx/sites-available/sheshe-culture.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # 网站根目录
    root /var/www/sheshe-culture;
    index index.html;
    
    # 开启gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_min_length 1000;
    
    # 静态资源缓存
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Vue Router history模式支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API代理（如果后端分离）
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
}
```

#### 4.1.3 启用配置

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/sheshe-culture.conf /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

#### 4.1.4 配置HTTPS（推荐）

使用Let's Encrypt免费SSL证书：

```bash
# 安装certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 3 * * * certbot renew --quiet
```

### 方案二：Docker部署

#### 4.2.1 创建Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 构建阶段
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 4.2.2 创建nginx.conf

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 4.2.3 构建和运行

```bash
# 构建镜像
docker build -t sheshe-culture-platform .

# 运行容器
docker run -d -p 80:80 --name sheshe-culture sheshe-culture-platform

# 查看日志
docker logs -f sheshe-culture
```

#### 4.2.4 使用Docker Compose

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - app-network

  backend:
    image: your-backend-image
    ports:
      - "8080:8080"
    environment:
      - DB_HOST=db
    networks:
      - app-network

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your-password
      MYSQL_DATABASE: sheshe_culture
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - app-network

networks:
  app-network:
    driver: bridge

volumes:
  db-data:
```

运行：

```bash
docker-compose up -d
```

### 方案三：云服务器部署

#### 4.3.1 阿里云/腾讯云部署

1. **购买云服务器**
   - 选择CentOS 7+ 或 Ubuntu 18.04+
   - 配置建议：2核4G起步

2. **安装必要软件**

```bash
# Ubuntu
sudo apt update
sudo apt install nginx nodejs npm

# CentOS
sudo yum install epel-release
sudo yum install nginx nodejs npm
```

3. **上传并部署**
   - 使用SCP或FTP上传dist文件
   - 配置Nginx（参考上面配置）
   - 启动服务

#### 4.3.2 对象存储 + CDN（推荐）

对于静态资源较多的情况，建议使用对象存储：

1. **阿里云OSS**
   - 创建Bucket
   - 上传dist文件
   - 配置静态网站托管
   - 绑定自定义域名
   - 开启CDN加速

2. **腾讯云COS**
   - 类似OSS的操作流程

## 五、环境变量配置

### 5.1 创建环境变量文件

创建 `.env.production` 文件：

```env
# API基础地址
VITE_API_BASE_URL=https://api.your-domain.com

# 其他配置
VITE_APP_TITLE=浙江畲族文化交流与交易平台
```

### 5.2 在代码中使用

```javascript
// 在vite.config.js中
export default defineConfig({
  // ...
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(process.env.VITE_API_BASE_URL)
  }
})
```

## 六、性能优化

### 6.1 构建优化

在 `vite.config.js` 中添加：

```javascript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          element: ['element-plus'],
          utils: ['axios']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
})
```

### 6.2 图片优化

1. 使用WebP格式（减小50%体积）
2. 图片懒加载
3. 响应式图片

### 6.3 缓存策略

在Nginx中配置强缓存和协商缓存：

```nginx
# HTML文件不缓存
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}

# JS和CSS文件长期缓存
location ~* \.(js|css)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

## 七、监控和日志

### 7.1 前端监控

集成监控SDK（可选）：
- Sentry: 错误追踪
- Google Analytics: 访问统计
- 阿里云ARMS: 性能监控

### 7.2 Nginx日志

```nginx
access_log /var/log/nginx/sheshe-culture.access.log;
error_log /var/log/nginx/sheshe-culture.error.log;
```

查看日志：

```bash
# 实时查看访问日志
tail -f /var/log/nginx/sheshe-culture.access.log

# 查看错误日志
tail -f /var/log/nginx/sheshe-culture.error.log
```

## 八、常见问题排查

### 8.1 页面空白

1. 检查浏览器控制台错误
2. 确认路由模式（history/hash）
3. 检查Nginx配置中的try_files

### 8.2 路由404

确保Nginx配置了：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

### 8.3 API请求失败

1. 检查API代理配置
2. 确认后端服务是否启动
3. 检查跨域配置

### 8.4 样式丢失

1. 清除浏览器缓存
2. 检查构建是否成功
3. 确认文件路径正确

## 九、备份和恢复

### 9.1 备份内容

- 源代码（Git仓库）
- 环境变量文件
- Nginx配置文件
- SSL证书

### 9.2 快速恢复脚本

创建 `deploy.sh`：

```bash
#!/bin/bash

echo "开始部署..."

# 1. 拉取最新代码
git pull origin main

# 2. 安装依赖
npm install

# 3. 构建
npm run build

# 4. 备份旧版本
cp -r /var/www/sheshe-culture /var/www/sheshe-culture.backup

# 5. 部署新版本
rm -rf /var/www/sheshe-culture/*
cp -r dist/* /var/www/sheshe-culture/

# 6. 重启Nginx
sudo systemctl restart nginx

echo "部署完成！"
```

赋予执行权限：

```bash
chmod +x deploy.sh
```

## 十、维护建议

1. **定期更新依赖**: `npm outdated` 检查过时包
2. **安全补丁**: 及时更新Node.js和Nginx
3. **性能监控**: 定期检查页面加载速度
4. **日志轮转**: 配置logrotate防止日志过大
5. **数据库备份**: 如果使用后端，定期备份数据库

## 十一、联系支持

如遇到部署问题，请联系技术支持：
- Email: support@sheshe-culture.com
- 电话: 0571-XXXXXXXX

---

**最后更新时间**: 2024-01-15
