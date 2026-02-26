// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwind

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Import this

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Add this to the plugins array
  ],
})