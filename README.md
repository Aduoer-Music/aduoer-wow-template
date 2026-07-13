# Aduoer Wow Origin Template

[![CI](https://github.com/Aduoer-Music/aduoer-wow-template/actions/workflows/ci.yml/badge.svg)](https://github.com/Aduoer-Music/aduoer-wow-template/actions/workflows/ci.yml)
[![Documentation](https://github.com/Aduoer-Music/aduoer-wow-template/actions/workflows/docs.yml/badge.svg)](https://github.com/Aduoer-Music/aduoer-wow-template/actions/workflows/docs.yml)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

Aduoer Wow 音乐源的官方项目模板。它提供了可直接运行的 Node.js 服务、鉴权示例、测试、API 文档和 Docker 配置，让音乐源开发者只需关注目标平台的数据接入与模型转换。

路由、请求参数、响应模型、运行时校验、错误响应、能力检测和 OpenAPI 文档统一由 [`aduoer-wow-sdk`](https://github.com/Aduoer-Music/aduoer-wow-sdk) 维护。

完整文档：<https://aduoer-music.github.io/aduoer-wow-template/>

## 特性

- 使用 TypeScript 和 Express，要求 Node.js 22 或更高版本。
- 通过 `WowAdapter` 按需实现平台能力，未实现的接口自动返回标准 `501` 响应。
- 根据 Adapter 已实现的方法自动生成 `capabilities`，无需维护重复的能力清单。
- SDK 内置 `/v1` 协议路由、类型定义、响应封装和运行时 Schema 校验。
- SDK 内置 OpenAPI 3.1 文档，项目使用 VitePress 和 Scalar 发布完整开发文档。
- 包含 Vitest、GitHub Actions、Dependabot 和多阶段 Docker 构建配置。

## 创建音乐源项目

在 GitHub 打开本仓库，点击 **Use this template** 创建自己的仓库，然后执行：

```bash
git clone https://github.com/<your-account>/<your-origin>.git
cd <your-origin>
npm install
cp .env.example .env
npm run dev
```

服务默认监听 `http://localhost:3000`。使用 `.env` 中配置的 token 验证服务与客户端接口：

```bash
curl http://localhost:3000/status
curl -H 'Authorization: change-me' http://localhost:3000/v1/status
```

`GET /status` 是无需鉴权的服务健康检查；所有 Wow 客户端接口均位于 `/v1/*`，并通过 `Authorization` 请求头鉴权。

## 实现平台 Adapter

编辑 [`src/adapter.ts`](src/adapter.ts)，将示例数据替换为目标音乐平台的请求和模型转换。只实现平台实际支持的方法即可：

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

Adapter 应返回 SDK 导出的标准模型，不要直接暴露上游平台的原始响应。SDK 会在开发和测试环境中校验返回值；不符合协议时，响应会包含具体的 Schema 路径，便于定位字段问题。

常用能力包括歌曲详情与播放地址、歌词、歌单、排行榜、搜索、艺人、专辑、收藏、每日推荐和私人 FM。完整的 `WowAdapter` 方法及字段定义以 [aduoer-wow-sdk](https://github.com/Aduoer-Music/aduoer-wow-sdk) 为准。

## 自定义鉴权与账号上下文

[`src/app.ts`](src/app.ts) 默认使用单一的 `WOW_API_TOKEN`。如果音乐源需要支持多个账号，可以在 `resolveContext` 中根据 token 查找账号，并为每次请求返回对应的 Adapter 和音质配置：

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

`createWowRouter()` 返回的路由已经包含 `/v1` 前缀，应用应直接挂载。返回 `null` 表示鉴权失败，SDK 会生成统一的 `401` 响应。

## 环境变量

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `WOW_API_TOKEN` | 无 | Wow API 访问令牌，启动服务时必填 |
| `PORT` | `3000` | HTTP 服务端口 |
| `HOST` | `0.0.0.0` | HTTP 监听地址 |
| `CORS_ALLOW_ORIGIN` | `*` | 允许访问服务的 Origin |
| `NODE_ENV` | 无 | 设为 `production` 时默认不公开 `/openapi.json` |

请勿将 `.env`、平台 cookie、访问令牌或其他凭据提交到仓库。

## 项目结构

```text
.
├── src/
│   ├── adapter.ts          # 音乐平台 Adapter
│   ├── app.ts              # Express、鉴权与 Wow 路由配置
│   └── server.ts           # 服务进程入口
├── tests/                  # 接口与应用测试
├── docs/                   # VitePress 文档和 API Reference
├── scripts/                # 文档构建使用的 OpenAPI 同步脚本
├── Dockerfile              # 生产镜像构建
└── .github/                # CI、文档部署和依赖更新配置
```

复杂平台可以继续拆分 `clients/`、`mappers/`、`services/` 等业务目录，但不需要复制或修改 SDK 内部的路由和响应模型。

## 常用命令

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 监听源码变更并启动开发服务 |
| `npm run build` | 编译生产代码到 `dist/` |
| `npm start` | 启动已编译的生产服务 |
| `npm test` | 运行 Vitest 测试 |
| `npm run docs:dev` | 同步 SDK OpenAPI 并启动本地文档站点 |
| `npm run docs:build` | 同步 SDK OpenAPI 并构建完整文档 |

提交代码前建议运行：

```bash
npm test
npm run build
```

## Docker 部署

```bash
docker build -t my-wow-origin .
docker run --rm \
  -p 3000:3000 \
  -e WOW_API_TOKEN=your-secret \
  my-wow-origin
```

生产镜像基于 Node.js 22 Alpine，并使用非 root 用户运行。平台账号等需要持久化的数据应使用数据库或单独挂载的存储卷管理。

## 升级 SDK

模板用于创建项目的初始结构，后续协议和类型更新通过 npm 获取，无需持续合并本仓库：

```bash
npm outdated aduoer-wow-sdk
npm install aduoer-wow-sdk@latest
npm test
npm run build
```

SDK 遵循语义化版本。升级前请阅读对应的 Release 或 Changelog，并在合并依赖更新前确认完整检查通过。

## 相关项目

- [完整开发文档](https://aduoer-music.github.io/aduoer-wow-template/)
- [aduoer-wow-sdk](https://github.com/Aduoer-Music/aduoer-wow-sdk)

## 许可证

本项目基于 [MIT License](LICENSE) 开源。
