/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { navigateTo } from "../lib/axios";
// Define the user type
interface User {
  _id: string;
  email: string;
  name: string;
  [key: string]: any; // Allow dynamic properties
}

// Define the authentication context type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  logoutWhileDeletingUser: () => Promise<void>;
  token: string | null;
  fetchUser: () => Promise<void>; // Export fetchUser to allow manual refresh
  verificationString: string;
  setVerificationString: (verificationString: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(null);
  //const [loading, setLoading] = useState<boolean>(true);
  const [verificationString, setVerificationString] = useState("")

  const fetchUser = async () => {
    try {
      // const storedToken = localStorage.getItem("auth_token");
      
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/auth/me`, {
        withCredentials: true,
        // headers: { Authorization: `Bearer ${storedToken}` }, // Ensure token is sent
      });

      if (res.data && res.data.user) {
        setUser(res.data.user);
        setIsAuthenticated(true);

        const authToken = res.data.token;
        setToken(authToken);

        // if (authToken) {
        //   localStorage.setItem('auth_token', authToken);
        // }

        // console.log("Token set in context:", authToken);
      }
      console.log("user after login:", user);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      // localStorage.removeItem('auth_token');
    }
  };

  // Check for stored token on initial load
  useEffect(() => {
    fetchUser();
  }, []);

  // Login function
  const login = async () => {
    await fetchUser();
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });

      setUser(null);
      setIsAuthenticated(false);
      setToken(null);

      navigateTo("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if API call fails, clear local state and redirect
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      navigateTo("/");
    }
  };

  const logoutWhileDeletingUser = async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      // localStorage.removeItem('auth_token');
    }
    catch (error) {
      console.error("Logout Failed: ", error);
    }
  }

  // Create the context value object
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    login,
    logout,
    logoutWhileDeletingUser,
    token,
    verificationString,
    setVerificationString,
    fetchUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to use AuthContext
const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  // const storedToken = localStorage.getItem("auth_token");
  // console.log("Token in localStorage:", storedToken);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


export { AuthProvider, useAuth };