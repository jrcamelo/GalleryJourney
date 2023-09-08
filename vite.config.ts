import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createSvgIconsPlugin({
      iconDirs: [process.cwd() + '/src/assets/icons/'],
      symbolId: 'icon-[dir]-[name]',
      svgoOptions: true
    })
  ],
})
