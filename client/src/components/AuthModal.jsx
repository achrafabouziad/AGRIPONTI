import React, { useState } from 'react';
import { auth, googleProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '../firebase';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

export default function AuthModal({ onClose, onLoginSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const sendIdTokenToServer = async (idToken) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://agriponti.onrender.com' : 'http://localhost:3001');
      const res = await fetch(`${API_URL}/api/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
        credentials: 'include'
      });
      if (res.ok) {
        onLoginSuccess();
        onClose();
      } else {
        const errorData = await res.json().catch(() => ({}));
        setError(`Échec serveur: ${errorData.details || 'Erreur inconnue'}`);
      }
    } catch (err) {
      setError('Erreur réseau.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await sendIdTokenToServer(idToken);
    } catch (err) {
      setError('Connexion Google échouée ou annulée.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Remplissez tous les champs.');
    try {
      setLoading(true);
      setError('');
      let result;
      if (isRegistering) {
        result = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        result = await signInWithEmailAndPassword(auth, email, password);
      }
      const idToken = await result.user.getIdToken();
      await sendIdTokenToServer(idToken);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Cet email est déjà utilisé.');
      else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') setError('Email ou mot de passe incorrect.');
      else setError(err.message || 'Erreur lors de l\'authentification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uno-overlay" onClick={onClose}>
      <div className="uno-modal" onClick={e => e.stopPropagation()}>
        <button className="uno-close" onClick={onClose}>✕</button>
        
        <div className="uno-columns">
          {/* Left Column (Forms) */}
          <div className="uno-left">
            <h2 className="uno-title">{isRegistering ? 'Nouveaux clients' : 'Clients enregistrés'}</h2>
            
            {error && <div className="uno-error">{error}</div>}
            
            <button type="button" onClick={handleGoogleLogin} disabled={loading} className="uno-google-btn">
              {loading ? 'Patientez...' : (
                <>
                  <div className="uno-google-icon-wrapper"><GoogleIcon /></div>
                  <span>Continuer avec Google</span>
                </>
              )}
            </button>

            <form className="uno-form" onSubmit={handleEmailAuth}>
              <label>EMAIL <span>*</span></label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              
              <label>MOT DE PASSE <span>*</span></label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />

              <div className="uno-actions">
                <button type="submit" className="uno-btn-green" disabled={loading}>
                  {isRegistering ? 'S\'INSCRIRE' : 'CONNEXION'}
                </button>
                {!isRegistering && <span className="uno-forgot">MOT DE PASSE OUBLIÉ ?</span>}
              </div>
            </form>
          </div>

          {/* Right Column (Toggle switch) */}
          <div className="uno-right">
            <h2 className="uno-title">{isRegistering ? 'Déjà client ?' : 'Nouveaux clients'}</h2>
            <p className="uno-desc">
              {isRegistering 
                ? "Si vous avez déjà un compte, connectez-vous pour retrouver vos préférences et annonces."
                : "La création d'un compte a de nombreux avantages : consultation rapide, sauvegarder vos alertes, publier des annonces et bien plus."
              }
            </p>
            <button className="uno-btn-green" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} disabled={loading}>
              {isRegistering ? 'SE CONNECTER' : 'CRÉER UN COMPTE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
