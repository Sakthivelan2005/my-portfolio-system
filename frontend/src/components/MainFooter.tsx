import React, { useState, useEffect, useRef } from 'react';
import { useSound } from '../hooks/useSound';
import SocialImage from '../assets/Social-Network-Transparent-PNG.webp'; 

const DEV_QUOTES = [
  '"First, solve the problem. Then, write the code."',
  '"Clean code always looks like it was written by someone who cares."',
  '"Make it work, make it right, make it fast."',
  '"Code is like humor. When you have to explain it, it\'s bad."',
  '"Simplicity is the soul of efficiency."',
  '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand."'
];

const LocationURL = "https://maps.app.goo.gl/2QrnRMQLBgypvdXb7";
const GitHubURL = "https://github.com/Sakthivelan2005";
const LinkedInURL = "https://www.linkedin.com/in/sakthivelan-s-5a7215318/";
const TwitterURL = "https://x.com/Sakthivelan2005";
const InstagramURL = "https://www.instagram.com/sakthivelan_2k_kid/";

const IconLink = ({ 
  href, 
  label, 
  hoverBg, 
  hoverColor, 
  children 
}: { 
  href: string, 
  label: string, 
  hoverBg: string, 
  hoverColor: string, 
  children: React.ReactNode 
}) => {
  const isExternal = !href.startsWith('mailto:') && !href.startsWith('tel:');
  const { playSound } = useSound();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    playSound('click');
    if (!href || href === '') {
      e.preventDefault();
    }
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      target={isExternal ? "_blank" : "_self"}
      rel={isExternal ? "noopener noreferrer" : ""}
      className="perf-icon-link"
      style={{ 
        '--hover-bg': hoverBg, 
        '--hover-color': hoverColor 
      } as React.CSSProperties}
    >
      <span className="perf-tooltip">
        {label}
        <span className="perf-tooltip-arrow"></span>
      </span>
      {children}
    </a>
  );
};

export default function ContactFooter() {
  const [quote] = useState(() => DEV_QUOTES[Math.floor(Math.random() * DEV_QUOTES.length)]);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  // Typewriter Effect
  useEffect(() => {
    if (!quote) return;
    let i = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNextChar = () => {
      setDisplayedText(quote.substring(0, i + 1));
      i++;
      if (i < quote.length) {
        timeoutId = setTimeout(typeNextChar, 40);
      } else {
        setIsTyping(false);
      }
    };

    timeoutId = setTimeout(typeNextChar, 300);
    return () => clearTimeout(timeoutId);
  }, [quote]);

  // Pure CSS Animation Trigger via Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px" }
    );

    if (footerRef.current) observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer id="bottom" ref={footerRef} style={{
      backgroundColor: 'var(--bg-color)',
      borderTop: '1px solid var(--border-color)',
      padding: '3rem 1rem 2rem 1rem',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        
        <div style={{ 
          minHeight: '80px',
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          marginBottom: '2rem',
          padding: '0 1rem'
        }}>
          <p style={{ 
            fontFamily: 'var(--mono)', 
            fontSize: '1rem', 
            color: 'var(--orange)', 
            fontStyle: 'italic',
            margin: 0,
            lineHeight: '1.5'
          }}>
            {displayedText}
            <span style={{ 
              display: 'inline-block',
              width: '8px',
              height: '1em',
              backgroundColor: 'var(--orange)',
              verticalAlign: 'text-bottom',
              marginLeft: '4px',
              opacity: isTyping ? 1 : 0, 
              animation: isTyping ? 'none' : 'blink 1s step-end infinite'
            }}></span>
          </p>
        </div>

        {/* --- ZERO-LAG NATIVE CSS ENGINE --- */}
        <style>
          {`
            @keyframes blink {
              0%, 100% { opacity: 1; }
              50% { opacity: 0; }
            }
            @keyframes slideUpFade {
              from { opacity: 0; transform: translateY(40px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes wiggle {
              0%, 100% { transform: rotate(0deg); }
              25% { transform: rotate(10deg); }
              75% { transform: rotate(-10deg); }
            }
            @keyframes scaleRight {
              from { opacity: 0; transform: scaleX(0); }
              to { opacity: 1; transform: scaleX(1); }
            }

            .responsive-icon-grid {
              display: flex;
              justify-content: center;
              flex-wrap: wrap;
              gap: 16px;
              margin-bottom: 3rem;
              padding: 0 1rem;
            }
            @media (max-width: 480px) {
              .responsive-icon-grid {
                max-width: 250px; 
                margin-left: auto;
                margin-right: auto;
              }
            }

            /* GPU-Accelerated Icon Links */
            .perf-icon-link {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background-color: var(--pill-bg);
              color: var(--text-main);
              border: 1px solid var(--border-color);
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              text-decoration: none;
              position: relative;
            }
            
            /* Native CSS Hover state mapping */
            @media (hover: hover) {
              .perf-icon-link:hover {
                background-color: var(--hover-bg);
                color: var(--hover-color);
                transform: scale(1.05);
              }
              .perf-icon-link:hover .perf-tooltip {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
              }
            }

            /* Mobile Edge-Case: Use :active for strict touch responses */
            .perf-icon-link:active {
              background-color: var(--hover-bg);
              color: var(--hover-color);
              transform: scale(0.95);
            }
            .perf-icon-link:active .perf-tooltip {
              opacity: 1;
              transform: translateX(-50%) translateY(0);
            }

            .perf-tooltip {
              position: absolute;
              bottom: calc(100% + 10px);
              left: 50%;
              transform: translateX(-50%) translateY(8px);
              opacity: 0;
              pointer-events: none;
              background-color: var(--tooltip-bg);
              color: var(--tooltip-text);
              padding: 6px 12px;
              border-radius: 6px;
              font-size: 0.75rem;
              font-weight: 600;
              white-space: nowrap;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
              transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
              z-index: 20;
              will-change: transform, opacity;
            }

            .perf-tooltip-arrow {
              position: absolute;
              top: 100%;
              left: 50%;
              transform: translateX(-50%);
              border-width: 5px;
              border-style: solid;
              border-color: var(--tooltip-bg) transparent transparent transparent;
            }

            .connect-title {
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 2.2rem;
              font-weight: 800;
              color: var(--text-main);
              margin: 0 0 12px 0;
              opacity: 0;
            }
            .connect-title.animate-in {
              animation: slideUpFade 0.8s ease-out forwards;
            }
            
            .titleIcon {
              width: 50px;
              height: 50px;
              object-fit: contain;
              filter: drop-shadow(0 0 5px var(--primary, #3b82f6));
              margin-left: 20px;
              animation: wiggle 3s infinite ease-in-out;
            }
            
            .title-underline {
              width: 60px;
              height: 4px;
              background-color: #2563eb;
              margin: 0 auto 2.5rem auto;
              border-radius: 2px;
              opacity: 0;
              transform-origin: center;
            }
            .title-underline.animate-in {
              animation: scaleRight 0.8s ease-out 0.2s forwards;
            }
          `}
        </style>

        <h2 className={`connect-title ${isVisible ? 'animate-in' : ''}`}>
          Let’s Connect
          <img
            src={SocialImage}
            alt="Connect"
            className="titleIcon"
          />
        </h2>
        
        <div className={`title-underline ${isVisible ? 'animate-in' : ''}`} />

        <div className="responsive-icon-grid">
          <IconLink href="tel:7305418685" label="Call Me" hoverBg="var(--highlight-green)" hoverColor="#000">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </IconLink>

          <IconLink href="mailto:sakthivelan.shankar@gmail.com" label="Email" hoverBg="var(--highlight-orange)" hoverColor="#000">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </IconLink>

          <IconLink href={LocationURL} label="Location" hoverBg="#ef4444" hoverColor="#fff">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          </IconLink>

          <IconLink href={GitHubURL} label="GitHub" hoverBg="var(--text-main)" hoverColor="var(--bg-color)">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          </IconLink>

          <IconLink href={LinkedInURL} label="LinkedIn" hoverBg="#0a66c2" hoverColor="#fff">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
          </IconLink>

          <IconLink href={TwitterURL} label="X (Twitter)" hoverBg="var(--text-main)" hoverColor="var(--bg-color)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </IconLink>

          <IconLink href={InstagramURL} label="Instagram" hoverBg="#e1306c" hoverColor="#fff">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </IconLink>
        </div>

        <div style={{ 
          borderTop: '1px solid var(--border-color)', 
          paddingTop: '2rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            padding: '6px 12px',
            borderRadius: '50px',
            border: '1px solid rgba(34, 197, 94, 0.2)'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              boxShadow: '0 0 10px #22c55e',
              animation: 'pulse-dot 2s infinite ease-in-out'
            }}></span>
            <span style={{ 
              color: '#22c55e', 
              fontSize: '0.8rem', 
              fontWeight: '600', 
              fontFamily: 'var(--mono)',
              letterSpacing: '1px'
            }}>
              SYSTEM.ONLINE
            </span>
          </div>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.85rem', 
            margin: 0, 
            textAlign: 'center',
            fontFamily: 'var(--mono)'
          }}>
            Engineered by Sakthivelan S
            </p>
            <p style={{ color: 'var(--text-main)' }}>Strictly DRY & KISS. Clean code only...!</p>
        </div>
      </div>
    </footer>
  );
}