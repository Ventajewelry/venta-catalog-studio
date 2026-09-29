import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { PreviewStudio } from './PreviewStudio.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {window.location.hostname.endsWith('.vercel.app') && window.location.pathname.replace(/\/$/, '') === '/admin' ? <PreviewStudio /> : <App />}
  </StrictMode>,
);
