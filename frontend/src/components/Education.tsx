import HighlightText from './HighlightText';
import { useSound } from '../hooks/useSound';

// Data structure updated with logo paths and new credentials
const educationData = [
  {
    degree: "Bachelor of Computer Applications",
    institution: "Loyola College, Chennai",
    duration: "June 2023 - May 2026",
    metric: "CGPA: 8.97",
    details: "Focus on Object-Oriented Design, Data Structures, and Relational Databases.",
    logo: "/logos/loyola.png"
  },
  {
    degree: "Higher Secondary Education (Commerce)",
    institution: "MGR Adarsh School, Chennai",
    duration: "June 2021 - May 2023",
    metric: "Marks: 92.67 %",
    details: "Strong mathematical and analytical foundation.",
    logo: "/logos/mgr.png"
  }
];

// THE FIX 1: Added 'url' property to your data structure
const certificationData = [
  {
    title: "Mobile App Development",
    issuer: "Coderz Vision Technology",
    date: "January 2026",
    badge: "Professional",
    logo: "/logos/coderz.jpg",
    url: "https://drive.google.com/file/d/1CT_Ahs7fBkhE1e_A_yWp2SJNJitt4Ri8/view"
  },
  {
    title: "Python for Data Science",
    issuer: "IIT Madras via NPTEL",
    date: "August 2025",
    badge: "Elite + Silver",
    logo: "/logos/nptel.png",
    url: "https://archive.nptel.ac.in/content/noc/NOC25/SEM2/Ecertificates/106/noc25-cs104/Course/NPTEL25CS104S43330877509125149.pdf" 
  },
  {
    title: "Database Management System",
    issuer: "IIT Madras via NPTEL",
    date: "September 2024",
    badge: "Certified", 
    logo: "/logos/nptel.png",
    url: "https://archive.nptel.ac.in/content/noc/NOC24/SEM2/Ecertificates/106/noc24-cs75/Course/NPTEL24CS75S23310195602621365.pdf" 
  },
  {
    title: "Web Development Training",
    issuer: "GenZ EducateWing",
    date: "July 2024",
    badge: "Completed",
    logo: "/logos/genz.jpg",
    url: "https://drive.google.com/file/d/1lfMlhF1EolKxO0S2Hf9HLI0y8kBhuTfM/view"
  }
];

export default function Education() {
  const {playSound} = useSound();
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.style.display = 'none';
  };

  return (
    <section id='academics' style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '40px', 
        color: 'var(--text-main)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '10px'
      }}>
        Academic & Credential Baseline
      </h2>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '40px' 
      }}>
        
        {/* Education Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Education
          </h3>
          
          {educationData.map((edu, index) => (
            <div key={index} style={{ display: 'flex', gap: '15px' }}>
              
              <div style={{
                width: '50px',
                height: '50px',
                minWidth: '50px', 
                borderRadius: '8px',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-color)'
              }}>
                <img 
                  src={edu.logo} 
                  alt={edu.institution} 
                  onError={handleImageError}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  loading="lazy"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.2 }}>
                  <HighlightText color="var(--highlight-orange)">{edu.degree}</HighlightText>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                  {edu.institution}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{edu.duration}</span>
                  <span style={{ 
                    fontSize: '0.8rem', 
                    fontWeight: 700, 
                    color: 'var(--pill-text)',
                    backgroundColor: 'var(--pill-bg)',
                    padding: '2px 8px',
                    borderRadius: '4px'
                  }}>
                    {edu.metric}
                  </span>
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {edu.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Certifications Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--orange)', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            Certifications
          </h3>

          {certificationData.map((cert, index) => (
            /* THE FIX 2: Wrapped the entire card in an anchor tag */
            <a 
              key={index}
              href={cert.url} 
              onClick={() => playSound('click')}
              target="_blank" 
              rel="noopener noreferrer" /* Mandatory security practice */
              style={{ textDecoration: 'none', display: 'block', color: 'inherit' }}
            >
              <div 
                style={{ 
                  padding: '16px', 
                  backgroundColor: 'var(--card-bg)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px',
                  display: 'flex',
                  gap: '15px',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s ease, border-color 0.2s ease'
                }}
                /* Interactive hover states using inline event handlers */
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'var(--orange)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                
                <div style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '6px',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={cert.logo} 
                    alt={cert.issuer} 
                    onError={handleImageError}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 7 }}
                    loading="lazy"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                    <HighlightText color="var(--highlight-green)">{cert.title}</HighlightText>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {cert.issuer}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cert.date}</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {/* THE FIX 3: Visual indicator that it is a link */}
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>
                        View ↗
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        color: 'var(--orange)', 
                        border: '1px solid var(--orange)',
                        backgroundColor: 'var(--orange-bg)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 600
                      }}>
                        {cert.badge}
                      </span>
                    </div>

                  </div>
                </div>

              </div>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
}