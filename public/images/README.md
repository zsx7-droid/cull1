# 图片资源使用说明

## 📁 目录结构

```
public/
└── images/
    ├── banners/      # Banner轮播图 (建议尺寸: 1920x500px)
    ├── culture/      # 文化展示图片 (建议尺寸: 800x600px)
    ├── products/     # 商品图片 (建议尺寸: 800x800px)
    ├── activities/   # 活动图片 (建议尺寸: 1200x400px)
    └── forum/        # 论坛配图 (建议尺寸: 800x600px)
```

## 📝 使用指南

### 1. 放置图片文件

将您的图片文件放入对应的目录中：

**示例：**
```
public/images/products/bag-001.jpg
public/images/culture/mountain-song.jpg
public/images/banners/home-banner-1.jpg
```

### 2. 在代码中使用

#### 方式一：绝对路径引用（推荐）

```vue
<template>
  <img src="/images/products/bag-001.jpg" alt="商品图片" />
</template>
```

#### 方式二：动态绑定

```vue
<script setup>
const productImage = '/images/products/bag-001.jpg'
</script>

<template>
  <img :src="productImage" alt="商品图片" />
</template>
```

### 3. 替换现有网络图片

当前项目使用的是 Unsplash 网络图片，您可以逐步替换为本地图片：

**修改前：**
```javascript
coverImage: 'https://images.unsplash.com/photo-xxx?w=400'
```

**修改后：**
```javascript
coverImage: '/images/products/bag-001.jpg'
```

## 🎨 图片规范建议

### 尺寸要求

| 用途 | 推荐尺寸 | 格式 | 大小限制 |
|------|---------|------|---------|
| Banner轮播 | 1920x500px | JPG/WebP | < 500KB |
| 商品主图 | 800x800px | JPG/WebP | < 300KB |
| 文化展示 | 800x600px | JPG/WebP | < 300KB |
| 活动封面 | 1200x400px | JPG/WebP | < 400KB |
| 论坛配图 | 800x600px | JPG/WebP | < 300KB |
| 用户头像 | 200x200px | PNG/JPG | < 100KB |

### 命名规范

- 使用小写字母
- 使用连字符 `-` 分隔单词
- 包含有意义的描述

**示例：**
```
✅ sheshe-bag-red-001.jpg
✅ mountain-song-cover.jpg
❌ IMG_20240115.jpg
❌ 新建图片.jpg
```

### 格式选择

- **JPG**: 照片类图片，色彩丰富
- **PNG**: 需要透明背景的图片
- **WebP**: 现代格式，体积更小（推荐）
- **SVG**: 图标、Logo等矢量图

## 🚀 优化建议

### 1. 图片压缩

上传前使用工具压缩图片：
- TinyPNG: https://tinypng.com/
- Squoosh: https://squoosh.app/

### 2. 响应式图片

提供多种尺寸，适配不同设备：

```html
<picture>
  <source media="(max-width: 768px)" srcset="/images/products/bag-001-small.jpg">
  <source media="(min-width: 769px)" srcset="/images/products/bag-001-large.jpg">
  <img src="/images/products/bag-001.jpg" alt="商品图片">
</picture>
```

### 3. 懒加载

对于列表图片，建议使用懒加载：

```vue
<el-image
  src="/images/products/bag-001.jpg"
  lazy
  fit="cover"
/>
```

## 📸 图片来源建议

### 畲族文化相关图片获取途径：

1. **实地拍摄**
   - 畲族村落
   - 手工艺品制作过程
   - 民俗活动现场

2. **专业摄影机构**
   - 购买版权图片
   - 委托拍摄

3. **免费图库**
   - Unsplash: https://unsplash.com/
   - Pexels: https://www.pexels.com/
   - Pixabay: https://pixabay.com/

4. **民族文化资源库**
   - 联系当地文化馆
   - 非遗保护中心

## 📋 图片清单模板

创建一个表格记录已添加的图片：

| 文件名 | 类型 | 尺寸 | 用途 | 添加日期 |
|-------|------|------|------|---------|
| banner-home-01.jpg | Banner | 1920x500 | 首页轮播 | 2024-01-15 |
| product-bag-001.jpg | 商品 | 800x800 | 彩带编织包 | 2024-01-15 |
| culture-song-01.jpg | 文化 | 800x600 | 山歌介绍 | 2024-01-15 |

---

**提示：** 使用本地图片可以提升加载速度，避免外部依赖，建议逐步替换网络图片。
