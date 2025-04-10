import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { alumniAPI, chatAPI } from '../../utils/api';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import ProfileButton from '../../components/ProfileButton';
import { FaUser } from "react-icons/fa";

// Socket.io connection setup
const SOCKET_SERVER_URL = 'https://campus-connect-backend-j6g5.onrender.com';
let socket;

const ChatPage = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState(null);
  const [messagesError, setMessagesError] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [socketConnected, setSocketConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser, logout, successMessage } = useAuth();
  const navigate = useNavigate();
  
  // Function to manually reconnect the socket
  const reconnectSocket = () => {
    if (socket) {
      toast.success("Attempting to reconnect...");
      setReconnectAttempts(prev => prev + 1);
      
      // Force disconnect first if needed
      if (socket.connected) {
        socket.disconnect();
      }
      
      // Small delay before reconnecting
      setTimeout(() => {
        socket.connect();
      }, 500);
    } else {
      // If socket object is null, recreate it
      socket = io(SOCKET_SERVER_URL, {
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        autoConnect: true,
        forceNew: true
      });
      
      // Reattach event listeners
      setupSocketListeners();
      socket.connect();
      toast.success("Recreating connection...");
    }
  };
  
  // Separate function to set up socket listeners to avoid code duplication
  const setupSocketListeners = () => {
    if (!socket) return;
    
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setSocketConnected(true);
      
      // Rejoin current chat room if there is one
      if (selectedChat && selectedChat._id) {
        socket.emit('joinRoom', selectedChat._id);
        console.log(`Rejoined chat room after reconnect: ${selectedChat._id}`);
      }
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setSocketConnected(false);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      if (reconnectAttempts === 0) { // Only show once to avoid spamming
        toast.error('Chat connection failed. Please try reconnecting.');
      }
      setSocketConnected(false);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'An error occurred with the chat connection');
    });
  };
  
  // Initialize Socket.io connection - Modified for immediate connection
  useEffect(() => {
    // Create new socket connection on mount
    socket = io(SOCKET_SERVER_URL, {
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
      forceNew: true
    });
    
    // Set up all listeners
    setupSocketListeners();
    
    // Explicitly connect the socket
    if (!socket.connected) {
      socket.connect();
    }
    
    // Clean up socket connection on component unmount
    return () => {
      if (socket) {
        // Leave any room we might be in
        if (selectedChat) {
          socket.emit('leaveRoom', selectedChat._id);
        }
        socket.disconnect();
        socket = null;
      }
    };
  }, []);
  
  // Try auto-reconnect after short intervals if connection fails
  useEffect(() => {
    // Only run if socket is disconnected
    if (socketConnected || !socket) return;
    
    // Auto-reconnect timer after page is loaded
    const autoReconnectTimer = setTimeout(() => {
      if (!socketConnected && socket) {
        console.log('Auto-reconnect attempt...');
        reconnectSocket();
      }
    }, 3000); // Try after 3 seconds
    
    return () => {
      clearTimeout(autoReconnectTimer);
    };
  }, [socketConnected, reconnectAttempts]);
  
  // Additional auto-reconnect on initial load
  useEffect(() => {
    const initialConnectTimer = setTimeout(() => {
      if (!socketConnected && socket) {
        console.log('Initial connection check...');
        reconnectSocket();
      }
    }, 1000);
    
    return () => clearTimeout(initialConnectTimer);
  }, []);
  
  // Setup message listener when a chat is selected
  useEffect(() => {
    if (!socket || !selectedChat) return;
    
    // Leave previous room if any
    if (socket.previousRoom) {
      socket.emit('leaveRoom', socket.previousRoom);
    }
    
    // Join the new chat room
    socket.emit('joinRoom', selectedChat._id);
    socket.previousRoom = selectedChat._id;
    
    console.log(`Joined chat room: ${selectedChat._id}`);
    
    // Set up listener for incoming messages
    const handleReceiveMessage = (newMessage) => {
      console.log('New message received:', newMessage);
      
      // Check if message is already in the messages array to avoid duplicates
      setMessages((prevMessages) => {
        // Check if we already have this message (by _id)
        const isDuplicate = prevMessages.some(msg => msg._id === newMessage._id);
        if (isDuplicate) {
          return prevMessages;
        }
        return [...prevMessages, newMessage];
      });
      
      // Auto-scroll on new message
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };
    
    // Clean up existing listener to avoid duplicates
    socket.off('receiveMessage', handleReceiveMessage);
    // Add the listener
    socket.on('receiveMessage', handleReceiveMessage);
    
    // Clean up listener when chat changes
    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [selectedChat]);
  
  // Fetch user's chats on component mount
  useEffect(() => {
    fetchUserChats();
  }, []);
  
  // Fetch user chats function
  const fetchUserChats = async () => {
    setChatsLoading(true);
    setChatsError(null);
    
    try {
      const response = await chatAPI.getUserChats();
      
      if (response.data && response.data.data) {
        setChats(response.data.data);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
      setChatsError('Failed to load chat sessions. Please try again.');
    } finally {
      setChatsLoading(false);
    }
  };
  
  // Fetch messages for a selected chat
  const fetchChatMessages = async (chatId) => {
    if (!chatId) return;
    
    setMessagesLoading(true);
    setMessagesError(null);
    
    try {
      const response = await chatAPI.getChatMessages(chatId);
      
      if (response.data && response.data.data) {
        setMessages(response.data.data);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setMessagesError('Failed to load messages. Please try again.');
    } finally {
      setMessagesLoading(false);
    }
  };
  
  // New form data state for alumni profile update
  const [profileFormData, setProfileFormData] = useState({
    yearOfPassing: '',
    domain: '',
    industry: '',
    companyName: '',
    jobTitle: '',
    linkedInProfile: '',
    yearsOfExperience: ''
  });
  
  // Options for dropdown menus
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
    'Non-profit'
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
  
  // Get years for the dropdown (current year and past 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - i);
  
  // Years of experience options
  const experienceOptions = Array.from({ length: 21 }, (_, i) => i);

  useEffect(() => {
    // Load messages when a chat is selected
    if (selectedChat) {
      fetchChatMessages(selectedChat._id);
    }
  }, [selectedChat]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || sendingMessage) return;

    try {
      setSendingMessage(true);
      
      // Create message data for socket
      const messageData = {
        sender: currentUser._id,
        recipient: getOtherUser(selectedChat)._id,
        chatSession: selectedChat._id,
        content: newMessage.trim()
      };
      
      // Create optimistic message with proper structure matching MongoDB
      const tempMessage = {
        _id: Date.now().toString(), // temporary ID
        content: newMessage.trim(),
        sender: {
          _id: currentUser._id,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
        },
        recipient: getOtherUser(selectedChat)._id,
        chatSession: selectedChat._id,
        createdAt: new Date().toISOString(),
      };
      
      // Always add the message to UI immediately since sender won't receive their own message via socket
      setMessages((prevMessages) => [...prevMessages, tempMessage]);
      setNewMessage('');
      
      // Send the message via socket.io
      if (socketConnected) {
        socket.emit("sendMessage", messageData);
        // No need to wait for message to come back since backend won't send it to the sender
      } else {
        // Fallback to REST API if socket is not connected
        await chatAPI.sendMessage(selectedChat._id, newMessage.trim());
        // Refetch messages to ensure consistency
        await fetchChatMessages(selectedChat._id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Remove the optimistic message on error
      setMessages((prevMessages) => 
        prevMessages.filter(msg => typeof msg._id === 'string' && msg._id.length > 10 ? false : true)
      );
    } finally {
      setSendingMessage(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Disconnect socket before logout
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      
      // Perform logout
      await logout();
      
      // Navigate to sign-up page
      toast.success('Successfully logged out');
      navigate('/signup');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare data for API
      const profileData = {
        yearOfPassing: profileFormData.yearOfPassing,
        domain: profileFormData.domain,
        industry: profileFormData.industry,
        companyName: profileFormData.companyName,
        jobTitle: profileFormData.jobTitle,
        linkedInProfile: profileFormData.linkedInProfile,
        yearsOfExperience: profileFormData.yearsOfExperience
      };
      
      const response = await alumniAPI.updateProfile(profileData);
      
      // Display the success message from the API
      if (response.data && response.data.message) {
        setSuccess(response.data.message);
      } else {
        setSuccess('Profile updated successfully!');
      }
      
      // Redirect to the root path using React Router's navigate
      navigate('/');
      
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

  const isStudent = currentUser?.role === 'student';
  
  // Helper function to get other user from chat session
  const getOtherUser = (chat) => {
    if (!chat || !currentUser) return null;
    
    return currentUser.role === 'student' 
      ? chat.alumni 
      : chat.student;
  };
  
  // Helper function to check if a message is from the current user
  const isCurrentUserMessage = (message) => {
    if (!message || !currentUser) return false;
    
    // Check against the sender id - could be id or _id depending on source
    const messageId = message.sender?._id || message.sender?.id;
    const userId = currentUser._id;
    
    return messageId === userId;
  };
  
  // Return to login if no user is found
  useEffect(() => {
    if (!currentUser) {
      navigate('/signup');
    }
  }, [currentUser, navigate]);
  
  // Replace the getAvatarUrl helper function with this:
  const getAvatar = (user) => {
    if (user?.profileImage) {
      return (
        <img 
          src={user.profileImage} 
          alt={`${user.firstName || ''} ${user.lastName || ''}`}
          className="w-full h-full object-cover"
        />
      );
    }
    return <FaUser className="text-indigo-700 text-2xl" />;
  };
  
  // Render profile update form if alumni user is not verified
  if (currentUser?.role === 'alumni' && !currentUser.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-bold text-indigo-600">Campus Connect</h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="ml-4 px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6" role="alert">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg> */}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Please complete your profile to access the chat.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Complete Your Alumni Profile</h2>
                
                {error && (
                  <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}
                
                {success && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{success}</span>
                  </div>
                )}
                
                {successMessage && (
                  <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{successMessage}</span>
                  </div>
                )}
                
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <select
                        name="yearsOfExperience"
                        value={profileFormData.yearsOfExperience}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Years</option>
                        {experienceOptions.map(years => (
                          <option key={years} value={years}>{years} {years === 1 ? 'year' : 'years'}</option>
                        ))}
                      </select>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                      <select
                        name="companyName"
                        value={profileFormData.companyName}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Company</option>
                        {companyNameOptions.map(company => (
                          <option key={company} value={company}>{company}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                      <select
                        name="jobTitle"
                        value={profileFormData.jobTitle}
                        onChange={handleProfileFormChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Job Title</option>
                        {jobTitleOptions.map(title => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                      <input
                        type="url"
                        name="linkedInProfile"
                        value={profileFormData.linkedInProfile}
                        onChange={handleProfileFormChange}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        required
                      />
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

  // Render the chat page for verified users
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-indigo-600">Campus Connect</h1>
              {/* Show socket connection status */}
              <div className="ml-4 flex items-center">
                <div className={`h-3 w-3 rounded-full mr-1 ${
                  socketConnected 
                    ? 'bg-green-500 animate-pulse' 
                    : 'bg-red-500'
                }`}></div>
                <span className="text-xs text-gray-500">
                  {socketConnected 
                    ? 'Connected' 
                    : reconnectAttempts > 0 
                      ? `Reconnecting... (${reconnectAttempts})` 
                      : 'Disconnected'
                  }
                </span>
                {!socketConnected && (
                  <button 
                    onClick={reconnectSocket}
                    className="ml-2 text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/student-dashboard" 
                className="px-4 py-2 text-sm text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50"
              >
                Dashboard
              </Link>
              <ProfileButton />
            </div>
          </div>
        </div>
      </nav>
      
      {/* Display success message from AuthContext if any */}
      {successMessage && (
        <div className="mx-auto px-4 py-2 max-w-7xl">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{successMessage}</span>
          </div>
        </div>
      )}
      
      {/* Add reconnection button if socket is disconnected */}
      {!socketConnected && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 mx-4 my-2">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-yellow-400">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Chat connection lost. 
                <button 
                  onClick={reconnectSocket}
                  className="ml-2 text-yellow-700 underline"
                >
                  Reconnect
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chats sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Messages</h2>
          </div>
          
          {chatsLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : chatsError ? (
            <div className="flex justify-center items-center h-full">
              <p className="text-red-500">{chatsError}</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              <p>No conversations yet</p>
            </div>
          ) : (
            <div className="overflow-y-auto flex-1">
              {chats.map(chat => {
                const otherUser = getOtherUser(chat);
                return (
                  <div 
                    key={chat._id}
                    className={`flex items-center p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedChat?._id === chat._id ? 'bg-indigo-50' : ''
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="relative w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                      {getAvatar(otherUser)}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{otherUser?.name || 'User'}</h3>
                        {/* Timestamp of last message */}
                        {chat.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatTime(chat.lastMessage.createdAt || chat.updatedAt)}
                          </span>
                        )}
                      </div>
                      {/* Preview of last message */}
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage ? chat.lastMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        
        {/* Chat area */}
        <div className="hidden md:flex flex-col flex-1">
          {!selectedChat ? (
            <div className="flex justify-center items-center h-full bg-gray-50 text-gray-500">
              <p>Select a conversation to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center p-3 border-b border-gray-200 bg-white">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                  {getAvatar(getOtherUser(selectedChat))}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{getOtherUser(selectedChat)?.name || 'User'}</h3>
                  <p className="text-sm text-gray-500">
                    {currentUser?.role === 'student' ? 'Alumni' : 'Student'}
                  </p>
                </div>
              </div>
              
              {/* Messages */}
              <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
                {messagesLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : messagesError ? (
                  <div className="flex justify-center items-center py-4">
                    <p className="text-red-500">{messagesError}</p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex justify-center items-center h-full text-gray-500">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map(message => {
                      // Skip rendering messages with missing data
                      if (!message || !message.content) return null;
                      
                      return (
                        <div 
                          key={message._id || `temp-${Date.now()}`} 
                          className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUserMessage(message) 
                                ? 'bg-indigo-600 text-white' 
                                : 'bg-white border border-gray-200'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className={`text-xs mt-1 text-right ${
                              isCurrentUserMessage(message) ? 'text-indigo-200' : 'text-gray-500'
                            }`}>
                              {formatTime(message.createdAt || message.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>
              
              {/* Message input */}
              <form 
                onSubmit={handleSendMessage} 
                className="mt-auto border-t border-gray-200 p-4 flex items-center"
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={socketConnected ? "Type a message..." : "Connecting..."}
                  className="flex-1 p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sendingMessage || !socketConnected}
                />
                <button
                  type="submit"
                  className={`ml-2 p-2 rounded-md flex items-center justify-center ${
                    socketConnected ? 'bg-blue-500 text-white hover:bg-blue-600' : 'bg-gray-400 text-gray-200'
                  } transition duration-150`}
                  disabled={!newMessage.trim() || sendingMessage || !socketConnected}
                >
                  {sendingMessage ? (
                    <span className="h-5 w-5 border-t-2 border-white rounded-full animate-spin"></span>
                  ) : (
                    <span>Send</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage; 