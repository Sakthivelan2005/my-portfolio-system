import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group 1: The heavy 3D Engine
            if (id.includes('@react-three') || id.includes('three')) {
              return 'three-engine'; 
            }
            // Group 2: The heavy Physics Engine (WASM)
            if (id.includes('@dimforge/rapier') || id.includes('@react-three/rapier')) {
              return 'physics-engine'; 
            }
            // Group 3: Animations
            if (id.includes('framer-motion')) {
              return 'animation-engine';
            }
            // Group 4: Everything else (React, DOM, etc.)
            return 'vendor'; 
          }
        }
      }
    }
  }
})