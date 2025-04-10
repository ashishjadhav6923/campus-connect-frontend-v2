import { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Auto-clear success messages after a delay
  useEffect(() => {
    let timer;
    if (successMessage) {
      timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 4000); // Clear after 4 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [successMessage]);
  
  // Auto-clear error messages after a delay
  useEffect(() => {
    let timer;
    if (error) {
      timer = setTimeout(() => {
        setError(null);
      }, 4000); // Clear after 4 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [error]);

  useEffect(() => {
    // Check if user is logged in on page load
    const checkLoggedInStatus = async () => {
      try {
        // Verify token with backend - cookies will be sent automatically
        const response = await authAPI.verifyToken();
        
        if (response.data && response.data.data && response.data.data.user) {
          setCurrentUser(response.data.data.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setCurrentUser(null);
        setError('Failed to authenticate user');
      } finally {
        setLoading(false);
      }
    };

    checkLoggedInStatus();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // The withCredentials option is crucial here for cookies to be saved
      const response = await authAPI.login(email, password);
      
      // Handle the response based on the structure provided
      // {statusCode: 200, message: "User logged In Successfully", data: {user: {...}}}
      if (response.data) {
        // Set success message from the API response
        if (response.data.message) {
          setSuccessMessage(response.data.message);
        }
        
        // Set user data
        if (response.data.data && response.data.data.user) {
          const userData = response.data.data.user;
          setCurrentUser(userData);
          console.log('Login successful - cookies should be set by the browser');
          return userData;
        }
      }
      
      throw new Error('Invalid response format');
    } catch (err) {
      console.error('Login error:', err);
      if (err.response && err.response.data) {
        setError(err.response.data.message || 'Failed to login');
      } else {
        setError(err.message || 'Failed to login');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      // Call the logout endpoint at /api/auth/logout which will invalidate the session
      // and clear cookies on the server side
      const response = await authAPI.logout();
      
      // Set success message if available
      if (response && response.data && response.data.message) {
        setSuccessMessage(response.data.message);
      } else {
        setSuccessMessage('Logged out successfully');
      }
      
      // Clear the user state
      setCurrentUser(null);
      
      // Manually clear cookies in case server-side clearing doesn't work due to CORS
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      return response;
    } catch (err) {
      console.error('Logout error:', err);
      
      if (err.message) {
        setError(err.message);
      } else {
        setError('Failed to log out');
      }
      
      // Even if the server-side logout fails, clear the user from the frontend
      // and manually clear cookies
      setCurrentUser(null);
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Show a success message anyway since we've at least logged out on the frontend
      setSuccessMessage('Logged out on this device');
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Clear messages after they've been displayed
  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    successMessage,
    login,
    logout,
    clearMessages
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 