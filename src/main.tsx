import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { captureCreemReferral } from './lib/creem-referral.mjs'
import { takeAccountAppLaunch } from './lib/account-app-entry'
import { isLiveAccountHost, sharedAccountEnabled, sharedAccountLiveAccountEnabled } from './lib/shared-account-preview'
import './index.css'

const accountAppLaunch = sharedAccountEnabled && (!sharedAccountLiveAccountEnabled || isLiveAccountHost())
  ? takeAccountAppLaunch(window.location, window.history, () => window.sessionStorage)
  : undefined;
captureCreemReferral();
const root = document.getElementById('root')!;
const app = <BrowserRouter><App accountAppLaunch={accountAppLaunch} /></BrowserRouter>;
if (root.dataset.prerendered === 'true') hydrateRoot(root, app);
else createRoot(root).render(app);
