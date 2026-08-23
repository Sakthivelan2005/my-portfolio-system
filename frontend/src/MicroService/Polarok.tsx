import { useEffect, useRef } from 'react';

export default function Polarok() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w: number, h: number, dpr: number;
    let pts: Array<{ x: number, y: number, vx: number, vy: number, r: number, act: number }> = [];
    let pulses: Array<{ a: number, b: number, t: number, sp: number }> = [];
    let rafId: number;
    let isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    let lastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
    let smoothedVelocity = 0;

    let isDark = document.documentElement.getAttribute('data-theme') !== 'light';
    let baseColorStr = isDark ? '248, 250, 252' : '15, 23, 42'; 
    let cometColorStr = isDark ? '92, 255, 255' : '37, 99, 235';
    let baseColorRGB = `rgb(${baseColorStr})`;
    let cometColorRGB = `rgb(${cometColorStr})`;

    // THE FIX: High-performance CSS Nebula Gradient Generator
    const applyGalaxyBackground = (dark: boolean) => {
      if (!canvas) return;
      // Dark Mode: A deep indigo nebula center fading into pure cosmic black
      // Light Mode: A soft cyan glow fading into your standard light background
      canvas.style.background = dark
        ? 'radial-gradient(ellipse at 50% 50%, rgba(30, 32, 60, 1) 0%, rgba(15, 23, 42, 1) 50%, rgba(2, 6, 23, 1) 100%)'
        : 'radial-gradient(ellipse at 50% 50%, rgba(224, 242, 254, 0.8) 0%, rgba(248, 250, 252, 1) 60%, rgba(226, 232, 240, 1) 100%)';
    };

    applyGalaxyBackground(isDark);

    const themeObserver = new MutationObserver(() => {
      isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      baseColorStr = isDark ? '248, 250, 252' : '15, 23, 42';
      cometColorStr = isDark ? '92, 255, 255' : '37, 99, 235';
      baseColorRGB = `rgb(${baseColorStr})`;
      cometColorRGB = `rgb(${cometColorStr})`;
      
      // Update the galaxy background instantly on theme toggle
      applyGalaxyBackground(isDark);
    });
    
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const init = () => {
      const rect = canvas.getBoundingClientRect();
      const isMobile = rect.width < 768;
      
      dpr = isMobile ? 1 : Math.min(window.devicePixelRatio || 1, 2); 
      
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);

      const count = isMobile ? 35 : 70; 
      pts = [];
      pulses = [];
      lastScrollY = window.scrollY;
      smoothedVelocity = 0;

      for (let i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          r: Math.random() * 1.2 + 0.8,
          act: 0 
        });
      }
    };

    const spawnPulse = () => {
      if (pts.length < 2) return;
      const a = (Math.random() * pts.length) | 0; 
      let best = -1;
      let bd = Infinity;

      for (let k = 0; k < 10; k++) {
        const b = (Math.random() * pts.length) | 0;
        if (b === a) continue;
        const dx = pts[a].x - pts[b].x;
        const dy = pts[a].y - pts[b].y;
        const distSq = dx * dx + dy * dy; 
        if (distSq < bd && distSq > 4000) { 
          bd = distSq;
          best = b;
        }
      }

      if (best < 0 || bd > 90000) return; 

      pts[a].act = 1; 
      pulses.push({
        a: a,
        b: best,
        t: 0,
        sp: 0.002 + Math.random() * 0.003 
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;
      
      let targetVelocity = deltaY * 0.3; 

      if (targetVelocity > 20) targetVelocity = 20;
      if (targetVelocity < -20) targetVelocity = -20;

      smoothedVelocity += (targetVelocity - smoothedVelocity) * 0.15;

      if (Math.abs(smoothedVelocity) < 0.01) smoothedVelocity = 0;

      if (!isReducedMotion) {
        for (let i = 0; i < pts.length; i++) {
          const p = pts[i];
          
          p.x += p.vx;
          p.y += p.vy - smoothedVelocity;

          p.x = ((p.x % w) + w) % w;
          p.y = ((p.y % h) + h) % h;
          
          if (p.act > 0.02) p.act *= 0.95;
          else p.act = 0;
        }
      }

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = baseColorRGB; 
      
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 12000) { 
            ctx.globalAlpha = 0.08 * (1 - distSq / 12000) + (a.act + b.act) * 0.05;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 0.2;
      ctx.fillStyle = baseColorRGB;
      ctx.beginPath();
      for (let i = 0; i < pts.length; i++) {
        if (pts[i].act <= 0.04) {
          ctx.moveTo(pts[i].x, pts[i].y);
          ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
        }
      }
      ctx.fill();

      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const g = p.act; 
        if (g > 0.04) {
          ctx.globalAlpha = g * 0.15;
          ctx.fillStyle = cometColorRGB;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + g * 6, 0, Math.PI * 2);
          ctx.fill();

          ctx.globalAlpha = 0.2 + g * 0.6;
          ctx.fillStyle = baseColorRGB;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + g * 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;

      for (let k = pulses.length - 1; k >= 0; k--) {
        const pu = pulses[k];
        const a = pts[pu.a], b = pts[pu.b];

        if (!a || !b) {
          pulses.splice(k, 1);
          continue;
        }
        
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        if (dx * dx + dy * dy > 50000) {
          pulses.splice(k, 1);
          continue;
        }

        if (!isReducedMotion) {
          pu.t += pu.sp;
        }

        if (pu.t >= 1) {
          b.act = 1; 
          pulses.splice(k, 1);
          continue;
        }

        const x = a.x + (b.x - a.x) * pu.t;
        const y = a.y + (b.y - a.y) * pu.t;
        
        const t2 = Math.max(0, pu.t - 0.15); 
        const tx = a.x + (b.x - a.x) * t2;
        const ty = a.y + (b.y - a.y) * t2;

        const lg = ctx.createLinearGradient(tx, ty, x, y);
        lg.addColorStop(0, `rgba(${cometColorStr}, 0)`);
        lg.addColorStop(1, `rgba(${cometColorStr}, 0.8)`);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cometColorStr}, 0.2)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = baseColorRGB;
        ctx.fill();
      }

      if (!isReducedMotion && pulses.length < (w < 768 ? 4 : 8) && Math.random() < 0.05) {
        spawnPulse();
      }

      if (!isReducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    const bootTimeout = setTimeout(() => {
      init();
      render();
    }, 50);

    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        init();
        if (isReducedMotion) render(); 
      }, 200);
    };

    const handleQueryChange = (e: MediaQueryListEvent) => {
      isReducedMotion = e.matches;
      if (!isReducedMotion) render();
    };

    window.addEventListener('resize', handleResize);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    mediaQuery.addEventListener('change', handleQueryChange);

    return () => {
      clearTimeout(bootTimeout);
      cancelAnimationFrame(rafId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      mediaQuery.removeEventListener('change', handleQueryChange);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1, 
        pointerEvents: 'none', 
        /* Fallback background if JS fails */
        background: 'var(--bg-color)', 
        transform: 'translateZ(0)' 
      }}
      aria-hidden="true"
    />
  );
}