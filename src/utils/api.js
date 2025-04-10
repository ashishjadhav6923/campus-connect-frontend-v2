import axios from 'axios';

const BASE_URL = 'https://campus-connect-backend-j6g5.onrender.com/api';

// Create an instance of axios with default config
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
  // This ensures cookies work correctly across different browsers
  // Important for cross-origin requests (frontend on different domain than backend)
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
});

// Add a request interceptor to ensure credentials are included with every request
api.interceptors.request.use(
  (config) => {
    // Always include credentials with every request
    config.withCredentials = true;
    
    // Ensure cookies work in Chrome and Safari
    config.headers['Access-Control-Allow-Credentials'] = true;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    // Check if we got any cookies with the response
    const cookies = document.cookie;
    // if (cookies) {
    //   console.log('Cookies present after response:', cookies.split(';').map(c => c.trim().split('=')[0]));
    // } else {
    //   console.warn('No cookies found after response');
    // }
    
    return response;
  },
  (error) => {
    // Handle response errors globally
    const errorResponse = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'Something went wrong',
      data: error.response?.data || {},
    };
    
    // Handle unauthorized errors (401)
    if (errorResponse.status === 401) {
      // User is not authenticated or session expired
      console.error('Authentication error:', errorResponse.message);
    }
    
    return Promise.reject(errorResponse);
  }
);

// Helper function to create requests with credentials explicitly set
const createRequest = (method, url, data = null, config = {}) => {
  const requestConfig = {
    ...config,
    withCredentials: true, // Triple ensure credentials are sent
  };
  
  switch (method.toLowerCase()) {
    case 'get':
      return api.get(url, requestConfig);
    case 'post':
      return api.post(url, data, requestConfig);
    case 'put':
      return api.put(url, data, requestConfig);
    case 'patch':
      return api.patch(url, data, requestConfig);
    case 'delete':
      return api.delete(url, requestConfig);
    default:
      throw new Error(`Unsupported method: ${method}`);
  }
};

export default api;

// Auth API endpoints
export const authAPI = {
  login: (email, password) => createRequest('post', '/auth/login', { email, password }),
  logout: () => createRequest('post', '/auth/logout', null, {
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Credentials': 'true'
    }
  }),
  verifyToken: () => createRequest('get', '/auth/verify'),
};

// User API endpoints
export const userAPI = {
  getProfile: () => createRequest('get', '/users/profile'),
  updateProfile: (userData) => createRequest('put', '/users/profile', userData),
};

// Admin API endpoints
export const adminAPI = {
  createUser: (userData) => createRequest('post', '/admin/createUser', userData),
  deleteUser: (email) => createRequest('post', '/admin/deleteUser', { email }),
  getUsers: () => createRequest('get', '/admin/users'),
};

// Student API endpoints
export const studentAPI = {
  updateProfile: (profileData) => createRequest('patch', '/student/updateStudentProfile', profileData),
  searchAlumniByFilter: (filters) => createRequest('post', '/student/searchAlumniByFilter', filters),
};

// Alumni API endpoints
export const alumniAPI = {
  updateProfile: (profileData) => createRequest('patch', '/alumni/updateAlumniProfile', profileData),
};

// Chat API endpoints
export const chatAPI = {
  getContacts: () => createRequest('get', '/chat/contacts'),
  getUserChats: () => createRequest('get', '/user/chats'),
  getChatMessages: (chatSessionId) => createRequest('get', `/user/chat/get/${chatSessionId}`),
  createChatSession: (userId) => createRequest('post', '/user/chat/createChatSession', { userId }),
  sendMessage: (chatSessionId, content) => createRequest('post', '/user/chat/send', { 
    chatSessionId, 
    content 
  }),
  // Add explicit method to handle leaving a chat room for graceful disconnects
  leaveChat: (chatSessionId) => createRequest('post', '/user/chat/leave', { chatSessionId }),
}; 