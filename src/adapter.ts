import type { Track, WowAdapter } from 'aduoer-wow-sdk';

const demoTrack: Track = {
  id: 'demo-track',
  title: 'Hello Wow',
  artists: [{ id: 'demo-artist', name: 'Wow Developer' }],
  album: {
    id: 'demo-album',
    name: 'My First Origin',
    coverUrl: 'https://placehold.co/600x600/png'
  },
  durationMs: 180_000,
  favorite: false,
  qualities: [{ key: 'standard', label: '标准音质', bitrate: 128_000, format: 'mp3', size: 0 }]
};

/**
 * 示例 Adapter。开发自己的源时，将这里的方法连接到目标音乐服务；
 * 未实现的方法无需声明，SDK 会从实现自动生成 capabilities，并返回 501。
 */
export const adapter: WowAdapter = {
  async getTrackDetail(id) {
    return { ...demoTrack, id };
  },

  async getTrackUrl(id, quality = 'standard') {
    return {
      url: `https://example.com/audio/${encodeURIComponent(id)}.mp3`,
      quality,
      format: 'mp3',
      bitrate: 128_000,
      size: 0
    };
  },

  async getTrackLyric() {
    return {
      lyric: '[00:00.00]Hello Wow',
      wordLyric: '',
      translateLyric: '',
      translateWordLyric: ''
    };
  },

  async searchTracks(keyword, offset, limit) {
    const items = demoTrack.title.toLocaleLowerCase().includes(keyword.toLocaleLowerCase())
      ? [demoTrack]
      : [];
    return { items, offset, limit, hasMore: false };
  }
};
