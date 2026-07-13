# 鉴权与配置

模板使用单一 `WOW_API_TOKEN` 演示鉴权。生产源可在 `resolveContext` 中将 token 解析为不同账号和 Adapter：

```ts
createWowRouter({
  async resolveContext({ authorization }) {
    const account = await accounts.findByToken(authorization);
    if (!account) return null;
    return {
      adapter: createAdapter(account),
      accountName: account.name,
      qualityMap: account.qualities
    };
  }
});
```

不要把 token、cookie 或上游密钥提交到仓库。缺少或非法 token 必须返回 `null`，SDK 会生成统一 401 响应。
