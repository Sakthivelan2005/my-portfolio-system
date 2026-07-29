import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // THE FIX: Explicitly tell Vite that .glb files are binary assets, not code.
  assetsInclude: ['**/*.glb'], 
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@react-three') || id.includes('three')) {
              return 'three-engine'; 
            }
            if (id.includes('@dimforge/rapier') || id.includes('@react-three/rapier')) {
              return 'physics-engine'; 
            }
            if (id.includes('framer-motion')) {
              return 'animation-engine';
            }
            return 'vendor'; 
          }
        }
      }
    }
  }
})