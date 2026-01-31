import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

/* =======================
   TYPES
======================= */

interface AuthUser {
  uid: string;
  email: string | null;
  name?: string | null;
  photo?: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  role: string;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

/* =======================
   CONTEXT
======================= */

const AuthContext = createContext<AuthContextType | null>(null);

/* =======================
   PROVIDER
======================= */

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState("agent");
  const [loading, setLoading] = useState(true);

  /* =======================
     FIREBASE SESSION LISTENER
  ======================= */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setRole("agent");
        setLoading(false);
        return;
      }

      const token = await firebaseUser.getIdToken();
      localStorage.setItem("token", token);

      setUser({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        photo: firebaseUser.photoURL,
      });

      // TEMP role (backend will later override this)
      setRole(
        localStorage.getItem("voicesentinel_selected_role") ?? "agent"
      );

      // CHECK BACKEND AUTH STATUS (important: include cookies)
      try {
        const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/$/, '');
        const resp = await fetch(`${API_URL}/auth/status`, {
          credentials: 'include'
        });
        const data = await resp.json();
        if (data?.authenticated) {
          console.log('Backend user:', data.user);
          // backend may provide additional role info
          if (data.user?.role) setRole(data.user.role);
        }
      } catch (err) {
        console.warn('Backend auth check failed', err);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* =======================
     GOOGLE LOGIN
  ======================= */
  const loginWithGoogle = async () => {
    // Prefer backend OAuth flow so server can create a session cookie.
    // This will redirect: Frontend -> Backend -> Google -> Backend -> Frontend
    const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/$/, '');
    window.location.href = `${API_URL}/auth/google`;
  };

  /* =======================
     LOGOUT
  ======================= */
  const logout = async () => {
    try {
      // Sign out locally (Firebase) and inform backend to clear session cookie
      await signOut(auth);
    } catch (e) {
      console.warn('Firebase signOut failed', e);
    }
    try {
      const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').trim().replace(/\/$/, '');
      await fetch(`${API_URL}/auth/logout`, { credentials: 'include' });
    } catch (e) {
      console.warn('Backend logout failed', e);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("voicesentinel_selected_role");
    setUser(null);
    setRole("agent");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* =======================
   HOOK
======================= */

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("AuthContext missing");
  return ctx;
};
