import React, { useState, useEffect } from 'react';

const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 1c1 2 2 4.5 2 8 0 5.5-4.5 10-10 10Z"/>
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
  </svg>
);

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
  </svg>
);

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme, user, onLoginClick, onLogout }) {
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
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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

          <button 
            onClick={toggleTheme} 
            className="theme-toggle"
            aria-label="Toggle Dark Mode"
            style={{
              background: 'transparent',
              border: '1px solid var(--slate-200)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--slate-600)',
              transition: 'all var(--transition-fast)'
            }}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '1px solid var(--slate-200)', paddingLeft: '16px' }}>
            {user ? (
              <>
                {user.photoURL && (
                  <img 
                    src={user.photoURL} 
                    alt="Profil" 
                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--slate-200)' }} 
                  />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--slate-600)' }}>
                  {user.displayName || user.email || user.phoneNumber || 'Utilisateur'}
                </span>
                <button 
                  onClick={onLogout}
                  style={{ background: 'transparent', border: '1px solid var(--red-200)', color: 'var(--red-500)', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                >
                  Quitter
                </button>
              </>
            ) : (
              <button 
                onClick={onLoginClick}
                style={{ background: 'var(--emerald-600)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
              >
                Se Connecter
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
