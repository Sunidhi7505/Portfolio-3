import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Replaces __SITE_URL__ in index.html with VITE_SITE_URL (set it in .env.production
 * once the site is deployed so Open Graph / canonical URLs become absolute).
 */
function siteUrlPlugin(siteUrl) {
  return {
    name: 'site-url-html',
    transformIndexHtml: (html) => html.replaceAll('__SITE_URL__', siteUrl),
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const siteUrl = (env.VITE_SITE_URL || '').replace(/\/$/, '')
  return {
    plugins: [react(), siteUrlPlugin(siteUrl)],
    build: {
      chunkSizeWarningLimit: 900,
    },
  }
})
