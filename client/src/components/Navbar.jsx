import React, { useState, useEffect } from 'react';

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

export default function Navbar({ activeTab, setActiveTab }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="navbar-logo">
            <LeafIcon />
          </div>
          <div>
            <span className="navbar-title">AGRIPONTI</span>
            <span className="navbar-subtitle">Bernoussi</span>
          </div>
        </div>
        <div className="navbar-tabs">
          <button
            className={`navbar-tab ${activeTab === 'b2c' ? 'active-b2c' : ''}`}
            onClick={() => setActiveTab('b2c')}
          >
            📊 Info-Prix
          </button>
          <button
            className={`navbar-tab ${activeTab === 'b2b' ? 'active-b2b' : ''}`}
            onClick={() => setActiveTab('b2b')}
          >
            🏭 Marché B2B
          </button>
        </div>
      </div>
    </nav>
  );
}
