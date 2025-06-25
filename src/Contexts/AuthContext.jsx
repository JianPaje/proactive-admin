// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types'; // 1. Import PropTypes
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Wrap the 'value' object in a useMemo hook.
  // This tells React to only recreate this object when 'session' or 'user' changes.
  const value = useMemo(() => ({
    session,
    user,
    supabase,
    login: (email, password) => supabase.auth.signInWithPassword({ email, password }),
    logout: () => supabase.auth.signOut(),
  }), [session, user]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Add the PropTypes validation block at the bottom
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};