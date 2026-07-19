import styles from './TechStack.module.css';

export default function TechStack() {
  const stackData = [
    {
      layer: "Core Logic & Scripting",
      focus: "Data Structures & Complexity Analysis",
      tech: [
        { name: "Python", icon: "python/python-original.svg", level: "Advanced", learned: "Elite + Silver Certification (NPTEL). Applied Object-Oriented Design and Data Science principles." },
        { name: "JavaScript", icon: "javascript/javascript-original.svg", level: "Advanced", learned: "Core language for full-stack DOM manipulation and asynchronous API handling." },
        { name: "TypeScript", icon: "typescript/typescript-original.svg", level: "Intermediate", learned: "Enforced strict static typing for scalable and maintainable architectures." },
      ]
    },
    {
      layer: "Database Architecture",
      focus: "Relational & NoSQL System Design",
      tech: [
        { name: "Oracle", icon: "oracle/oracle-original.svg", level: "Advanced", learned: "Engineered complex triggers, procedures, and data partitioning strategies." },
        { name: "MySQL", icon: "mysql/mysql-original.svg", level: "Advanced", learned: "Designed normalized relational schemas and optimized querying." },
        { name: "MongoDB", icon: "mongodb/mongodb-original.svg", level: "Advanced", learned: "Built NoSQL aggregation pipelines for real-time order processing." },
      ]
    },
    {
      layer: "Backend & WebSockets",
      focus: "Real-Time Event Driven Architecture",
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
                <div key={t.name} className={styles.pill} tabIndex={0}>
                  {/* High-speed CDN for zero-bundle-size SVG icons */}
                  <img 
                    src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${t.icon}`} 
                    alt={`${t.name} icon`}
                    className={`${styles.techIcon} ${t.needsInvert ? styles.invertInDark : ''}`} 
                    loading="lazy"
                    decoding="async"
                    />
                  {t.name}

                  {/* Pure CSS Tooltip Engine */}
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