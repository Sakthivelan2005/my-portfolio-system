import React, { useState } from 'react';
import HighlightText from '../MicroService/HighlightText';
import UnderlineText from '../MicroService/UnderlineText';
import styles from './TechStack.module.css'; 
import './Project.css'; 
import { useSound } from '../hooks/useSound';

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

const experiencesData: ExperienceItem[] = [
  {
    role: "Full Stack Developer",
    company: "Tailor Junction (Academic Capstone)",
    date: "December 2025 - March 2026",
    tech: ["React Native", "Node.js", "Express.js", "TypeScript", "MySQL", "Socket.IO", "Expo", "Android Studio", "Postman", "Git"],
    description: (
      <>
        Engineered a <HighlightText color="var(--highlight-orange)">live marketplace</HighlightText> for local tailors. Used Socket.io for instant messaging and order tracking, ensuring the app updates <UnderlineText color="var(--underline-blue)">instantly without page reloads.</UnderlineText>
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">Tailor Junction</HighlightText> - A mobile app that connects customers with local tailors in real time.</>,
      responsibilities: [
        <>Designed a <HighlightText color="var(--highlight-blue)">bulletproof Node.js backend</HighlightText> and database architecture from scratch.</>,
        <>Integrated <HighlightText color="var(--highlight-orange)">zero-latency chat</HighlightText> and live order tracking using <UnderlineText color="var(--underline-green)">Socket.io.</UnderlineText></>,
        <>Wrote strict, clean code to ensure the app <HighlightText color="var(--highlight-green)">never crashes</HighlightText> during high traffic.</>
      ],
      performance: (
        <>
          Delivered a <HighlightText color="var(--highlight-green)">blazing-fast experience</HighlightText> where users receive instant mobile alerts <UnderlineText color="var(--underline-blue)">without ever refreshing.</UnderlineText>
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
        Developed 'MeTime', a cross-platform beauty app. Built a <HighlightText color="var(--highlight-green)">highly secure OTP login</HighlightText> system to keep user data <UnderlineText color="var(--underline-blue)">strictly private and safe.</UnderlineText>
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">MeTime</HighlightText> - A cross-platform app for booking beauty services.</>,
      responsibilities: [
        <>Built smooth, responsive <HighlightText color="var(--highlight-blue)">mobile app screens</HighlightText> using React Native.</>,
        <>Engineered a robust login flow enforced by <HighlightText color="var(--highlight-green)">strict OTP validation</HighlightText>.</>,
        <>Rigorously tested the app to guarantee flawless performance on both <HighlightText color="var(--highlight-orange)">Android and iOS.</HighlightText></>
      ],
      performance: (
        <>
          Delivered a <HighlightText color="var(--highlight-orange)">bug-free login infrastructure</HighlightText> that completely blocks fake accounts and <UnderlineText color="var(--underline-green)">protects user privacy.</UnderlineText>
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
        Built a full-stack e-commerce store. Designed a fast <HighlightText color="var(--highlight-green)">MongoDB database</HighlightText> to handle heavy orders and used real-time APIs to <UnderlineText color="var(--underline-blue)">display live currency rates.</UnderlineText>
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">Kirana Connect</HighlightText> - An E-commerce platform for local grocery stores.</>,
      responsibilities: [
        <>Developed highly interactive <HighlightText color="var(--highlight-blue)">frontend pages</HighlightText> using React.js.</>,
        <>Architected a fast <HighlightText color="var(--highlight-green)">MongoDB database</HighlightText> to securely save user and order data.</>,
        <>Integrated external APIs to dynamically adjust product prices based on <HighlightText color="var(--highlight-orange)">live market rates.</HighlightText></>
      ],
      performance: (
        <>
          Launched a <HighlightText color="var(--highlight-blue)">highly stable online store</HighlightText> that processes complex orders <UnderlineText color="var(--underline-blue)">with zero data loss or lag.</UnderlineText>
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
        Built a modern property portal from the ground up. Focused entirely on clean semantics and writing <HighlightText color="var(--highlight-orange)">mobile-first</HighlightText> <UnderlineText color="var(--underline-blue)">responsive code.</UnderlineText>
      </>
    ),
    details: {
      projects: <><HighlightText color="var(--highlight-blue)">Real-Estate Platform</HighlightText> - A modern property portal and financial education hub.</>,
      responsibilities: [
        <>Designed the UI with Bootstrap so it scales perfectly across <HighlightText color="var(--highlight-blue)">all screen sizes.</HighlightText></>,
        <>Structured clear educational modules specifically targeting <HighlightText color="var(--highlight-green)">first-time property buyers.</HighlightText></>,
        <>Wrote strict, lightweight HTML/CSS to guarantee <HighlightText color="var(--highlight-orange)">fast load times</HighlightText> and a <UnderlineText color="var(--underline-blue)">smooth user experience.</UnderlineText></>
      ],
      performance: (
        <>
          Delivered a <HighlightText color="var(--highlight-green)">fluid, highly responsive</HighlightText> platform that looks and feels premium on <UnderlineText color="var(--underline-green)">both mobile and desktop.</UnderlineText>
        </>
      )
    }
  }
];

export default function Experience() {
  const { playSound } = useSound();

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    type: string;
    data: React.ReactNode | React.ReactNode[];
  }>({ isOpen: false, title: '', type: '', data: [] });

  const openModal = (title: string, type: string, data: React.ReactNode | React.ReactNode[]) => {
    playSound('click'); 
    setModalConfig({ isOpen: true, title, type, data });
  };

  const closeModal = () => {
    playSound('click');
    setModalConfig({ ...modalConfig, isOpen: false });
  };

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