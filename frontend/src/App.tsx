import { useState, useEffect, memo, Suspense, lazy } from 'react';
import HeroSection from './components/HeroSection';
import Navbar from './components/Navbar';
import FloatingControls from './MicroService/FloatingControls';
import WebGLErrorBoundary from './MicroService/WebGLErrorBoundary';
import GlobalSpark from './MicroService/GlobalSpark';
import Polarok from './MicroService/Polarok';
import GalaxySkeleton from './MicroService/GalaxySkeleton';

// Lazy load everything the user cannot see immediately.
const GithubGraph = lazy(() => import('./components/GithubGraph'));
const TechStack = lazy(() => import('./components/TechStack'));
const ProjectsSection = lazy(() => import('./components/Project'));
const Experience = lazy(() => import('./components/Experience'));
const Education = lazy(() => import('./components/Education'));
const ContactFooter = lazy(() => import('./components/ContactFooter'));
const TerminalFooter = lazy(() => import('./components/TerminalFooter'));
const MainFooter = lazy(() => import('./components/MainFooter'));
const LiveTime = lazy(() => import('./MicroService/LiveTime'));

// Bulletproof Code Splitting for 3D
const LanyardEngine = lazy(() => import('./components/Lanyard'));

const WebGLShield = memo(() => {
  const [gpuActive, setGpuActive] = useState(true);
  const [startEngine, setStartEngine] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const [textures, setTextures] = useState<{ fg: string | null; bg: string | null }>({ fg: null, bg: null });
  const [lanyardPos, setLanyardPos] = useState<[number, number, number]>([0, 0, 15]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setLanyardPos([0, 0, 15]); 
      } else if (width >= 768) {
        setLanyardPos([1.5, 0, 18]); 
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleContextLost = (event: Event) => {
      event.preventDefault(); 
      console.error("[SYSTEM] GPU Panic Detected: WebGL Context Lost. Executing Kill Switch.");
      setGpuActive(false); 
    };

    window.addEventListener('webglcontextlost', handleContextLost, true);
    return () => window.removeEventListener('webglcontextlost', handleContextLost, true);
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) return; 

    let isMounted = true;

    Promise.all([
      import('./assets/fg.webp'),
      import('./assets/bg.webp')
    ]).then(([fgModule, bgModule]) => {
      if (isMounted) {
        setTextures({ fg: fgModule.default, bg: bgModule.default });
      }
    }).catch(err => console.error("Failed to load 3D textures:", err));

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) return;
    const mountTimer = setTimeout(() => setStartEngine(true), 1000);
    return () => clearTimeout(mountTimer);
  }, []);

  useEffect(() => {
    if (startEngine && gpuActive && textures.fg && textures.bg) {
      const visTimer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(visTimer);
    }
  }, [startEngine, gpuActive, textures]);

  if (typeof window !== 'undefined' && window.innerWidth < 768) return null;
  if (!gpuActive) return null; 

  return (
    <>
      {!isVisible && (
        <div style={{
          position: 'absolute', right: '25%', top: '40%', display: 'flex',
          flexDirection: 'column', alignItems: 'center', gap: '15px',
          zIndex: 100, pointerEvents: 'none', opacity: 0.8
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
            width: '35px', height: '35px', border: '3px solid rgba(56, 189, 248, 0.1)', 
            borderTop: '3px solid #38bdf8', borderRadius: '50%',
            animation: 'spin-loader 1s linear infinite'
          }} />
          <div style={{
            fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.85rem',
            textAlign: 'center', letterSpacing: '1px'
          }}>
            INITIALIZING<br/>PHYSICS ENGINE...
          </div>
        </div>
      )}

      <div style={{ 
        width: '99vw', height: '100vh', display: 'block', position: 'absolute', 
        zIndex: 8, top: 0, left: 0, pointerEvents: 'none',
        opacity: isVisible ? 1 : 0, transition: 'opacity 1s ease-in-out'
      }}>
        {startEngine && textures.fg && textures.bg && (
          <WebGLErrorBoundary>
            <Suspense fallback={null}>
              <LanyardEngine 
                position={lanyardPos} gravity={[0,-60,0]}
                frontImage={textures.fg} backImage={textures.bg}
                imageFit="cover" lanyardWidth={1}
              />
            </Suspense>
          </WebGLErrorBoundary>
        )}
      </div>
    </>
  );
}, () => true);

function App() {
  const [loadHeavyContent, setLoadHeavyContent] = useState(false);

  useEffect(() => {
    const handleUserInteraction = () => {
      setLoadHeavyContent(true);
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };

    // THE FIX: Listen purely for human interaction. No setTimeout bomb.
    window.addEventListener('scroll', handleUserInteraction, { passive: true });
    window.addEventListener('touchstart', handleUserInteraction, { passive: true });
    window.addEventListener('mousemove', handleUserInteraction, { passive: true });
    window.addEventListener('keydown', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleUserInteraction);
      window.removeEventListener('touchstart', handleUserInteraction);
      window.removeEventListener('mousemove', handleUserInteraction);
      window.removeEventListener('keydown', handleUserInteraction);
    };
  }, []);

  return (
    <div 
      className="app-container" 
      style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden' }}
    >
      <WebGLShield />
      <GlobalSpark />
      <FloatingControls />
      <Navbar />
      
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Polarok />
        <HeroSection />
        <GithubGraph />
        
        {loadHeavyContent ? (
          <Suspense fallback={<div style={{width:'70%', alignSelf:"center"}}>
            <GalaxySkeleton type='card' />
            <br />
            <br />
            <br />
            <GalaxySkeleton type='card' />
          </div>}>
            <TechStack />
            <ProjectsSection />
            <Experience />
            <Education />
            <ContactFooter />
          </Suspense>
        ) : (
          <div style={{ minHeight: '50vh' }} />
        )}
      </main>
      
      {loadHeavyContent && (
        <Suspense fallback={
          <div>
            <GalaxySkeleton type='card' />
          </div>
        }>
          <footer style={{ padding: '20px', width: '100%', display: 'flex', justifyContent: 'flex-end', boxSizing: 'border-box' }}>
            <LiveTime />
          </footer>
          <TerminalFooter />
          <MainFooter />
        </Suspense>
      )}
    </div>
  );
}

export default App;