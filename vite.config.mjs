// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
// vite.config.ts / vite.config.js
// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwind from '@tailwindcss/vite'   // <-- IMPORT THE PLUGIN

export default defineConfig({
  plugins: [react(), tailwind()],          // <-- USE THE IMPORTED NAME
})
