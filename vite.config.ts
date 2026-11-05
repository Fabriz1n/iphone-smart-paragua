import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/Fabriz1n/', // <-- Reemplaza con el nombre exacto de tu repositorio en GitHub
})