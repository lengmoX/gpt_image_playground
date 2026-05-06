// xjs-custom-start: 自定义域名自动代理
// 仅当用户填写的 API URL 命中指定域名时，前端自动走后端代理路径。
// 指定域名通过环境变量 VITE_CUSTOM_PROXY_DOMAINS 配置（逗号分隔）。
// 示例：VITE_CUSTOM_PROXY_DOMAINS=www.88code.pro,api.88code.pro

const CUSTOM_PROXY_DOMAINS: string[] = (import.meta.env.VITE_CUSTOM_PROXY_DOMAINS ?? '')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean)

export const CUSTOM_PROXY_PREFIX = '/custom-proxy'

/**
 * 判断给定的 baseUrl 是否命中自定义代理域名列表。
 * 命中后，前端会自动将请求路由到 /custom-proxy/...，由后端代理转发。
 */
export function isCustomProxyDomain(baseUrl: string): boolean {
  if (!CUSTOM_PROXY_DOMAINS.length || !baseUrl) return false
  try {
    const { hostname } = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`,
    )
    return CUSTOM_PROXY_DOMAINS.some(d => hostname === d || hostname.endsWith(`.${d}`))
  } catch {
    return false
  }
}

/**
 * 构建传给后端的目标主机头（X-Proxy-Target-Host）。
 * 后端会校验此 header 是否在白名单内，然后转发到 https://{hostname}/...
 */
export function buildCustomProxyTargetHeader(baseUrl: string): Record<string, string> {
  try {
    const { hostname } = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(baseUrl) ? baseUrl : `https://${baseUrl}`,
    )
    return { 'X-Proxy-Target-Host': hostname }
  } catch {
    return {}
  }
}
// xjs-custom-end
