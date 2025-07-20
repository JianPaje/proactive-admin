import { useContext } from 'react';
// This now correctly points to the separate context file.
import { AuthContext } from '../Contexts/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
