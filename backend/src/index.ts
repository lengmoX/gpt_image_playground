import express from 'express'
import cors from 'cors'
import { setupProxy } from './proxy'
import { PORT, ALLOWED_REFERER_ORIGINS, ALLOWED_TARGET_HOSTS } from './config'

const app = express()

// 允许来自前端部署域名的跨域请求（包含 preflight OPTIONS）
app.use(
  cors({
    origin: (origin, callback) => {
      // 允许 null origin（如直接访问）在开发时放行，生产应收紧
      if (!origin || ALLOWED_REFERER_ORIGINS.some(o => origin.startsWith(o))) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`))
      }
    },
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Proxy-Target-Host',
      'Cache-Control',
      'Pragma',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: false,
  }),
)

// 健康检查端点
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', allowedHosts: ALLOWED_TARGET_HOSTS })
})

// 代理路由（必须在 cors 之后注册）
setupProxy(app)

const server = app.listen(PORT, () => {
  console.log(`[proxy] Server running on port ${PORT}`)
  console.log(`[proxy] Allowed target hosts: ${ALLOWED_TARGET_HOSTS.join(', ')}`)
  console.log(`[proxy] Allowed referer origins: ${ALLOWED_REFERER_ORIGINS.join(', ')}`)
})

// 增加 Node.js 底层 HTTP Server 超时，支持长时间运行的图片生成 API
server.keepAliveTimeout = 600_000
server.headersTimeout = 601_000
server.setTimeout(600_000)
