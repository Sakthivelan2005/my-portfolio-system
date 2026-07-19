// src/vite-env.d.ts OR src/custom.d.ts

/// <reference types="vite/client" />

// Tells TypeScript to treat 3D models as importable strings (URLs)
declare module '*.glb' {
  const src: string;
  export default src;
}

// Tells TypeScript to treat images as importable strings
declare module '*.png' {
  const src: string;
  export default src;
}