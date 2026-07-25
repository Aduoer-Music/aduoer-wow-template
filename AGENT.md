# AGENT.md

本文档面向在本仓库中工作的自动化开发代理。开始修改前先阅读本文件、`README.md`、`package.json`，再检查与任务直接相关的源码和测试。

## 项目作用

本项目是 Aduoer Wow 音乐源的 Node.js/TypeScript 模板。它帮助开发者把第三方音乐平台接入 Wow 客户端：

- `aduoer-wow-sdk` 定义公开协议，负责 `/v1` 路由、参数解析、类型、运行时校验、标准响应、能力检测和 OpenAPI。
- 本项目负责目标音乐平台的请求、数据转换、鉴权上下文、服务配置、测试和部署。
- `WowAdapter` 是平台业务与 Wow 协议之间的核心边界。

目标是让派生项目只维护平台相关逻辑，不在本仓库重复实现 SDK 已经提供的协议基础设施。

## 技术基础

- 运行时：Node.js 22+
- 语言：TypeScript，启用 `strict`
- 模块格式：CommonJS
- HTTP 服务：Express 5
- 协议 SDK：`aduoer-wow-sdk`
- 测试：Vitest + Supertest
- 依赖管理：npm，必须同步维护 `package-lock.json`

## 代码结构与职责

| 路径 | 职责 | 修改原则 |
| --- | --- | --- |
| `src/adapter.ts` | 示例 Adapter 和平台能力 | 接入平台时优先修改这里；复杂逻辑再拆到 `clients/`、`mappers/`、`services/` |
| `src/app.ts` | Express、中间件、鉴权上下文和 Wow Router | 保持应用装配职责，不放平台字段转换 |
| `src/server.ts` | 进程入口、监听地址和信号处理 | 保持轻量，不放业务逻辑 |
| `tests/` | HTTP 契约和行为测试 | 每次行为变更都应补充或更新测试 |
| `Dockerfile` | 生产镜像 | 保持多阶段构建和非 root 运行 |

## 实现新音乐源的方法

### 1. 确认能力范围

先确认目标平台支持哪些能力，只实现实际可用的 `WowAdapter` 方法。不要为未验证的能力返回伪数据；未实现的方法交给 SDK 返回标准 `501`。

组合能力可能依赖多个 Adapter 方法。修改后通过 `/v1/status` 检查实际生成的 `capabilities`，不要维护额外的能力清单。

### 2. 隔离上游请求

简单项目可以直接从 `src/adapter.ts` 发起请求。出现以下情况时再拆分模块：

- 需要统一处理 base URL、header、cookie、重试或超时：放入 `src/clients/`。
- 多个接口共享字段转换：放入 `src/mappers/`。
- 存在跨接口编排、缓存或账号逻辑：放入 `src/services/`。

模块拆分应服务于明确的复用或复杂度，不预先创建空抽象。

### 3. 转换为 SDK 模型

- Adapter 返回值必须符合 `aduoer-wow-sdk` 导出的类型。
- 不直接暴露上游原始响应，也不把平台私有字段混入公开模型。
- 平台 ID 统一转换为字符串。
- 时间、码率、文件大小等数值使用 SDK 字段规定的单位。
- 缺失数据按 SDK 类型表达，不用虚构内容填充必填字段。
- 音质 `key` 必须在 `qualityMap`、曲目 `qualities` 和播放地址返回值之间保持一致。
- 分页结果应正确保留 `offset`、`limit` 和 `hasMore` 语义。

优先使用 SDK 导出的类型约束实现，避免 `any`、无依据的类型断言和重复定义协议接口。

### 4. 配置鉴权上下文

单账号项目使用 `WOW_API_TOKEN` 即可。多账号项目在 `createWowRouter({ resolveContext })` 中完成 token 到账号的解析，并返回账号对应的 Adapter、名称和音质配置。

- `createWowRouter()` 已包含 `/v1` 前缀，直接挂载，不要再次添加 `/v1`。
- 非法或缺失凭据返回 `null`，由 SDK 生成标准 `401`。
- 不在 Adapter 中读取全局请求状态；账号相关依赖通过工厂或上下文创建。

### 5. 补充验证

至少覆盖以下与本次改动相关的行为：

- 正常请求的状态码和标准响应数据。
- 鉴权失败。
- 参数错误或上游异常的处理。
- 新增 Adapter 返回值满足 SDK Schema。
- 新增或移除方法后，`capabilities` 与实现一致。

优先测试公开 HTTP 行为；只有纯转换逻辑复杂时，再增加较细粒度的单元测试。

## 编码规范

- 遵循现有 TypeScript 风格：2 空格缩进、单引号、分号、尾逗号规则与相邻代码保持一致。
- 使用 `import type` 导入仅用于类型检查的符号。
- 保持 `strict` 类型检查通过，不以关闭规则或扩大类型掩盖错误。
- 函数和模块保持单一职责；仅在逻辑意图不明显时添加简短注释。
- 错误信息应便于定位问题，但不得包含 token、cookie、账号资料或完整上游响应。
- 不改变标准响应结构；协议级错误、校验和未实现能力由 SDK 统一处理。
- 新增依赖前先确认标准库、现有依赖或 SDK 是否已经提供所需能力。
- 更新依赖时同时提交 `package.json` 和 `package-lock.json`。

## 安全与运行约束

- 绝不提交 `.env`、token、cookie、密码、私钥或平台账号信息。
- 日志中不得输出 `Authorization`、完整 cookie 或敏感上游响应。
- 生产环境通过 Secret 管理服务注入配置，不在镜像中写入凭据。
- 保留请求体大小限制，并谨慎评估 CORS、代理、文件下载和重定向相关改动。
- 外部请求应有合理的超时；重试必须有上限，并避免放大上游故障。
- 不提交 `node_modules/`、`dist/`、coverage 或 VitePress 构建产物。

## 变更边界

以下内容原则上不在派生项目中实现：

- 复制或改写 SDK 的 `/v1` 协议路由。
- 维护独立于 SDK 的响应模型、OpenAPI 或 capabilities 清单。
- 通过覆盖 SDK 路由保留旧协议行为。
- 为单个平台需求修改公共协议语义。

如果确认需求属于公共协议，应在 `aduoer-wow-sdk` 中设计和发布，再升级本项目依赖；平台特有差异留在 Adapter、mapper 或 `resolveContext` 边界处理。

## 常用命令

```bash
npm install          # 安装依赖
npm run dev          # 启动开发服务
npm test             # 运行测试
npm run build        # TypeScript 生产构建
```

不要用 `npm start` 验证未构建的源码；它只运行 `dist/server.js`。

## 完成任务前

根据改动范围完成以下检查：

1. 确认改动位于正确的职责边界，没有复制 SDK 能力。
2. 运行 `npm test`。
3. 运行 `npm run build`。
4. 检查没有提交密钥、生成物、调试日志或无关文件。
5. 在交付说明中列出行为变化、验证结果和仍存在的限制。
