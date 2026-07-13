# 升级 SDK

模板只负责首次创建，后续更新通过 npm 完成：

```bash
npm outdated aduoer-wow-sdk
npm install aduoer-wow-sdk@latest
npm test
npm run build
```

SDK 遵循 SemVer：patch 修复兼容问题，minor 增加兼容能力，major 可能需要迁移。每次升级都应查看 SDK Release/CHANGELOG，并运行本项目测试与文档构建。

模板自带 `.github/dependabot.yml`，GitHub 每周检查 `aduoer-wow-sdk`，并为新版本创建升级 PR。合并前确认 CI 中的测试和构建通过即可。

不要通过覆盖 SDK 路由来保留旧行为；如果平台需要特殊处理，应在 Adapter 或 `resolveContext` 边界完成。
