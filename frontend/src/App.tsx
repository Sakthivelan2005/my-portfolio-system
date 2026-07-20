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
    if (window.innerWidth < 768) return;

    const load3DEngine = () => {
      import('./components/Lanyard')
        .then((module) => {
          setEngine(() => module.default);
        })
        .catch((err) => {
          console.error("3D Engine aborted:", err);
        });
    };

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

  // THE FIX: Render a technical loading animation while the 3D physics engine downloads
  if (!Engine) {
    // If on mobile, return nothing
    if (typeof window !== 'undefined' && window.innerWidth < 768) return null;

    return (
      <div style={{
        position: 'absolute',
        right: '25%', /* Adjust this to center the loader exactly where your 3D badge hangs */
        top: '40%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '15px',
        zIndex: 100,
        pointerEvents: 'none',
        opacity: 0.8
      }}>
        <style>
          {`
            @keyframes spin-loader {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
        
        {/* CSS Spinner */}
        <div style={{
          width: '35px',
          height: '35px',
          border: '3px solid rgba(56, 189, 248, 0.1)', 
          borderTop: '3px solid #38bdf8', /* Matches your accent color */
          borderRadius: '50%',
          animation: 'spin-loader 1s linear infinite'
        }} />
        
        {/* Terminal-style text */}
        <div style={{
          fontFamily: 'monospace',
          color: '#cbd5e1',
          fontSize: '0.85rem',
          textAlign: 'center',
          letterSpacing: '1px'
        }}>
          INITIALIZING<br/>PHYSICS ENGINE...
        </div>
      </div>
    );
  }

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
        position={[0, 0, 15]}
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