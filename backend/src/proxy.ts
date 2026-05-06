import express from 'express'
import { createProxyMiddleware, type Options } from 'http-proxy-middleware'
import { ALLOWED_TARGET_HOSTS, ALLOWED_REFERER_ORIGINS } from './config'

/**
 * 注册代理路由：所有请求经白名单校验后转发到目标 API。
 *
 * 安全校验（两层）：
 * 1. Referer / Origin 来源检查 — 只允许来自前端部署域名的请求
 * 2. X-Proxy-Target-Host 白名单 — 只代理 www.88code.pro 和 api.88code.pro
 */
export function setupProxy(app: express.Application): void {
  app.use('/', (req, res, next) => {
    // ── 层 1：Referer / Origin 来源校验 ──────────────────────────────────
    const referer = String(req.headers['referer'] ?? req.headers['origin'] ?? '')
    const isAllowedReferer =
      ALLOWED_REFERER_ORIGINS.length === 0 ||
      ALLOWED_REFERER_ORIGINS.some(origin => referer.startsWith(origin))

    if (!isAllowedReferer) {
      res.status(403).json({ error: 'Forbidden: invalid referer' })
      return
    }

    // ── 层 2：目标主机白名单校验 ──────────────────────────────────────────
    const targetHost = String(req.headers['x-proxy-target-host'] ?? '')
    if (!targetHost || !ALLOWED_TARGET_HOSTS.includes(targetHost)) {
      res.status(403).json({
        error: 'Forbidden: target host not in allowlist',
        received: targetHost || '(empty)',
        allowed: ALLOWED_TARGET_HOSTS,
      })
      return
    }

    // 删除代理专用头，避免泄漏到上游 API
    delete req.headers['x-proxy-target-host']

    // ── 动态创建代理，转发到校验通过的目标主机 ──────────────────────────
    const proxyOptions: Options = {
      target: `https://${targetHost}`,
      changeOrigin: true,
      secure: true,
      // 图片生成最多等待 10 分钟（600000ms）
      proxyTimeout: 600_000,
      timeout: 600_000,
      on: {
        error: (err, _req, proxyRes) => {
          console.error(`[proxy] error forwarding to ${targetHost}:`, err.message)
          const res = proxyRes as express.Response | undefined
          if (res && typeof res.status === 'function') {
            res.status(502).json({ error: 'Bad Gateway', detail: err.message })
          }
        },
      },
    }

    createProxyMiddleware(proxyOptions)(req, res, next)
  })
}
