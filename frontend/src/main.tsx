import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { SoundProvider } from './context/SoundContext.tsx'
import { ThemeProvider } from './context/ThemeContext.tsx'

createRoot(document.getElementById('root')!).render(
    <SoundProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </SoundProvider>
)
