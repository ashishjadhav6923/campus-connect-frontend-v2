import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './pages/auth/Login';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import ChatPage from './pages/chat/ChatPage';
import { AuthProvider, useAuth } from './context/AuthContext';

// Protected route component that redirects to login if not authenticated
const ProtectedRoute = ({ element, allowedRoles }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Not authenticated
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If roles are specified, check if user has an allowed role
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
    // Redirect based on role
    if (currentUser.role === 'admin') {
      return <Navigate to="/dashboard" />;
    } else if (currentUser.role === 'student') {
      return <Navigate to="/student-dashboard" />;
    } else if (currentUser.role === 'alumni') {
      return <Navigate to="/chat" />;
    } else {
      return <Navigate to="/login" />;
    }
  }

  // User is authenticated and has an allowed role
  return element;
};

// Routes that redirect to the appropriate page if user is already authenticated
const PublicRoute = ({ element }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (currentUser) {
    // Redirect based on user role
    if (currentUser.role === 'admin') {
      return <Navigate to="/dashboard" />;
    } else if (currentUser.role === 'student') {
      return <Navigate to="/student-dashboard" />;
    } else if (currentUser.role === 'alumni') {
      return <Navigate to="/chat" />;
    }
  }
  
  return element;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicRoute element={<Login />} />} />
      <Route path="/login" element={<PublicRoute element={<Login />} />} />

      {/* Protected routes */}
      <Route 
        path="/dashboard" 
        element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={['admin']} />} 
      />
      
      <Route 
        path="/student-dashboard" 
        element={<ProtectedRoute element={<StudentDashboard />} allowedRoles={['student']} />} 
      />
      
      <Route 
        path="/chat" 
        element={<ProtectedRoute element={<ChatPage />} allowedRoles={['student', 'alumni']} />}
      />

      {/* Fallback route for any unmatched routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
