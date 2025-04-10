import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUser } from "react-icons/fa";

const ProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { currentUser, logout } = useAuth();

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  if (!currentUser) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="overflow-hidden flex items-center justify-center h-10 w-10 rounded-full bg-indigo-100 border-2 border-indigo-300 hover:border-indigo-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-expanded={isOpen}
      >
        {currentUser.profileImage ? (
          <img 
            src={currentUser.profileImage} 
            alt={`${currentUser.firstName} ${currentUser.lastName}`}
            className="h-full w-full object-cover rounded-full"
          />
        ) : (
          <FaUser className="text-indigo-700 text-2xl" />
        )}
      </button>

      {/* Dropdown menu */}
      <div className={`absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 invisible'}`}>
        <div className="px-4 py-3 border-b border-gray-200 flex items-center">
          <div className="mr-3 h-10 w-10 flex items-center justify-center bg-indigo-100 rounded-full">
            {currentUser.profileImage ? (
              <img 
                src={currentUser.profileImage}
                alt={`${currentUser.firstName} ${currentUser.lastName}`}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <FaUser className="text-indigo-700 text-xl" />
            )}
          </div>
          <div>
            <p className="text-sm leading-5 font-medium text-gray-900">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-sm leading-5 text-gray-500 truncate">
              {currentUser.email}
            </p>
          </div>
        </div>
        
        <div className="px-4 py-2">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">User Details</div>
          <ul className="space-y-2">
            <li className="text-sm text-gray-700">
              <span className="font-semibold">Role:</span> {currentUser.role}
            </li>
            {currentUser.role === 'student' && currentUser.studentInfo && (
              <>
                {currentUser.studentInfo.department && (
                  <li className="text-sm text-gray-700">
                    <span className="font-semibold">Department:</span> {currentUser.studentInfo.department}
                  </li>
                )}
                {currentUser.studentInfo.yearOfPassing && (
                  <li className="text-sm text-gray-700">
                    <span className="font-semibold">Year of Passing:</span> {currentUser.studentInfo.yearOfPassing}
                  </li>
                )}
              </>
            )}
            {currentUser.role === 'alumni' && currentUser.alumniInfo && (
              <>
                {currentUser.alumniInfo.companyName && (
                  <li className="text-sm text-gray-700">
                    <span className="font-semibold">Company:</span> {currentUser.alumniInfo.companyName}
                  </li>
                )}
                {currentUser.alumniInfo.jobTitle && (
                  <li className="text-sm text-gray-700">
                    <span className="font-semibold">Job:</span> {currentUser.alumniInfo.jobTitle}
                  </li>
                )}
              </>
            )}
          </ul>
        </div>
        
        <div className="border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 focus:outline-none"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileButton; 