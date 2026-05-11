import React from 'react';
import { createRoot } from 'react-dom/client';
import TrackerApp from '../windows/TrackerApp.jsx';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<TrackerApp />);
