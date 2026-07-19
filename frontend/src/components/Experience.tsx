import HighlightText from './HighlightText';

const experiences = [
  {
    role: "Software Dev Engineer",
    company: "Tailor Junction (Academic Capstone)",
    date: "March 2026",
    tech: ["React Native", "Node.js", "Express.js", "MySQL", "Socket.IO"],
    description: "Engineered a cross-platform real-time MSME marketplace. Integrated Socket.io for live, two-way messaging and instant order broadcasting, optimizing performance by eliminating server polling."
  },
  {
    role: "Mobile App Developer Intern",
    company: "Coderz Vision Technology LLP",
    date: "Dec 2025 - Jan 2026",
    tech: ["React Native", "Security Auth"],
    description: "Developed 'MeTime', a cross-platform beauty application. Implemented secure OTP authentication workflows to ensure strict data privacy and user security."
  },
  {
    role: "React Developer Intern",
    company: "Kirana Connect",
    date: "March 2024 - June 2024",
    tech: ["React.js", "MongoDB", "RESTful APIs", "Netlify", "Render"],
    description: "Built and deployed a MERN-stack e-commerce platform. Engineered MongoDB pipelines for order processing and integrated RESTful APIs for real-time currency conversion."
  }
];

export default function Experience() {
  return (
    <section style={{ padding: '60px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '1.5rem', 
        marginBottom: '40px', 
        color: 'var(--text-main)',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '10px'
      }}>
        Engineering Showcases
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {experiences.map((exp, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: '10px' }}>
              <h3 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-main)' }}>
                <HighlightText color="var(--highlight-blue)">{exp.role}</HighlightText>
              </h3>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                {exp.date}
              </span>
            </div>

            <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>
              {exp.company}
            </div>

            <p style={{ margin: '10px 0', lineHeight: 1.6, color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              {exp.description}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
              {exp.tech.map(tech => (
                <span 
                  key={tech} 
                  style={{ 
                    padding: '4px 10px', 
                    fontSize: '0.8rem', 
                    backgroundColor: 'var(--pill-bg)', 
                    color: 'var(--pill-text)', 
                    borderRadius: '50px',
                    border: '1px solid var(--pill-border)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
            
          </div>
        ))}
      </div>
    </section>
  );
}