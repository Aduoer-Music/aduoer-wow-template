# 快速开始

## 从模板创建仓库

在 GitHub 打开 `Aduoer-Music/aduoer-wow-template`，点击 **Use this template** 创建自己的源。

```bash
npm install
cp .env.example .env
npm run dev
```

默认服务地址是 `http://localhost:3000`。使用 `.env` 中的 `WOW_API_TOKEN` 请求：

```bash
curl -H 'Authorization: change-me' http://localhost:3000/v1/status
```

`data.version` 是服务当前实际使用的 `aduoer-wow-sdk` 版本，不是业务项目版本。

## 开发顺序

1. 在 `src/adapter.ts` 连接目标音乐平台。
2. 只实现平台真正支持的方法。
3. 运行 `npm test` 和 `npm run build` 校验接口与生产构建。
4. 使用 Docker 或任意 Node.js 22+ 环境部署。
