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
        <div className="col-span-full text-center py-6">
          <p className="text-gray-500">No alumni found.</p>
        </div>
      );
    }
    
    return alumniList.map((alumni) => (
      <div key={alumni._id} className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {getAvatar(alumni)}
            </div>
            <div>
              <h3 className="text-lg font-medium">{alumni.name}</h3>
              <p className="text-gray-600">{alumni.alumniInfo?.jobTitle}</p>
              <p className="text-gray-600">{alumni.alumniInfo?.companyName}</p>
              <p className="text-gray-600">Domain: {alumni.alumniInfo?.domain}</p>
              <p className="text-gray-600">Experience: {alumni.alumniInfo?.yearsOfExperience} years</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => handleConnectRequest(alumni._id)}
              disabled={connectLoading[alumni._id]}
              className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 ${
                connectLoading[alumni._id] ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {connectLoading[alumni._id] ? 'Connecting...' : 'Connect'}
            </button>
          </div>
        </div>
      </div>
    ));
  };
  
  // Render profile update form if user is not verified
  if (currentUser && !currentUser.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Campus Connect</h1>
              </div>
              <div className="flex items-center space-x-4">
                <ProfileButton />
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please complete your profile to access the dashboard.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Complete Your Profile</h2>
                
                <AutoDismissAlert message={error} type="error" onDismiss={() => setError(null)} />
                
                <AutoDismissAlert message={success} type="success" onDismiss={() => setSuccess(null)} />
                
                <AutoDismissAlert message={successMessage} type="success" />
                
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year of Passing</label>
                      <select
                        name="yearOfPassing"
                        value={profileFormData.yearOfPassing}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Year</option>
                        {yearOptions.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                      <select
                        name="department"
                        value={profileFormData.department}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                      <select
                        name="domain"
                        value={profileFormData.domain}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
                      <select
                        name="industry"
                        value={profileFormData.industry}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Industry</option>
                        {industryOptions.map(industry => (
                          <option key={industry} value={industry}>{industry}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Company</label>
                      <select
                        name="preferredCompany"
                        value={profileFormData.preferredCompany}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Preferred Company</option>
                        {companyNameOptions.map(company => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                      <select
                        name="degree"
                        value={profileFormData.degree}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
                          className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                          required
                        />
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <button
                      type="submit"
                      disabled={formLoading}
                      className={`w-full md:w-auto px-6 py-2 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        formLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {formLoading ? 'Updating...' : 'Update Profile'}
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Campus Connect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/chat" 
                className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
              >
                Go to Chat
              </Link>
              <ProfileButton />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
        
        {/* Display success message from AuthContext if any */}
        <AutoDismissAlert message={successMessage} type="success" />
        
        {/* Display local success message */}
        <AutoDismissAlert message={success} type="success" onDismiss={() => setSuccess(null)} />
        
        {/* Display error message */}
        <AutoDismissAlert message={error} type="error" onDismiss={() => setError(null)} />
        
        {/* Two column layout with filters on left and results on right */}
        <div style={{display: 'flex', flexDirection: 'row', gap: '1.5rem'}}>
          {/* Left sidebar with filters */}
          <div style={{width: '25%', flexShrink: 0}}>
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Find Alumni</h2>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                  <select
                    name="domain"
                    value={filters.domain}
                    onChange={handleSearchInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Domains</option>
                    {domainOptions.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <select
                    name="companyName"
                    value={filters.companyName}
                    onChange={handleSearchInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Companies</option>
                    {companyNameOptions.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                  <select
                    name="jobTitle"
                    value={filters.jobTitle}
                    onChange={handleSearchInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Job Titles</option>
                    {jobTitleOptions.map(title => (
                      <option key={title} value={title}>{title}</option>
                    ))}
                  </select>
                </div>
                <div className="pt-2 flex flex-col space-y-2">
                  <button 
                    type="submit"
                    disabled={searchLoading}
                    className={`w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition duration-200 ${
                      searchLoading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {searchLoading ? 'Searching...' : 'Search'}
                  </button>
                  
                  {(searchResults.length > 0 || searchError) && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      className="w-full text-indigo-600 border border-indigo-600 py-2 px-4 rounded-md hover:bg-indigo-50"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Right content area with alumni cards */}
          <div style={{width: '75%', flexGrow: 1}}>
            {/* Search error message */}
            {searchError && (
              <div className="mb-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{searchError}</span>
              </div>
            )}
            
            {/* Search Results Section */}
            {searchResults.length > 0 ? (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderAlumniCards(searchResults)}
                </div>
              </div>
            ) : (
              /* Suggested Alumni Section - Show when there are no search results */
              <div>
                <h2 className="text-2xl font-semibold mb-4">Suggested Alumni</h2>
                {loading ? (
                  <div className="flex justify-center p-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
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