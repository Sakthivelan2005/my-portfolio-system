import { useState, useEffect, useRef } from 'react';
import styles from './GithubGraph.module.css';

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
  x: number;
  y: number;
  count: number;
  date: string;
}

export default function GithubGraph() {
  const [data, setData] = useState<GitHubData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchGitHubData = async () => {
      try {
        const res = await fetch('https://my-portfolio-system.onrender.com/');
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

  // Auto-scroll to the current date (right side)
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

  // THE FIX: Viewport-Relative Tooltip Tracking
  const handleInteraction = (e: React.MouseEvent | React.TouchEvent, day: Day) => {
    const target = e.target as HTMLElement;
    // Reads exact pixel coordinates relative to your physical monitor screen
    const rect = target.getBoundingClientRect(); 
    
    const dateObj = new Date(day.date);
    const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    setTooltip({
      x: rect.left + rect.width / 2, // Centers exactly on the box
      y: rect.top - 8,               // Pushes slightly above the box
      count: day.contributionCount,
      date: formattedDate
    });
  };

  // Month Calculation Engine
  const renderMonthLabels = () => {
    if (!data) return null;
    
    const labels:any = [];
    let currentMonth = "";

    data.weeks.forEach((week, index) => {
      if (week.contributionDays.length > 0) {
        const monthStr = new Date(week.contributionDays[0].date).toLocaleDateString('en-US', { month: 'short' });
        if (monthStr !== currentMonth) {
          // Calculate precise pixel offset: Index * (12px width + 4px gap)
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
    <section className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Open Source Activity</h2>
        {!loading && data && (
          <span className={styles.total}>
            {data.totalContributions} Contributions (1 Year)
          </span>
        )}
      </div>

      {/* The Global Tooltip - rendered outside of all containers */}
      {tooltip && (
        <div 
          className={styles.customTooltip}
          style={{ left: tooltip.x, top: tooltip.y }}
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
            onMouseLeave={() => setTooltip(null)} // Clear tooltip on exit
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
                      style={getIntensityStyle(day.contributionCount)}
                      onMouseEnter={(e) => handleInteraction(e, day)}
                      onClick={(e) => handleInteraction(e, day)}
                      tabIndex={0} 
                    />
                  ))}
                </div>
              ))}
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