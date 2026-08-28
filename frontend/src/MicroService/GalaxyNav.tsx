'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence, MotionValue } from 'motion/react';
import React, { useRef, useState, useEffect, useCallback } from 'react';
import './GalaxyNav.css';

export type NavItemData = {
  id: string; 
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
};

// 1. Explicitly defining the props interface to resolve the 'any' ESLint error
type DockItemProps = {
  item: NavItemData;
  mouseX: MotionValue<number>;
  activeId: string;
  onNavClick: (id: string, onClick: () => void) => void;
  registerRef: (id: string, el: HTMLDivElement) => void;
};

const noise = (n = 1) => n / 2 - Math.random() * n;

const getXY = (distance: number, pointIndex: number, totalPoints: number): [number, number] => {
  const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
  return [distance * Math.cos(angle), distance * Math.sin(angle)];
};

const createParticle = (i: number, t: number, d: [number, number], r: number, colors: string[], particleCount: number) => {
  const rotate = noise(r / 10);
  return {
    start: getXY(d[0], particleCount - i, particleCount),
    end: getXY(d[1] + noise(7), particleCount - i, particleCount),
    time: t,
    scale: 1 + noise(0.2),
    color: colors[Math.floor(Math.random() * colors.length)],
    rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
  };
};

function DockItem({ item, mouseX, activeId, onNavClick, registerRef }: DockItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false); 
  const isActive = activeId === item.id;

  useEffect(() => {
    if (itemRef.current) registerRef(item.id, itemRef.current);
  }, [item.id, registerRef]);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = itemRef.current?.getBoundingClientRect() ?? { x: 0, width: 50 };
    return val - rect.x - 50 / 2;
  });

  const targetSize = useTransform(mouseDistance, [-150, 0, 150], [45, 80, 45]);
  const size = useSpring(targetSize, { mass: 0.1, stiffness: 150, damping: 12 });

  return (
    <div 
      className={`dock-item-wrapper ${isActive ? 'is-active' : ''}`}
      ref={itemRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        style={{ width: size, height: size }}
        onClick={() => onNavClick(item.id, item.onClick)}
        className="galaxy-item-circle"
      >
        <div className="icon-wrapper">{item.icon}</div>
      </motion.div>

      <div className="active-label-container">
        <div className="active-label-inner">
          <span className="active-label-text">{item.label}</span>
        </div>
      </div>

      <AnimatePresence>
        {!isActive && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.9 }}
            animate={{ opacity: 1, y: 15, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className="hover-tooltip"
          >
            {item.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GalaxyNav({ items }: { items: NavItemData[] }) {
  const mouseX = useMotionValue(Infinity);
  const [activeId, setActiveId] = useState(items[0]?.id || '');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<{ [key: string]: HTMLDivElement }>({});

  const registerRef = useCallback((id: string, el: HTMLDivElement) => {
    itemRefs.current[id] = el;
  }, []);

  const updateEffectPosition = useCallback((targetId: string) => {
    const element = itemRefs.current[targetId];
    if (!containerRef.current || !filterRef.current || !element) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    Object.assign(filterRef.current.style, {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    });
  }, []);

  const makeParticles = () => {
    const filterEl = filterRef.current;
    if (!filterEl) return;

    const animationTime = 600;
    const particleCount = 15;
    const particleDistances: [number, number] = [110, 20]; 
    const particleR = 100;
    const timeVariance = 300;
    const colors = ['#00e5ff', '#38bdf8', '#0ea5e9']; 

    const bubbleTime = animationTime * 2 + timeVariance;
    filterEl.style.setProperty('--time', `${bubbleTime}ms`);

    const oldParticles = filterEl.querySelectorAll('.particle');
    oldParticles.forEach(p => p.remove());

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, particleDistances, particleR, colors, particleCount);
      
      filterEl.classList.remove('active');

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        point.style.setProperty('--color', p.color);

        particle.appendChild(point);
        filterEl.appendChild(particle);
        
        requestAnimationFrame(() => filterEl.classList.add('active'));
        
        setTimeout(() => {
          // 2. Added a comment inside the catch block to resolve the 'no-empty' ESLint error
          try { filterEl.removeChild(particle); } catch { /* Ignore if particle was already removed */ }
        }, t);
      }, 30);
    }
  };

  const handleNavClick = (id: string, onClick: () => void) => {
    if (activeId === id) {
      onClick(); 
      return; 
    }
    setActiveId(id);
    updateEffectPosition(id);
    makeParticles();
    onClick(); 
  };

  useEffect(() => {
    updateEffectPosition(activeId);
    
    const observer = new ResizeObserver(() => updateEffectPosition(activeId));
    if (containerRef.current) observer.observe(containerRef.current);
    Object.values(itemRefs.current).forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  }, [activeId, updateEffectPosition]);

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        let currentSection = items[0]?.id;
        
        for (const item of items) {
          if (item.id === 'top' || item.id === 'bottom') continue; 
          const element = document.getElementById(item.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= window.innerHeight / 3) currentSection = item.id;
          }
        }
        if (window.scrollY === 0) currentSection = 'top';
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) currentSection = 'bottom';
        
        if (currentSection !== activeId) {
          setActiveId(currentSection);
          updateEffectPosition(currentSection);
        }
      }, 150); 
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [items, activeId, updateEffectPosition]);

  return (
    <>
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="gooey-physics">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="gooey" />
          <feBlend in="SourceGraphic" in2="gooey" />
        </filter>
      </svg>

      <div className="galaxy-nav-container">
        <motion.div
          ref={containerRef}
          onMouseMove={(e) => mouseX.set(e.pageX)}
          onMouseLeave={() => mouseX.set(Infinity)}
          className="galaxy-panel"
        >
          <span className="effect filter" ref={filterRef} />

          {items.map((item) => (
            <DockItem 
              key={item.id} 
              item={item} 
              mouseX={mouseX} 
              activeId={activeId}
              onNavClick={handleNavClick}
              registerRef={registerRef}
            />
          ))}
        </motion.div>
      </div>
    </>
  );
}