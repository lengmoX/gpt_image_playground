/**
 * 代理服务配置
 * 生产环境通过 .env 文件或系统环境变量注入
 */

/** 后端代理允许转发的目标主机白名单（硬编码，防止被滥用为通用代理） */
export const ALLOWED_TARGET_HOSTS: string[] = [
  'www.88code.pro',
  'api.88code.pro',
]

/**
 * 允许的前端请求来源（Referer / Origin 校验）。
 * 生产环境必须设置 FRONTEND_ORIGIN 为你部署的前端域名。
 * 开发环境自动允许 localhost。
 */
export const ALLOWED_REFERER_ORIGINS: string[] = [
  ...(process.env.FRONTEND_ORIGIN ? [process.env.FRONTEND_ORIGIN] : []),
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:3000',
]

/** 代理服务监听端口 */
export const PORT = Number(process.env.PORT ?? 3001)
