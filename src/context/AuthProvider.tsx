import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentUser } from "../lib/auth";
import { clearSessionAuthGrace, markSessionAuthenticated } from "../lib/session-timeout";
import type { AuthUser } from "../types/auth";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const hydrateUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.user);
    } catch {
      setUser(null);
    } finally {
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const hydrateUserSafely = async () => {
      try {
        const response = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setUser(response.user);
      } catch {
        if (!isMounted) {
          return;
        }

        setUser(null);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    void hydrateUserSafely();

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isAuthReady,
      signIn: (nextUser: AuthUser) => {
        markSessionAuthenticated();
        setUser(nextUser);
        setIsAuthReady(true);
      },
      signOut: () => {
        clearSessionAuthGrace();
        setUser(null);
        setIsAuthReady(true);
      },
      refreshUser: async () => {
        await hydrateUser();
      },
    }),
    [isAuthReady, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
