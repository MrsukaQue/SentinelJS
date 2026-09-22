import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode><BrowserRouter><Dashboard /></BrowserRouter></StrictMode>,
);
