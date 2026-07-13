import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages: https://dewyue.github.io/fitness-log/
const base = process.env.VITE_BASE_PATH ?? '/fitness-log/'

export default defineConfig({
  base,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: '健身打卡',
        short_name: '健身打卡',
        description: '个人健身打卡与数据可视化',
        theme_color: '#10b981',
        background_color: '#f8fafc',
        display: 'standalone',
        lang: 'zh-CN',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico,png,woff2}'],
      },
    }),
  ],
})
