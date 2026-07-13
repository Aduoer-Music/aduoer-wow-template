# 部署

## Docker

```bash
docker build -t my-wow-origin .
docker run --rm -p 3000:3000 -e WOW_API_TOKEN=your-secret my-wow-origin
```

镜像使用 Node.js 22 Alpine、多阶段构建和非 root 用户。部署平台必须为 `data/` 等持久化目录单独挂载卷；模板本身不持久化账号。

## 健康检查

`GET /status` 不需要 Wow token，返回服务状态和 SDK 版本。客户端能力检测使用需要鉴权的 `GET /v1/status`。
