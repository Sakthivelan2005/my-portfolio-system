import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { useSound } from '../hooks/useSound';
import TooltipWrapper from './TooltipWrapper';

interface CommandHistory {
  id: number;
  text: string;
  isCommand: boolean;
  align: 'center' | 'left';
  color?: string; 
}

export default function TerminalFooter() {
  const { playSound } = useSound();
  
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<CommandHistory[]>([
    { id: 1, text: 'Portfolio Terminal v1.0.0', isCommand: false, align: 'center' },
    { id: 2, text: 'Type "help" to see available commands.', isCommand: false, align: 'center' }
  ]);
  
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const [isMaximized, setIsMaximized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 450, height: 350 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef({ startX: 0, startY: 0, initX: 0, initY: 0 });
  const resizeRef = useRef({ startX: 0, startY: 0, initW: 0, initH: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    setIsMobile(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = Math.ceil(window.innerHeight + window.scrollY);
      const documentHeight = document.documentElement.scrollHeight;
      setIsAtBottom(documentHeight - scrollPosition <= 30);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen && !isMaximized && typeof window !== 'undefined') {
      if (window.innerWidth <= 768) {
        const initW = window.innerWidth - 32; 
        const initH = Math.min(window.innerHeight * 0.4, 350); 
        setSize({ width: initW, height: initH });
        setPosition({ x: 16, y: 16 });
      } else {
        const initW = Math.min(window.innerWidth * 0.9, 450);
        const initH = 350;
        setSize({ width: initW, height: initH });
        setPosition({
          x: Math.max(20, window.innerWidth - initW - 24),
          y: Math.max(20, window.innerHeight - initH - 90)
        });
      }
    }
  }, [isOpen, isMaximized]);

  // THE FIX: The Ultimate Shutdown Protocol
  // Forces the browser to drop focus immediately, then hides the terminal
  const closeTerminal = () => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    // A micro-delay ensures the mobile OS registers the blur and drops the keyboard
    // before the terminal disappears from the screen.
    setTimeout(() => {
      setIsOpen(false);
    }, 10);
  };

  useEffect(() => {
    if (!isMobile || !isOpen) return;

    const handleViewportChange = () => {
      if (window.visualViewport && document.activeElement === inputRef.current) {
        setPosition(prev => ({ ...prev, y: 16 }));
        setTimeout(() => {
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
          }
        }, 150); 
      }
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    return () => window.visualViewport?.removeEventListener('resize', handleViewportChange);
  }, [isMobile, isOpen]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging && !isMaximized) {
        e.preventDefault();
        setPosition({
          x: dragRef.current.initX + (e.clientX - dragRef.current.startX),
          y: Math.max(0, dragRef.current.initY + (e.clientY - dragRef.current.startY)) 
        });
      }
      if (isResizing && !isMaximized) {
        e.preventDefault();
        setSize({
          width: Math.max(280, resizeRef.current.initW + (e.clientX - resizeRef.current.startX)),
          height: Math.max(200, resizeRef.current.initH + (e.clientY - resizeRef.current.startY))
        });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      document.body.style.userSelect = ''; 
      document.body.style.touchAction = ''; 
    };

    if (isDragging || isResizing) {
      document.body.style.userSelect = 'none'; 
      document.body.style.touchAction = 'none'; 
      window.addEventListener('pointermove', handlePointerMove, { passive: false });
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      document.body.style.userSelect = ''; 
      document.body.style.touchAction = ''; 
    };
  }, [isDragging, isResizing, isMaximized]);

  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  const shouldHideButton = isMobile && isAtBottom && !isOpen;

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    let response = '';
    let responseColor = 'var(--pill-text)'; 

    if (trimmedCmd === '') return;

    if (trimmedCmd === 'clear') {
      setHistory([{ id: Date.now(), text: 'Terminal cleared.', isCommand: false, align: 'center' }]);
      return;
    }

    switch (trimmedCmd) {
      case 'help':
        response = 'Available commands: about, stack, principles, fetch-resume, clear';
        break;
      case 'about':
        response = 'Sakthivelan S. - Software Dev Engineer. Building practical, user-focused products.';
        break;
      case 'stack':
        response = 'Core Stack: MERN (MongoDB, Express.js, React.js, Node.js), React Native, Oracle SQL.';
        break;
      case 'principles':
        response = "Strictly adhering to DRY (Don't Repeat Yourself) and KISS (Keep It Simple, Stupid).";
        break;
      case 'fetch-resume':
        response = 'Downloading resume...';
        const link = document.createElement('a');
        link.href = '/resume.pdf'; 
        link.download = 'Sakthivelan_S_Resume.pdf';
        link.click();
        break;
      default:
        playSound('error');
        response = `⚠️ Command not found: ${trimmedCmd}. Type "help" for a list of commands.`;
        responseColor = 'var(--red, #ef4444)'; 
    }

    setHistory(prev => [
      ...prev,
      { id: Date.now(), text: `sakthi@portfolio:~$ ${cmd}`, isCommand: true, align: 'left', color: 'var(--text-main)' },
      { id: Date.now() + 1, text: response, isCommand: false, align: 'left', color: responseColor }
    ]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    }
  };

  return (
    <>
      <button 
        id="terminal-trigger"
        onClick={() => {
            playSound('click');
            if (!isOpen) {
              setIsOpen(true);
              // Delay allows terminal animation to start before focus pulls keyboard up
              setTimeout(() => inputRef.current?.focus(), 100);
            } else {
              closeTerminal();
            }
        }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          // THE FIX: Raised above the overlay (9996) so this button is genuinely clickable
          zIndex: 9998, 
          backgroundColor: 'var(--pill-bg)',
          color: 'var(--pill-text)',
          border: '1px solid var(--pill-border)',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(20px)',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          transition: 'transform 0.3s ease, opacity 0.3s ease, background-color 0.2s ease',
          opacity: shouldHideButton ? 0 : 1,
          pointerEvents: shouldHideButton ? 'none' : 'auto',
          transform: isOpen ? 'scale(0.9)' : (shouldHideButton ? 'translateY(20px) scale(0.8)' : 'scale(1)')
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--card-bg-hover)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--pill-bg)'}
      >
        {isOpen ? (
            <TooltipWrapper text='Close Terminal'>
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>×</span>
            </TooltipWrapper>
        ) : (
            <TooltipWrapper text='Open Terminal'>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 17 10 11 4 5"></polyline>
                <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            </TooltipWrapper>
        )}
      </button>

      {/* The Background Catcher Overlay */}
      {isOpen && (
        <div 
          onTouchStart={() => {
            playSound('click');
            closeTerminal();
          }}
          onMouseDown={() => {
            playSound('click');
            closeTerminal();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9996, 
            backgroundColor: 'transparent', 
            pointerEvents: 'auto',
            touchAction: 'none' 
          }}
        />
      )}

      <div 
        id="terminal-window"
        style={{
          position: 'fixed',
          top: isMaximized ? 0 : position.y,
          left: isMaximized ? 0 : position.x,
          width: isMaximized ? '100vw' : size.width,
          height: isMaximized ? '100dvh' : size.height, 
          zIndex: 9997, 
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          border: isMaximized ? 'none' : '1px solid var(--pill-border)',
          borderRadius: isMaximized ? '0' : '12px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? 'translateY(0) scale(1)' : (isMobile ? 'translateY(-20px) scale(0.95)' : 'translateY(20px) scale(0.95)'),
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: (isDragging || isResizing) ? 'none' : 'opacity 0.2s ease, transform 0.2s ease',
          willChange: 'top, left, width, height, transform'
        }}
      >
        <div 
          onPointerDown={(e) => {
            if (isMaximized) return;
            dragRef.current = { startX: e.clientX, startY: e.clientY, initX: position.x, initY: position.y };
            setIsDragging(true);
            inputRef.current?.blur(); 
          }}
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: isMaximized ? '0' : '12px 12px 0 0',
            cursor: isMaximized ? 'default' : 'grab',
            userSelect: 'none',
            touchAction: 'none'
          }}
        >
          <TooltipWrapper text="Close">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                closeTerminal();
              }}
              style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', cursor: 'pointer', zIndex: 2 }}
            />
          </TooltipWrapper>
          <TooltipWrapper text="Minimize">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                closeTerminal();
              }}
              style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308', cursor: 'pointer', zIndex: 2 }}
            />
          </TooltipWrapper>
          <TooltipWrapper text={isMaximized ? "Restore" : "Maximize"}>
            <div 
              onClick={(e) => {
                e.stopPropagation();
                playSound('click');
                setIsMaximized(!isMaximized);
              }}
              style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e', cursor: 'pointer', zIndex: 2 }}
            />
          </TooltipWrapper>
          
          <span style={{ 
            position: 'absolute', 
            left: 0, 
            right: 0, 
            textAlign: 'center', 
            fontSize: '0.8rem', 
            color: 'var(--text-muted)', 
            fontFamily: 'var(--mono)',
            pointerEvents: 'none'
          }}>
            bash - root
          </span>
        </div>

        <div 
          ref={scrollContainerRef}
          className="terminal-body"
          onClick={() => {
            inputRef.current?.focus();
            if (isMobile) {
              setPosition(prev => ({ ...prev, y: 16 })); 
            }
            setTimeout(() => {
              if (scrollContainerRef.current) {
                scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
              }
            }, 300);
          }}
          style={{
            padding: '16px',
            fontFamily: 'var(--mono)',
            fontSize: '0.9rem',
            color: 'var(--text-muted)',
            cursor: 'text',
            flex: 1,
            overflowY: 'auto',
            position: 'relative',
            WebkitOverflowScrolling: 'touch' 
          }}
        >
          {(isDragging || isResizing) && (
            <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: isDragging ? 'grabbing' : 'nwse-resize' }} />
          )}

          {history.map((line) => (
            <div 
              key={line.id} 
              style={{ 
                marginBottom: '8px',
                color: line.color || 'var(--pill-text)',
                textAlign: line.align 
              }}
            >
              {line.text}
            </div>
          ))}

          <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ color: '#22c55e', marginRight: '8px', whiteSpace: 'nowrap' }}>
              sakthi@portfolio:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (isMobile) {
                  setPosition(prev => ({ ...prev, y: 16 }));
                }
              }}
              spellCheck={false}
              name='Terminal'
              autoComplete="off"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontFamily: 'inherit',
                fontSize: 'inherit',
                outline: 'none',
                flex: '1 1 100px', 
                padding: 0,
                margin: 0
              }}
            />
          </div>
        </div>

        {!isMaximized && (
          <div 
            onPointerDown={(e) => {
              e.stopPropagation();
              resizeRef.current = { startX: e.clientX, startY: e.clientY, initW: size.width, initH: size.height };
              setIsResizing(true);
            }}
            style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '24px',
              height: '24px',
              cursor: 'nwse-resize',
              zIndex: 1000,
              touchAction: 'none'
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', bottom: '6px', right: '6px' }}>
              <polyline points="21 15 21 21 15 21"></polyline>
              <line x1="21" y1="21" x2="15" y2="15"></line>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="3" y1="21" x2="9" y2="15"></line>
            </svg>
          </div>
        )}
      </div>
    </>
  );
}