import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CookieDebugger from '../../components/common/CookieDebugger';
import AutoDismissAlert from '../../components/AutoDismissAlert';

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [showDebugger, setShowDebugger] = useState(false);
  const { login, loading, error, successMessage, clearMessages, currentUser } = useAuth();
  const navigate = useNavigate();

  // If user is already logged in, redirect based on role
  useEffect(() => {
    if (currentUser) {
      // Add a small delay to show the success message before redirecting
      const redirectTimer = setTimeout(() => {
        redirectBasedOnRole(currentUser);
      }, 1500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [currentUser, navigate]);

  // Clear auth context messages when component unmounts
  useEffect(() => {
    return () => {
      clearMessages();
    };
  }, [clearMessages]);

  const redirectBasedOnRole = (user) => {
    if (user.role === 'admin') {
      navigate('/dashboard');
    } else if (user.role === 'student') {
      navigate('/student-dashboard');
    } else if (user.role === 'alumni') {
      navigate('/chat');
    } else {
      setLoginError('Unknown user role');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    
    try {
      await login(credentials.email, credentials.password);
      // Success message will be displayed from the context state
      // Redirect will happen in the useEffect when currentUser is updated
    } catch (err) {
      console.error('Login attempt failed:', err);
      // If we have an error from the context, use that, otherwise use a generic message
      setLoginError(error || err.message || 'An error occurred during login. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="max-w-md w-full space-y-6 p-10 bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-indigo-600">
            Campus Connect
          </h2>
          <p className="mt-2 text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        {successMessage && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-green-50 text-green-800 border border-green-200">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}
        
        {(loginError || error) && (
          <div className="p-4 mb-4 text-sm rounded-lg bg-red-50 text-red-800 border border-red-200">
            <p className="font-medium">{loginError || error}</p>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="your@email.com"
                value={credentials.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="••••••••"
                value={credentials.password}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : 'Sign in'}
            </button>
          </div>
          
          <div className="flex justify-center pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowDebugger(!showDebugger)}
              className="text-sm text-gray-500 hover:text-indigo-600 transition duration-150 ease-in-out"
            >
              {showDebugger ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
          </div>
        </form>
      </div>
      
      {showDebugger && <CookieDebugger />}
    </div>
  );
};

export default Login; 