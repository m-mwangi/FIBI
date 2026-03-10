import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'investor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'investor' | 'admin') => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('fibi_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, role: 'investor' | 'admin'): Promise<boolean> => {
    if (role === 'admin') {
      // Demo admin credentials
      if (email === 'admin@demo.com' && password === 'admin123') {
        const adminUser = { id: 'admin-1', name: 'Admin User', email, role: 'admin' as const };
        setUser(adminUser);
        localStorage.setItem('fibi_user', JSON.stringify(adminUser));
        return true;
      }
      return false;
    }

    // Investor login using localStorage mock
    const users = JSON.parse(localStorage.getItem('fibi_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      const userData = { id: foundUser.id, name: foundUser.name, email: foundUser.email, role: 'investor' as const };
      setUser(userData);
      localStorage.setItem('fibi_user', JSON.stringify(userData));
      return true;
    }

    return false;
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    const users = JSON.parse(localStorage.getItem('fibi_users') || '[]');

    if (users.find((u: any) => u.email === email)) return false;

    const newUser = { id: Date.now().toString(), name, email, password };
    users.push(newUser);
    localStorage.setItem('fibi_users', JSON.stringify(users));

    const userData = { id: newUser.id, name: newUser.name, email: newUser.email, role: 'investor' as const };
    setUser(userData);
    localStorage.setItem('fibi_user', JSON.stringify(userData));

    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fibi_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}