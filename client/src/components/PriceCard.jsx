import React from 'react';

const TrendUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const TrendDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
    <polyline points="16 17 22 17 22 11"/>
  </svg>
);

const MinusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const getProductEmoji = (name) => {
  const n = name.toLowerCase();
  if (n.includes('tomate')) return '🍅';
  if (n.includes('oignon')) return '🧅';
  if (n.includes('pomme de terre')) return '🥔';
  if (n.includes('carotte')) return '🥕';
  if (n.includes('courgette') || n.includes('concombre')) return '🥒';
  if (n.includes('poivron')) return '🫑';
  if (n.includes('aubergine')) return '🍆';
  return '🥬';
};

export default function PriceCard({ item }) {
  const getTrendIcon = () => {
    switch (item.trend) {
      case 'up': return <TrendUpIcon />;
      case 'down': return <TrendDownIcon />;
      default: return <MinusIcon />;
    }
  };

  const isHigh = item.currentMarketAvg > item.recommendedRetail.max;
  const diff = ((item.currentMarketAvg - item.wholesalePrice) / item.wholesalePrice * 100).toFixed(0);

  return (
    <div className={`price-card premium-card ${item.alert ? 'has-alert' : ''}`}>
      <div className="premium-card-header">
        <div className="premium-icon-box">
          <span className="premium-emoji">{getProductEmoji(item.name)}</span>
        </div>
        <div className="premium-title-box">
          <h3 className="premium-name">{item.name}</h3>
          <span className="premium-unit">par {item.unit}</span>
        </div>
        <div className="premium-trend">
          <span className={`trend-pill ${item.trend}`}>
            {getTrendIcon()}
          </span>
        </div>
      </div>

      <div className="premium-main-price">
        <div className="main-price-label">Moyenne au Marché</div>
        <div className="main-price-row">
          <div className={`main-price-value ${isHigh ? 'text-red' : 'text-emerald'}`}>
            {item.currentMarketAvg} <span className="currency">DH</span>
          </div>
          {item.trend === 'up' && <span className="price-status-badge bad">En hausse</span>}
          {item.trend === 'down' && <span className="price-status-badge good">En baisse</span>}
          {item.trend === 'stable' && <span className="price-status-badge neutral">Stable</span>}
        </div>
      </div>

      <div className="premium-stats">
        <div className="stat-box">
          <span className="stat-label">Prix de Gros</span>
          <span className="stat-value">{item.wholesalePrice} <small>DH</small></span>
        </div>
        <div className="stat-divider" />
        <div className="stat-box">
          <span className="stat-label">Détail Conseillé</span>
          <span className="stat-value">{item.recommendedRetail.min}-{item.recommendedRetail.max} <small>DH</small></span>
        </div>
        <div className="stat-divider" />
        <div className="stat-box">
          <span className="stat-label">Marge Actuelle</span>
          <span className={`stat-value ${isHigh ? 'text-red' : 'text-emerald'}`}>+{diff}%</span>
        </div>
      </div>

      {item.alert && (
        <div className="premium-alert">
          <div className="premium-alert-icon"><AlertIcon /></div>
          <div className="premium-alert-text">Prix abusif ! Dépasse le seuil recommandé.</div>
        </div>
      )}
    </div>
  );
}
