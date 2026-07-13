# 实现 Adapter

`WowAdapter` 是源项目唯一需要实现的业务接口。SDK 负责 Express 路由、参数解析、响应包裹、错误状态和 OpenAPI。

```ts
import type { WowAdapter } from 'aduoer-wow-sdk';

export const adapter: WowAdapter = {
  async getTrackDetail(id) {
    const raw = await upstream.song(id);
    return {
      id: String(raw.id),
      title: raw.name,
      artists: raw.artists.map((artist) => ({ id: String(artist.id), name: artist.name })),
      album: { id: String(raw.album.id), name: raw.album.name, coverUrl: raw.album.cover },
      durationMs: raw.duration,
      qualities: []
    };
  }
};
```

不要返回上游原始对象。开发与测试环境会校验 Adapter 返回值，不符合契约时返回 500 并指出 Schema 路径。

## Capabilities

`/v1/status.data.capabilities` 根据已实现方法生成。组合能力只有在所需方法全部实现时才会出现，例如 `search` 要求实现歌曲、艺人、专辑和歌单四类搜索。
