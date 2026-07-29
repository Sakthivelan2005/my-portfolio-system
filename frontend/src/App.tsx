import { useState, useEffect, memo, Suspense, lazy } from 'react';
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
import ProjectsSection from './components/Project';
import ContactFooter from './components/ContactFooter';
import WebGLErrorBoundary from './components/WebGLErrorBoundary';
import TerminalFooter from './components/TerminalFooter';
import MainFooter from './components/MainFooter';

// 1. Bulletproof Code Splitting
const LanyardEngine = lazy(() => import('./components/Lanyard'));

const WebGLShield = memo(({ fgImage, bgImage }: { fgImage: string, bgImage: string }) => {
  const [gpuActive, setGpuActive] = useState(true);
  const [startEngine, setStartEngine] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // THE FIX: Dynamic Camera Positioning for iPads
  const [lanyardPos, setLanyardPos] = useState<[number, number, number]>([0, 0, 15]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        // Desktop: Standard right-aligned view
        setLanyardPos([0, 0, 15]); 
      } else if (width >= 768) {
        // Tablet (iPad): Pan right (+1.5) and pull back (+18) to perfectly fit the ID card
        setLanyardPos([1.5, 0, 18]); 
      }
    };

    handleResize(); // Run once on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. The Kill Switch
  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault(); 
      console.error("[SYSTEM] GPU Panic Detected: WebGL Context Lost. Executing Kill Switch.");
      setGpuActive(false); 
    };

    window.addEventListener('webglcontextlost', handleContextLost, true);
    return () => window.removeEventListener('webglcontextlost', handleContextLost, true);
  }, []);

  // 3. Staggered Mount (Protects the main thread on load)
  useEffect(() => {
    if (window.innerWidth < 768) return;
    const mountTimer = setTimeout(() => setStartEngine(true), 1000);
    return () => clearTimeout(mountTimer);
  }, []);

  // 4. Staggered Visibility (Hides the physics explosion)
  useEffect(() => {
    if (startEngine && gpuActive) {
      const visTimer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(visTimer);
    }
  }, [startEngine, gpuActive]);

  // 5. The Amputation: If mobile OR if GPU fails, return null.
  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;
  if (!gpuActive) {
    console.warn("3D Engine amputated. Running strictly in 2D mode.");
    return null; 
  }

  return (
    <>
      {/* Loader UI */}
      {!isVisible && (
        <div style={{
          position: 'absolute',
          right: '25%', 
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
          <div style={{
            width: '35px',
            height: '35px',
            border: '3px solid rgba(56, 189, 248, 0.1)', 
            borderTop: '3px solid #38bdf8',
            borderRadius: '50%',
            animation: 'spin-loader 1s linear infinite'
          }} />
          <div style={{
            fontFamily: 'monospace',
            color: 'var(--text-muted)',
            fontSize: '0.85rem',
            textAlign: 'center',
            letterSpacing: '1px'
          }}>
            INITIALIZING<br/>PHYSICS ENGINE...
          </div>
        </div>
      )}

      {/* 3D Canvas */}
      <div style={{ 
        width: '99vw', 
        height: '100vh', 
        display: 'block', 
        position: 'absolute', 
        zIndex: 8, 
        top: 0, 
        left: 0, 
        pointerEvents: 'none',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 1s ease-in-out'
      }}>
        {startEngine && (
          <WebGLErrorBoundary>
            <Suspense fallback={null}>
              <LanyardEngine 
                position={lanyardPos} // Connected to the dynamic iPad state
                gravity={[0,-60,0]}
                frontImage={fgImage} 
                backImage={bgImage}
                imageFit="cover" 
                lanyardWidth={1}
              />
            </Suspense>
          </WebGLErrorBoundary>
        )}
      </div>
    </>
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
        <ProjectsSection />
        <Experience />
        <Education />
        <ContactFooter />
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
      <TerminalFooter />
      <MainFooter />
    </div>
  );
}

export default App;