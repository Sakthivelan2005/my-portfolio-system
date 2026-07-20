import { useState, useEffect } from 'react';
import HighlightText from './HighlightText';
import UnderlineText from './UnderlineText';
import LiveTime from './LiveTime';
import SkillCarousel from './SkillCarousel';
import myDp from "../assets/dp.webp";

const Icons = {
  Code: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  Cap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>,
  Pin: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
  Mail: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  Clock: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
};

export default function HeroSection() {
  
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768; // Returns true immediately on laptops
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <section id='top' style={{ 
      width: '100%', 
      maxWidth: '1200px', 
      /* THE FIX 1: Responsive margins. Centers on mobile, shifts right on desktop */
      margin: isDesktop ? '0 0 0 5%' : '0 auto',
      padding: isDesktop ? '100px 20px 40px 20px' : '40px 20px',
      display: 'grid',
      gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr', 
      alignItems: 'center',
      gap: '40px',
      boxSizing: 'border-box',
      overflow: 'hidden', 
      zIndex: '10'
    }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
          {!isDesktop && (
            <div style={{
              width: '110px', height: '110px', borderRadius: '50%', overflow: 'hidden',
              border: '2px solid var(--border-color)', backgroundColor: 'var(--card-bg)',
              flexShrink: 0,
              /* Webkit mask forces iOS Safari to respect the circle */
              WebkitMaskImage: '-webkit-radial-gradient(white, black)'
            }}>
              <img 
                src={myDp} 
                alt="Sakthivelan S." 
                style={{ width: '100%', height: '100%', objectFit: 'fill', borderRadius: '50%' }} 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h1 style={{ fontWeight: 800, color: 'var(--text-main)', 
              margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '8px',
              flexWrap: 'wrap' /* Prevents text overflow on ultra-small screens */
            }}>
              Sakthivelan S.
              <sup><sup>
              <svg id="Verify" height={24} width={24} viewBox="0 0 24 24" fill="#3b82f6" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.1 14.6l-4.5-4.5 1.4-1.4 3.1 3.1 6.5-7.4 1.5 1.3-8 8.9z" fill="#3b82f6"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.1 14.6l-4.5-4.5 1.4-1.4 3.1 3.1 6.5-7.4 1.5 1.3-8 8.9z"/>
                <path fill="#3b82f6" d="M24 12a4.454 4.454 0 0 0-2.564-3.91 4.437 4.437 0 0 0-.948-4.578 4.436 4.436 0 0 0-4.577-.948A4.44 4.44 0 0 0 12 0a4.423 4.423 0 0 0-3.9 2.564 4.434 4.434 0 0 0-2.43-.178 4.425 4.425 0 0 0-2.158 1.126 4.42 4.42 0 0 0-1.12 2.156 4.42 4.42 0 0 0 .183 2.421A4.456 4.456 0 0 0 0 12a4.465 4.465 0 0 0 2.576 3.91 4.433 4.433 0 0 0 .936 4.577 4.459 4.459 0 0 0 4.577.95A4.454 4.454 0 0 0 12 24a4.439 4.439 0 0 0 3.91-2.563 4.26 4.26 0 0 0 5.526-5.526A4.453 4.453 0 0 0 24 12Zm-13.709 4.917-4.38-4.378 1.652-1.663 2.646 2.646L15.83 7.4l1.72 1.591-7.258 7.926Z"></path>
              </svg>
              </sup> </sup>
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
          marginBottom: '30px'
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

        <div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '15px' }}>
            Good Morning
          </h2>
          <ul style={{ 
            color: 'var(--text-muted)', 
            fontSize: '1.05rem', 
            lineHeight: 1.6, 
            paddingLeft: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <li>
              {/* THE FIX 4: Messaging consistency enforced */}
              I am Sakthivelan, a Software Dev Engineer focused on writing <HighlightText color="var(--highlight-blue)">clean and maintainable code</HighlightText> by applying DRY and KISS principles.
            </li>
            <li>
              My core stack includes <UnderlineText color='#3eeefe'>MERN and React Native</UnderlineText>, with experience in real-time systems and database architecture.
            </li>
            <li>
              I build products that are practical, scalable, and user-focused, always testing my logic to ship bulletproof software.
            </li>
          </ul>
        </div>
        
      </div>
    </section>
  );
}