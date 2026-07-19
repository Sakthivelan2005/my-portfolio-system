import HeroSection from './components/HeroSection';
import LiveTime from './components/LiveTime';
import Navbar from './components/Navbar';
import Experience from './components/Experience';
import TechStack from './components/TechStack';
import FloatingControls from './components/FloatingControls';
import Education from './components/Education';
import GithubGraph from './components/GithubGraph';
import myDp from './assets/fg.webp';
import bgimg from './assets/bg.webp'

// THE FIX 1: We completely removed 'lazy' and 'Suspense' from the imports
import { useState, useEffect } from 'react';

function App() {
  const [isDesktop, setIsDesktop] = useState(false);
  
  // THE FIX 2: We create a state to hold the actual 3D component once it downloads
  const [LanyardComponent, setLanyardComponent] = useState<React.ComponentType<any> | null>(null);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    setIsDesktop(mediaQuery.matches);
    
    const handleResize = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mediaQuery.addEventListener('change', handleResize);
    
    // THE FIX 3: Manual Dynamic Import
    // We wait 1 second for the text to paint (Perfect Lighthouse Score), 
    // then safely download the 3D code without triggering Suspense crashes.
    const timer = setTimeout(() => {
      import('./components/Lanyard')
        .then((module) => {
          setLanyardComponent(() => module.default);
        })
        .catch((err) => {
          console.error("3D Engine failed to load:", err);
        });
    }, 1000);

    return () => {
      mediaQuery.removeEventListener('change', handleResize);
      clearTimeout(timer);
    };
  }, []);

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
      <FloatingControls />
      <Navbar />
      
      <main style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        width: '100%' 
      }}>
        
        {isDesktop && LanyardComponent && (
          <div style={{ 
            width: '100vw', 
            height: '100vh', 
            display: 'block', 
            position: 'absolute', 
            zIndex: 200, 
            top: 0,
            left: 0,
            pointerEvents: 'none' 
          }}>
              <LanyardComponent 
                position={[0,0,15]}
                frontImage={myDp}
                backImage={bgimg} 
                imageFit="cover" 
              />
          </div>
        )}
      
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