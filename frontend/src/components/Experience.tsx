import React, { useState } from 'react';
import HighlightText from '../MicroService/HighlightText';
import UnderlineText from '../MicroService/UnderlineText';
import styles from './TechStack.module.css'; 
import './Projects.css'; 

interface ExperienceDetails {
  projects: React.ReactNode;
  responsibilities: React.ReactNode[];
  performance: React.ReactNode;
}

interface ExperienceItem {
  role: string;
  company: string;
  date: string;
  tech: string[];
  description: React.ReactNode;
  details: ExperienceDetails;
}

interface TechInfo {
  name: string;
  icon: string;
  needsInvert?: boolean;
}

// Updated to include HTML, CSS, JavaScript, and Bootstrap
const getTechInfo = (techName: string): TechInfo => {
  switch (techName.toLowerCase()) {
    case 'react native':
    case 'react.js':
      return { name: techName, icon: 'react/react-original.svg' };
    case 'node.js':
      return { name: 'Node.js', icon: 'nodejs/nodejs-original.svg' };
    case 'express.js':
      return { name: 'Express.js', icon: 'express/express-original.svg', needsInvert: true };
    case 'mysql':
      return { name: 'MySQL', icon: 'mysql/mysql-original.svg' };
    case 'mongodb':
      return { name: 'MongoDB', icon: 'mongodb/mongodb-original.svg' };
    case 'socket.io':
      return { name: 'Socket.IO', icon: 'socketio/socketio-original.svg', needsInvert: true };
    case 'html':
      return { name: 'HTML', icon: 'html5/html5-original.svg' };
    case 'css':
      return { name: 'CSS', icon: 'css3/css3-original.svg' };
    case 'javascript':
      return { name: 'JavaScript', icon: 'javascript/javascript-original.svg' };
    case 'typescript':
      return { name: 'TypeScript', icon: 'typescript/typescript-original.svg' };
    case 'bootstrap':
      return { name: 'Bootstrap', icon: 'bootstrap/bootstrap-original.svg' };
    case 'security auth':
      return { name: 'Auth / Security', icon: 'bash/bash-original.svg', needsInvert: true }; 
    case 'android studio':
      return { name: "Android Studio", icon: "androidstudio/androidstudio-original.svg"}
    case 'expo':
      return {name: "Expo", icon: "expo/expo-original.svg", needsInvert: true}
    case 'git':
      return {name: "Git", icon: "git/git-original.svg"}
    case 'postman':
    return {name: "Postman", icon: "postman/postman-original.svg",}
    default:
      return { name: techName, icon: 'code/code-original.svg' };
  }
};

const Icons = {
  Folder: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>,
  Clipboard: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>,
  Chart: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>,
};

// THE FIX: All modal data is now wrapped in JSX fragments (<>...</>) to support HighlightText and UnderlineText
const experiencesData: ExperienceItem[] = [
  {
    role: "Full Stack Developer",
    company: "Tailor Junction (Academic Capstone)",
    date: "December 2025 - March 2026",
    tech: ["React Native", "Node.js", "Express.js", "TypeScript", "MySQL", "Socket.IO", "Expo", "Android Studio", "Postman", "Git"],
    description: (
      <>
        Built a <HighlightText color="var(--highlight-orange)">live marketplace app</HighlightText> for small tailor shops. Used Socket.io for instant messages and live orders, making the app run fast because it <UnderlineText color="var(--underline-blue)">does not wait for the server</UnderlineText> to reload.
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">Tailor Junction</HighlightText> - A mobile app that connects customers with local tailors in real time.</>,
      responsibilities: [
        <><UnderlineText color="var(--underline-blue)">Created the backend server</UnderlineText> and database from scratch.</>,
        <>Added <HighlightText color="var(--highlight-orange)">live chat</HighlightText> and order updates using Socket.io.</>,
        <>Wrote clean code to make sure the app <HighlightText color="var(--highlight-green)">does not crash</HighlightText> when many people use it.</>
      ],
      performance: (
        <>
          Made the app <HighlightText color="var(--highlight-green)">extremely fast</HighlightText>. Users get instant alerts on their phones without refreshing the page.
        </>
      )
    }
  },
  {
    role: "Mobile App Developer Intern",
    company: "Coderz Vision Technology LLP",
    date: "Dec 2025 - Jan 2026",
    tech: ["React Native", "TypeScript", "Expo", "Android Studio", "Security Auth", "Git"],
    description: (
      <>
        Developed 'MeTime', a beauty app for mobile phones. Added a <HighlightText color="var(--highlight-green)">secure OTP login</HighlightText> system to keep user data <UnderlineText color="var(--underline-blue)">safe and private</UnderlineText>.
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">MeTime</HighlightText> - A cross-platform app for booking beauty services.</>,
      responsibilities: [
        <><UnderlineText color="var(--underline-blue)">Built the phone app screens</UnderlineText> using React Native.</>,
        <>Made the login system safe using <HighlightText color="var(--highlight-green)">strict OTP</HighlightText> rules.</>,
        <>Tested the app to make sure it works well on both <HighlightText color="var(--highlight-orange)">Android and iPhone</HighlightText>.</>
      ],
      performance: (
        <>
          Delivered a <HighlightText color="var(--highlight-orange)">bug-free login system</HighlightText> that protects user data and prevents fake accounts.
        </>
      )
    }
  },
  {
    role: "React Developer Intern",
    company: "Kirana Connect",
    date: "March 2024 - June 2024",
    tech: ["React.js", "MongoDB", "Express.js", "Node.js", "Git"],
    description: (
      <>
        Built an online store using the MERN stack. Set up <HighlightText color="var(--highlight-green)">MongoDB</HighlightText> to handle orders quickly and used APIs to <UnderlineText color="var(--underline-blue)">show live money conversion</UnderlineText>.
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">Kirana Connect</HighlightText> - An E-commerce platform for local grocery stores.</>,
      responsibilities: [
        <><UnderlineText color="var(--underline-blue)">Created the website pages</UnderlineText> using React.js.</>,
        <>Connected the website to <HighlightText color="var(--highlight-green)">MongoDB</HighlightText> to save user and order details.</>,
        <>Added APIs to change prices based on <HighlightText color="var(--highlight-orange)">live currency rates</HighlightText>.</>
      ],
      performance: (
        <>
          Built a <HighlightText color="var(--highlight-blue)">stable online store</HighlightText> that loads quickly and handles order data without any errors.
        </>
      )
    }
  },
  {
    role: "Web Developer",
    company: "GenZ Educate Wing",
    date: "November 2023 - January 2024",
    tech: ["HTML", "CSS", "JavaScript", "Bootstrap", "Git"],
    description: (
      <>
        Trained in core web technologies to build a modern property portal. Focused heavily on clean semantics and <HighlightText color="var(--highlight-orange)">mobile-first</HighlightText> <UnderlineText color="var(--underline-blue)">responsive layouts</UnderlineText>.
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">Real-Estate Platform</HighlightText> - A modern property portal and financial education hub.</>,
      responsibilities: [
        <><UnderlineText color="var(--underline-blue)">Designed the user interface</UnderlineText> using Bootstrap to ensure it looked good on all devices.</>,
        <>Structured educational modules to guide <HighlightText color="var(--highlight-green)">first-time property investors</HighlightText>.</>,
        <>Wrote clean HTML/CSS to ensure <HighlightText color="var(--highlight-orange)">fast loading times</HighlightText> and a smooth user experience.</>
      ],
      performance: (
        <>
          Delivered a <HighlightText color="var(--highlight-green)">highly responsive</HighlightText> website that adapts perfectly to both mobile phones and desktop screens.
        </>
      )
    }
  }
];

export default function Experience() {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    type: string;
    data: React.ReactNode | React.ReactNode[];
  }>({ isOpen: false, title: '', type: '', data: [] });

  const openModal = (title: string, type: string, data: React.ReactNode | React.ReactNode[]) => {
    setModalConfig({ isOpen: true, title, type, data });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <section id='experience' style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="portfolio-section" style={{ padding: 0 }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '40px', 
          color: 'var(--text-main)',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px'
        }}>
          Experience <span className='length'>({experiencesData.length})</span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '50px' }}>
          {experiencesData.map((exp, index) => (
            <div key={index} className="project-row" style={{ paddingBottom: '30px', marginBottom: 0 }}>
              
              {/* Header: Role & Date */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--pill-text)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {exp.role}
                </h3>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {exp.date}
                </span>
              </div>

              {/* Company */}
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
                {exp.company}
              </div>

              {/* Description */}
              <p className="project-desc">
                {exp.description}
              </p>

              {/* Action Buttons */}
              <div className="action-buttons" style={{ marginBottom: '20px' }}>
                <button className="action-btn outline" onClick={() => openModal(exp.company, 'Project Involved', exp.details.projects)}>
                  <Icons.Folder /> Project Involved
                </button>
                <button className="action-btn fill" onClick={() => openModal(exp.company, 'My Responsibilities', exp.details.responsibilities)}>
                  <Icons.Clipboard /> My Responsibilities
                </button>
                <button className="action-btn fill" onClick={() => openModal(exp.company, 'My Performance', exp.details.performance)}>
                  <Icons.Chart /> My Performance
                </button>
              </div>

              {/* Tech Stack Pills with Devicon Icons */}
              <div className={styles.techWrapper}>
                {exp.tech.map(techName => {
                  const t = getTechInfo(techName);
                  return (
                    <span key={techName} className={styles.pill} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <img 
                        src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${t.icon}`} 
                        alt={`${t.name} icon`}
                        className={`${styles.techIcon} ${t.needsInvert ? styles.invertInDark : ''}`} 
                        style={{ width: '14px', height: '14px' }}
                        loading="lazy"
                        decoding="async"
                      />
                      {t.name}
                    </span>
                  );
                })}
              </div>
              
            </div>
          ))}
        </div>

        {/* Dynamic Pop-up Modal */}
        {modalConfig.isOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className={`modal-content ${styles.grid}`} onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>&#10005;</button>
              <h3 style={{ color: 'var(--orange)', marginBottom: '4px' }}>{modalConfig.title}</h3>
              <h4 style={{ textTransform: 'capitalize', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                {modalConfig.type}
              </h4>
              
              <div className="modal-body-left">
                {Array.isArray(modalConfig.data) ? (
                  <ul>
                    {/* Because we changed strings to JSX nodes, React renders them perfectly here */}
                    {modalConfig.data.map((item, idx) => <li key={idx}>{item}</li>)}
                  </ul>
                ) : (
                  <div>{modalConfig.data}</div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}