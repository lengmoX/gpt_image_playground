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
