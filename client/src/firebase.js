import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBVOvbEhhBPxjHq4nycS8O4VT6xWELgWYo",
  authDomain: "agriponti-app.firebaseapp.com",
  projectId: "agriponti-app",
  storageBucket: "agriponti-app.firebasestorage.app",
  messagingSenderId: "1012109344066",
  appId: "1:1012109344066:web:4a169f55e7d517f5da1cdb",
  measurementId: "G-5B55QNJB69"
};

let app, auth, googleProvider, storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  storage = getStorage(app);
} catch (e) {
  console.warn("Firebase is not properly configured yet.");
}

export { auth, googleProvider, storage, ref, uploadBytes, getDownloadURL, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged };
