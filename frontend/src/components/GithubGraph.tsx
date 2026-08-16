import React, { useState, useEffect, useRef } from 'react';
import styles from './GithubGraph.module.css';
import { useSound } from '../hooks/useSound';

interface Day {
  contributionCount: number;
  date: string;
}

interface Week {
  contributionDays: Day[];
}

interface GitHubData {
  totalContributions: number;
  weeks: Week[];
}

interface TooltipData {
  y: number;
  count: number;
  date: string;
  ttLeft: string;
  ttX: string;
  ttArrow: string;
}

export default function GithubGraph() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // THE FIX: Integrate global audio and mobile detection
  const { playSound } = useSound();
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const res = await fetch('https://my-portfolio-system.onrender.com/api/github');
        if (!res.ok) throw new Error('Network response was not ok');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('[SYSTEM] Frontend failed to fetch GitHub data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGitHubData();
  }, []);

  useEffect(() => {
    if (!loading && scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [loading]);

  const getIntensityStyle = (count: number) => {
    if (count === 0) return { backgroundColor: 'var(--border-color)' };
    if (count < 3) return { backgroundColor: 'rgba(59, 130, 246, 0.3)' };
    if (count < 6) return { backgroundColor: 'rgba(59, 130, 246, 0.6)' };
    if (count < 10) return { backgroundColor: 'rgba(59, 130, 246, 0.8)' };
    return { backgroundColor: 'rgba(59, 130, 246, 1)' };
  };

const handleInteraction = (e: React.SyntheticEvent<HTMLDivElement>, day: Day) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    
    const dateObj = new Date(day.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const targetCenter = rect.left + (rect.width / 2);
    const viewportWidth = window.innerWidth;
    const tooltipHalfWidth = 85; // Approximate safe radius for the tooltip
    const safePadding = 16; // Edge of screen padding

    let ttLeft = `${targetCenter}px`;
    let ttX = '-50%';
    let ttArrow = '50%';

    // 1. Check Left Edge Bleed
    if (targetCenter - tooltipHalfWidth < safePadding) {
      ttLeft = `${safePadding}px`;
      ttX = '0';
      ttArrow = `${targetCenter - safePadding}px`; 
    } 
    // 2. Check Right Edge Bleed
    else if (targetCenter + tooltipHalfWidth > viewportWidth - safePadding) {
      ttLeft = `${viewportWidth - safePadding}px`;
      ttX = '-100%';
      ttArrow = `calc(100% - ${viewportWidth - targetCenter - safePadding}px)`;
    }

    setTooltip({
      y: rect.top - 8,              
      count: day.contributionCount,
      date: formattedDate,
      ttLeft,
      ttX,
      ttArrow
    });
  };

  const renderMonthLabels = () => {
    if (!data) return null;
    
    const labels:React.ReactNode[] = [];
    let currentMonth = "";

    data.weeks.forEach((week, index) => {
      if (week.contributionDays.length > 0) {
        const monthStr = new Date(week.contributionDays[0].date).toLocaleDateString('en-US', { month: 'short' });
        if (monthStr !== currentMonth) {
          labels.push(
            <span key={index} className={styles.monthLabel} style={{ left: `${index * 16}px` }}>
              {monthStr}
            </span>
          );
          currentMonth = monthStr;
        }
      }
    });

    return labels;
  };

  return (
    <section id='git' className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Open Source Activity</h2>
        {!loading && data && (
          <span className={styles.total}>
            {data.totalContributions} Contributions (1 Year)
          </span>
        )}
      </div>

      {tooltip && (
        <div 
          className={styles.customTooltip}
          style={{ 
            top: tooltip.y, 
            left: tooltip.ttLeft,
            transform: `translate(${tooltip.ttX}, -100%)`,
            '--tt-arrow': tooltip.ttArrow 
          } as React.CSSProperties}
        >
          <span className={styles.tooltipCount}>
            {tooltip.count === 0 ? 'No' : tooltip.count} contributions
          </span>
          <span className={styles.tooltipDate}>{tooltip.date}</span>
        </div>
      )}

      {loading ? (
        <div className={styles.skeleton}></div>
      ) : data ? (
        <div className={styles.graphContainer}>
          <div className={styles.graphLayout}>
            
            {/* Static Y-Axis (Days) */}
            <div className={styles.dayLabels}>
              <span className={styles.dayLabel}>Mon</span>
              <span className={styles.dayLabel}>Wed</span>
              <span className={styles.dayLabel}>Fri</span>
            </div>

            {/* Scrolling Data Area */}
            <div 
              className={styles.scrollWrapper} 
              ref={scrollRef}
              onMouseLeave={() => setTooltip(null)} 
              // Dismiss tooltip naturally if the user starts touching/scrolling elsewhere
              onTouchStart={() => setTooltip(null)}
            >
              {/* Dynamic X-Axis (Months) */}
              <div className={styles.monthLabels}>
                {renderMonthLabels()}
              </div>

              {/* Matrix Core */}
              <div className={styles.grid}>
                {data.weeks.map((week, wIndex) => (
                  <div key={wIndex} className={styles.weekColumn}>
                    {week.contributionDays.map((day, dIndex) => (
                     <div 
                        key={dIndex} 
                        className={styles.dayNode}
                        data-mini-spark="true" // Tells the engine to fire a smaller spark
                        style={getIntensityStyle(day.contributionCount)}
                        onMouseEnter={(e) => handleInteraction(e, day)}
                        onFocus={(e) => handleInteraction(e, day)}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleInteraction(e, day);
                        }}
                        
                        // The Spark & Sound remain strictly gated to mobile taps
                        onClick={() => {
                          if (isMobile) playSound('click');
                        }}
                        tabIndex={0} 
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className={styles.graphFooter}>
            <a 
              href="https://docs.github.com/en/account-and-profile/how-tos/contribution-settings/troubleshooting-missing-contributions?search-overlay-open=true&search-overlay-input=how+we+count+contributions+daily&search-overlay-ask-ai=true"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.learnLink}
            >
              Learn how we count contributions
            </a>

            <div className={styles.legend}>
              <span className={styles.legendText}>Less</span>
              <div className={styles.legendBlocks}>
                <div className={styles.legendNode} style={{ backgroundColor: 'var(--border-color)' }}></div>
                <div className={styles.legendNode} style={{ backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
                <div className={styles.legendNode} style={{ backgroundColor: 'rgba(59, 130, 246, 0.6)' }}></div>
                <div className={styles.legendNode} style={{ backgroundColor: 'rgba(59, 130, 246, 0.8)' }}></div>
                <div className={styles.legendNode} style={{ backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
              </div>
              <span className={styles.legendText}>More</span>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-muted)' }}>
          System offline: Unable to load GitHub telemetry.
        </div>
      )}
    </section>
  );
}