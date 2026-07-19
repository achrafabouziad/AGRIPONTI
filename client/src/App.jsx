import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import PriceCard from './components/PriceCard';
import ShopCard from './components/ShopCard';
import B2BTable from './components/B2BTable';
import ReportModal from './components/ReportModal';
import CreateListingModal from './components/CreateListingModal';
import AuthModal from './components/AuthModal';
import { auth, onAuthStateChanged } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://agriponti.onrender.com' : 'http://localhost:3001');

const ChartIcon = () => (
  <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const StoreIcon = () => (
  <svg className="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <path d="M2 7h20"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('b2c');
  const [prices, setPrices] = useState([]);
  const [shops, setShops] = useState([]);
  const [b2bListings, setB2bListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportOpen, setReportOpen] = useState(false);
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [b2bSearch, setB2bSearch] = useState('');
  const [toast, setToast] = useState(null);
  
  // Auth state
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  
  // Theme state
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    fetchData();
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pricesRes, shopsRes, b2bRes] = await Promise.all([
        fetch(`${API_URL}/api/prices`),
        fetch(`${API_URL}/api/shops`),
        fetch(`${API_URL}/api/b2b`),
      ]);

      if (pricesRes.ok) setPrices(await pricesRes.json());
      if (shopsRes.ok) setShops(await shopsRes.json());
      if (b2bRes.ok) setB2bListings(await b2bRes.json());
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      showToast('Déconnecté avec succès', 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleActionRequiringAuth = (actionCallback) => {
    if (user) {
      actionCallback();
    } else {
      setAuthModalOpen(true);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const renderLoadingSkeleton = (count = 4) => (
    <div className="price-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="loading-skeleton loading-card" />
      ))}
    </div>
  );

  return (
    <div>
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        user={user}
        onLoginClick={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      <div className="main-content">
        <HeroSection
          activeTab={activeTab}
          priceCount={prices.length}
          shopCount={shops.length}
          b2bCount={b2bListings.length}
        />

        {activeTab === 'b2c' ? (
          <>
            {/* ── Price Index Section ── */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">
                  <ChartIcon />
                  Indice des prix
                </h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="section-badge">
                    Mis à jour aujourd'hui
                  </span>
                  <button className="btn-report" onClick={() => handleActionRequiringAuth(() => setReportOpen(true))}>
                    <AlertIcon />
                    Signaler
                  </button>
                </div>
              </div>

              {loading ? renderLoadingSkeleton() : (
                <div className="price-grid stagger-children">
                  {prices.map(item => (
                    <PriceCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </section>

            {/* ── Trusted Shops Section ── */}
            <section className="section">
              <div className="section-header">
                <h2 className="section-title">
                  <StoreIcon />
                  Commerçants de Confiance
                </h2>
                <span className="section-badge">
                  {shops.length} vérifiés
                </span>
              </div>

              {loading ? renderLoadingSkeleton(3) : (
                <div className="shop-grid stagger-children">
                  {shops.map(shop => (
                    <ShopCard key={shop.id} shop={shop} />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* ── B2B Section ── */
          <section className="section">
            <div className="section-header">
              <h2 className="section-title" style={{ color: 'var(--blue-700)' }}>
                🏭 Offres Producteurs
              </h2>
              <span className="section-badge" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}>
                {b2bListings.length} offres actives
              </span>
            </div>

            {loading ? renderLoadingSkeleton(3) : (
              <B2BTable
                listings={b2bListings}
                searchQuery={b2bSearch}
                setSearchQuery={setB2bSearch}
                user={user}
                onPublishClick={() => handleActionRequiringAuth(() => setCreateListingOpen(true))}
              />
            )}
          </section>
        )}
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        onSuccess={() => showToast('Signalement envoyé avec succès !')}
      />

      {/* Create Listing Modal */}
      <CreateListingModal
        isOpen={createListingOpen}
        onClose={() => setCreateListingOpen(false)}
        onSuccess={() => {
          showToast('Annonce publiée avec succès !');
          fetchData();
        }}
      />

      {/* Auth Modal */}
      {authModalOpen && (
        <AuthModal 
          onClose={() => setAuthModalOpen(false)} 
          onLoginSuccess={() => {
            checkAuth();
            showToast('Connecté avec succès !');
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✅' : '❌'} {toast.message}
        </div>
      )}
    </div>
  );
}
