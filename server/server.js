require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Low } = require('lowdb')
const { JSONFile } = require('lowdb/node')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { join } = require('path')

const app = express()
const PORT = process.env.PORT || 8080
const JWT_SECRET = process.env.JWT_SECRET || 'she-culture-jwt-secret-key'
const ALI_ACCESS_KEY_ID = process.env.ALI_ACCESS_KEY_ID || ''
const ALI_ACCESS_KEY_SECRET = process.env.ALI_ACCESS_KEY_SECRET || ''
const AI_API_KEY = process.env.AI_API_KEY || ''

app.set('trust proxy', 1)
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(join(__dirname, 'uploads')))

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = join(__dirname, 'uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '.' + file.originalname.split('.').pop())
  }
})

const upload = multer({ storage })

const adapter = new JSONFile(join(__dirname, 'data', 'db.json'))
const defaultData = { users: [], posts: [], comments: [], likes: [], favorites: [], products: [], categories: [], carts: [], orders: [], cultures: [], activities: [] }
const db = new Low(adapter, defaultData)

async function initDB() {
  const dataDir = join(__dirname, 'data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  await db.read()
  if (!db.data) {
    db.data = defaultData
    await db.write()
  }
  if (!db.data.posts) {
    db.data.posts = []
  }
  if (!db.data.users) {
    db.data.users = []
  }
  if (!db.data.comments) {
    db.data.comments = []
  }
  if (!db.data.likes) {
    db.data.likes = []
  }
  if (!db.data.favorites) {
    db.data.favorites = []
  }
  if (!db.data.products) {
    db.data.products = []
  }
  if (!db.data.categories) {
    db.data.categories = [
      { id: 1, name: '服饰', icon: '👘', description: '畲族传统服饰' },
      { id: 2, name: '首饰', icon: '💍', description: '畲族特色首饰' },
      { id: 3, name: '工艺品', icon: '🏺', description: '手工工艺品' },
      { id: 4, name: '食品', icon: '🍵', description: '畲族特色美食' },
      { id: 5, name: '文创', icon: '🎨', description: '文创产品' }
    ]
  }
  if (!db.data.carts) {
    db.data.carts = []
  }
  if (!db.data.orders) {
    db.data.orders = []
  }
  if (!db.data.cultures) {
    db.data.cultures = []
  }
  if (!db.data.activities) {
    db.data.activities = []
  }
  await db.write()
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: '未登录' })
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], JWT_SECRET)
    req.user = decoded
    next()
  } catch (err) {
    return res.status(401).json({ code: 401, message: '登录已过期，请重新登录' })
  }
}

app.post('/api/user/register', async (req, res) => {
  try {
    const { username, phone, password, role } = req.body
    
    await db.read()
    const existingUser = db.data.users.find(u => u.username === username || u.phone === phone)
    if (existingUser) {
      return res.status(400).json({ code: 400, message: '用户名或手机号已存在' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = {
      id: Date.now(),
      username,
      phone,
      password: hashedPassword,
      role: role || 'user',
      createdAt: new Date().toISOString()
    }

    db.data.users.push(newUser)
    await db.write()

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
        role: newUser.role
      }
    })
  } catch (error) {
    console.error('注册错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/user/login', async (req, res) => {
  try {
    const { username, password } = req.body

    await db.read()
    const user = db.data.users.find(u => u.username === username)
    if (!user) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({ code: 401, message: '用户名或密码错误' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar || '',
        nickname: user.nickname || '',
        bio: user.bio || '',
        token
      }
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/user/info', authMiddleware, async (req, res) => {
  await db.read()
  const user = db.data.users.find(u => u.id === req.user.id)
  if (!user) {
    return res.status(404).json({ code: 404, message: '用户不存在' })
  }
  res.json({
    code: 200,
    data: {
      id: user.id,
      username: user.username,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar || '',
      nickname: user.nickname || '',
      bio: user.bio || '',
      email: user.email || ''
    }
  })
})

app.put('/api/user/update', async (req, res) => {
  try {
    const { id, nickname, phone, email, avatar, bio } = req.body
    
    if (!id) {
      return res.status(401).json({ code: 401, message: '请先登录' })
    }
    
    await db.read()
    const userIndex = db.data.users.findIndex(u => u.id === id)
    
    if (userIndex === -1) {
      return res.status(404).json({ code: 404, message: '用户不存在' })
    }
    
    if (nickname) db.data.users[userIndex].nickname = nickname
    if (phone) db.data.users[userIndex].phone = phone
    if (email !== undefined) db.data.users[userIndex].email = email
    if (avatar) db.data.users[userIndex].avatar = avatar
    if (bio !== undefined) db.data.users[userIndex].bio = bio
    
    await db.write()
    
    res.json({
      code: 200,
      message: '更新成功',
      data: db.data.users[userIndex]
    })
  } catch (error) {
    console.error('更新用户信息错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ code: 400, message: '上传失败' })
  }
  
  const url = `/uploads/${req.file.filename}`
  const baseUrl = `${req.protocol}://${req.get('host')}`
  res.json({
    code: 200,
    url: `${baseUrl}${url}`
  })
})

app.get('/api/forum/posts', async (req, res) => {
  try {
    const { category, keyword, page = 1, size = 10, searchType = 'content' } = req.query
    console.log('后端接收参数:', { category, keyword, searchType })
    
    await db.read()
    let posts = [...db.data.posts].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    if (keyword && searchType === 'category') {
      // 分类搜索时，不使用顶部tab分类过滤
    } else if (category && category !== 'latest' && category !== 'essence') {
      posts = posts.filter(p => p.category === category)
    }
    
    if (keyword) {
      const kw = keyword.toLowerCase()
      posts = posts.filter(p => {
        if (searchType === 'author') {
          return p.authorName?.toLowerCase().includes(kw)
        } else if (searchType === 'category') {
          return p.category?.toLowerCase().includes(kw)
        } else {
          return p.title.toLowerCase().includes(kw) || 
                 p.content.toLowerCase().includes(kw)
        }
      })
    }
    
    posts = posts.map(post => {
      const author = db.data.users.find(u => u.id === post.authorId)
      const likeCount = db.data.likes.filter(l => l.targetId === post.id && l.targetType === 'post').length
      const favoriteCount = db.data.favorites.filter(f => f.targetId === post.id && f.targetType === 'post').length
      const replyCount = db.data.comments.filter(c => c.postId === post.id).length
      return {
        ...post,
        authorAvatar: author?.avatar || '',
        likeCount,
        favoriteCount,
        replyCount
      }
    })
    
    const total = posts.length
    const start = (page - 1) * size
    posts = posts.slice(start, start + parseInt(size))
    
    res.json({
      code: 200,
      data: {
        list: posts,
        total
      }
    })
  } catch (error) {
    console.error('获取帖子列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/forum/post/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    
    await db.read()
    const post = db.data.posts.find(p => p.id === parseInt(id))
    
    if (!post) {
      return res.status(404).json({ code: 404, message: '帖子不存在' })
    }
    
    const author = db.data.users.find(u => u.id === post.authorId)
    const likeCount = db.data.likes.filter(l => l.targetId === post.id && l.targetType === 'post').length
    const favoriteCount = db.data.favorites.filter(f => f.targetId === post.id && f.targetType === 'post').length
    const replyCount = db.data.comments.filter(c => c.postId === post.id).length
    const userLiked = userId ? db.data.likes.some(l => l.targetId === post.id && l.targetType === 'post' && l.userId === parseInt(userId)) : false
    const userFavorited = userId ? db.data.favorites.some(f => f.targetId === post.id && f.targetType === 'post' && f.userId === parseInt(userId)) : false
    
    const postWithAvatar = {
      ...post,
      authorAvatar: author?.avatar || '',
      likeCount,
      favoriteCount,
      replyCount,
      userLiked,
      userFavorited
    }
    
    post.views = (post.views || 0) + 1
    await db.write()
    
    res.json({
      code: 200,
      data: postWithAvatar
    })
  } catch (error) {
    console.error('获取帖子详情错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/forum/post', async (req, res) => {
  try {
    const { title, content, category, authorId, authorName } = req.body
    
    if (!title || !content || !category) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' })
    }
    
    if (!authorId || !authorName) {
      return res.status(401).json({ code: 401, message: '请先登录' })
    }
    
    await db.read()
    
    const author = db.data.users.find(u => u.id === authorId)
    
    const newPost = {
      id: Date.now(),
      title,
      content,
      category,
      authorId,
      authorName,
      authorAvatar: author?.avatar || '',
      createTime: new Date().toISOString(),
      views: 0,
      likes: 0,
      replies: 0,
      isTop: false,
      isEssence: false
    }
    
    db.data.posts.push(newPost)
    await db.write()
    
    res.json({
      code: 200,
      message: '发布成功',
      data: newPost
    })
  } catch (error) {
    console.error('发布帖子错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/forum/comments/:postId', async (req, res) => {
  try {
    const { postId } = req.params
    const { userId } = req.query
    
    await db.read()
    let comments = db.data.comments.filter(c => c.postId === parseInt(postId))
    comments = comments.map(comment => {
      const author = db.data.users.find(u => u.id === comment.authorId)
      const likeCount = db.data.likes.filter(l => l.targetId === comment.id && l.targetType === 'comment').length
      const userLiked = userId ? db.data.likes.some(l => l.targetId === comment.id && l.targetType === 'comment' && l.userId === parseInt(userId)) : false
      return {
        ...comment,
        authorAvatar: author?.avatar || '',
        likeCount,
        userLiked
      }
    })
    
    res.json({
      code: 200,
      data: comments
    })
  } catch (error) {
    console.error('获取评论错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/forum/comment', async (req, res) => {
  try {
    const { postId, content, authorId, authorName } = req.body
    
    if (!content || !authorId || !authorName) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' })
    }
    
    await db.read()
    const author = db.data.users.find(u => u.id === authorId)
    
    const newComment = {
      id: Date.now(),
      postId: parseInt(postId),
      content,
      authorId,
      authorName,
      authorAvatar: author?.avatar || '',
      createTime: new Date().toISOString(),
      likes: 0,
      replies: []
    }
    
    db.data.comments.push(newComment)
    await db.write()
    
    res.json({
      code: 200,
      message: '评论成功',
      data: newComment
    })
  } catch (error) {
    console.error('评论错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/forum/reply', async (req, res) => {
  try {
    const { commentId, content, authorId, authorName } = req.body
    
    if (!content || !authorId || !authorName || !commentId) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' })
    }
    
    await db.read()
    const author = db.data.users.find(u => u.id === authorId)
    
    const commentIndex = db.data.comments.findIndex(c => c.id === parseInt(commentId))
    if (commentIndex === -1) {
      return res.status(404).json({ code: 404, message: '评论不存在' })
    }
    
    const newReply = {
      id: Date.now(),
      authorId,
      authorName,
      authorAvatar: author?.avatar || '',
      content,
      createTime: new Date().toISOString()
    }
    
    if (!db.data.comments[commentIndex].replies) {
      db.data.comments[commentIndex].replies = []
    }
    db.data.comments[commentIndex].replies.push(newReply)
    await db.write()
    
    res.json({
      code: 200,
      message: '回复成功',
      data: newReply
    })
  } catch (error) {
    console.error('回复错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.delete('/api/forum/post/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    
    await db.read()
    const postIndex = db.data.posts.findIndex(p => p.id === parseInt(id))
    
    if (postIndex === -1) {
      return res.status(404).json({ code: 404, message: '帖子不存在' })
    }
    
    const post = db.data.posts[postIndex]
    if (post.authorId !== userId) {
      return res.status(403).json({ code: 403, message: '无权删除此帖子' })
    }
    
    db.data.posts.splice(postIndex, 1)
    
    db.data.comments = db.data.comments.filter(c => c.postId !== parseInt(id))
    
    await db.write()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除帖子错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/forum/like', async (req, res) => {
  try {
    const { targetId, targetType, userId } = req.body
    
    if (!targetId || !targetType || !userId) {
      return res.status(400).json({ code: 400, message: '参数错误' })
    }
    
    await db.read()
    
    const existingLikeIndex = db.data.likes.findIndex(
      l => l.targetId === targetId && l.targetType === targetType && l.userId === userId
    )
    
    let isLiked = false
    
    if (existingLikeIndex !== -1) {
      db.data.likes.splice(existingLikeIndex, 1)
      isLiked = false
    } else {
      db.data.likes.push({
        id: Date.now(),
        targetId,
        targetType,
        userId,
        createTime: new Date().toISOString()
      })
      isLiked = true
    }
    
    const likeCount = db.data.likes.filter(
      l => l.targetId === targetId && l.targetType === targetType
    ).length
    
    await db.write()
    
    res.json({
      code: 200,
      data: {
        isLiked,
        likeCount
      }
    })
  } catch (error) {
    console.error('点赞错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/forum/favorite', async (req, res) => {
  try {
    const { targetId, targetType, userId } = req.body
    
    if (!targetId || !targetType || !userId) {
      return res.status(400).json({ code: 400, message: '参数错误' })
    }
    
    await db.read()
    
    const existingIndex = db.data.favorites.findIndex(
      f => f.targetId === targetId && f.targetType === targetType && f.userId === userId
    )
    
    let isFavorited = false
    
    if (existingIndex !== -1) {
      db.data.favorites.splice(existingIndex, 1)
      isFavorited = false
    } else {
      db.data.favorites.push({
        id: Date.now(),
        targetId,
        targetType,
        userId,
        createTime: new Date().toISOString()
      })
      isFavorited = true
    }
    
    await db.write()
    
    res.json({
      code: 200,
      data: { isFavorited }
    })
  } catch (error) {
    console.error('收藏错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/user/favorites', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    
    const userFavorites = db.data.favorites.filter(f => f.userId === parseInt(userId))
    const posts = []
    
    for (const fav of userFavorites) {
      if (fav.targetType === 'post') {
        const post = db.data.posts.find(p => p.id === fav.targetId)
        if (post) {
          const author = db.data.users.find(u => u.id === post.authorId)
          const likeCount = db.data.likes.filter(l => l.targetId === post.id && l.targetType === 'post').length
          posts.push({
            ...post,
            authorAvatar: author?.avatar || '',
            likeCount,
            favoritedAt: fav.createTime
          })
        }
      }
    }
    
    res.json({
      code: 200,
      data: posts
    })
  } catch (error) {
    console.error('获取收藏列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/shop/categories', async (req, res) => {
  try {
    await db.read()
    res.json({
      code: 200,
      data: db.data.categories
    })
  } catch (error) {
    console.error('获取分类错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/shop/products', async (req, res) => {
  try {
    const { category, keyword, page = 1, size = 12 } = req.query
    
    await db.read()
    let products = [...db.data.products].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    if (category) {
      products = products.filter(p => p.category === category)
    }
    
    if (keyword) {
      const kw = keyword.toLowerCase()
      products = products.filter(p => 
        p.name.toLowerCase().includes(kw) || 
        p.description.toLowerCase().includes(kw)
      )
    }
    
    const total = products.length
    const start = (page - 1) * size
    products = products.slice(start, start + parseInt(size))
    
    res.json({
      code: 200,
      data: {
        list: products,
        total
      }
    })
  } catch (error) {
    console.error('获取商品列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/shop/product/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await db.read()
    const product = db.data.products.find(p => p.id === parseInt(id))
    
    if (!product) {
      return res.status(404).json({ code: 404, message: '商品不存在' })
    }
    
    res.json({
      code: 200,
      data: product
    })
  } catch (error) {
    console.error('获取商品详情错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/shop/product', async (req, res) => {
  try {
    const { name, description, price, stock, category, images, sellerId, sellerName } = req.body
    
    if (!name || !price || !category || !sellerId) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' })
    }
    
    await db.read()
    
    const newProduct = {
      id: Date.now(),
      name,
      description: description || '',
      price: parseFloat(price),
      stock: parseInt(stock) || 0,
      category,
      images: images || [],
      sellerId,
      sellerName: sellerName || '',
      sales: 0,
      createTime: new Date().toISOString()
    }
    
    db.data.products.push(newProduct)
    await db.write()
    
    res.json({
      code: 200,
      message: '发布成功',
      data: newProduct
    })
  } catch (error) {
    console.error('发布商品错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/shop/cart', async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body
    
    if (!productId || !quantity || !userId) {
      return res.status(400).json({ code: 400, message: '参数错误' })
    }
    
    await db.read()
    
    const existingCart = db.data.carts.find(
      c => c.productId === productId && c.userId === userId
    )
    
    if (existingCart) {
      existingCart.quantity += quantity
    } else {
      db.data.carts.push({
        id: Date.now(),
        productId,
        quantity,
        userId,
        createTime: new Date().toISOString()
      })
    }
    
    await db.write()
    
    res.json({
      code: 200,
      message: '加入购物车成功'
    })
  } catch (error) {
    console.error('加入购物车错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/shop/cart', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    
    const carts = db.data.carts.filter(c => c.userId === parseInt(userId))
    const products = []
    
    for (const cart of carts) {
      const product = db.data.products.find(p => p.id === cart.productId)
      if (product) {
        products.push({
          ...product,
          cartId: cart.id,
          quantity: cart.quantity
        })
      }
    }
    
    res.json({
      code: 200,
      data: products
    })
  } catch (error) {
    console.error('获取购物车错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.delete('/api/shop/cart/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    await db.read()
    const cartIndex = db.data.carts.findIndex(c => c.id === parseInt(id))
    
    if (cartIndex !== -1) {
      db.data.carts.splice(cartIndex, 1)
      await db.write()
    }
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除购物车商品错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.delete('/api/shop/cart', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '参数错误' })
    }
    
    await db.read()
    db.data.carts = db.data.carts.filter(c => c.userId !== parseInt(userId))
    await db.write()
    
    res.json({
      code: 200,
      message: '清空成功'
    })
  } catch (error) {
    console.error('清空购物车错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/shop/order', async (req, res) => {
  try {
    const { items, userId, address, contact, totalAmount, paymentMethod } = req.body
    
    console.log('创建订单请求:', { items, userId, address, contact, totalAmount, paymentMethod })
    
    if (!items || items.length === 0 || !userId) {
      return res.status(400).json({ code: 400, message: '订单信息不完整', details: { items: !!items, userId: !!userId } })
    }
    
    await db.read()
    
    const newOrder = {
      id: Date.now(),
      orderNo: 'ORD' + Date.now(),
      userId: parseInt(userId),
      items: items.map(item => ({
        productId: item.id,
        productName: item.name,
        productImage: item.images?.[0] || '',
        price: item.price,
        quantity: item.quantity || 1
      })),
      totalAmount,
      address: address || '',
      contact: contact || '',
      paymentMethod: paymentMethod || 'wechat',
      status: 'pending',
      createTime: new Date().toISOString(),
      expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString()
    }
    
    for (const item of items) {
      const productIndex = db.data.products.findIndex(p => p.id === item.id)
      if (productIndex !== -1) {
        db.data.products[productIndex].sales = (db.data.products[productIndex].sales || 0) + (item.quantity || 1)
        if (db.data.products[productIndex].stock >= (item.quantity || 1)) {
          db.data.products[productIndex].stock -= (item.quantity || 1)
        }
      }
    }
    
    db.data.orders.push(newOrder)
    await db.write()
    
    console.log('订单创建成功:', newOrder.id)
    
    res.json({
      code: 200,
      message: '订单创建成功',
      data: newOrder
    })
  } catch (error) {
    console.error('创建订单错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/shop/orders', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    const orders = db.data.orders
      .filter(o => o.userId === parseInt(userId))
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    res.json({
      code: 200,
      data: orders
    })
  } catch (error) {
    console.error('获取订单列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/shop/seller-orders', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    const orders = db.data.orders
    const products = db.data.products
    
    const sellerOrders = orders
      .filter(o => {
        return o.items && o.items.some(item => {
          const product = products.find(p => p.id == item.productId)
          return product && product.sellerId == userId
        })
      })
      .map(o => {
        const buyer = db.data.users.find(u => u.id == o.userId)
        return {
          ...o,
          buyerName: buyer?.username || '',
          buyerNickname: buyer?.nickname || '',
          buyerPhone: o.contact || '',
          items: o.items.map(item => {
            const product = products.find(p => p.id == item.productId)
            return {
              ...item,
              sellerId: product?.sellerId,
              isSellerItem: product?.sellerId == userId
            }
          }).filter(item => {
            const product = products.find(p => p.id == item.productId)
            return product?.sellerId == userId
          })
        }
      })
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    res.json({
      code: 200,
      data: sellerOrders
    })
  } catch (error) {
    console.error('获取卖家订单列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/shop/order/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    let order = db.data.orders.find(o => o.id === parseInt(id))
    
    if (!order) {
      return res.status(404).json({ code: 404, message: '订单不存在' })
    }
    
    const products = db.data.products
    const isBuyer = order.userId === parseInt(userId)
    const isSeller = order.items && order.items.some(item => {
      const product = products.find(p => p.id === item.productId)
      return product && product.sellerId === parseInt(userId)
    })
    
    if (!isBuyer && !isSeller) {
      return res.status(403).json({ code: 403, message: '无权查看此订单' })
    }
    
    if (isSeller) {
      const buyer = db.data.users.find(u => u.id === order.userId)
      order = {
        ...order,
        buyerName: buyer?.username || '',
        buyerNickname: buyer?.nickname || '',
        buyerPhone: order.contact || '',
        items: order.items.map(item => {
          const product = products.find(p => p.id === item.productId)
          return {
            ...item,
            sellerId: product?.sellerId,
            isSellerItem: product?.sellerId === parseInt(userId)
          }
        }).filter(item => {
          const product = products.find(p => p.id === item.productId)
          return product?.sellerId === parseInt(userId)
        })
      }
    }
    
    res.json({
      code: 200,
      data: order
    })
  } catch (error) {
    console.error('获取订单详情错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/shop/order/:id/pay', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.body
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    const orderIndex = db.data.orders.findIndex(o => o.id === parseInt(id) && o.userId === parseInt(userId))
    
    if (orderIndex === -1) {
      return res.status(404).json({ code: 404, message: '订单不存在' })
    }
    
    const order = db.data.orders[orderIndex]
    
    if (order.status !== 'pending') {
      return res.status(400).json({ code: 400, message: '订单状态不正确' })
    }
    
    db.data.orders[orderIndex].status = 'paid'
    db.data.orders[orderIndex].payTime = new Date().toISOString()
    
    await db.write()
    
    res.json({
      code: 200,
      message: '付款成功'
    })
  } catch (error) {
    console.error('付款错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/cultures', async (req, res) => {
  try {
    await db.read()
    const cultures = [...db.data.cultures].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    res.json({
      code: 200,
      data: cultures
    })
  } catch (error) {
    console.error('获取文化列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/culture/:id', async (req, res) => {
  try {
    const { id } = req.params
    await db.read()
    const culture = db.data.cultures.find(c => c.id === parseInt(id))
    if (!culture) {
      return res.status(404).json({ code: 404, message: '文化内容不存在' })
    }
    res.json({
      code: 200,
      data: culture
    })
  } catch (error) {
    console.error('获取文化详情错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/culture', async (req, res) => {
  try {
    const { title, content, type, images, userId } = req.body
    
    if (!title || !content || !userId) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' })
    }
    
    await db.read()
    const user = db.data.users.find(u => u.id === userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '只有管理员才能发布文化内容' })
    }
    
    const newCulture = {
      id: Date.now(),
      title,
      content,
      type: type || 'culture',
      images: images || [],
      authorId: userId,
      authorName: user.username,
      createTime: new Date().toISOString()
    }
    
    db.data.cultures.push(newCulture)
    await db.write()
    
    res.json({
      code: 200,
      message: '发布成功',
      data: newCulture
    })
  } catch (error) {
    console.error('发布文化内容错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/activities', async (req, res) => {
  try {
    const { type } = req.query
    await db.read()
    let activities = [...db.data.activities].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    const now = new Date()
    
    if (type === 'upcoming') {
      // 即将开始：活动开始时间大于当前时间
      activities = activities.filter(a => new Date(a.time) > now)
    } else if (type === 'past') {
      // 往期活动：活动开始时间小于当前时间
      activities = activities.filter(a => new Date(a.time) <= now)
    }
    
    res.json({
      code: 200,
      data: activities
    })
  } catch (error) {
    console.error('获取活动列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/spots', async (req, res) => {
  try {
    const { category } = req.query
    await db.read()
    let spots = [...db.data.spots].sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    if (category && category !== 'all') {
      spots = spots.filter(s => s.category === category)
    }
    
    res.json({
      code: 200,
      data: spots
    })
  } catch (error) {
    console.error('获取景点列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/activity/:id', async (req, res) => {
  try {
    const { id } = req.params
    await db.read()
    const activity = db.data.activities.find(a => a.id === parseInt(id))
    if (!activity) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }
    res.json({
      code: 200,
      data: activity
    })
  } catch (error) {
    console.error('获取活动详情错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/activity', async (req, res) => {
  try {
    const { title, content, location, time, images, userId } = req.body
    
    if (!title || !content || !time || !userId) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' })
    }
    
    await db.read()
    const user = db.data.users.find(u => u.id === userId)
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '只有管理员才能发布活动' })
    }
    
    const newActivity = {
      id: Date.now(),
      title,
      content,
      location: location || '',
      time,
      images: images || [],
      authorId: userId,
      authorName: user.username,
      createTime: new Date().toISOString()
    }
    
    db.data.activities.push(newActivity)
    await db.write()
    
    res.json({
      code: 200,
      message: '发布成功',
      data: newActivity
    })
  } catch (error) {
    console.error('发布活动错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.delete('/api/culture/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    const user = db.data.users.find(u => u.id === parseInt(userId))
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '只有管理员才能删除' })
    }
    
    const cultureIndex = db.data.cultures.findIndex(c => c.id === parseInt(id))
    if (cultureIndex === -1) {
      return res.status(404).json({ code: 404, message: '文化内容不存在' })
    }
    
    if (db.data.cultures[cultureIndex].authorId !== parseInt(userId)) {
      return res.status(403).json({ code: 403, message: '只能删除自己发布的内容' })
    }
    
    db.data.cultures.splice(cultureIndex, 1)
    await db.write()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除文化内容错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.delete('/api/activity/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    const user = db.data.users.find(u => u.id === parseInt(userId))
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ code: 403, message: '只有管理员才能删除' })
    }
    
    const activityIndex = db.data.activities.findIndex(a => a.id === parseInt(id))
    if (activityIndex === -1) {
      return res.status(404).json({ code: 404, message: '活动不存在' })
    }
    
    if (db.data.activities[activityIndex].authorId !== parseInt(userId)) {
      return res.status(403).json({ code: 403, message: '只能删除自己发布的内容' })
    }
    
    db.data.activities.splice(activityIndex, 1)
    await db.write()
    
    res.json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除活动错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

const crypto = require('crypto')

function sendSms(phone, code) {
  return new Promise((resolve, reject) => {
    console.log('开始发送短信到:', phone, '验证码:', code)
    
    const crypto = require('crypto')
    const https = require('https')
    
    const params = {
      Format: 'JSON',
      Version: '2017-05-25',
      AccessKeyId: ALI_ACCESS_KEY_ID,
      SignatureMethod: 'HMAC-SHA1',
      Timestamp: new Date().toISOString(),
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(),
      Action: 'SendSms',
      PhoneNumbers: phone,
      SignName: '速通互联验证码',
      TemplateCode: '100001',
      TemplateParam: JSON.stringify({ code: code, min: '5' })
    }

    const sortedParams = Object.keys(params).sort().map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&')

    const stringToSign = 'POST&%2F&' + encodeURIComponent(sortedParams)
    const signature = crypto.createHmac('sha1', ALI_ACCESS_KEY_SECRET + '&')
      .update(stringToSign)
      .digest('base64')
    
    params.Signature = signature
    
    const postData = Object.keys(params).map(key => {
      return key + '=' + encodeURIComponent(params[key])
    }).join('&')
    
    const options = {
      hostname: 'dysmsapi.aliyuncs.com',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        console.log('阿里云短信响应:', data)
        const result = JSON.parse(data)
        if (result.Code === 'OK') {
          resolve(result)
        } else {
          console.error('阿里云错误:', result.Code, result.Message)
          reject(new Error(result.Message || '发送失败，错误码: ' + result.Code))
        }
      })
    })
    
    req.on('error', (err) => {
      console.error('HTTPS请求错误:', err.message)
      reject(err)
    })
    req.write(postData)
    req.end()
  })
}

function sendSmsByDypns(phone, code) {
  return new Promise((resolve, reject) => {
    console.log('开始发送验证码到:', phone, '验证码:', code)
    
    const crypto = require('crypto')
    const https = require('https')
    
    const params = {
      Format: 'JSON',
      Version: '2017-05-25',
      AccessKeyId: ALI_ACCESS_KEY_ID,
      SignatureMethod: 'HMAC-SHA1',
      Timestamp: new Date().toISOString().replace(/\.\d{3}Z$/, '.000Z'),
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(),
      Action: 'SendSmsVerifyCode',
      PhoneNumber: phone,
      SignName: '速通互联验证码',
      TemplateCode: '100001',
      TemplateParam: JSON.stringify({ code: code, min: '5' })
    }

    const sortedParams = Object.keys(params).sort().map(key => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&')

    const stringToSign = 'POST&%2F&' + encodeURIComponent(sortedParams)
    const signature = crypto.createHmac('sha1', ALI_ACCESS_KEY_SECRET + '&')
      .update(stringToSign)
      .digest('base64')
    
    params.Signature = signature
    
    const postData = Object.keys(params).map(key => {
      return key + '=' + encodeURIComponent(params[key])
    }).join('&')
    
    const options = {
      hostname: 'dypnsapi.aliyuncs.com',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
    
    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        console.log('阿里云号码认证响应:', data)
        const result = JSON.parse(data)
        if (result.Code === 'OK') {
          resolve(result)
        } else {
          console.error('阿里云错误:', result.Code, result.Message)
          reject(new Error(result.Message || '发送失败，错误码: ' + result.Code))
        }
      })
    })
    
    req.on('error', (err) => {
      console.error('HTTPS请求错误:', err.message)
      reject(err)
    })
    req.write(postData)
    req.end()
  })
}

// 使用内存存储验证码
const smsCodes = new Map()

app.post('/api/sms/send', async (req, res) => {
  try {
    const { phone } = req.body
    
    if (!phone) {
      return res.status(400).json({ code: 400, message: '请输入手机号' })
    }
    
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ code: 400, message: '手机号格式不正确' })
    }
    
    const lastSendTime = smsCodes.get(phone)
    const now = Date.now()
    
    if (lastSendTime && now - lastSendTime.time < 60000) {
      return res.status(400).json({ code: 400, message: '发送过于频繁，请稍后再试' })
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    
    smsCodes.set(phone, {
      code,
      time: now,
      expireTime: now + 5 * 60 * 1000
    })
    
    await sendSmsByDypns(phone, code)
    
    res.json({
      code: 200,
      message: '验证码已发送'
    })
  } catch (error) {
    console.error('发送验证码错误:', error)
    res.status(500).json({ code: 500, message: error.message || '发送失败' })
  }
})

app.post('/api/sms/verify', async (req, res) => {
  try {
    const { phone, code } = req.body
    
    if (!phone || !code) {
      return res.status(400).json({ code: 400, message: '参数不完整' })
    }
    
    const record = smsCodes.get(phone)
    
    if (!record) {
      return res.status(400).json({ code: 400, message: '请先获取验证码' })
    }
    
    const now = Date.now()
    
    if (now > record.expireTime) {
      smsCodes.delete(phone)
      return res.status(400).json({ code: 400, message: '验证码已过期，请重新获取' })
    }
    
    if (record.code !== code) {
      return res.status(400).json({ code: 400, message: '验证码错误' })
    }
    
    smsCodes.delete(phone)
    
    res.json({
      code: 200,
      message: '验证成功'
    })
  } catch (error) {
    console.error('验证验证码错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/registration', async (req, res) => {
  try {
    console.log('收到报名请求:', req.body)
    const { activityId, activityTitle, userId, userName, phone } = req.body
    
    if (!activityId || !userId || !userName || !phone) {
      return res.status(400).json({ code: 400, message: '参数不完整' })
    }
    
    const existingReg = db.data.registrations.find(
      r => r.activityId === activityId && r.userId === userId
    )
    
    if (existingReg) {
      return res.status(400).json({ code: 400, message: '您已报名过该活动' })
    }
    
    const registration = {
      id: Date.now(),
      activityId,
      activityTitle,
      userId,
      userName,
      phone,
      createTime: new Date().toISOString()
    }
    
    db.data.registrations.push(registration)
    await db.write()
    
    res.json({
      code: 200,
      message: '报名成功'
    })
  } catch (error) {
    console.error('报名错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/registrations', async (req, res) => {
  try {
    const { activityId, userId } = req.query
    
    let registrations = db.data.registrations
    
    if (activityId) {
      registrations = registrations.filter(r => r.activityId == activityId)
    }
    
    if (userId) {
      registrations = registrations.filter(r => r.userId == userId)
    }
    
    console.log('查询 registrations:', { activityId, userId, count: registrations.length })
    
    res.json({
      code: 200,
      data: registrations
    })
  } catch (error) {
    console.error('获取报名信息错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/friends', async (req, res) => {
  try {
    const { userId } = req.query
    await db.read()
    let friends = db.data.friends
    
    if (userId) {
      friends = friends.filter(f => (f.userId == userId || f.friendId == userId) && (!f.status || f.status === 'accepted'))
      friends = friends.map(f => {
        const friendId = f.userId == userId ? f.friendId : f.userId
        const friend = db.data.users.find(u => u.id == friendId)
        return {
          ...f,
          friendId: friendId,
          friendUsername: friend?.username || '',
          friendNickname: friend?.nickname || '',
          friendAvatar: friend?.avatar || ''
        }
      })
    }
    
    res.json({
      code: 200,
      data: friends
    })
  } catch (error) {
    console.error('获取好友列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/friend-requests', async (req, res) => {
  try {
    const { userId, type } = req.query
    await db.read()
    let requests = db.data.friends
    
    if (userId) {
      if (type === 'sent') {
        requests = requests.filter(f => f.userId == userId && f.status === 'pending')
        requests = requests.map(f => {
          const user = db.data.users.find(u => u.id == f.friendId)
          return {
            ...f,
            fromUserId: f.friendId,
            fromUsername: user?.username || '',
            fromNickname: user?.nickname || '',
            fromAvatar: user?.avatar || ''
          }
        })
      } else {
        requests = requests.filter(f => f.friendId == userId && f.status === 'pending')
        requests = requests.map(f => {
          const user = db.data.users.find(u => u.id == f.userId)
          return {
            ...f,
            fromUserId: f.userId,
            fromUsername: user?.username || '',
            fromNickname: user?.nickname || '',
            fromAvatar: user?.avatar || ''
          }
        })
      }
    }
    
    res.json({
      code: 200,
      data: requests
    })
  } catch (error) {
    console.error('获取好友请求错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/friends', async (req, res) => {
  try {
    const { userId, friendId } = req.body
    
    if (!userId || !friendId) {
      return res.status(400).json({ code: 400, message: '参数不完整' })
    }
    
    if (userId == friendId) {
      return res.status(400).json({ code: 400, message: '不能添加自己为好友' })
    }
    
    const existing = db.data.friends.find(
      f => (f.userId == userId && f.friendId == friendId) || 
           (f.userId == friendId && f.friendId == userId)
    )
    
    if (existing) {
      if (!existing.status || existing.status === 'accepted') {
        return res.status(400).json({ code: 400, message: '你们已经是好友了' })
      }
      if (existing.status === 'pending') {
        return res.status(400).json({ code: 400, message: '已发送过好友请求，等待对方同意' })
      }
    }
    
    const friend = {
      id: Date.now(),
      userId,
      friendId,
      status: 'pending',
      createTime: new Date().toISOString()
    }
    
    db.data.friends.push(friend)
    await db.write()
    
    res.json({
      code: 200,
      message: '添加好友成功',
      data: friend
    })
  } catch (error) {
    console.error('添加好友错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.delete('/api/friends/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { userId, action } = req.query
    
    await db.read()
    const friend = db.data.friends.find(f => f.id == id)
    
    if (!friend) {
      return res.status(404).json({ code: 404, message: '好友关系不存在' })
    }
    
    if (action === 'accept') {
      friend.status = 'accepted'
      await db.write()
      return res.json({
        code: 200,
        message: '已接受好友请求'
      })
    } else if (action === 'reject') {
      db.data.friends = db.data.friends.filter(f => f.id != id)
      await db.write()
      return res.json({
        code: 200,
        message: '已拒绝好友请求'
      })
    } else {
      db.data.friends = db.data.friends.filter(f => f.id != id)
      await db.write()
      return res.json({
        code: 200,
        message: '删除好友成功'
      })
    }
  } catch (error) {
    console.error('操作失败:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/messages', async (req, res) => {
  try {
    const { userId, friendId } = req.query
    await db.read()
    let messages = db.data.messages
    
    if (userId && friendId) {
      messages = messages.filter(m => 
        (m.senderId == userId && m.receiverId == friendId) || 
        (m.senderId == friendId && m.receiverId == userId)
      )
      messages = messages.sort((a, b) => new Date(a.createTime) - new Date(b.createTime))
    } else if (userId) {
      const userIds = new Set()
      messages.forEach(m => {
        if (m.senderId == userId) userIds.add(m.receiverId)
        if (m.receiverId == userId) userIds.add(m.senderId)
      })
      const conversationList = []
      for (const fid of userIds) {
        const friend = db.data.users.find(u => u.id == fid)
        const lastMsg = messages
          .filter(m => m.senderId == fid || m.receiverId == fid)
          .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))[0]
        const unreadCount = messages.filter(m => m.senderId == fid && m.receiverId == userId && !m.read).length
        conversationList.push({
          friendId: fid,
          friendUsername: friend?.username || '',
          friendNickname: friend?.nickname || '',
          friendAvatar: friend?.avatar || '',
          lastMessage: lastMsg?.content || '',
          lastTime: lastMsg?.createTime || '',
          unreadCount
        })
      }
      conversationList.sort((a, b) => new Date(b.lastTime) - new Date(a.lastTime))
      return res.json({ code: 200, data: conversationList })
    }
    
    res.json({
      code: 200,
      data: messages
    })
  } catch (error) {
    console.error('获取消息列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/messages', async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body
    
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ code: 400, message: '参数不完整' })
    }
    
    const message = {
      id: Date.now(),
      senderId,
      receiverId,
      content,
      read: false,
      createTime: new Date().toISOString()
    }
    
    db.data.messages.push(message)
    await db.write()
    
    res.json({
      code: 200,
      message: '发送成功',
      data: message
    })
  } catch (error) {
    console.error('发送消息错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.put('/api/messages/read', async (req, res) => {
  try {
    const { userId, friendId } = req.body
    
    await db.read()
    db.data.messages.forEach(m => {
      if (m.senderId == friendId && m.receiverId == userId) {
        m.read = true
      }
    })
    await db.write()
    
    res.json({
      code: 200,
      message: '已标记为已读'
    })
  } catch (error) {
    console.error('标记已读错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/transactions', async (req, res) => {
  try {
    const { userId } = req.query
    
    if (!userId) {
      return res.status(400).json({ code: 400, message: '请先登录' })
    }
    
    await db.read()
    const orders = db.data.orders.filter(o => o.userId == userId && (o.status === 'paid' || o.status === 'completed'))
    const transactions = orders.map(o => ({
      id: o.id,
      orderNo: o.orderNo,
      amount: o.totalAmount,
      paymentMethod: o.paymentMethod,
      status: o.status,
      payTime: o.payTime,
      createTime: o.createTime,
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0)
    })).sort((a, b) => new Date(b.payTime || b.createTime) - new Date(a.payTime || a.createTime))
    
    res.json({
      code: 200,
      data: transactions
    })
  } catch (error) {
    console.error('获取交易记录错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/feedback', async (req, res) => {
  try {
    const { userId, type, content } = req.body
    
    if (!userId || !type || !content) {
      return res.status(400).json({ code: 400, message: '请填写完整信息' })
    }
    
    await db.read()
    
    const user = db.data.users.find(u => u.id == userId)
    
    const feedback = {
      id: Date.now(),
      userId: parseInt(userId),
      username: user?.username || '',
      nickname: user?.nickname || '',
      type,
      content,
      status: 'pending',
      createTime: new Date().toISOString()
    }
    
    db.data.feedbacks.push(feedback)
    await db.write()
    
    res.json({
      code: 200,
      message: '反馈提交成功'
    })
  } catch (error) {
    console.error('提交反馈错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/feedbacks', async (req, res) => {
  try {
    const { userId, adminId } = req.query
    
    await db.read()
    let feedbacks = db.data.feedbacks
    
    if (userId) {
      feedbacks = feedbacks.filter(f => f.userId == userId)
    }
    
    feedbacks = feedbacks.sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
    
    res.json({
      code: 200,
      data: feedbacks
    })
  } catch (error) {
    console.error('获取反馈列表错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history } = req.body
    
    if (!message) {
      return res.status(400).json({ code: 400, message: '请输入消息' })
    }
    
    const systemPrompt = `你是浙江畲族文化交流平台的AI助手，专门为用户解答关于畲族文化的问题。你需要：
1. 回答关于畲族的历史、文化、传统习俗、节日、服饰、美食、工艺等问题
2. 如果用户问的是畲族相关的问题，请给出详细、准确的回答
3. 如果用户问的不是畲族相关的问题，可以适当回答但要引导回畲族文化主题
4. 回答要友好、专业、有帮助
5. 如果遇到不确定的信息，请如实告知用户`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-10),
      { role: 'user', content: message }
    ]
    
    if (!AI_API_KEY) {
      const qaDatabase = {
        '畲族': '畲族是中国南方的一个少数民族，主要分布在福建、浙江、江西、广东、安徽等地。畲族有着悠久的历史和丰富的文化传统，包括独特的服饰、节日、工艺和饮食习惯。',
        '畲族历史': '畲族历史悠久，源于古代"武陵蛮"。隋唐时期已居住在闽、粤、赣三省交界地区。宋元时期逐步迁居到闽东、浙南等地。清代以后，畲族逐渐形成今天的分布格局。',
        '畲族文化': '畲族文化是中华民族文化的重要组成部分，包括：1.民间文学：神话传说、民间故事 2.音乐舞蹈：山歌、祭祀舞蹈 3.工艺美术：彩带、竹编、刺绣 4.民俗风情：婚嫁、祭祀、节日 5.饮食文化：乌米饭、糍粑等'
      }
      
      const lowerMessage = message.toLowerCase()
      for (const key in qaDatabase) {
        if (lowerMessage.includes(key)) {
          return res.json({ code: 200, data: { message: qaDatabase[key] } })
        }
      }
      
      return res.json({ 
        code: 200, 
        data: { 
          message: '您好！我是畲族文化AI助手，关于畲族的历史、文化、传统习俗、节日、服饰、美食、工艺等方面的问题，我可以为您解答。您想了解什么呢？' 
        } 
      })
    }
    
    const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    })
    
    const result = await response.json()
    console.log('AI API响应:', JSON.stringify(result))
    
    if (result.choices?.[0]?.message?.content) {
      res.json({ code: 200, data: { message: result.choices[0].message.content } })
    } else if (result.choices?.[0]?.message) {
      res.json({ code: 200, data: { message: result.choices[0].message } })
    } else {
      console.log('API响应格式:', result)
      throw new Error('API响应格式错误')
    }
  } catch (error) {
    console.error('AI聊天错误:', error)
    res.json({ 
      code: 200, 
      data: { 
        message: '抱歉，我现在暂时无法回答您的问题。你可以尝试咨询关于畲族文化的问题，如历史、节日、服饰、美食等。' 
      } 
    })
  }
})

// ==================== 管理后台统计 API ====================

app.get('/api/admin/overview', async (req, res) => {
  try {
    await db.read()
    const users = db.data.users || []
    const cultures = db.data.cultures || []
    const products = db.data.products || []
    const orders = db.data.orders || []
    const posts = db.data.posts || []
    const feedbacks = db.data.feedbacks || []
    const activities = db.data.activities || []

    res.json({
      code: 200,
      data: {
        userCount: users.length,
        cultureCount: cultures.length,
        productCount: products.length,
        orderCount: orders.length,
        postCount: posts.length,
        feedbackCount: feedbacks.length,
        activityCount: activities.length,
        totalRevenue: orders
          .filter(o => o.status === 'paid' || o.status === 'completed')
          .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
      }
    })
  } catch (error) {
    console.error('获取概览数据错误:', error)
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/admin/users/statistics', async (req, res) => {
  try {
    await db.read()
    const users = db.data.users || []
    let admins = 0, normalUsers = 0
    users.forEach(u => {
      if (u.role === 'admin') admins++
      else normalUsers++
    })
    res.json({
      code: 200,
      data: { totalUsers: users.length, admins, normalUsers }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/admin/orders/statistics', async (req, res) => {
  try {
    await db.read()
    const orders = db.data.orders || []
    let pending = 0, paid = 0, completed = 0, cancelled = 0, totalAmount = 0
    orders.forEach(o => {
      totalAmount += o.totalAmount || 0
      switch (o.status) {
        case 'pending': pending++; break
        case 'paid': paid++; break
        case 'completed': completed++; break
        case 'cancelled': cancelled++; break
      }
    })
    res.json({
      code: 200,
      data: { totalOrders: orders.length, totalAmount, pending, paid, completed, cancelled }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/admin/products/statistics', async (req, res) => {
  try {
    await db.read()
    const products = db.data.products || []
    const categoryCount = {}
    let totalSales = 0, totalStock = 0
    products.forEach(p => {
      totalSales += p.sales || 0
      totalStock += p.stock || 0
      const cat = p.category || '未分类'
      categoryCount[cat] = (categoryCount[cat] || 0) + 1
    })
    res.json({
      code: 200,
      data: { totalProducts: products.length, totalSales, totalStock, categoryCount }
    })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/admin/orders/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    await db.read()
    const orders = [...(db.data.orders || [])]
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .slice(0, limit)
      .map(o => {
        const buyer = db.data.users.find(u => u.id === o.userId)
        return {
          id: o.id,
          orderNo: o.orderNo,
          buyerName: buyer?.nickname || buyer?.username || '未知',
          totalAmount: o.totalAmount,
          status: o.status,
          createTime: o.createTime
        }
      })
    res.json({ code: 200, data: orders })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/admin/products/top', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5
    await db.read()
    const products = [...(db.data.products || [])]
      .sort((a, b) => (b.sales || 0) - (a.sales || 0))
      .slice(0, limit)
      .map(p => ({ id: p.id, name: p.name, sales: p.sales || 0, price: p.price, category: p.category }))
    res.json({ code: 200, data: products })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/admin/users', async (req, res) => {
  try {
    await db.read()
    const users = (db.data.users || []).map(u => ({
      id: u.id,
      username: u.username,
      nickname: u.nickname || '',
      phone: u.phone,
      role: u.role,
      avatar: u.avatar || '',
      email: u.email || '',
      createdAt: u.createdAt
    }))
    res.json({ code: 200, data: users })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.delete('/api/admin/user/:id', async (req, res) => {
  try {
    const { id } = req.params
    await db.read()
    const index = db.data.users.findIndex(u => u.id === parseInt(id))
    if (index === -1) return res.status(404).json({ code: 404, message: '用户不存在' })
    if (db.data.users[index].role === 'admin') return res.status(403).json({ code: 403, message: '不能删除管理员' })
    db.data.users.splice(index, 1)
    await db.write()
    res.json({ code: 200, message: '删除成功' })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.get('/api/admin/orders', async (req, res) => {
  try {
    await db.read()
    const orders = [...(db.data.orders || [])]
      .sort((a, b) => new Date(b.createTime) - new Date(a.createTime))
      .map(o => {
        const buyer = db.data.users.find(u => u.id === o.userId)
        return { ...o, buyerName: buyer?.nickname || buyer?.username || '未知' }
      })
    res.json({ code: 200, data: orders })
  } catch (error) {
    res.status(500).json({ code: 500, message: '服务器错误' })
  }
})

app.listen(PORT, async () => {
  await initDB()
  console.log(`服务器运行在 http://localhost:${PORT}`)
})
