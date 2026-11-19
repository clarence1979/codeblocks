// The teachingtools.dev connection must load first: it watches fetch() so AI requests made
// with a teachingtools.dev pass are sent through the school relay.
import './vendor/eduai-connect.js';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
