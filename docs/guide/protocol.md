# 请求与响应规范

## 路径和方法

- 所有客户端接口位于 `/v1/*`。
- 查询接口使用 GET，标识符通过 `id` query 传递。
- 修改接口使用 POST JSON body。
- `Authorization` 选择当前账号或租户；公开协议不传 `platform`。

## 成功响应

```json
{
  "code": 200,
  "data": {}
}
```

## 错误响应

```json
{
  "code": 400,
  "message": "id is required",
  "data": null
}
```

HTTP 状态与 body `code` 保持一致：400 参数错误、401 鉴权失败、404 路径不存在、501 能力未实现、500 内部或 Adapter 响应错误。

完整字段约束以 [Scalar API Reference](/api-reference) 为准。
