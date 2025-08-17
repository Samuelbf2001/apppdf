import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useQuery } from 'react-query';
import { authService } from '../services/authService';

/**
 * Contexto de autenticación
 * Maneja estado global de autenticación y usuario
 */

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  tenant: {
    id: string;
    name: string;
    hubspotPortalId: string;
    isActive: boolean;
  };
  preferences?: Record<string, any>;
  lastLoginAt?: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_TOKEN'; payload: string | null }
  | { type: 'LOGOUT' };

interface AuthContextType extends AuthState {
  login: (token: string) => void;
  logout: () => void;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Reducer para manejar estado de autenticación
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      };
    
    case 'SET_TOKEN':
      return { ...state, token: action.payload };
    
    case 'LOGOUT':
      return {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        token: null,
      };
    
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: localStorage.getItem('auth_token'),
  });

  // Query para obtener información del usuario
  const { refetch: refetchUser } = useQuery(
    'current-user',
    authService.getCurrentUser,
    {
      enabled: !!state.token,
      onSuccess: (data) => {
        dispatch({ type: 'SET_USER', payload: data });
      },
      onError: () => {
        // Token inválido o expirado
        logout();
      },
      retry: false,
    }
  );

  // Verificar token al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      dispatch({ type: 'SET_TOKEN', payload: token });
      // La query se ejecutará automáticamente cuando se establezca el token
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Verificar token desde URL (para OAuth callback)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    
    if (tokenFromUrl) {
      login(tokenFromUrl);
      // Limpiar URL sin recargar página
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('auth_token', token);
    dispatch({ type: 'SET_TOKEN', payload: token });
    refetchUser();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    dispatch({ type: 'LOGOUT' });
    
    // Llamar logout del servidor si está disponible
    if (state.token) {
      authService.logout().catch(() => {
        // Ignorar errores de logout del servidor
      });
    }
  };

  const refreshUser = () => {
    if (state.token) {
      refetchUser();
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
