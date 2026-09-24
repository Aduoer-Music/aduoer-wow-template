# Aduoer Wow 音乐源模板

[![CI](https://github.com/Aduoer-Music/aduoer-wow-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Aduoer-Music/aduoer-wow-template/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

这是 Aduoer Wow 的官方音乐源项目模板。你只需要连接目标音乐平台并完成数据转换，即可得到一个能被 Wow 客户端使用的音乐源服务。

模板已经准备好 Node.js 服务、鉴权、测试和 Docker 构建；协议路由、请求参数、响应模型、运行时校验、能力检测与 OpenAPI 由 [`aduoer-wow-sdk`](https://github.com/Aduoer-Music/aduoer-wow-sdk) 统一提供。

> 本仓库用于创建新项目，不是需要持续合并的上游框架。项目创建后，通过 npm 升级 `aduoer-wow-sdk` 即可获得后续协议更新。

[阅读完整开发文档](https://aduoer-music.github.io/docs/development/)

## 快速开始

### 1. 创建并启动项目

需要 Node.js 22 或更高版本。

在 GitHub 中点击 **Use this template** 创建自己的仓库，然后执行：

```bash
git clone https://github.com/<your-account>/<your-origin>.git
cd <your-origin>
npm install
cp .env.example .env
npm run dev
```

服务默认监听 `http://localhost:3000`。`.env.example` 中的默认 token 为 `change-me`，可以用下面的命令确认服务已经正常运行：

```bash
# 无需鉴权的服务健康检查
curl http://localhost:3000/status

# Wow 客户端接口，需要 Authorization
curl -H 'Authorization: change-me' http://localhost:3000/v1/status
```

### 2. 接入目标音乐平台

主要工作在 [`src/adapter.ts`](src/adapter.ts) 中完成：

1. 调用目标平台的 API。
2. 将平台响应转换成 SDK 导出的标准模型。
3. 只实现平台真正支持的能力。
4. 为新增能力补充测试。

下面是一个简化的歌曲详情实现：

```ts
import type { WowAdapter } from 'aduoer-wow-sdk';

export const adapter: WowAdapter = {
  async getTrackDetail(id) {
    const track = await upstream.getTrack(id);

    return {
      id: String(track.id),
      title: track.name,
      artists: track.artists.map((artist) => ({
        id: String(artist.id),
        name: artist.name
      })),
      album: {
        id: String(track.album.id),
        name: track.album.name,
        coverUrl: track.album.coverUrl
      },
      durationMs: track.duration,
      qualities: []
    };
  }
};
```

Adapter 必须返回 SDK 定义的模型，不要直接透传上游平台的原始响应。在开发和测试环境中，SDK 会校验 Adapter 返回值；字段不符合协议时，错误信息会指出具体的 Schema 路径。

`WowAdapter` 的方法都是按能力选配的：

- 已实现的方法会自动出现在 `/v1/status` 的 `capabilities` 中。
- 未实现的接口会返回统一的 `501` 响应。
- 路由、参数解析、错误格式和响应封装无需在项目中重复实现。

完整的方法和字段定义以 [`aduoer-wow-sdk`](https://github.com/Aduoer-Music/aduoer-wow-sdk) 及 [API Reference](https://aduoer-music.github.io/docs/development/api-reference) 为准。

歌单歌曲排序由源实现。`src/app.ts` 的 `playlistSortOptions` 声明可选的 `key` 和用户可见 `label`；`src/adapter.ts` 的 `getPlaylistDetail(id, trackLimit, sort, order)` 接收客户端选择。未选择排序时 `sort`、`order` 均为 `undefined`，应保留目标平台的歌单原始顺序。

### 3. 验证改动

提交代码前至少运行：

```bash
npm test
npm run build
```

## 模板负责什么

| 模块 | 负责内容 |
| --- | --- |
| `aduoer-wow-sdk` | `/v1` 路由、协议类型、运行时校验、标准响应、能力检测和 OpenAPI |
| `src/adapter.ts` | 目标音乐平台请求、字段转换和业务能力实现 |
| `src/app.ts` | Express 配置、鉴权、账号上下文、CORS 和公开端点 |
| `src/server.ts` | 环境变量读取、服务监听和优雅退出 |
| `tests/` | Adapter 与 HTTP 行为的回归测试 |

复杂的音乐源可以增加 `clients/`、`mappers/`、`services/` 等目录，但应继续保持“平台接入”和“Wow 协议”之间的边界，不要复制 SDK 内部的路由或响应模型。

## 鉴权与多账号

模板默认使用单一的 `WOW_API_TOKEN`。所有 `/v1/*` 请求都通过 `Authorization` 请求头鉴权；`GET /status` 是公开的服务健康检查。

如果音乐源需要支持多个账号，可以在 [`src/app.ts`](src/app.ts) 的 `resolveContext` 中解析 token，并为每次请求返回对应的 Adapter：

```ts
app.use(createWowRouter({
  async resolveContext({ authorization }) {
    const account = await accounts.findByToken(authorization);
    if (!account) return null;

    return {
      adapter: createAdapter(account),
      accountName: account.name,
      qualityMap: account.qualities
    };
  }
}));
```

`createWowRouter()` 已经包含 `/v1` 前缀，应直接挂载。`resolveContext` 返回 `null` 时，SDK 会生成统一的 `401` 响应。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `WOW_API_TOKEN` | 无 | Wow API 访问令牌，启动服务时必填 |
| `PORT` | `3000` | HTTP 服务端口 |
| `HOST` | `0.0.0.0` | HTTP 监听地址 |
| `CORS_ALLOW_ORIGIN` | `*` | 允许访问服务的 Origin |
| `NODE_ENV` | 无 | 设为 `production` 时默认不公开 `/openapi.json` |

不要将 `.env`、平台 cookie、访问令牌或其他凭据提交到仓库。生产环境应使用部署平台的 Secret 管理能力注入敏感配置。

## 项目结构

```text
.
├── src/
│   ├── adapter.ts          # 音乐平台 Adapter
│   ├── app.ts              # Express、鉴权与 Wow 路由配置
│   └── server.ts           # 服务进程入口
├── tests/                  # 接口与应用测试
├── .github/                # CI 和依赖更新
├── Dockerfile              # 生产镜像构建
└── AGENT.md                # 自动化开发代理的项目约定
```

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 监听源码变更并启动开发服务 |
| `npm test` | 运行 Vitest 测试 |
| `npm run build` | 将 TypeScript 编译到 `dist/` |
| `npm start` | 启动已编译的生产服务 |

## Docker 部署

```bash
docker build -t my-wow-origin .
docker run --rm \
  -p 3000:3000 \
  -e WOW_API_TOKEN=your-secret \
  my-wow-origin
```

生产镜像基于 Node.js 22 Alpine，并以非 root 用户运行。模板本身不持久化账号信息；数据库、缓存或其他持久化目录需要由部署环境单独提供。

## 升级 SDK

协议和类型更新通过 npm 获取：

```bash
npm outdated aduoer-wow-sdk
npm install aduoer-wow-sdk@latest
npm test
npm run build
```

升级前请阅读 SDK 的 Release 或 Changelog。依赖升级后应检查类型错误、协议模型变化和能力检测结果，再合并 lockfile。

## 相关资源

- [完整开发文档](https://aduoer-music.github.io/docs/development/)
- [交互式 API Reference](https://aduoer-music.github.io/docs/development/api-reference)
- [`aduoer-wow-sdk`](https://github.com/Aduoer-Music/aduoer-wow-sdk)

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
