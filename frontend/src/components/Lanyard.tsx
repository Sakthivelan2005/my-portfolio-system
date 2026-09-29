import React, { useState, useEffect, Suspense } from 'react';
import type { LanyardProps } from './LanyardScene'; // Import the type
import './Lanyard.css';

// Dynamically import the heavy 3D scene. This splits the bundle.
const LanyardScene = React.lazy(() => import('./LanyardScene'));

export default function Lanyard(props: LanyardProps) {
  const [shouldRender3D, setShouldRender3D] = useState(false);

  useEffect(() => {
    const init3D = () => setShouldRender3D(true);

    // Wait until the browser finishes painting HTML/CSS to load Rapier & GLTF
    if ('requestIdleCallback' in window) {
      requestIdleCallback(init3D, { timeout: 3000 });
    } else {
      setTimeout(init3D, 1000);
    }
  }, []);

  return (
    <div className="lanyard-wrapper" style={{ minHeight: '100vh', width: '100%' }}>
      {shouldRender3D && (
        <Suspense fallback={null}>
          <LanyardScene {...props} />
        </Suspense>
      )}
    </div>
  );
}