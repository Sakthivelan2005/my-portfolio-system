import React, { useState, useEffect } from 'react';
import styles from './TechStack.module.css';
import dsaDark from '../assets/dsaD.webp'
import dsaLight from '../assets/dsaL.webp'
import { useTheme } from '../context/ThemeContext';

// IMPORTANT: Save your provided MySQL Workbench image as 'workbench.png' inside the src/assets folder
import workbenchImg from '../assets/workbench.png';

interface TechItem {
  name: string;
  level: string;
  learned: string;
  icon?: string;
  customSvg?: React.ReactNode;
  needsInvert?: boolean;
}

interface StackLayer {
  layer: string;
  focus: string;
  tech: TechItem[];
}

export default function TechStack() {
  const { isDark } = useTheme();
  
  // Dynamic Viewport Detection for structural shifting
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Precision O(1) Pixel Shifting
  const handleBoundaryCheck = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const pill = e.currentTarget;
    const pillRect = pill.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    const safePadding = 16;
    const actualTooltipWidth = Math.min(250, viewportWidth - (safePadding * 2));
    const tooltipHalfWidth = actualTooltipWidth / 2;
    const pillCenter = pillRect.left + (pillRect.width / 2);

    const unshiftedLeft = pillCenter - tooltipHalfWidth;
    const unshiftedRight = pillCenter + tooltipHalfWidth;

    let shift = 0;

    if (unshiftedLeft < safePadding) {
      shift = safePadding - unshiftedLeft;
    } 
    else if (unshiftedRight > viewportWidth - safePadding) {
      shift = (viewportWidth - safePadding) - unshiftedRight;
    }

    if (shift !== 0) {
      pill.style.setProperty('--tt-shift', `${shift}px`);
      pill.style.setProperty('--tt-arrow', `calc(50% - ${shift}px)`);
    } else {
      pill.style.removeProperty('--tt-shift');
      pill.style.removeProperty('--tt-arrow');
    }
  };

  // 1. Isolate the DB Tech Items
  const oracleTech: TechItem = { 
    name: "Oracle", 
    customSvg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 130">
        <rect x="25" y="25" width="150" height="80" rx="40" fill="none" stroke="#CA3F2E" strokeWidth="35"/>
      </svg>
    ),
    level: "Advanced", 
    learned: "Engineered complex triggers, procedures, and data partitioning strategies." 
  };

  const mysqlTech: TechItem = { 
    name: "MySQL", 
    icon: "mysql/mysql-original.svg", 
    level: "Advanced", 
    learned: "Designed normalized relational schemas and optimized querying." 
  };

  const mongoTech: TechItem = { 
    name: "MongoDB", 
    icon: "mongodb/mongodb-original.svg", 
    level: "Advanced", 
    learned: "Built NoSQL aggregation pipelines for real-time order processing." 
  };

  const compassTech: TechItem = { 
    name: "MongoDB Compass", 
    customSvg: (
      <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon>
      </svg>
    ),
    level: "Intermediate", 
    learned: "Visualized schema structures, analyzed query execution plans, and indexed large NoSQL datasets." 
  };

  const workbenchTech: TechItem = { 
    name: "MySQL Workbench", 
    customSvg: (
      <img src={workbenchImg} alt="MySQL Workbench" width={22} height={22} style={{ borderRadius: '4px', objectFit: 'contain' }} />
    ),
    level: "Intermediate", 
    learned: "Designed Entity-Relationship (ER) diagrams, managed secure database connections, and executed complex SQL administration scripts." 
  };

  // 2. Dynamically structure the Data Array based on the viewport
  const stackData: StackLayer[] = [
    {
      layer: "Core Logic & Scripting",
      focus: "Data Structures & Complexity Analysis",
      tech: [
        { name: "Python", icon: "python/python-original.svg", level: "Advanced", learned: "Elite + Silver Certification (NPTEL). Applied Object-Oriented Design and Data Science principles." },
        { name: "JavaScript", icon: "javascript/javascript-original.svg", level: "Advanced", learned: "Core language for full-stack DOM manipulation and asynchronous API handling." },
        { name: "TypeScript", icon: "typescript/typescript-original.svg", level: "Intermediate", learned: "Enforced strict static typing for scalable and maintainable architectures." },
        { 
          name: "DSA", 
          customSvg: (
            <img src={isDark ? dsaDark : dsaLight} alt="dsa" width={20} height={20}  />
          ), 
          level: "Advanced", 
          learned: "Ranked #353 in CodeQuest. Heavy focus on time/space complexity optimization and competitive programming." 
        }
      ]
    },
    {
      layer: "Database Architecture",
      focus: "Relational & NoSQL System Design",
      // On mobile, only show the 3 core databases. On desktop, show all 5.
      tech: isMobile ? [oracleTech, mysqlTech, mongoTech] : [oracleTech, mysqlTech, mongoTech, compassTech, workbenchTech]
    },
    // If we are on mobile, dynamically inject a brand new section for the GUI tools
    ...(isMobile ? [{
      layer: "DB Management Tools",
      focus: "GUI Tools & Administration",
      tech: [compassTech, workbenchTech]
    }] : []),
    {
      layer: "Backend & Event-Driven",
      focus: "Real-Time Server Architecture",
      tech: [
        { name: "Node.js", icon: "nodejs/nodejs-original.svg", level: "Advanced", learned: "Architected custom backend servers and secure authentication workflows." },
        { name: "Express.js", icon: "express/express-original.svg", level: "Advanced", learned: "Built RESTful APIs and middleware for seamless client-server communication.", needsInvert: true },
        { name: "Socket.IO", icon: "socketio/socketio-original.svg", level: "Advanced", learned: "Established live, two-way messaging, eliminating heavy server polling.", needsInvert: true },
      ]
    },
    {
      layer: "Client Applications",
      focus: "Cross-Platform Mobile & Web UI",
      tech: [
        { name: "React Native", icon: "react/react-original.svg", level: "Advanced", learned: "Engineered cross-platform mobile apps with secure OTP authentication." },
        { name: "React.js", icon: "react/react-original.svg", level: "Advanced", learned: "Built component-driven frontends emphasizing DRY and KISS principles." },
        { 
          name: "Expo", 
          customSvg: (
            <svg viewBox="0 0 128 128" fill="currentColor">
            <path d="M60.654 48.883c1.051-1.534 2.197-1.727 3.127-1.727s2.475.193 3.527 1.727C75.556 60.12 89.173 82.512 99.22 99.035c6.555 10.767 11.586 19.043 12.622 20.095 3.874 3.952 9.189 1.489 12.278-2.995 3.039-4.412 3.88-7.512 3.88-10.817 0-2.253-44.052-83.515-48.486-90.28C75.25 8.534 73.856 6.89 66.56 6.89h-5.469c-7.28 0-8.331 1.644-12.599 8.148C44.058 21.803 0 103.065 0 105.313c0 3.31.847 6.41 3.892 10.822 3.088 4.484 8.403 6.947 12.278 2.99 1.03-1.053 6.061-9.323 12.615-20.095 10.047-16.518 23.62-38.91 31.874-50.153z"></path>
            </svg>
          
          ),
          level: "Advanced", 
          learned: "Accelerated React Native mobile development, handling over-the-air updates and native module linking." 
        },
      ]
    },
    {
      layer: "DevOps & Workflows",
      focus: "Version Control & API Testing",
      tech: [
        { name: "Git", icon: "git/git-original.svg", level: "Advanced", learned: "Managed version control, branching strategies, and collaborative code merging." },
        { name: "Postman", icon: "postman/postman-original.svg", level: "Advanced", learned: "Mocked, stress-tested, and documented RESTful API endpoints before frontend integration." },
        { name: "Android Studio", icon: "androidstudio/androidstudio-original.svg", level: "Intermediate", learned: "Configured emulators, managed SDKs, and built native Android APK/AAB bundles." },
      ]
    },
    {
      layer: "Human Protocols",
      focus: "Soft Skills & Engineering Mindset",
      tech: [
        { 
          name: "Mentorship", 
          customSvg: (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          ),
          level: "Empathic Guide", 
          learned: "I break down complex architectures into simple, digestible concepts. No slow learner gets left behind." 
        },
        { 
          name: "Code Auditing", 
          customSvg: (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <polyline points="9 12 11 14 15 10"></polyline>
            </svg>
          ),
          level: "Ruthless Reviewer", 
          learned: "Strict adherence to DRY and KISS principles. I reject bloated code and validate every assumption." 
        },
        { 
          name: "Problem Solving", 
          customSvg: (
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          ),
          level: "Stress Tester", 
          learned: "I don't seek validation; I seek bulletproof logic. If a system can break, I will find out how and fix it." 
        }
      ]
    }
  ];

  return (
    <section id='tech' style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '40px', 
        color: 'var(--text-main)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        paddingBottom: '10px'
      }}>
        Technical Arsenal
      </h2>

      <div className={styles.gridContainer}>
        {stackData.map((item, index) => (
          <div key={index} className={styles.grid}>
            
            <div>
              <h3 className={styles.layerTitle}>{item.layer}</h3>
              <p className={styles.layerFocus}>// {item.focus}</p>
            </div>

            <div className={styles.techWrapper}>
              {item.tech.map(t => (
                <div 
                  key={t.name} 
                  className={styles.pill} 
                  tabIndex={0}
                  onMouseEnter={handleBoundaryCheck}
                  onPointerEnter={handleBoundaryCheck}
                  onFocus={handleBoundaryCheck}
                  onTouchStart={(e) => {
                    e.stopPropagation();
                    handleBoundaryCheck(e);
                  }}
                >
                  
                  {t.icon ? (
                    <img 
                      src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${t.icon}`} 
                      alt={`${t.name} icon`}
                      className={`${styles.techIcon} ${t.needsInvert ? styles.invertInDark : ''}`} 
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className={styles.techIcon} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {t.customSvg}
                    </div>
                  )}

                  {t.name}

                  <div className={styles.tooltip}>
                    <span className={styles.tooltipLevel}>[{t.level}]</span>
                    <p className={styles.tooltipLearned}>{t.learned}</p>
                  </div>
                </div>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
}