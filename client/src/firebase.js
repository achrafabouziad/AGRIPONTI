import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXY1R_phRgCUsYMW8AJDh8DbTf485N3gk",
  authDomain: "agriponti-auth.firebaseapp.com",
  projectId: "agriponti-auth",
  storageBucket: "agriponti-auth.firebasestorage.app",
  messagingSenderId: "479608377458",
  appId: "1:479608377458:web:c064d35ebde1f957c872eb",
  measurementId: "G-279TB06JNW"
};

let app, auth, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.warn("Firebase is not properly configured yet. Please update client/src/firebase.js");
}

export { auth, googleProvider, RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber };
