# 浙江畲族文化交流与交易平台 - 前端项目

## 项目简介

这是一个面向浙江畲族文化的数字化展示、交流互动、手工艺品/文创产品线上交易一体化平台。项目采用现代化的Vue.js技术栈，实现了文化交流与产品交易的完整闭环。

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 5
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP客户端**: Axios
- **样式预编译**: Sass

## 核心功能模块

### 1. 文化展示
- 畲族文化资讯浏览
- 非遗展示（山歌、彩带、刺绣、服饰）
- 音视频播放支持
- 文化资源检索

### 2. 交流互动
- 论坛发帖与回复
- 评论系统
- 文化主题活动报名
- 在线分享功能

### 3. 线上交易
- 商品浏览与搜索
- 商品详情展示
- 购物车管理
- 订单创建与管理
- 物流跟踪

### 4. 用户管理
- 用户注册/登录
- 个人中心
- 权限分级控制（普通用户、传承人、商家、管理员）

### 5. 后台管理
- 文化资源管理
- 用户管理
- 交易管理
- 数据统计分析

## 项目结构

```
zhe-she-culture-platform/
├── src/
│   ├── api/              # API接口定义
│   │   ├── culture.js    # 文化相关API
│   │   ├── shop.js       # 商城相关API
│   │   └── user.js       # 用户相关API
│   ├── components/       # 公共组件
│   │   ├── Header.vue    # 头部导航
│   │   └── Footer.vue    # 页脚
│   ├── router/          # 路由配置
│   │   └── index.js
│   ├── stores/          # Pinia状态管理
│   │   └── user.js      # 用户状态
│   ├── utils/           # 工具函数
│   │   └── request.js   # Axios封装
│   ├── views/           # 页面组件
│   │   ├── Home.vue     # 首页
│   │   ├── culture/     # 文化展示
│   │   ├── forum/       # 论坛
│   │   ├── activity/    # 活动
│   │   ├── shop/        # 商城
│   │   ├── order/       # 订单
│   │   ├── user/        # 用户中心
│   │   └── admin/       # 后台管理
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── index.html           # HTML模板
├── vite.config.js       # Vite配置
├── package.json         # 依赖配置
└── README.md            # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
```

构建产物将输出到 `dist/` 目录

### 预览生产构建

```bash
npm run preview
```

## 设计特色

### 1. 畲族文化视觉元素
- **主色调**: 畲族红 (#C81D25)、畲族蓝 (#1E3A8A)、金色 (#F59E0B)
- **渐变设计**: 采用畲族传统色彩渐变
- **图标设计**: 融入畲族文化符号

### 2. 响应式设计
- 支持桌面端、平板、手机等多设备
- 自适应布局和断点设置
- 移动端友好的交互优化

### 3. 用户体验优化
- 流畅的页面过渡动画
- 卡片悬浮效果
- 加载状态提示
- 友好的错误提示

## 路由说明

| 路径 | 页面 | 说明 | 需要登录 |
|------|------|------|----------|
| / | 首页 | 平台概览 | 否 |
| /culture | 文化展示列表 | 浏览文化资源 | 否 |
| /culture/:id | 文化详情 | 查看详细内容 | 否 |
| /forum | 论坛列表 | 交流互动 | 是 |
| /forum/:id | 帖子详情 | 查看详情和评论 | 是 |
| /activity | 活动列表 | 文化活动 | 是 |
| /activity/:id | 活动详情 | 活动详情和报名 | 是 |
| /shop | 商品列表 | 浏览商品 | 否 |
| /product/:id | 商品详情 | 查看商品详情 | 否 |
| /cart | 购物车 | 管理购物车 | 是 |
| /order | 订单列表 | 查看订单 | 是 |
| /order/:id | 订单详情 | 订单详细信息 | 是 |
| /login | 登录 | 用户登录 | 否 |
| /register | 注册 | 用户注册 | 否 |
| /user | 个人中心 | 个人信息管理 | 是 |
| /admin | 后台管理 | 管理员后台 | 是(管理员) |

## API对接说明

项目中使用了模拟数据，实际开发时需要对接后端API。API接口定义在 `src/api/` 目录下，通过 `src/utils/request.js` 中的Axios实例进行请求。

### API配置

在 `vite.config.js` 中配置了代理：

```javascript
server: {
  port: 3000,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',  // 后端服务地址
      changeOrigin: true
    }
  }
}
```

### 添加新API

在 `src/api/` 下创建新的API文件：

```javascript
import request from '@/utils/request'

export function getData(params) {
  return request({
    url: '/endpoint',
    method: 'get',
    params
  })
}
```

## 状态管理

使用Pinia进行状态管理，主要管理用户登录状态和信息：

```javascript
// src/stores/user.js
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
userStore.setUserInfo(userInfo)
userStore.setToken(token)
```

## 权限控制

通过Vue Router的路由守卫实现权限控制：

- **requireAuth**: 需要登录才能访问
- **requireAdmin**: 需要管理员权限

## 样式规范

### 颜色变量

```scss
$primary-red: #C81D25;      // 畲族红
$primary-blue: #1E3A8A;     // 畲族蓝
$primary-gold: #F59E0B;     // 金色
$text-primary: #333;
$text-secondary: #666;
$text-light: #999;
```

### 组件命名

- 使用 PascalCase 命名组件文件
- 使用 kebab-case 命名CSS类
- BEM命名规范：`.block__element--modifier`

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 部署说明

### Nginx部署

1. 构建项目：`npm run build`
2. 将 `dist/` 目录上传到服务器
3. 配置Nginx：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend-server:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Docker部署

```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 开发规范

1. **代码风格**: 遵循ESLint规范
2. **提交信息**: 使用语义化提交信息
3. **组件设计**: 保持组件单一职责
4. **注释**: 复杂逻辑必须添加注释
5. **测试**: 关键功能编写单元测试

## 性能优化

- 路由懒加载
- 图片懒加载
- 组件按需加载
- API请求防抖
- 缓存策略优化

## 常见问题

### Q: 如何修改API基础地址？

A: 修改 `vite.config.js` 中的代理配置或 `src/utils/request.js` 中的baseURL。

### Q: 如何添加新的页面？

A: 
1. 在 `src/views/` 下创建页面组件
2. 在 `src/router/index.js` 中添加路由配置
3. 根据需要添加权限控制

### Q: 如何调试应用？

A: 安装Vue DevTools浏览器插件，可以方便地查看组件状态和调试。

## 联系方式

- 邮箱: contact@sheshe-culture.com
- 电话: 0571-XXXXXXXX

## 许可证

Copyright © 2024 浙江畲族文化交流与交易平台

---

**注意**: 本项目使用的是模拟数据，实际使用时需要对接后端API接口。
