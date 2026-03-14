import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simple plugin to import .md files as raw text
function markdownPlugin() {
  return {
    name: 'vite-plugin-markdown',
    transform(src, id) {
      if (id.endsWith('.md')) {
        return {
          code: `export default ${JSON.stringify(src)};`,
          map: null,
        }
      }
    },
  }
}

export default defineConfig({
  plugins: [react(), markdownPlugin()],
})
