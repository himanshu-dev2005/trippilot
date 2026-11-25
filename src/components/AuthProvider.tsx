import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { getSessionUser, type SessionUser } from '@/lib/auth';

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  setUser: (user: SessionUser | null) => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  setUser: () => {},
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const revisionRef = useRef(0);
  const router = useRouter();
  const queryClient = useQueryClient();

  const setUser = useCallback(
    (next: SessionUser | null) => {
      revisionRef.current += 1;
      setUserState(next);
      setLoading(false);
      void router.invalidate();
      void queryClient.invalidateQueries();
    },
    [router, queryClient],
  );

  const refresh = useCallback(async () => {
    const startRev = revisionRef.current;
    try {
      const { user: sessionUser } = await getSessionUser();
      if (revisionRef.current === startRev) {
        setUserState(sessionUser);
      }
    } catch {
      if (revisionRef.current === startRev) {
        setUserState(null);
      }
    } finally {
      if (revisionRef.current === startRev) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, loading, setUser, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAccount = () => useContext(AuthContext);
