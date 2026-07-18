import React from 'react';

const BarChartIcon = () => (
  <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>
  </svg>
);

const StoreIcon = () => (
  <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <path d="M2 7h20"/>
  </svg>
);

const TruckIcon = () => (
  <svg className="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
    <path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
    <circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>
  </svg>
);

export default function HeroSection({ activeTab, priceCount, shopCount, b2bCount }) {
  if (activeTab === 'b2c') {
    return (
      <div className="hero animate-fade-in">
        <h1 className="hero-title">
          Indice des prix <span className="highlight">du jour</span>
        </h1>
        <p className="hero-subtitle">
          Comparez les prix de gros et de détail pour acheter au meilleur prix à Bernoussi
        </p>
        <div className="stats-bar">
          <div className="stat-chip emerald">
            <BarChartIcon />
            <span>{priceCount} produits suivis</span>
          </div>
          <div className="stat-chip blue">
            <StoreIcon />
            <span>{shopCount} commerçants vérifiés</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hero hero-b2b animate-fade-in">
      <h1 className="hero-title">
        Marché <span className="highlight">B2B</span>
      </h1>
      <p className="hero-subtitle">
        Achetez directement auprès des producteurs et coopératives agricoles
      </p>
      <div className="stats-bar">
        <div className="stat-chip blue">
          <TruckIcon />
          <span>{b2bCount} offres disponibles</span>
        </div>
      </div>
    </div>
  );
}
