import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Lazy-load all components
const Hero = lazy(() => import('./components/Hero'));
const Countdown = lazy(() => import('./components/Countdown'));
const Timeline = lazy(() => import('./components/Timeline'));
const InteractiveMap = lazy(() => import('./components/InteractiveMap'));
const MemoryWall = lazy(() => import('./components/MemoryWall'));
const RSVP = lazy(() => import('./components/RSVP'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

function MainSite() {
  return (
    <div style={{ opacity: 0, animation: 'fadeIn 1.5s ease forwards' }}>
      <Hero />
      <Countdown />
      <Timeline />
      <InteractiveMap />
      <MemoryWall />
      <RSVP />
      <footer className="footer">
        <div className="footerInitials">M & B</div>
        <div className="footerThanks">Avec toute notre gratitude, Mamadou & Binetou</div>
        <div className="footerDate">Dakar · Juillet 2026</div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--color-cream)',
          color: 'var(--color-gold-dark)',
          fontFamily: 'var(--font-display)',
          fontSize: '14px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
        }}>
          Chargement…
        </div>
      }>
        <Routes>
          <Route path="/" element={<MainSite />} />
          <Route path="/admin" element={
            <Suspense fallback={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--color-charcoal)',
                color: 'var(--color-gold-dark)',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                letterSpacing: '4px',
                textTransform: 'uppercase',
              }}>
                Chargement…
              </div>
            }>
              <AdminPanel />
            </Suspense>
          } />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
