import { useState } from 'react';
import styles from './TechStack.module.css'; 
import './Projects.css'; 
import HighlightText from './HighlightText';
import UnderlineText from './UnderlineText';

interface ProjectDetails {
  contributions: string[];
  features: string[];
  outcomes: React.ReactNode;
}

interface Project {
  id: string;
  title: string;
  tag: string;
  role: string;
  context: string;
  description: React.ReactNode; 
  repoUrl: string;
  liveUrl?: string;
  demoUrl?: string;
  details: ProjectDetails;
  techStack: string[];
}

interface TechInfo {
  name: string;
  icon: string;
  needsInvert?: boolean;
}

// Helper to map tech stack names to Devicon CDN paths
const getTechInfo = (techName: string): TechInfo => {
  switch (techName.toLowerCase()) {
    case 'react':
      return { name: 'React', icon: 'react/react-original.svg' };
    case 'typescript':
      return { name: 'TypeScript', icon: 'typescript/typescript-original.svg' };
    case 'node.js':
      return { name: 'Node.js', icon: 'nodejs/nodejs-original.svg' };
    case 'express.js':
      return { name: 'Express.js', icon: 'express/express-original.svg', needsInvert: true };
    case 'mongodb':
      return { name: 'MongoDB', icon: 'mongodb/mongodb-original.svg' };
    case 'socket.io':
      return { name: 'Socket.IO', icon: 'socketio/socketio-original.svg', needsInvert: true };
    case 'html':
    case 'html5':
      return { name: 'HTML', icon: 'html5/html5-original.svg' };
    case 'css':
    case 'css3':
      return { name: 'CSS', icon: 'css3/css3-original.svg' };
    case 'javascript':
      return { name: 'JavaScript', icon: 'javascript/javascript-original.svg' };
    default:
      return { name: techName, icon: 'code/code-original.svg' };
  }
};

// Data mapping with enriched details
const projectsData: Project[] = [
  {
    id: 'tailor',
    title: 'TailorJunction',
    tag: 'Academic Project',
    role: 'Software Dev Engineer',
    context: 'Real-Time MSME Marketplace',
    description: (
      <>
        Tailor Junction is an Uber-style, real-time marketplace empowering MSME tailors. Engineered with <HighlightText color='var(--highlight-orange)'>React Native, Express.js, Node.js</HighlightText>, and <HighlightText color='var(--highlight-green)'>Socket.io</HighlightText> for live algorithmic order broadcasting and <UnderlineText color='var(--underline-blue)'>system telemetry</UnderlineText>.
      </>
    ),
    repoUrl: 'https://github.com/sakthivelan2005/TailorJunction',
    details: {
      contributions: [
        'Architected robust backend services and RESTful APIs using Node.js and Express.js.',
        'Engineered real-time bidirectional WebSocket connections via Socket.io for zero-latency order tracking.',
        'Designed scalable database schemas optimized for high-frequency transactions.'
      ],
      features: [
        'Live MSME Marketplace with instant matching algorithms',
        'Real-time in-app messaging and notification infrastructure',
        'Comprehensive vendor and user dashboards with live analytics'
      ],
      outcomes: (
        <>
          Successfully enabled <HighlightText color="var(--highlight-green)">seamless real-time communication</HighlightText> between users and vendors without requiring manual page reloads, drastically boosting user retention.
        </>
      )
    },
    techStack: ['React', 'TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'Socket.IO']
  },
  {
    id: 'ecommerce',
    title: 'e-commerce',
    tag: 'Kirana Connect',
    role: 'React Developer',
    context: 'Client Project',
    description: (
      <>
        Designed scalable platform architecture optimizing <HighlightText color="var(--highlight-green)">database queries</HighlightText> for lightning-fast load times. Built with an absolute focus on <UnderlineText color="var(--underline-blue)">clean, maintainable code</UnderlineText> following industry standards.
      </>
    ),
    repoUrl: 'https://github.com/sakthivelan2005/e-commerce',
    liveUrl: 'https://kirana-collection.netlify.app/',
    details: {
      contributions: [
        'Spearheaded the design and implementation of the full-stack architecture.',
        'Integrated secure third-party payment gateways and authentication workflows.',
        'Optimized frontend components for optimal rendering performance.'
      ],
      features: [
        'Custom admin dashboards for comprehensive inventory management',
        'Secure multi-step user checkout and cart processing',
        'Advanced product filtering and search capabilities'
      ],
      outcomes: (
        <>
          Delivered a <HighlightText color="var(--highlight-orange)">highly scalable platform</HighlightText> capable of handling concurrent user traffic smoothly while maintaining optimal latency.
        </>
      )
    },
    techStack: ['HTML', 'CSS', 'JavaScript', 'React', 'MongoDB']
  },
  {
    id: 'realestate',
    title: 'Real Estate Platform',
    tag: 'GenZ educate wing',
    role: 'Web Developer',
    context: 'Modern Property Portal & Education Hub',
    description: (
      <>
        A modern web application built to simplify property discovery while educating <HighlightText color="var(--highlight-orange)">GenZ buyers</HighlightText> on smart real-time real estate investments. Crafted with clean semantics and <UnderlineText color="var(--underline-blue)">responsive layouts</UnderlineText>.
      </>
    ),
    repoUrl: 'https://github.com/Sakthivelan2005/Real_Estate_Platform',
    liveUrl: 'https://sakthivelan2005.github.io/Real_Estate_Platform/Index.html',
    details: {
      contributions: [
        'Designed and developed the entire user interface focusing on mobile-first responsiveness.',
        'Structured educational modules tailored for first-time property investors.',
        'Optimized assets and DOM structure to ensure peak performance scores.'
      ],
      features: [
        'Interactive property listing catalog with modern card layouts',
        'GenZ-focused financial literacy and real estate guide sections',
        'Streamlined contact and inquiry submission forms'
      ],
      outcomes: (
        <>
          Provided an intuitive, <HighlightText color="var(--highlight-green)">engaging educational experience</HighlightText> that bridges the gap between modern real estate markets and young prospective buyers.
        </>
      )
    },
    techStack: ['HTML', 'CSS', 'JavaScript']
  }
];

// Icons using raw SVG
const Icons = {
  Code: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>,
  Play: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>,
  User: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  Zap: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Target: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
};

export default function ProjectsSection() {
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    type: 'contributions' | 'features' | 'outcomes';
    data: string[] | React.ReactNode;
  }>({ isOpen: false, title: '', type: 'features', data: [] });

  const openModal = (title: string, type: 'contributions' | 'features' | 'outcomes', data: string[] | React.ReactNode) => {
    setModalConfig({ isOpen: true, title, type, data });
  };

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  return (
    <section id='Projects' style={{ padding: '10px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div className="portfolio-section">
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '40px', 
          color: 'var(--text-main)',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '10px'
        }}>
          Projects <span className='length'>({projectsData.length})</span>
        </h2>
        
        <div className={styles.gridContainer}>
          {projectsData.map((project) => (
            <div key={project.id} className="project-row">
              
              {/* Header */}
              <div className="project-header">
                <h3>{project.title} <span className="project-tag">( {project.tag} ) <span className="dot"></span></span></h3>
              </div>

              {/* Role & Context */}
              <div className="project-role">
                <span className="role-title"><Icons.Code /> {project.role}</span>
              </div>
              <p className="project-context">{project.context}</p>

              {/* Description */}
              <p className="project-desc">{project.description}</p>

              {/* Action Buttons */}
              <div className="action-buttons">
                {project.repoUrl && (
                  <a href={project.repoUrl} target="_blank" rel="noreferrer" className="action-btn outline">
                    <Icons.Code /> Repository
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="action-btn outline">
                    <Icons.Target /> Live Site
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className="action-btn outline">
                    <Icons.Play /> Watch Demo
                  </a>
                )}
                <button className="action-btn fill" onClick={() => openModal(project.title, 'contributions', project.details.contributions)}>
                  <Icons.User /> View My Contributions
                </button>
                <button className="action-btn fill" onClick={() => openModal(project.title, 'features', project.details.features)}>
                  <Icons.Zap /> View Key Features
                </button>
                <button className="action-btn fill" onClick={() => openModal(project.title, 'outcomes', project.details.outcomes)}>
                  <Icons.Target /> View Outcomes
                </button>
              </div>

              {/* Tech Stack Pills with Devicon CDN Icons */}
              <div className={styles.techWrapper} style={{ marginTop: '20px' }}>
                {project.techStack.map(techName => {
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

        {/* Dynamic Pop-up Module */}
        {modalConfig.isOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <div className={`modal-content ${styles.grid}`} onClick={e => e.stopPropagation()}>
              <button className="close-btn" onClick={closeModal}>&#10005;</button>
              <h3 style={{ color: 'var(--orange)', marginBottom: '4px' }}>{modalConfig.title}</h3>
              <h4 style={{ textTransform: 'capitalize', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                {modalConfig.type}
              </h4>
              
              {/* Strict Left Alignment Container with Optimized Spacing */}
              <div className="modal-body-left">
                {Array.isArray(modalConfig.data) ? (
                  <ul>
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