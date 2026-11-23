import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { captureCreemReferral } from './lib/creem-referral.mjs'
import './index.css'

captureCreemReferral();
const root = document.getElementById('root')!;
const app = <BrowserRouter><App /></BrowserRouter>;
if (root.dataset.prerendered === 'true') hydrateRoot(root, app);
else createRoot(root).render(app);
