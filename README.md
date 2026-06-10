# AIGC Web

轻量级 AI 对话 Web 应用，对标 DeepSeek Chat / OpenAI Chat 体验。基于 Next.js 15 全栈架构，对接讯飞 MaaS OpenAI 兼容接口，支持流式输出、Markdown 渲染、会话本地持久化。

## 技术栈

- **框架**：Next.js 15（App Router）+ React 19 + TypeScript
- **样式**：Tailwind CSS 4
- **状态**：Zustand
- **大模型**：讯飞 MaaS（OpenAI 兼容 API）
- **部署**：Docker / Standalone 产物 + Nginx 反代

## 功能概览

- 模拟登录（默认账号 `admin` / `admin123`）
- 多轮对话、流式打字机输出、思考过程展示
- Markdown / 代码高亮、信息来源提取
- 会话侧边栏（新建、重命名、删除、全局搜索）
- 用户消息复制 / 内联编辑后重新生成
- 对话数据 localStorage 持久化

## 目录结构

```
aigc-web/
├── app/                  # Next.js 页面与 API 路由
│   └── api/              # /api/chat、/api/auth/*
├── features/             # 业务模块（chat、auth）
├── config/               # 应用与模型配置
├── lib/                  # LLM 网关、会话、工具函数
├── stores/               # Zustand 状态
├── docker/               # Docker 构建与编排
├── deploy/               # 服务器部署脚本与配置模板
├── scripts/              # 打包脚本
└── dist/                 # 打包产物（gitignore，本地生成）
```

## 环境要求

- Node.js 18+
- pnpm 10+
- （可选）Docker 24+

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
MAAS_API_BASE_URL=https://maas-api.cn-huabei-1.xf-yun.com/v2
MAAS_API_KEY=your_api_key_here
DEFAULT_MODEL=xopqwen36v35b
```

### 3. 启动开发服务

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000)，使用 `admin` 登录。

### 其他命令

| 命令 | 说明 |
|------|------|
| `pnpm build` | 生产构建 |
| `pnpm start` | 启动生产服务（需先 build） |
| `pnpm lint` | ESLint 检查 |

## 环境变量说明

| 变量 | 必填 | 说明 |
|------|------|------|
| `MAAS_API_BASE_URL` | 是 | 讯飞 MaaS API 地址 |
| `MAAS_API_KEY` | 是 | API 密钥 |
| `DEFAULT_MODEL` | 否 | 默认模型 ID，默认 `xopqwen36v35b` |
| `HOSTNAME` | 生产 | 进程监听地址，固定 `0.0.0.0`（不是公网 IP） |
| `PORT` | 生产 | 进程监听端口，推荐 `3000` |

> **注意**：`HOSTNAME=0.0.0.0` 表示绑定所有网卡，供 Nginx/端口映射访问；用户浏览器地址由域名或服务器 IP 决定。

## Docker 部署

```bash
# 初始化环境文件
pnpm docker:init
# 编辑 docker/.env.docker 填入 MAAS_API_KEY

# 构建并启动
pnpm docker:build
pnpm docker:up

# 停止
pnpm docker:down
```

默认映射 `http://localhost:3000` → 容器 `3000`。

配置文件：

- `docker/Dockerfile` — 多阶段构建，standalone 产物
- `docker/docker-compose.yml` — 服务编排
- `docker/.env.docker.example` — 环境变量模板

## 服务器部署（Standalone）

本项目含 API 路由，**不能**作为纯静态站点部署，需 Node.js 运行 standalone 产物。

### 1. 本地打包

```bash
pnpm deploy:package
```

生成：

- `dist/aigc-web/` — 可部署目录
- `dist/aigc-web-standalone.tar.gz` — 压缩包

打包前会自动清理上次 `dist/` 产物。

### 2. 上传到服务器

```bash
scp dist/aigc-web-standalone.tar.gz user@your-server:/opt/
```

### 3. 服务器解压与配置

```bash
cd /opt
tar -xzf aigc-web-standalone.tar.gz
cd aigc-web

cp .env.production.example .env.production
vim .env.production   # 填写 MAAS_API_KEY 等
```

`.env.production` 示例：

```env
MAAS_API_BASE_URL=https://maas-api.cn-huabei-1.xf-yun.com/v2
MAAS_API_KEY=your_api_key_here
DEFAULT_MODEL=xopqwen36v35b
HOSTNAME=0.0.0.0
PORT=3000
```

### 4. 启动服务

```bash
# 前台启动
./start.sh

# 或使用 PM2 后台常驻
npm i -g pm2
pm2 start ecosystem.config.cjs
pm2 save && pm2 startup
```

### 5. Nginx 反代（推荐）

Node 监听 `3000`，由 Nginx 对外提供 `443`（HTTPS）。

**不要**与现有静态站的 `location /api/ → 8001` 混用——aigc-web 的 `/api/chat`、`/api/auth/*` 由 Next.js 自身处理，需将全部流量反代到 `127.0.0.1:3000`。

参考 `deploy/nginx.conf.example`：

```bash
sudo cp nginx.conf.example /etc/nginx/conf.d/aigc-web.conf
# 修改 server_name、证书路径
sudo nginx -t && sudo systemctl reload nginx
```

关键配置：

- `proxy_pass http://127.0.0.1:3000`
- `proxy_buffering off` — 流式输出
- `proxy_read_timeout 3600` — 长连接超时

## 部署架构

```
浏览器 → Nginx :443 → Node.js :3000 → 讯飞 MaaS API
```

| 层级 | 地址 | 说明 |
|------|------|------|
| 对外访问 | `https://your-domain.com` | 用户浏览器地址 |
| Nginx | `443` | SSL 终结、反向代理 |
| Node 进程 | `0.0.0.0:3000` | standalone server |

## 默认账号

| 用户名 | 密码 |
|--------|------|
| admin | admin123 |

> 生产环境请修改 `config/app.ts` 中的 `MOCK_USERS` 或接入真实认证。

## 相关文档

- [PRD.md](./PRD.md) — 产品需求文档

## License

Private
