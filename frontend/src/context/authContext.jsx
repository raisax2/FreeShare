import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState(null); 
  const [authData, setAuthData] = useState(null); 
  const API_URL = process.env.REACT_APP_API_URL;

  const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/users/auth"); 
        console.log("Auth Response:", response.data); 
  
        if (response.status === 200) {
          setIsAuth(true);
          setUserType(response.data.userType); 
          setAuthData(response.data.user); 
        } else {
          setIsAuth(false);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        setIsAuth(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = async (email, password, userType) => {
    try {
      const endpoint = userType === "volunteer" ? "/users/login" : "/organizations/login"; 
      const response = await axiosInstance.post(endpoint, { email, password });
      
      setIsAuth(true);
      setUserType(userType);
      setAuthData(response.data.user || response.data.organization); 
      
      return response.data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userType, userData) => {
    try {
      const endpoint = userType === "volunteer" ? "/users/signup" : "/organizations/signup"; 
      const response = await axiosInstance.post(endpoint, userData);
      
      return response.data;
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    }
  };

  const logout = async (userType) => {
    try {
      const endpoint = userType === "volunteer" ? "/users/logout" : "/organizations/logout";
      await axiosInstance.post(endpoint, {}, { withCredentials: true });
      setIsAuth(false);
      setUserType(null);
      setAuthData(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };  

  return (
    <AuthContext.Provider
      value={{
        isAuth,
        loading,
        userType,
        authData,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};