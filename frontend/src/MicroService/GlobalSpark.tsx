import { useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';

interface Spark {
  x: number;
  y: number;
  angle: number;
  startTime: number;
  size: number;   // THE FIX: Individual spark tracking
  radius: number; // THE FIX: Individual radius tracking
}

export default function GlobalSpark() {
  const { isDark } = useTheme();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sparksRef = useRef<Spark[]>([]);
  const animationRef = useRef<number | null>(null);

  const sparkColorRef = useRef(isDark ? '#f8fafc' : '#0f172a');
  
  useEffect(() => {
    sparkColorRef.current = isDark ? '#f8fafc' : '#0f172a';
  }, [isDark]);

  const sparkSize = 12;
  const sparkRadius = 20;
  const sparkCount = 8;
  const duration = 400;

  const easeOut = useCallback((t: number) => t * (2 - t), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas, { passive: true });
    resizeCanvas();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const draw = (timestamp: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeSparks = false;

      sparksRef.current = sparksRef.current.filter((spark) => {
        const elapsed = timestamp - spark.startTime;
        if (elapsed >= duration) return false;

        activeSparks = true;
        const progress = elapsed / duration;
        const eased = easeOut(progress);

        // THE FIX: Use the spark's individual geometric tracking
        const distance = eased * spark.radius;
        const lineLength = spark.size * (1 - eased);

        const x1 = spark.x + distance * Math.cos(spark.angle);
        const y1 = spark.y + distance * Math.sin(spark.angle);
        const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
        const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

        ctx.strokeStyle = sparkColorRef.current;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        return true;
      });

      if (activeSparks) {
        animationRef.current = requestAnimationFrame(draw);
      } else {
        animationRef.current = null; 
      }
    };

    const handleFireSpark = (e: Event) => {
      const customEvent = e as CustomEvent<{ x: number, y: number }>;
      const { x, y } = customEvent.detail;
      const now = performance.now();

      // THE FIX: O(1) DOM Raycast to detect if we clicked a mini-spark zone
      let isMini = false;
      try {
        const targetElement = document.elementFromPoint(x, y);
        if (targetElement && targetElement.hasAttribute('data-mini-spark')) {
          isMini = true;
        }
      } catch (err) {
        // Safe fallback
        console.log(err);
      }

      // Shrink the geometry by 60% for tight spaces
      const activeSize = isMini ? 5 : sparkSize;
      const activeRadius = isMini ? 12 : sparkRadius;

      const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
        x,
        y,
        angle: (2 * Math.PI * i) / sparkCount,
        startTime: now,
        size: activeSize,
        radius: activeRadius
      }));

      sparksRef.current.push(...newSparks);

      if (!animationRef.current) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    window.addEventListener('fire-spark', handleFireSpark);

    return () => {
      window.removeEventListener('fire-spark', handleFireSpark);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [easeOut]); 

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999, 
      }}
    />
  );
}