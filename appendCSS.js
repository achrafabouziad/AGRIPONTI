const fs = require('fs');
const path = './client/src/index.css';

const newCss = `
/* ── Premium Price Cards ────────────────────────────────────── */
.premium-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.premium-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.premium-icon-box {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--emerald-50), var(--emerald-100));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.8rem;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.5);
}

[data-theme='dark'] .premium-icon-box {
  background: linear-gradient(135deg, var(--slate-200), var(--slate-100));
  box-shadow: inset 0 0 0 1px rgba(255,255,255,0.05);
}

.premium-title-box {
  flex: 1;
}

.premium-name {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--slate-900);
  margin-bottom: 2px;
  letter-spacing: -0.01em;
}

.premium-unit {
  font-size: 0.8rem;
  color: var(--slate-500);
  font-weight: 500;
}

.trend-pill {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-100);
  color: var(--slate-600);
}

.trend-pill.up { background: var(--red-50); color: var(--red-500); }
.trend-pill.down { background: var(--emerald-50); color: var(--emerald-500); }

.premium-main-price {
  background: var(--slate-50);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--slate-100);
}

[data-theme='dark'] .premium-main-price {
  background: var(--slate-100);
  border-color: var(--slate-200);
}

.main-price-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: var(--slate-500);
}

.main-price-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.main-price-value {
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
}

.main-price-value .currency {
  font-size: 1rem;
  font-weight: 700;
  color: var(--slate-400);
  margin-left: 4px;
}

.text-emerald { color: var(--emerald-600); }
.text-red { color: var(--red-500); }
[data-theme='dark'] .text-emerald { color: var(--emerald-400); }
[data-theme='dark'] .text-red { color: var(--red-400); }

.price-status-badge {
  font-size: 0.7rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  text-transform: uppercase;
}

.price-status-badge.good { background: var(--emerald-100); color: var(--emerald-700); }
.price-status-badge.bad { background: var(--red-100); color: var(--red-700); }
.price-status-badge.neutral { background: var(--slate-200); color: var(--slate-700); }

[data-theme='dark'] .price-status-badge.good { background: rgba(16,185,129,0.2); color: var(--emerald-400); }
[data-theme='dark'] .price-status-badge.bad { background: rgba(239,68,68,0.2); color: var(--red-400); }
[data-theme='dark'] .price-status-badge.neutral { background: rgba(148,163,184,0.2); color: var(--slate-300); }

.premium-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
}

.stat-box {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--slate-400);
}

.stat-value {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--slate-800);
}

.stat-value small {
  font-size: 0.65rem;
  color: var(--slate-400);
  font-weight: 600;
}

.stat-divider {
  width: 1px;
  height: 24px;
  background: var(--slate-200);
}

.premium-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--red-50);
  border-radius: 12px;
  color: var(--red-600);
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid var(--red-200);
}

[data-theme='dark'] .premium-alert {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.2);
  color: var(--red-400);
}

.premium-alert-icon {
  animation: pulse-soft 2s infinite;
}
`;

fs.appendFileSync(path, newCss);
console.log('Premium CSS appended successfully');
