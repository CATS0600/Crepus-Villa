import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // 核心修复：开启服务端渲染模式，这样 API 路由才能处理 POST 请求
  output: 'server',
  prefetch: true,
  
  integrations: [tailwind()],
  adapter: cloudflare({
    // 'smart' 模式通常没问题，但如果 D1 数据库绑定失效，可以尝试改为 'directory'
    mode: 'smart',
    runtime: {
      binding: 'DB' // 确保这里的名称与你在 Cloudflare 后台绑定的 D1 数据库名称一致
    }
  })
});