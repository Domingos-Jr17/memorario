/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, ReactNode } from 'react';
import { auth } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { AuthContext } from './useAuth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Observa o estado de autenticação e atualiza o usuário
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Login com validação de email verificado
  const login = async (email: string, password: string): Promise<void> => {
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = userCredential.user;

      if (!loggedUser.emailVerified) {
        await signOut(auth);
        throw new Error('Por favor, confirme seu email antes de fazer login.');
      }

      setUser(loggedUser);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Signup com username e envio de email de verificação
  const signup = async (email: string, password: string, username: string): Promise<void> => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: username });

      await sendEmailVerification(newUser);

      setUser(newUser);

    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Reenvio do email de verificação
  const resendVerificationEmail = async (): Promise<void> => {
    setError(null);
    try {
      const currentUser = auth.currentUser;
      if (currentUser && !currentUser.emailVerified) {
        await sendEmailVerification(currentUser);
      } else {
        throw new Error('Usuário não autenticado ou email já verificado.');
      }
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const googleSignIn = async (): Promise<void> => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);

      // Normalmente, email do Google já vem verificado, mas confirmamos
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error('Por favor, confirme seu email para continuar.');
      }

      setUser(userCredential.user);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        signup,
        logout,
        googleSignIn,
        resendVerificationEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
