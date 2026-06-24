import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { AppRole } from '@/lib/roleAccess';

interface AuthUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: AppRole;
  department: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (identifier: string, password: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const STORAGE_KEY = 'erp_user';

const AuthContext = createContext<AuthContextType | null>(null);

function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as AuthUser;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const metadata = data.session.user.user_metadata ?? {};
        const authUser: AuthUser = {
          id: data.session.user.id,
          name: metadata.name ?? data.session.user.email ?? 'Supabase User',
          username: metadata.username ?? data.session.user.email ?? 'supabase-user',
          email: data.session.user.email ?? undefined,
          role: (metadata.role as AppRole) ?? 'operator',
          department: metadata.department ?? 'Operations',
        };
        setUser(authUser);
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      }
      setIsLoading(false);
    };

    void restoreSession();
  }, []);

  const login = useCallback(async (identifier: string, password: string): Promise<AuthUser | null> => {
    setIsLoading(true);

    try {
      if (!isSupabaseConfigured || !supabase) {
        console.error("Supabase is not configured.");
        return null;
      }
      
      const email = identifier.includes('@') ? identifier : `${identifier}@mithela.local`;
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error || !data.user) {
        console.error("Login failed", error);
        return null;
      }

      const metadata = data.user.user_metadata ?? {};
      const authUser: AuthUser = {
        id: data.user.id,
        name: metadata.name ?? data.user.email ?? identifier,
        username: metadata.username ?? identifier,
        email: data.user.email ?? undefined,
        role: (metadata.role as AppRole) ?? 'operator',
        department: metadata.department ?? 'Operations',
      };
      
      setUser(authUser);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      return authUser;
    } catch (err) {
      console.error("Unexpected login error", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
