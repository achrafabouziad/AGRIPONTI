import React from 'react';

const StoreIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/>
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/>
    <path d="M2 7h20"/>
    <path d="M22 7v3a2 2 0 0 1-2 2a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12a2 2 0 0 1-2-2V7"/>
  </svg>
);

const StarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const MapPinIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

export default function ShopCard({ shop }) {
  const isExcellent = shop.respectIndex >= 90;

  return (
    <div className="shop-card">
      <div className="shop-card-icon">
        <StoreIcon />
      </div>
      <div className="shop-card-content">
        <div className="shop-card-name">{shop.name}</div>
        <div className="shop-card-meta">
          {shop.type} • {shop.zone}
        </div>
        <div className="shop-card-footer">
          <span className={`respect-badge ${isExcellent ? 'excellent' : 'good'}`}>
            <StarIcon />
            {shop.respectIndex}% prix justes
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="distance-tag">
              <MapPinIcon />
              {shop.distance}
            </span>
            <span className={`shop-status ${shop.status}`}>
              <span className="dot" />
              {shop.status === 'open' ? 'Ouvert' : 'Fermé'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
