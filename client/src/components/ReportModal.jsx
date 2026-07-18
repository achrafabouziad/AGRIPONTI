import React, { useState } from 'react';

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function ReportModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    shopName: '',
    product: '',
    reportedPrice: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shopName: formData.shopName,
          product: formData.product,
          reportedPrice: formData.reportedPrice ? parseFloat(formData.reportedPrice) : null,
          description: formData.description,
        }),
      });

      if (res.ok) {
        setFormData({ shopName: '', product: '', reportedPrice: '', description: '' });
        onSuccess && onSuccess();
        onClose();
      }
    } catch (err) {
      console.error('Report submission failed:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <div className="modal-title">🚨 Signaler un prix abusif</div>
            <div className="modal-subtitle">Aidez-nous à protéger les consommateurs</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: 'var(--slate-400)' }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom du commerce</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Hanout Mohamed"
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Produit</label>
            <input
              type="text"
              className="form-input"
              placeholder="Ex: Tomates, Oignons..."
              value={formData.product}
              onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Prix affiché (DH/kg)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              placeholder="Ex: 8.5"
              value={formData.reportedPrice}
              onChange={(e) => setFormData({ ...formData, reportedPrice: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (optionnel)</label>
            <textarea
              className="form-textarea"
              placeholder="Détails supplémentaires..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Envoi...' : 'Envoyer le signalement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
