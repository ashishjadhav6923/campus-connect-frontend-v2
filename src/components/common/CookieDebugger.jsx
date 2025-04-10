import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';

const CookieDebugger = () => {
  const [cookies, setCookies] = useState([]);
  const [testApiResponse, setTestApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Function to get all available cookies
  const getAllCookies = () => {
    const cookiesList = document.cookie.split(';').map(cookie => {
      const parts = cookie.trim().split('=');
      return {
        name: parts[0],
        // Don't display the actual value for security
        hasValue: parts.length > 1 && parts[1].length > 0
      };
    });
    
    setCookies(cookiesList);
  };

  // Initial check for cookies
  useEffect(() => {
    getAllCookies();
    
    // Set up periodic cookie check
    const interval = setInterval(getAllCookies, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Test API call to see if cookies are being sent
  const testVerifyEndpoint = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This should send cookies to the server
      const response = await authAPI.verifyToken();
      setTestApiResponse({
        status: response.status,
        statusText: response.statusText,
        hasData: !!response.data,
        authenticated: response.data?.data?.user ? true : false
      });
    } catch (err) {
      console.error('Verify test error:', err);
      setError(err.message || 'Failed to test verify endpoint');
      setTestApiResponse({
        status: err.status || 'Error',
        message: err.message,
        authenticated: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Cookie Debugger</h2>
      
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">User Authentication Status</h3>
        <div className="bg-gray-100 p-3 rounded">
          {currentUser ? (
            <p className="text-green-600">
              ✅ User authenticated as: {currentUser.name} ({currentUser.role})
            </p>
          ) : (
            <p className="text-red-600">❌ No user authenticated</p>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Current Cookies ({cookies.length})</h3>
        {cookies.length === 0 ? (
          <p className="text-red-600">No cookies found in this domain</p>
        ) : (
          <ul className="bg-gray-100 p-3 rounded">
            {cookies.map((cookie, index) => (
              <li key={index} className="mb-1">
                {cookie.name}: {cookie.hasValue ? '(has value)' : '(empty)'}
              </li>
            ))}
          </ul>
        )}
        <button 
          onClick={getAllCookies}
          className="mt-2 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Refresh Cookies
        </button>
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Test Authentication</h3>
        <button 
          onClick={testVerifyEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? 'Testing...' : 'Test Verify Endpoint'}
        </button>
        
        {error && (
          <div className="mt-2 text-red-600">
            Error: {error}
          </div>
        )}
        
        {testApiResponse && (
          <div className="mt-2 bg-gray-100 p-3 rounded">
            <p>Status: {testApiResponse.status} {testApiResponse.statusText}</p>
            <p>Has Data: {testApiResponse.hasData ? 'Yes' : 'No'}</p>
            <p>Authentication: {testApiResponse.authenticated ? 
              '✅ Authenticated' : 
              '❌ Not Authenticated'
            }</p>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Troubleshooting Tips</h3>
        <ul className="list-disc pl-5">
          <li>Ensure your backend is setting SameSite=None and Secure flags on cookies</li>
          <li>Check that your backend has proper CORS headers (Access-Control-Allow-Credentials: true)</li>
          <li>Verify that backend domain matches the expected cookie domain</li>
          <li>Try testing in an incognito window to avoid cookie conflicts</li>
        </ul>
      </div>
    </div>
  );
};

export default CookieDebugger; 