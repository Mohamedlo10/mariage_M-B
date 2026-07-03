import React, { useState, useEffect, lazy, Suspense } from 'react';
import './App.css';

import Envelope3D from './components/Envelope3D';

// Lazy-load all components that appear AFTER the envelope opens
const Hero = lazy(() => import('./components/Hero'));
const Countdown = lazy(() => import('./components/Countdown'));
const Timeline = lazy(() => import('./components/Timeline'));
const InteractiveMap = lazy(() => import('./components/InteractiveMap'));
const MemoryWall = lazy(() => import('./components/MemoryWall'));
const RSVP = lazy(() => import('./components/RSVP'));
const AdminPanel = lazy(() => import('./components/AdminPanel'));

function App() {
  const [showEnvelope, setShowEnvelope] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check hash for admin route
    const checkRoute = () => {
      setIsAdmin(window.location.hash === '#/admin');
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);

    // Scroll to top on load
    window.scrollTo(0, 0);

    return () => window.removeEventListener('hashchange', checkRoute);
  }, []);

  // Admin route
  if (isAdmin) {
    return (
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
    );
  }

  // Main site
  return (
    <>
      {showEnvelope ? (
        <Envelope3D onComplete={() => setShowEnvelope(false)} />
      ) : (
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
        </Suspense>
      )}
    </>
  );
}

export default App;
