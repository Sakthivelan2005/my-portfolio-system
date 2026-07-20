import { useState, useEffect, memo } from 'react';
import HeroSection from './components/HeroSection';
import LiveTime from './components/LiveTime';
import Navbar from './components/Navbar';
import Experience from './components/Experience';
import TechStack from './components/TechStack';
import FloatingControls from './components/FloatingControls';
import Education from './components/Education';
import GithubGraph from './components/GithubGraph';
import bg from './assets/bg.webp';
import fg from './assets/fg.webp';

const WebGLShield = memo(({ fgImage, bgImage }: { fgImage: string, bgImage: string }) => {
  const [Engine, setEngine] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    // 1. Abort on mobile to preserve mobile Lighthouse
    if (window.innerWidth < 768) return;

    // 2. Defer loading until the browser main thread is idle
    const load3DEngine = () => {
      import('./components/Lanyard')
        .then((module) => {
          setEngine(() => module.default);
        })
        .catch((err) => {
          console.error("3D Engine aborted:", err);
        });
    };

    // Use requestIdleCallback if available, or a 4.5s delay so TBT observation finishes first
    if ('requestIdleCallback' in window) {
      const idleId = (window as any).requestIdleCallback(() => {
        setTimeout(load3DEngine, 1000);
      });
      return () => (window as any).cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(load3DEngine, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!Engine) return null;

  return (
    <div style={{ 
      width: '99vw', 
      height: '100vh', 
      display: 'block', 
      position: 'absolute', 
      zIndex: 200, 
      top: 0, 
      left: 0, 
      pointerEvents: 'none' 
    }}>
      <Engine 
        position={[0, 0, 20]}
        frontImage={fgImage} 
        backImage={bgImage}
        imageFit="cover" 
        lanyardWidth={1}
      />
    </div>
  );
}, () => true);

function App() {
  return (
    <div 
      className="app-container" 
      style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%',
        overflowX: 'hidden'
      }}
    >
      <WebGLShield fgImage={fg} bgImage={bg} />

      <FloatingControls />
      <Navbar />
      
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%' 
      }}>
        <HeroSection />
        <GithubGraph />
        <TechStack />
        <Experience />
        <Education />
      </main>

      <footer style={{ 
        padding: '20px', 
        width: '100%', 
        display: 'flex', 
        justifyContent: 'flex-end',
        boxSizing: 'border-box'
      }}>
        <LiveTime />
      </footer>
    </div>
  );
}

export default App;