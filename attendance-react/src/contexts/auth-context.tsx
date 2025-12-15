import { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

type AuthContextType = {
  user: {
    id: number;
    username: string;
    fullName: string;
    role: 'User' | 'Admin';
    department: { id: number; name: string; isField: boolean };
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<{
    id: number;
    username: string;
    fullName: string;
    role: 'User' | 'Admin';
    department: { id: number; name: string; isField: boolean };
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (username: string, password: string) => {
    const response = await fetch(
      `${import.meta.env.VITE_NODE_URL}/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      },
    );

    if (!response.ok) {
      const errorBody = await response.json();
      toast.error(errorBody.message);
      return;
    }

    const { user, message } = await response.json();
    setUser(user);
    toast.success(message);
  };

  const logout = async () => {
    const response = await fetch(
      `${import.meta.env.VITE_NODE_URL}/auth/logout`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    setUser(null);
    const { message } = await response.json();
    toast.success(message);
  };

  const refresh = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_NODE_URL}/auth/refresh`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (response.ok) {
        const { user } = await response.json();
        setUser(user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
};
