import { useState } from 'react';
import styles from './TechStack.module.css'; 
import './Project.css'; 
import HighlightText from '../MicroService/HighlightText';
import UnderlineText from '../MicroService/UnderlineText';
import { useSound } from '../hooks/useSound'; 

interface ProjectDetails {
  contributions: React.ReactNode[];
  features: React.ReactNode[];
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
    case 'react native':
    case 'react':
      return { name: techName, icon: 'react/react-original.svg' };
    case 'typescript':
      return { name: 'TypeScript', icon: 'typescript/typescript-original.svg' };
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
    case 'html5':
      return { name: 'HTML', icon: 'html5/html5-original.svg' };
    case 'css':
    case 'css3':
      return { name: 'CSS', icon: 'css3/css3-original.svg' };
    case 'javascript':
      return { name: 'JavaScript', icon: 'javascript/javascript-original.svg' };
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

// Data mapping with enriched details
const projectsData: Project[] = [
  {
    id: 'tailor',
    title: 'TailorJunction',
    tag: 'Academic Project',
    role: 'Full Stack Developer',
    context: 'Real-Time MSME Marketplace',
    description: (
      <>
        TailorJunction works exactly like Uber, but for local tailors. I built it using <HighlightText color='var(--highlight-orange)'>React Native</HighlightText> and <HighlightText color='var(--highlight-green)'>Socket.io</HighlightText> so tailors and customers can talk and track orders <UnderlineText color='var(--underline-blue)'>instantly, without refreshing the app.</UnderlineText>
      </>
    ),
    repoUrl: 'https://github.com/sakthivelan2005/TailorJunction',
    details: {
      contributions: [
        <>Built a <HighlightText color='var(--highlight-green)'>strong and secure Node.js backend</HighlightText> to handle <UnderlineText color='var(--underline-blue)'>hundreds of orders smoothly.</UnderlineText></>,
        <>Set up <HighlightText color='var(--highlight-orange)'>live tracking</HighlightText> so users see order updates the <UnderlineText color='var(--underline-green)'>exact second they happen.</UnderlineText></>,
        <>Designed a <HighlightText color='var(--highlight-blue)'>smart database</HighlightText> that never slows down, even during <UnderlineText color='var(--underline-blue)'>heavy concurrent usage.</UnderlineText></>
      ],
      features: [
        <><HighlightText color='var(--highlight-green)'>Instant matching system</HighlightText> to connect buyers with the <UnderlineText color='var(--underline-blue)'>right tailors.</UnderlineText></>,
        <><HighlightText color='var(--highlight-orange)'>Live chat</HighlightText> and <UnderlineText color='var(--underline-green)'>instant pop-up alerts.</UnderlineText></>,
        <><HighlightText color='var(--highlight-blue)'>Simple dashboards</HighlightText> for tailors to track their <UnderlineText color='var(--underline-blue)'>daily earnings.</UnderlineText></>
      ],
      outcomes: (
        <>
          Created a <HighlightText color="var(--highlight-green)">lightning-fast app</HighlightText> where everything happens live. It makes buying and selling clothes <UnderlineText color="var(--underline-green)">incredibly easy for local shops.</UnderlineText>
        </>
      )
    },
    techStack: ['React Native', 'TypeScript', 'Node.js', 'Express.js', 'MySQL', 'Socket.IO', "Expo", "Android Studio", "Postman"]
  },
  {
    id: 'ecommerce',
    title: 'E-commerce',
    tag: 'Kirana Connect',
    role: 'React Developer',
    context: 'Client Project',
    description: (
      <>
        A fast, smooth online store for local grocery shops. I wrote <HighlightText color="var(--highlight-green)">highly optimized code</HighlightText> to make sure the pages load instantly, strictly following the <UnderlineText color="var(--underline-blue)">DRY and KISS rules.</UnderlineText>
      </>
    ),
    repoUrl: 'https://github.com/sakthivelan2005/e-commerce',
    liveUrl: 'https://kirana-collection.netlify.app/',
    details: {
      contributions: [
        <>Built the <HighlightText color='var(--highlight-green)'>entire frontend</HighlightText> using clean and <UnderlineText color='var(--underline-blue)'>modern React practices.</UnderlineText></>,
        <>Connected a <HighlightText color='var(--highlight-orange)'>safe checkout system</HighlightText> so users can buy <UnderlineText color='var(--underline-green)'>without worry.</UnderlineText></>,
        <>Wrote <HighlightText color='var(--highlight-blue)'>strict logic</HighlightText> to stop the website from <UnderlineText color='var(--underline-blue)'>lagging or freezing.</UnderlineText></>
      ],
      features: [
        <>An <HighlightText color='var(--highlight-green)'>easy-to-use admin panel</HighlightText> for shop owners to <UnderlineText color='var(--underline-blue)'>add products.</UnderlineText></>,
        <>A <HighlightText color='var(--highlight-orange)'>simple, step-by-step</HighlightText> shopping cart for <UnderlineText color='var(--underline-green)'>frictionless checkout.</UnderlineText></>,
        <><HighlightText color='var(--highlight-blue)'>Fast search bar</HighlightText> to find groceries <UnderlineText color='var(--underline-blue)'>instantly.</UnderlineText></>
      ],
      outcomes: (
        <>
          Delivered a <HighlightText color="var(--highlight-orange)">lag-free shopping website</HighlightText> that helps local businesses sell online <UnderlineText color="var(--underline-blue)">without technical headaches.</UnderlineText>
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
        A beautiful property website designed specifically to teach <HighlightText color="var(--highlight-orange)">young people (GenZ)</HighlightText> how to buy their first home. It works perfectly on <UnderlineText color="var(--underline-blue)">any mobile phone or laptop.</UnderlineText>
      </>
    ),
    repoUrl: 'https://github.com/Sakthivelan2005/Real_Estate_Platform',
    liveUrl: 'https://htmlpreview.github.io/?https://github.com/Sakthivelan2005/Real_Estate_Platform/blob/main/Index.html',
    details: {
      contributions: [
        <>Designed the <HighlightText color='var(--highlight-green)'>whole website</HighlightText> to look amazing and fit perfectly on <UnderlineText color='var(--underline-blue)'>small mobile screens.</UnderlineText></>,
        <>Built an <HighlightText color='var(--highlight-orange)'>interactive guide</HighlightText> that explains real estate in <UnderlineText color='var(--underline-green)'>simple words.</UnderlineText></>,
        <>Compressed images and cleaned code to hit a <HighlightText color='var(--highlight-blue)'>perfect 100/100</HighlightText> <UnderlineText color='var(--underline-blue)'>Lighthouse performance score.</UnderlineText></>
      ],
      features: [
        <><HighlightText color='var(--highlight-green)'>Beautiful property cards</HighlightText> with <UnderlineText color='var(--underline-blue)'>clear price tags.</UnderlineText></>,
        <>A <HighlightText color='var(--highlight-orange)'>beginner-friendly</HighlightText> learning hub for <UnderlineText color='var(--underline-green)'>first-time investing.</UnderlineText></>,
        <><HighlightText color='var(--highlight-blue)'>Quick contact forms</HighlightText> to talk directly to <UnderlineText color='var(--underline-blue)'>property agents.</UnderlineText></>
      ],
      outcomes: (
        <>
          Built an <HighlightText color="var(--highlight-green)">impressive learning tool</HighlightText> that actually makes real estate <UnderlineText color="var(--underline-blue)">fun and easy to understand</UnderlineText> for students.
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
  const { playSound } = useSound(); 
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    type: 'contributions' | 'features' | 'outcomes';
    data: React.ReactNode[] | React.ReactNode;
  }>({ isOpen: false, title: '', type: 'features', data: [] });

  const openModal = (title: string, type: 'contributions' | 'features' | 'outcomes', data: React.ReactNode[] | React.ReactNode) => {
    playSound('click'); 
    setModalConfig({ isOpen: true, title, type, data });
  };

  const closeModal = () => {
    playSound('click'); 
    setModalConfig({ ...modalConfig, isOpen: false });
  };

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
                  <a href={project.repoUrl} target="_blank" rel="noreferrer" className="action-btn outline" onClick={() => playSound('click')}>
                    <Icons.Code /> Repository
                  </a>
                )}
                {project.liveUrl && (
                  <a href={project.liveUrl} target="_blank" rel="noreferrer" className="action-btn outline" onClick={() => playSound('click')}>
                    <Icons.Target /> Live Site
                  </a>
                )}
                {project.demoUrl && (
                  <a href={project.demoUrl} target="_blank" rel="noreferrer" className="action-btn outline" onClick={() => playSound('click')}>
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