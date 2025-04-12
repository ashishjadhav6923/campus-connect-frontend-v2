import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentAPI, chatAPI } from '../../utils/api';
import AutoDismissAlert from '../../components/AutoDismissAlert';
import ProfileButton from '../../components/ProfileButton';
import { FaUser } from "react-icons/fa";

const StudentDashboard = () => {
  const [suggestedAlumni, setSuggestedAlumni] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [connectLoading, setConnectLoading] = useState({});
  
  const navigate = useNavigate();
  
  // Search filters
  const [filters, setFilters] = useState({
    domain: '',
    companyName: '',
    jobTitle: ''
  });
  
  // Domain options for filter
  const domainOptions = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Artificial Intelligence',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'Blockchain',
    'UI/UX Design',
    'Game Development',
    'IoT (Internet of Things)',
    'Embedded Systems',
    'Quantum Computing',
    'AR/VR Development',
    'Database Administration',
    'Network Engineering',
    'Big Data',
    'Business Intelligence',
    'ERP Systems',
    'Robotics',
    'Bioinformatics',
    'Digital Marketing',
    'Product Management',
    'QA & Testing'
  ];
  
  // Job Title options
  const jobTitleOptions = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Data Analyst',
    'Machine Learning Engineer',
    'AI Research Scientist',
    'Cloud Architect',
    'Cybersecurity Analyst',
    'Network Engineer',
    'Database Administrator',
    'System Administrator',
    'UX/UI Designer',
    'Product Manager',
    'Project Manager',
    'Scrum Master',
    'QA Engineer',
    'QA Analyst',
    'Business Analyst',
    'Technical Writer',
    'Solutions Architect',
    'IT Consultant',
    'Mobile App Developer',
    'Game Developer',
    'Blockchain Developer',
    'IoT Developer',
    'AR/VR Developer',
    'Technical Lead',
    'CTO',
    'CIO',
    'IT Director',
    'VP of Engineering'
  ];
  
  // Company Name options
  const companyNameOptions = [
    'Google',
    'Microsoft',
    'Apple',
    'Amazon',
    'Meta (Facebook)',
    'Netflix',
    'IBM',
    'Oracle',
    'Salesforce',
    'Adobe',
    'Intel',
    'Cisco',
    'Dell',
    'HP',
    'NVIDIA',
    'AMD',
    'Twitter',
    'LinkedIn',
    'Airbnb',
    'Uber',
    'Lyft',
    'PayPal',
    'Spotify',
    'Dropbox',
    'Stripe',
    'Slack',
    'Zoom',
    'TCS',
    'Infosys',
    'Wipro',
    'HCL Technologies',
    'Tech Mahindra',
    'Cognizant',
    'Accenture',
    'Capgemini',
    'Deloitte',
    'PwC',
    'EY',
    'KPMG',
    'McKinsey',
    'Boston Consulting Group',
    'JPMorgan Chase',
    'Goldman Sachs',
    'Morgan Stanley',
    'Bank of America',
    'Citigroup',
    'Wells Fargo',
    'HSBC',
    'Samsung',
    'Sony'
  ];
  
  // New form data state for profile update
  const [profileFormData, setProfileFormData] = useState({
    yearOfPassing: '',
    department: '',
    domain: '',
    industry: '',
    preferredCompany: '',
    degree: '',
    customDomain: '',
    customDegree: ''
  });
  
  // Options for dropdown menus
  const departmentOptions = [
    'Computer Science',
    'Electrical Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Business Administration',
    'Other'
  ];
  
  const industryOptions = [
    'Information Technology',
    'Healthcare',
    'Finance',
    'Banking',
    'Insurance',
    'Education',
    'E-commerce',
    'Manufacturing',
    'Automotive',
    'Aerospace',
    'Telecommunications',
    'Retail',
    'Hospitality',
    'Entertainment',
    'Media',
    'Pharmaceuticals',
    'Biotechnology',
    'Energy',
    'Oil & Gas',
    'Renewable Energy',
    'Construction',
    'Real Estate',
    'Agriculture',
    'Food & Beverage',
    'Transportation',
    'Logistics',
    'Consulting',
    'Legal Services',
    'Government',
    'Non-profit',
    'Fashion',
    'Gaming',
    'Sports',
    'Travel & Tourism',
    'Environmental Services',
    'Cybersecurity',
    'Artificial Intelligence',
    'Blockchain',
    'Public Relations',
    'Advertising'
  ];
  
  const degreeOptions = [
    'Bachelor of Technology',
    'Bachelor of Engineering',
    'Master of Technology',
    'Master of Engineering',
    'PhD',
    'Other'
  ];
  
  // Get years for the dropdown (current year and past 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear + 1 - i);
  
  const { currentUser, logout, successMessage } = useAuth();
  
  useEffect(() => {
    // Load suggested alumni when component mounts
    fetchSuggestedAlumni();
  }, []);
  
  const fetchSuggestedAlumni = async () => {
    setLoading(true);
    try {
      // Use the same searchAlumniByFilter API but with empty filters to get all alumni
      const response = await studentAPI.searchAlumniByFilter({});
      if (response.data && response.data.data) {
        setSuggestedAlumni(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching suggested alumni:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleConnectRequest = async (alumniId) => {
    // Set loading state for this specific alumni
    setConnectLoading(prev => ({ ...prev, [alumniId]: true }));
    
    try {
      const response = await chatAPI.createChatSession(alumniId);
      
      console.log('Chat session created:', response.data);
      
      // If successful, navigate to the chat page
      if (response.data && response.data.data && response.data.data.chatSessionId) {
        navigate('/chat');
      }
    } catch (err) {
      console.error('Error creating chat session:', err);
      setError(err.message || 'Failed to connect with alumni. Please try again.');
      
      // Scroll to top to show the error message
      window.scrollTo(0, 0);
    } finally {
      setConnectLoading(prev => ({ ...prev, [alumniId]: false }));
    }
  };

  const handleLogout = async () => {
    await logout();
  };
  
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearchInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSearch = async (e) => {
    e.preventDefault();
    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    
    try {
      // Remove empty fields from filters
      const cleanedFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== '')
      );
      
      const response = await studentAPI.searchAlumniByFilter(cleanedFilters);
      console.log(response);
      if (response.data && response.data.data) {
        setSearchResults(response.data.data);
        
        if (response.data.data.length === 0) {
          setSearchError('No alumni found matching these criteria.');
        }
      }
    } catch (err) {
      console.error('Search error:', err);
      
      if (err.data && err.data.message) {
        setSearchError(err.data.message);
      } else {
        setSearchError('Failed to search alumni. Please try again.');
      }
    } finally {
      setSearchLoading(false);
    }
  };
  
  const clearSearch = () => {
    setFilters({
      domain: '',
      companyName: '',
      jobTitle: ''
    });
    setSearchResults([]);
    setSearchError(null);
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data for API with custom values if "Other" is selected
      const profileData = {
        yearOfPassing: profileFormData.yearOfPassing,
        department: profileFormData.department === 'Other' ? profileFormData.customDepartment : profileFormData.department,
        domain: profileFormData.domain === 'Other' ? profileFormData.customDomain : profileFormData.domain,
        industry: profileFormData.industry,
        preferredCompany: profileFormData.preferredCompany,
        degree: profileFormData.degree === 'Other' ? profileFormData.customDegree : profileFormData.degree
      };
      
      const response = await studentAPI.updateProfile(profileData);
      
      // Display the success message from the API
      if (response.data && response.data.message) {
        setSuccess(response.data.message);
      } else {
        setSuccess('Profile updated successfully!');
      }
      
      // Force refresh of user data to get the updated isVerified status
      // This will reload the component with the dashboard view
      window.location.reload();
      
    } catch (err) {
      console.error('Profile update error:', err);
      
      // Display the exact error message from the API if available
      if (err.data && err.data.message) {
        setError(err.data.message);
      } else {
        setError(err.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setFormLoading(false);
    }
  };
  
  // Auto-dismiss success message after delay
  useEffect(() => {
    let timer;
    if (success) {
      timer = setTimeout(() => {
        setSuccess(null);
      }, 3000); // Clear after 3 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success]);
  
  // Replace the getAvatarUrl helper function with this:
  const getAvatar = (user) => {
    if (user?.profileImage) {
      return (
        <img 
          src={user.profileImage} 
          alt={user.name || 'User'}
          className="h-full w-full object-cover"
        />
      );
    }
    return <FaUser className="text-indigo-700 text-2xl" />;
  };
  
  // Helper function to render alumni cards
  const renderAlumniCards = (alumniList) => {
    if (alumniList.length === 0) {
      return (
        <div className="col-span-full text-center py-6 bg-gray-50 rounded-xl p-10">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-xl font-medium text-gray-600 mb-2">No alumni found</p>
          <p className="text-gray-500">Try adjusting your search filters</p>
        </div>
      );
    }
    
    return alumniList.map((alumni) => (
      <div key={alumni._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shadow-md">
              {getAvatar(alumni)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-indigo-800">{alumni.name}</h3>
              <div className="text-sm text-gray-600 mt-1 space-y-1">
                {alumni.alumniInfo?.jobTitle && (
                  <p className="flex items-center">
                    <span className="w-4 h-4 mr-2 text-indigo-500">👨‍💻</span>
                    {alumni.alumniInfo.jobTitle}
                  </p>
                )}
                {alumni.alumniInfo?.companyName && (
                  <p className="flex items-center">
                    <span className="w-4 h-4 mr-2 text-indigo-500">🏢</span>
                    {alumni.alumniInfo.companyName}
                  </p>
                )}
                {alumni.alumniInfo?.domain && (
                  <p className="flex items-center">
                    <span className="w-4 h-4 mr-2 text-indigo-500">🔧</span>
                    {alumni.alumniInfo.domain}
                  </p>
                )}
                {alumni.alumniInfo?.yearsOfExperience && (
                  <p className="flex items-center">
                    <span className="w-4 h-4 mr-2 text-indigo-500">⏳</span>
                    {alumni.alumniInfo.yearsOfExperience} {alumni.alumniInfo.yearsOfExperience === 1 ? 'year' : 'years'} experience
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100">
            <button
              onClick={() => handleConnectRequest(alumni._id)}
              disabled={connectLoading[alumni._id]}
              className={`w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex justify-center items-center font-medium ${
                connectLoading[alumni._id] ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {connectLoading[alumni._id] ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connecting...
                </>
              ) : (
                'Connect with Alumni'
              )}
            </button>
          </div>
        </div>
      </div>
    ));
  };
  
  // Render profile update form if user is not verified
  if (currentUser && !currentUser.isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">
                  <span className="mr-2">🎓</span>
                  Campus Connect
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <ProfileButton />
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 mb-8 rounded-r-lg shadow-sm" role="alert">
              <div className="flex">
                <div className="flex-shrink-0 text-yellow-400 text-xl mr-3">
                  ⓘ
                </div>
                <div>
                  <p className="text-sm text-yellow-700 font-medium">
                    Please complete your profile to access the dashboard. Your profile information helps us match you with the right alumni mentors.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-indigo-800 mb-6 flex items-center">
                  <span className="mr-3 text-indigo-500">👤</span>
                  Complete Your Student Profile
                </h2>
                
                {error && (
                  <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md shadow-sm" role="alert">
                    <span className="block sm:inline font-medium">{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-md shadow-sm" role="alert">
                    <span className="block sm:inline font-medium">{success}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-md shadow-sm" role="alert">
                    <span className="block sm:inline font-medium">{successMessage}</span>
                  </div>
                )}
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year of Passing</label>
                      <select
                        name="yearOfPassing"
                        value={profileFormData.yearOfPassing}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Year</option>
                        {yearOptions.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <select
                        name="department"
                        value={profileFormData.department}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      
                      {profileFormData.department === 'Other' && (
                        <input
                          type="text"
                          name="customDepartment"
                          value={profileFormData.customDepartment}
                          onChange={handleProfileFormChange}
                          placeholder="Enter your department"
                          className="mt-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                          required
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                      <select
                        name="domain"
                        value={profileFormData.domain}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Domain</option>
                        {domainOptions.map(domain => (
                          <option key={domain} value={domain}>{domain}</option>
                        ))}
                      </select>
                      
                      {profileFormData.domain === 'Other' && (
                        <input
                          type="text"
                          name="customDomain"
                          value={profileFormData.customDomain}
                          onChange={handleProfileFormChange}
                          placeholder="Enter your domain"
                          className="mt-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                          required
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                      <select
                        name="industry"
                        value={profileFormData.industry}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Industry</option>
                        {industryOptions.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Company</label>
                      <select
                        name="preferredCompany"
                        value={profileFormData.preferredCompany}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Preferred Company</option>
                        {companyNameOptions.map(company => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                      <select
                        name="degree"
                        value={profileFormData.degree}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                        required
                      >
                        <option value="">Select Degree</option>
                        {degreeOptions.map(degree => (
                          <option key={degree} value={degree}>{degree}</option>
                        ))}
                      </select>
                      
                      {profileFormData.degree === 'Other' && (
                        <input
                          type="text"
                          name="customDegree"
                          value={profileFormData.customDegree}
                          onChange={handleProfileFormChange}
                          placeholder="Enter your degree"
                          className="mt-2 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                          required
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={formLoading}
                      className={`w-full md:w-auto px-8 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md transition-colors duration-200 ${
                        formLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {formLoading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating Profile...
                        </span>
                      ) : (
                        'Update Profile'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Render the dashboard for verified users
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">
                <span className="mr-2">🎓</span>
                Campus Connect
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/chat" 
                className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition-colors duration-200 font-medium"
              >
                Go to Chat
              </Link>
              <ProfileButton />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            <span className="text-indigo-600">Student</span> Dashboard
          </h1>
          <div className="ml-auto">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
              Find your mentors!
            </span>
          </div>
        </div>
        
        {/* Display success message from AuthContext if any */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-md shadow-sm" role="alert">
            <span className="block sm:inline font-medium">{successMessage}</span>
          </div>
        )}
        
        {/* Display local success message */}
        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded-r-md shadow-sm" role="alert">
            <span className="block sm:inline font-medium">{success}</span>
          </div>
        )}
        
        {/* Display error message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-md shadow-sm" role="alert">
            <span className="block sm:inline font-medium">{error}</span>
          </div>
        )}
        
        {/* Two column layout with filters on left and results on right */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left sidebar with filters */}
          <div className="w-full md:w-1/4 lg:w-1/4 md:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4 text-indigo-800 flex items-center">
                <span className="mr-2">🔍</span>
                Find Alumni
              </h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Domain</label>
                  <select
                    name="domain"
                    value={filters.domain}
                    onChange={handleSearchInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                  >
                    <option value="">All Domains</option>
                    {domainOptions.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                  <select
                    name="companyName"
                    value={filters.companyName}
                    onChange={handleSearchInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                  >
                    <option value="">All Companies</option>
                    {companyNameOptions.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                  <select
                    name="jobTitle"
                    value={filters.jobTitle}
                    onChange={handleSearchInputChange}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50"
                  >
                    <option value="">All Job Titles</option>
                    {jobTitleOptions.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-4 flex flex-col space-y-3">
                  <button 
                    type="submit"
                    disabled={searchLoading}
                    className={`w-full bg-indigo-600 text-white py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition duration-200 shadow-sm flex justify-center items-center ${
                      searchLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {searchLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Searching...
                      </>
                    ) : (
                      'Search Alumni'
                    )}
                  </button>
                  
                  {(searchResults.length > 0 || searchError) && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="w-full text-indigo-600 border border-indigo-600 py-2.5 px-4 rounded-lg hover:bg-indigo-50 transition-colors duration-200"
                    >
                      Clear Results
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Right content area with alumni cards */}
          <div className="w-full md:w-3/4 lg:w-3/4 md:flex-grow">
            {/* Search error message */}
            {searchError && (
              <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4 rounded-r-md shadow-sm" role="alert">
                <p className="flex items-center font-medium">
                  <span className="mr-2">⚠️</span>
                  {searchError}
                </p>
              </div>
            )}
            
            {/* Search Results Section */}
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-2">
                  Search Results <span className="text-indigo-600">({searchResults.length})</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderAlumniCards(searchResults)}
                </div>
              </div>
            ) : (
              /* Suggested Alumni Section - Show when there are no search results */
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b border-gray-200 pb-2">
                  Suggested Alumni
                </h2>
                {loading ? (
                  <div className="flex flex-col justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-gray-500">Loading alumni suggestions...</p>
                  </div>
                ) : suggestedAlumni.length === 0 ? (
                  <div className="bg-gray-50 rounded-xl p-10 text-center">
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-xl font-medium text-gray-600 mb-2">No alumni suggestions available yet</p>
                    <p className="text-gray-500">Check back later or adjust your search filters</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderAlumniCards(suggestedAlumni)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 