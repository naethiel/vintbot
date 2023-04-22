import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "./firebase-config";
import { User } from "firebase/auth";

type AuthContext = {
  isLoading: boolean;
  currentUser: User | null;
};

export const AuthContext = createContext<AuthContext>({
  currentUser: null,
  isLoading: true,
});

export function AuthProvider({
  children,
}: React.ComponentProps<React.ElementType>) {
  const [authState, setAuthState] = useState<AuthContext>({
    currentUser: null,
    isLoading: true,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setAuthState({
        isLoading: false,
        currentUser: user,
      });
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={authState}>{children}</AuthContext.Provider>
  );
}

export function useUserData() {
  return useContext(AuthContext);
}
