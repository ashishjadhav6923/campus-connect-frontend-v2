import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { adminAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import AutoDismissAlert from '../../components/AutoDismissAlert';
import ProfileButton from '../../components/ProfileButton';

const AdminDashboard = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prn: '',
    password: '',
    role: 'student',
    graduationYear: '',
    department: ''
  });
  const [deleteEmail, setDeleteEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const { logout, successMessage } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleDeleteEmailChange = (e) => {
    setDeleteEmail(e.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Prepare data for API - only include required fields
    const userData = {
      name: formData.name,
      email: formData.email,
      prn: formData.prn,
      password: formData.password,
      role: formData.role
    };
    
    try {
      const response = await adminAPI.createUser(userData);
      
      // Display the exact message from the API response
      if (response.data && response.data.message) {
        setSuccess(response.data.message);
      } else {
        setSuccess(`${formData.role === 'student' ? 'Student' : 'Alumni'} account created successfully!`);
      }
      
      console.log('API Response:', response.data);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        prn: '',
        password: '',
        role: formData.role,
        graduationYear: '',
        department: ''
      });
    } catch (err) {
      console.error('Account creation error:', err);
      
      // Display the exact error message from the API if available
      if (err.data && err.data.message) {
        setError(err.data.message);
      } else {
        setError(err.message || 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteSubmit = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteError('');
    setDeleteSuccess('');
    
    try {
      const response = await adminAPI.deleteUser(deleteEmail);
      
      // Display the exact message from the API response
      if (response.data && response.data.message) {
        setDeleteSuccess(response.data.message);
      } else {
        setDeleteSuccess(`User with email ${deleteEmail} was successfully deleted.`);
      }
      
      // Reset delete email field
      setDeleteEmail('');
    } catch (err) {
      console.error('User deletion error:', err);
      
      // Display the exact error message from the API if available
      if (err.data && err.data.message) {
        setDeleteError(err.data.message);
      } else {
        setDeleteError(err.message || 'Failed to delete user. Please try again.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      
      // After successful logout, redirect to login page
      // Adding a small delay to show the success message
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Logout error:', err);
      setError('Failed to logout. Please try again.');
    }
  };
  
  // Auto-clear success and error messages
  useEffect(() => {
    let timer;
    if (success || error || deleteSuccess || deleteError) {
      timer = setTimeout(() => {
        setSuccess('');
        setError('');
        setDeleteSuccess('');
        setDeleteError('');
      }, 4000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, error, deleteSuccess, deleteError]);
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ProfileButton />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
        
        <AutoDismissAlert message={successMessage} type="success" />
        <AutoDismissAlert message={success} type="success" onDismiss={() => setSuccess('')} />
        <AutoDismissAlert message={error} type="error" onDismiss={() => setError('')} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create User Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Create User Account</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PRN (Registration Number)</label>
                    <input
                      type="text"
                      name="prn"
                      value={formData.prn}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      required
                    >
                      <option value="student">Student</option>
                      <option value="alumni">Alumni</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Department</option>
                      <option value="computer">Computer Science</option>
                      <option value="electrical">Electrical Engineering</option>
                      <option value="mechanical">Mechanical Engineering</option>
                      <option value="civil">Civil Engineering</option>
                      <option value="business">Business Administration</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                    <select
                      name="graduationYear"
                      value={formData.graduationYear}
                      onChange={handleChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="">Select Year</option>
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
                      <option value="2022">2022</option>
                      <option value="2021">2021</option>
                      <option value="2020">2020</option>
                      <option value="2019">2019</option>
                      <option value="2018">2018</option>
                      <option value="2017">2017</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Delete User Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Delete User Account</h2>
              
              <AutoDismissAlert message={deleteError} type="error" onDismiss={() => setDeleteError('')} />
              <AutoDismissAlert message={deleteSuccess} type="success" onDismiss={() => setDeleteSuccess('')} />
              
              <form onSubmit={handleDeleteSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                  <input
                    type="email"
                    value={deleteEmail}
                    onChange={handleDeleteEmailChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="Enter email of user to delete"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the email address of the user you want to delete. This action cannot be undone.
                  </p>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={deleteLoading}
                    className={`w-full md:w-auto px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                      deleteLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 