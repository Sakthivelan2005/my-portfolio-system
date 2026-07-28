import { useState, useEffect, useRef } from 'react';
import HighlightText from './HighlightText';
import UnderlineText from './UnderlineText';
import LiveTime from './LiveTime';
import SkillCarousel from './SkillCarousel';
import TooltipWrapper from './TooltipWrapper';
import { useSound } from '../hooks/useSound';
import myDp from "../assets/dp.webp";
import Greeting from './Greeting';

const Icons = {
  Code: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  Cap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
  Pin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
  Document: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Resize: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 15 21 21 15 21"></polyline><line x1="21" y1="21" x2="15" y2="15"></line><polyline points="9 21 3 21 3 15"></polyline><line x1="3" y1="21" x2="9" y2="15"></line></svg>,
  Close: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
};

export default function HeroSection() {
  const { playSound } = useSound();

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return false;
  });

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: Math.min(800, typeof window !== 'undefined' ? window.innerWidth * 0.9 : 800), height: 600 });
  
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  
  const dragRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, initW: 0, initH: 0 });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScrollTracking = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
      const scrollPosition = Math.ceil(window.innerHeight + window.scrollY);
      const documentHeight = document.documentElement.scrollHeight;
      if (documentHeight - scrollPosition <= 30) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(false);
      }
    };

    window.addEventListener('scroll', handleScrollTracking);
    handleScrollTracking(); 
    return () => window.removeEventListener('scroll', handleScrollTracking);
  }, []);

  useEffect(() => {
    if (isWindowOpen && !isMaximized && typeof window !== 'undefined') {
      setPosition({
        x: (window.innerWidth - size.width) / 2,
        y: Math.max(20, (window.innerHeight - size.height) / 2)
      });
    }
  }, [isWindowOpen, size.width, size.height, isMaximized]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && !isMaximized) {
        e.preventDefault();
        setPosition({
          x: dragRef.current.initX + (e.clientX - dragRef.current.startX),
          y: Math.max(0, dragRef.current.initY + (e.clientY - dragRef.current.startY)) 
        });
      }
      if (isResizing && !isMaximized) {
        e.preventDefault();
        setSize({
          width: Math.max(300, resizeRef.current.initW + (e.clientX - resizeRef.current.startX)),
          height: Math.max(400, resizeRef.current.initH + (e.clientY - resizeRef.current.startY))
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      document.body.style.userSelect = ''; 
      document.body.style.overflow = ''; 
      document.body.style.touchAction = ''; 
    };

    if (isDragging || isResizing) {
      document.body.style.userSelect = 'none'; 
      document.body.style.overflow = 'hidden'; 
      document.body.style.touchAction = 'none'; 
      
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.userSelect = ''; 
      document.body.style.overflow = ''; 
      document.body.style.touchAction = ''; 
    };
  }, [isDragging, isResizing, isMaximized]);

  const isMobileMiddle = !isDesktop && showScrollTop;
  const shouldHidePill = !isDesktop && isAtBottom;

  return (
    <section id='top' style={{ 
      width: '100%', 
      maxWidth: '1200px', 
      margin: isDesktop ? '0 0 0 5%' : '0 auto',
      padding: isDesktop ? '100px 20px 40px 20px' : '40px 20px',
      display: 'grid',
      gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', 
      alignItems: 'center',
      gap: '40px',
      boxSizing: 'border-box',
      pointerEvents: 'none' 
    }}>

      <style>
        {`
          .hero-header-container {
            display: flex;
            align-items: center;
            /* Dynamic gap that shrinks on mobile */
            gap: clamp(12px, 4vw, 20px);
            margin-bottom: 30px;
          }
          .profile-pic-container {
            /* THE FIX: Fluid image sizing based on viewport width */
            width: clamp(70px, 22vw, 110px);
            height: clamp(70px, 22vw, 110px);
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid var(--border-color);
            background-color: var(--card-bg);
            flex-shrink: 0;
            -webkit-mask-image: -webkit-radial-gradient(white, black);
            pointer-events: auto;
          }
          .hero-title {
            font-weight: 800;
            color: var(--text-main);
            margin: 0 0 5px 0;
            display: flex;
            align-items: center;
            flex-wrap: nowrap;
            white-space: nowrap;
            /* THE FIX: Lowered the minimum bound to 1.4rem so it fits on small screens */
            font-size: clamp(1.4rem, 6vw, 3rem);
          }
          .verified-badge {
            width: 0.85em; 
            height: 0.85em;
            margin-left: 8px;
            transform: translateY(-15%);
            flex-shrink: 0;
          }
          @media (max-width: 768px) {
            .verified-badge {
              margin-left: 6px;
              transform: translateY(-20%);
            }
          }
        `}
      </style>
      
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', position: 'relative', zIndex: 10 }}>
        
        <div className="hero-header-container">
          {!isDesktop && (
            <div className="profile-pic-container">
              <img 
                src={myDp} 
                alt="Sakthivelan S" 
                style={{ width: '100%', height: '100%', objectFit: 'fill', borderRadius: '50%' }} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
          )}
          
          {/* THE FIX: Added minWidth: 0 to prevent the text from forcing horizontal overflow */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: 'auto', minWidth: 0 }}>
            
            <h1 className="hero-title">
              Sakthivelan S.
              <svg className="verified-badge" viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.1 14.6l-4.5-4.5 1.4-1.4 3.1 3.1 6.5-7.4 1.5 1.3-8 8.9z" fill="#3b82f6"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.1 14.6l-4.5-4.5 1.4-1.4 3.1 3.1 6.5-7.4 1.5 1.3-8 8.9z"/>
                <path fill="#3b82f6" d="M24 12a4.454 4.454 0 0 0-2.564-3.91 4.437 4.437 0 0 0-.948-4.578 4.436 4.436 0 0 0-4.577-.948A4.44 4.44 0 0 0 12 0a4.423 4.423 0 0 0-3.9 2.564 4.434 4.434 0 0 0-2.43-.178 4.425 4.425 0 0 0-2.158 1.126 4.42 4.42 0 0 0-1.12 2.156 4.42 4.42 0 0 0 .183 2.421A4.456 4.456 0 0 0 0 12a4.465 4.465 0 0 0 2.576 3.91 4.433 4.433 0 0 0 .936 4.577 4.459 4.459 0 0 0 4.577.95A4.454 4.454 0 0 0 12 24a4.439 4.439 0 0 0 3.91-2.563 4.26 4.26 0 0 0 5.526-5.526A4.453 4.453 0 0 0 24 12Zm-13.709 4.917-4.38-4.378 1.652-1.663 2.646 2.646L15.83 7.4l1.72 1.591-7.258 7.926Z"></path>
              </svg>
            </h1>
            
            <SkillCarousel />
            
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '15px', 
          padding: '20px 0', 
          borderTop: '1px solid var(--border-color)', 
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '30px',
          pointerEvents: 'auto'
        }}>
          {[
            { icon: <Icons.Code />, text: "Software Dev Engineer" },
            { icon: <Icons.Cap />, text: "BCA @ Loyola College" },
            { icon: <Icons.Pin />, text: "Chennai, India" },
            { icon: <Icons.Clock />, text: <span style={{ display: 'flex', gap: '5px' }}><LiveTime /> (IST)</span> },
            { icon: <Icons.Mail />, text: "sakthivelan.shankar@gmail.com" }
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <span style={{ color: 'var(--text-main)' }}>{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <Greeting />
          <ul style={{ 
            color: 'var(--text-muted)', 
            fontSize: '1.05rem', 
            lineHeight: 1.6, 
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            marginBottom: '30px'
          }}>
            <li>
              I am Sakthivelan, a Software Dev Engineer focused on writing <HighlightText color="var(--highlight-blue)">clean and maintainable code</HighlightText> by applying DRY and KISS principles.
            </li>
            <li>
              My core stack includes <UnderlineText color='#3eeefe'>MERN and React Native</UnderlineText>, with experience in real-time systems and database architecture.
            </li>
            <li>
              I build products that are practical, scalable, and user-focused, always testing my logic to ship bulletproof software.
            </li>
          </ul>

          <button 
            onClick={() => {
              playSound('click'); 
              setIsWindowOpen(true);
              setIsMinimized(false);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 24px',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--highlight-blue)';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.backgroundColor = 'var(--card-bg)';
            }}
          >
            <Icons.Document /> Execute resume.pdf
          </button>
        </div>
        
      </div>

      {isWindowOpen && !isMinimized && (
        <div 
          onPointerDown={() => {
            playSound('click'); 
            setIsWindowOpen(false);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(3px)',
            touchAction: 'none',
            pointerEvents: 'auto'
          }}
        />
      )}

      {isWindowOpen && (
        <div 
          style={{
            position: 'fixed',
            top: isMaximized ? 0 : position.y,
            left: isMaximized ? 0 : position.x,
            width: isMaximized ? '100vw' : size.width,
            height: isMaximized ? '100vh' : size.height,
            backgroundColor: 'var(--bg-color)',
            border: isMaximized ? 'none' : '1px solid var(--border-color)',
            borderRadius: isMaximized ? '0' : '12px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: (isDragging || isResizing) ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: isMinimized ? 'translateY(20px) scale(0.95)' : 'translateY(0) scale(1)',
            opacity: isMinimized ? 0 : 1,
            pointerEvents: isMinimized ? 'none' : 'auto',
            willChange: 'top, left, width, height, transform' 
          }}
        >
          <div 
            onPointerDown={(e) => {
              if (isMaximized) return;
              dragRef.current = { startX: e.clientX, startY: e.clientY, initX: position.x, initY: position.y };
              setIsDragging(true);
            }}
            style={{
              height: '40px',
              backgroundColor: 'var(--card-bg)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              cursor: isMaximized ? 'default' : 'grab',
              userSelect: 'none',
              touchAction: 'none'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', zIndex: 2 }}>
              <TooltipWrapper text="Close">
                <div 
                  onPointerDown={(e) => {
                    e.stopPropagation(); 
                    playSound('click'); 
                    setIsWindowOpen(false);
                  }}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', cursor: 'pointer' }} 
                />
              </TooltipWrapper>
              <TooltipWrapper text="Minimize">
                <div 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    playSound('click'); 
                    setIsMinimized(true);
                  }}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308', cursor: 'pointer' }} 
                />
              </TooltipWrapper>
              <TooltipWrapper text={isMaximized ? "Restore" : "Maximize"}>
                <div 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    playSound('click'); 
                    setIsMaximized(!isMaximized);
                  }}
                  style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', cursor: 'pointer' }} 
                />
              </TooltipWrapper>
            </div>

            <div style={{ 
              position: 'absolute', 
              left: 0, 
              right: 0, 
              textAlign: 'center', 
              color: 'var(--text-muted)', 
              fontFamily: 'var(--mono)', 
              fontSize: '0.85rem',
              pointerEvents: 'none' 
            }}>
              Sakthivelan_S_Resume.pdf
            </div>
          </div>

          <div style={{ flex: 1, position: 'relative', backgroundColor: '#fff' }}>
            {(isDragging || isResizing) && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: isDragging ? 'grabbing' : 'nwse-resize' }} />
            )}
            <object data="/resume.pdf" type="application/pdf" style={{ width: '100%', height: '100%', border: 'none' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '16px' }}>Your browser does not support inline PDFs.</p>
                <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" style={{ padding: '10px 20px', backgroundColor: '#0c82ff', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
                  Download / View Resume
                </a>
              </div>
            </object>
          </div>

          {!isMaximized && (
            <div 
              onPointerDown={(e) => {
                e.stopPropagation();
                resizeRef.current = { startX: e.clientX, startY: e.clientY, initW: size.width, initH: size.height };
                setIsResizing(true);
              }}
              style={{ position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', cursor: 'nwse-resize', display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: '4px', zIndex: 1000, touchAction: 'none' }}
            >
              <Icons.Resize />
            </div>
          )}
        </div>
      )}

      {isWindowOpen && isMinimized && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: isMobileMiddle ? '24px' : '50%',
          transform: isMobileMiddle ? 'translateX(0)' : 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: 'var(--card-bg)',
          border: '1px solid var(--pill-border)',
          borderRadius: '50px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          zIndex: 10000,
          padding: '4px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: shouldHidePill ? 0 : 1,
          pointerEvents: shouldHidePill ? 'none' : 'auto'
        }}>
          <button
            onClick={() => {
              playSound('click'); 
              setIsMinimized(false);
            }}
            style={{ padding: '10px 16px', backgroundColor: 'transparent', color: 'var(--text-main)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', borderRadius: '50px' }}
          >
            <Icons.Document /> Restore
          </button>
          
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--pill-border)', margin: '0 4px' }} />
          
          <TooltipWrapper text='Close tab'>
            <button
              onClick={() => {
                playSound('click'); 
                setIsWindowOpen(false);
              }}
              style={{ padding: '10px 14px', backgroundColor: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', borderRadius: '50px' }}
              aria-label="Close Resume"
            >
              <Icons.Close />
            </button>
          </TooltipWrapper>
        </div>
      )}
    </section>
  );
}