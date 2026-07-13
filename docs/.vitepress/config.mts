import { defineConfig } from 'vitepress';

export default defineConfig({
  lang: 'zh-CN',
  title: 'Aduoer Wow 开发文档',
  description: '使用 aduoer-wow-sdk 开发自己的音乐源',
  base: '/aduoer-wow-template/',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api-reference' }
    ],
    sidebar: [
      {
        text: '开发指南',
        items: [
          { text: '快速开始', link: '/guide/getting-started' },
          { text: '实现 Adapter', link: '/guide/adapter' },
          { text: '请求与响应规范', link: '/guide/protocol' },
          { text: '鉴权与配置', link: '/guide/auth' },
          { text: '部署', link: '/guide/deployment' },
          { text: '升级 SDK', link: '/guide/upgrading' }
        ]
      },
      { text: 'API Reference', link: '/api-reference' }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Aduoer-Music/aduoer-wow-template' }
    ],
    search: { provider: 'local' },
    footer: { message: 'Released under the MIT License.' }
  }
});
