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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Campus Connect
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account
          </p>
        </div>
        
        <AutoDismissAlert message={successMessage} type="success" />
        <AutoDismissAlert message={loginError || error} type="error" />
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={credentials.email}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
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
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowDebugger(!showDebugger)}
              className="text-sm text-gray-500 hover:text-indigo-600"
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