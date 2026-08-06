import { useState, useEffect } from 'react';
// --- NEW: Import socket.io client ---
import { io } from 'socket.io-client';
import ElectricBorder from './ElectricBorder';
import styles from './GithubGraph.module.css';

interface ClientData {
  count: number;
  clients: { name: string; maskedEmail: string; msgCount: number }[];
}

export default function ClientStats() {
  const [data, setData] = useState<ClientData>({ count: 0, clients: [] });
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false); 
  const [visibleCount, setVisibleCount] = useState(10); 
 const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.matchMedia('(max-width: 768px)').matches : false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');

    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Normal fetch for initial load
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await fetch('https://my-portfolio-system.onrender.com/api/clients');
        const result = await response.json();
        
        if (response.ok) {
          setData(result);
          setHasError(false);
        } else {
          throw new Error(result.error);
        }
      } catch (error) {
        console.error('[ERROR] Failed to fetch client stats:', error);
        setHasError(true); 
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // --- NEW: Real-Time WebSocket Connection ---
  useEffect(() => {
    // Connect to your production backend
    const socket = io('https://my-portfolio-system.onrender.com');

    // Listen for the broadcast event from server.js
    socket.on('live_client_update', (updatedData: ClientData) => {
      console.log('[SYSTEM] Live client update received!');
      // Instantly updates the UI without refreshing the page
      setData(updatedData);
    });

    // Cleanup the connection if the user leaves the component
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  if (loading) {
    return (
      <div className={styles.skeleton}></div>
    );
  }

  const cellPadding = isMobile ? '10px 4px' : '12px';
  const headerFontSize = isMobile ? '0.8rem' : '0.9rem';
  const textFontSize = isMobile ? '0.8rem' : '0.9rem';

  return (
    <ElectricBorder
      color={hasError ? "#ef4444" : "#4debf9"} 
      speed={1.5}
      chaos={0.10}
      borderRadius={12}
      style={{ margin: '2rem auto', maxWidth: '600px', width: 'calc(100% - 32px)' }}
    >
      <div style={{
        backgroundColor: 'var(--bg-color)',
        borderRadius: '12px',
        padding: isMobile ? '20px 8px' : '24px',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        boxSizing: 'border-box',
        width: '100%'
      }}>
        
        {hasError ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '1rem' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '10px' }}>
              Server is resting
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5', margin: 0 }}>
              The live stats server is currently offline. <br/> Please check back later to see the latest clients!
            </p>
          </div>
        ) : (
          <>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem', 
              color: 'var(--orange)',
              textAlign: 'center',
              transition: 'color 0.3s ease'
            }}>
              {data.count} {data.count === 1 ? 'Client' : 'Clients'} talked with me!
            </h3>

            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              overflowX: 'auto',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              backgroundColor: 'var(--card-bg)'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ 
                  backgroundColor: 'var(--border-color)', 
                  position: 'sticky', 
                  top: 0, 
                  zIndex: 1 
                }}>
                  <tr>
                    <th style={{ padding: cellPadding, color: 'var(--text-main)', fontWeight: '600', fontSize: headerFontSize }}>S.NO</th>
                    <th style={{ padding: cellPadding, color: 'var(--text-main)', fontWeight: '600', fontSize: headerFontSize }}>Name</th>
                    <th style={{ padding: cellPadding, color: 'var(--text-main)', fontWeight: '600', fontSize: headerFontSize }}>Email</th>
                    <th style={{ padding: cellPadding, color: 'var(--text-main)', fontWeight: '600', fontSize: headerFontSize, textAlign: 'center' }}>Msgs</th>
                  </tr>
                </thead>
                <tbody>
                  {data.clients.slice(0, visibleCount).map((client, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: cellPadding, color: 'var(--text-muted)', fontSize: textFontSize }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: cellPadding, color: 'var(--text-main)', fontSize: textFontSize, fontWeight: '500' }}>
                        {client.name}
                      </td>
                      <td style={{ 
                        padding: cellPadding, 
                        color: 'var(--pill-text)', 
                        fontSize: textFontSize, 
                        fontStyle: 'italic',
                        wordBreak: 'break-all' 
                      }}>
                        {client.maskedEmail}
                      </td>
                      <td style={{ padding: cellPadding, color: 'var(--text-main)', fontSize: textFontSize, textAlign: 'center', fontWeight: 'bold' }}>
                        {client.msgCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {visibleCount < data.clients.length && (
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  onClick={handleLoadMore}
                  style={{
                    backgroundColor: 'var(--pill-bg)',
                    color: 'var(--pill-text)',
                    border: '1px solid var(--pill-border)',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--pill-bg)'}
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
        
      </div>
    </ElectricBorder>
  );
}