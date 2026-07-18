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

export default function PriceCard({ item }) {
  const getTrendIcon = () => {
    switch (item.trend) {
      case 'up': return <TrendUpIcon />;
      case 'down': return <TrendDownIcon />;
      default: return <MinusIcon />;
    }
  };

  const getTrendLabel = () => {
    switch (item.trend) {
      case 'up': return 'En hausse';
      case 'down': return 'En baisse';
      default: return 'Stable';
    }
  };

  // Calculate bar segment widths based on price ranges
  const maxPrice = item.recommendedRetail.max + 1;
  const wholesalePercent = (item.wholesalePrice / maxPrice) * 100;
  const fairPercent = ((item.recommendedRetail.max - item.wholesalePrice) / maxPrice) * 100;
  const highPercent = 100 - wholesalePercent - fairPercent;

  return (
    <div className={`price-card ${item.alert ? 'has-alert' : ''}`}>
      <div className="price-card-header">
        <div>
          <div className="price-card-name">{item.name}</div>
          <div className="price-card-unit">par {item.unit}</div>
        </div>
        <span className={`trend-badge ${item.trend}`}>
          {getTrendIcon()}
          {getTrendLabel()}
        </span>
      </div>

      <div className="price-card-prices">
        <div className="price-item wholesale">
          <div className="price-item-label">Gros</div>
          <div className="price-item-value">{item.wholesalePrice} DH</div>
        </div>
        <div className="price-item recommended">
          <div className="price-item-label">Détail Juste</div>
          <div className="price-item-value">{item.recommendedRetail.min}-{item.recommendedRetail.max}</div>
        </div>
        <div className="price-item market">
          <div className="price-item-label">Marché Actuel</div>
          <div className="price-item-value">{item.currentMarketAvg} DH</div>
        </div>
      </div>

      <div className="price-bar-container">
        <div className="price-bar">
          <div className="price-bar-segment good" style={{ width: `${wholesalePercent}%` }} />
          <div className="price-bar-segment fair" style={{ width: `${fairPercent}%` }} />
          <div className="price-bar-segment high" style={{ width: `${highPercent}%` }} />
        </div>
        <div className="price-bar-labels">
          <span className="good">{item.wholesalePrice} DH</span>
          <span className="fair">{item.recommendedRetail.min} - {item.recommendedRetail.max} DH</span>
          <span className="high">&gt; {(item.recommendedRetail.max + 0.5).toFixed(1)} DH</span>
        </div>
      </div>

      {item.alert && (
        <div className="alert-tag">
          <AlertIcon />
          Prix au-dessus du seuil recommandé
        </div>
      )}
    </div>
  );
}
