// components/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

export const AuthContext = createContext({
  user:    null,
  loading: true,
  signIn:  async () => false,
  signUp:  async () => false,
  signOut: async () => {}
});

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const signIn = async ({ email, password }) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (e) {
      console.warn('Login failed:', e.code);
      return false;
    }
  };

  const signUp = async ({ email, password }) => {
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      return true;
    } catch (e) {
      console.warn('SignUp failed:', e.code);
      return false;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
