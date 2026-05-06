# GPT Image Playground — 定制版维护指南

## 项目信息

| 项目 | 地址 |
|------|------|
| **原项目 (upstream)** | https://github.com/CookSleep/gpt_image_playground |
| **我的 Fork (origin)** | https://github.com/lengmoX/gpt_image_playground |
| **技术栈** | Vite + React 19 + TypeScript + Tailwind CSS + Zustand |
| **包管理器** | pnpm |

## Git 远程仓库

```text
origin   = git@github.com:lengmoX/gpt_image_playground.git   (我自己的 Fork)
upstream = https://github.com/CookSleep/gpt_image_playground.git  (原作者仓库)
```

## 分支策略

```text
main              保持与 upstream/main 同步，不直接在此分支开发
custom/main       我的长期定制版本（部署 & 开发的主分支）
feature/xxx       功能开发的临时分支，从 custom/main 分出，完成后合并回 custom/main
```

> **核心原则**：不要把自己的改动混在 `main` 里，`main` 只用来同步上游。

---

## 日常开发流程

### 开发新功能

```bash
git checkout custom/main
git checkout -b feature/my-feature
# ... 开发 & 提交 ...
git checkout custom/main
git merge feature/my-feature
git push origin custom/main
# 删除已合并的功能分支（可选）
git branch -d feature/my-feature
```

### 同步原项目更新

当原项目发布了新版本或新功能：

```bash
# 1. 先让 main 跟上原项目
git checkout main
git fetch upstream
git merge upstream/main
git push origin main

# 2. 再把更新合并到定制分支
git checkout custom/main
git merge main
# 如果有冲突，解决后：
git add .
git commit
git push origin custom/main
```

> **推荐使用 `merge` 而不是 `rebase`**，因为 custom/main 是长期维护的部署分支，merge 更安全、历史更清晰。

---

## 定制化开发守则

为了减少合并冲突、方便长期维护，请遵循以下原则：

### 1. 优先用配置，不改源码
能通过 `.env`、`config` 文件实现的功能，就不要改核心代码。

### 2. 优先做插件/扩展
如果原项目支持 plugins / hooks / middleware / custom-components，优先使用这些扩展点。

### 3. 改源码时集中在少数文件
不要把改动散落到几十个文件里，否则每次同步上游都可能大量冲突。

### 4. 给自定义改动加清晰标记

```ts
// custom: 简要描述改动目的
```

或者用块注释包裹：

```ts
// xjs-custom-start: 功能描述
...
// xjs-custom-end
```

这样合并冲突时能快速识别哪些是自己的改动。

---

## 包管理器

本项目使用 **pnpm** 管理依赖。

```bash
# 安装依赖
pnpm install

# 开发
pnpm dev

# 构建
pnpm build

# 测试
pnpm test
```

> 注意：原项目使用 npm，我们在 custom/main 中切换到了 pnpm。同步上游更新后如果出现 lock 文件冲突，
> 删除 `package-lock.json`，保留 `pnpm-lock.yaml`，重新 `pnpm install` 即可。

---

## 给原项目贡献代码（可选）

如果开发了通用功能想回馈原项目：

```bash
git checkout main           # 从干净的 main 分支出发
git checkout -b feature/add-xxx
# ... 开发 ...
git push origin feature/add-xxx
# 然后在 GitHub 上向原项目提交 Pull Request
```

> 私有定制功能（API Key、私有接口等）不要提交给原项目，保留在 `custom/main` 即可。

---

## 自定义功能状态：独立后端代理 (Custom API Proxy)

**功能说明**：为了解决前端直连私有 API（如 `api.88code.pro` 和 `www.88code.pro`）产生的跨域 (CORS) 问题，同时规避 Cloudflare 的 100 秒超时限制，本项目在 `backend/` 目录下引入了一个独立的轻量级 Node.js 代理服务。

**架构特点**：
1. **白名单机制**：只有当用户填写的 API URL 命中 `VITE_CUSTOM_PROXY_DOMAINS`（如 `.env.local` 中配置）时，前端才会把请求转发到代理路径 `/custom-proxy/`。
2. **安全性**：后端代理验证 `Referer` 来源，并严格限制只向白名单域名发起请求，防止被滥用为通用代理。
3. **长连接支持**：Node.js 后端与 Vite 配置中均将代理超时设置为 10 分钟（600 秒），以支持 AI 绘画等耗时请求。
4. **Cloudflare 限制**：**务必注意**，长时间的绘图请求不能经过 Cloudflare 代理（小黄云）。需在 Cloudflare 关掉被代理域名的云朵（DNS Only），让请求直达 Nginx，并在 Nginx 配置中增加 `proxy_read_timeout 600s;`。

**代码合并注意事项**：
为尽量避免与上游代码合并冲突：
* 后端代理全部集中在独立的 `backend/` 目录下。
* 核心代理判断工具函数单独放在 `src/lib/customProxy.ts`。
* 前端仅在 `src/lib/openaiCompatibleImageApi.ts` 和 `vite.config.ts` 中做了极少量侵入性修改，并且全部由 `// xjs-custom-start: 自定义域名自动代理` 和 `// xjs-custom-end` 块状注释包裹。
* 同步原项目代码发生冲突时，只要保留 `xjs-custom-start/end` 块内的逻辑即可。
