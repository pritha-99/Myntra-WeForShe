import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

// Initialize default theme (light mode)
const savedTheme = localStorage.getItem('bharat_theme');
if (!savedTheme) {
  localStorage.setItem('bharat_theme', 'light');
  document.body.classList.add('light-mode');
} else if (savedTheme === 'light') {
  document.body.classList.add('light-mode');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
