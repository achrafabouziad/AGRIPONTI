import React, { useState } from 'react';
import { auth } from '../firebase';

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://agriponti.onrender.com' : 'http://localhost:3001');

export default function CreateListingModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    product: '',
    variety: '',
    region: '',
    quantity: '',
    unit: 'Tonnes',
    pricePerKg: '',
    transportIncluded: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async () => {
    if (!imageFile) return null;
    const uploadData = new FormData();
    uploadData.append('image', imageFile);
    
    const res = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7'
      },
      body: uploadData
    });
    
    if (!res.ok) throw new Error("Échec de l'upload de l'image");
    
    const data = await res.json();
    return data.data.link;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }

      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Vous devez être connecté");

      const res = await fetch(`${API_URL}/api/b2b`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          ...formData,
          pricePerKg: parseFloat(formData.pricePerKg),
          quantity: parseFloat(formData.quantity),
          imageUrl
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Erreur lors de la création de l'annonce");
      }

      setFormData({
        product: '', variety: '', region: '', quantity: '', unit: 'Tonnes', pricePerKg: '', transportIncluded: false
      });
      setImageFile(null);
      setImagePreview('');
      
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erreur lors de la publication');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal animate-scale-in" onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 className="modal-title" style={{ margin: 0, fontSize: '1.5rem', color: 'var(--slate-800)' }}>Publier une annonce</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--slate-500)' }}>
            <CloseIcon />
          </button>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Image Upload Area */}
          <div style={{ width: '100%', height: '200px', backgroundColor: 'var(--slate-100)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed var(--slate-300)', position: 'relative', overflow: 'hidden' }}>
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--slate-400)' }}>
                <CameraIcon />
                <span style={{ marginTop: '8px', fontSize: '0.9rem', fontWeight: '500' }}>Ajouter des photos</span>
              </div>
            )}
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              onChange={handleImageChange}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Produit *</label>
              <input type="text" className="form-input" placeholder="Ex: Tomates" value={formData.product} onChange={e => setFormData({...formData, product: e.target.value})} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Variété</label>
              <input type="text" className="form-input" placeholder="Ex: Roma (Optionnel)" value={formData.variety} onChange={e => setFormData({...formData, variety: e.target.value})} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Région *</label>
            <input type="text" className="form-input" placeholder="Ex: Agadir, Souss..." value={formData.region} onChange={e => setFormData({...formData, region: e.target.value})} required />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Quantité *</label>
              <input type="number" step="0.1" className="form-input" placeholder="Ex: 15" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} required />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Unité</label>
              <select className="form-input" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})}>
                <option value="Tonnes">Tonnes</option>
                <option value="Kg">Kg</option>
                <option value="Caisses">Caisses</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Prix (DH / kg) *</label>
            <input type="number" step="0.1" className="form-input" placeholder="Ex: 1.8" value={formData.pricePerKg} onChange={e => setFormData({...formData, pricePerKg: e.target.value})} required />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', color: 'var(--slate-700)', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={formData.transportIncluded} onChange={e => setFormData({...formData, transportIncluded: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--emerald-600)' }} />
            Le prix inclut le transport (Livraison)
          </label>

          <button 
            type="submit" 
            disabled={submitting} 
            style={{ 
              marginTop: '10px', width: '100%', padding: '14px', background: 'var(--emerald-600)', color: 'white', 
              border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Publication en cours...' : 'Publier l\'annonce'}
          </button>
        </form>
      </div>
    </div>
  );
}
