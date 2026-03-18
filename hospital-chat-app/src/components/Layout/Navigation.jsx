import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, X, Bell, User, LogOut, AlertTriangle, PhoneCall } from 'lucide-react';

const Navigation = ({ user, onLogout }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/appointments', label: 'Appointments' },
    { path: '/consultations', label: 'Consultations' },
    { path: '/prescriptions', label: 'Prescriptions' },
    { path: '/feedback', label: 'Feedback' },
    { path: '/chat-with-us', label: 'Support' },
  ];

  const roleSpecificLinks = {
    patient: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/appointments', label: 'My Appointments' },
      { path: '/prescriptions', label: 'My Prescriptions' }
    ],
    doctor: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/consultations', label: 'Consultations' },
      { path: '/support', label: 'Staff Chat' }
    ],
    nurse: [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/consultations', label: 'Patient Care' },
      { path: '/support', label: 'Staff Chat' }
    ],
    admin: [
      { path: '/dashboard', label: 'Admin Panel' },
      { path: '/consultations', label: 'Manage Users' },
      { path: '/feedback', label: 'System Settings' }
    ]
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white rounded-full p-2">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">Abiex's Health Care</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Hospital Communication Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {user ? (
              // Show dashboard link for authenticated users
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                Dashboard
              </Link>
            ) : null}
            
            {navLinks.slice(1).map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Emergency Button */}
          <div className="hidden md:block">
            <a 
              href="tel:911" 
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg"
            >
              <AlertTriangle className="w-4 h-4" />
              Emergency
            </a>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Notifications */}
                <div className="relative">
                  <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors group">
                    <Bell className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center animate-pulse">
                      {user.role === 'patient' ? '2' : user.role === 'doctor' ? '5' : '8'}
                    </span>
                  </button>
                  
                  {/* Notification Dropdown */}
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {user.role === 'patient' && (
                        <>
                          <div className="p-3 border-b hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Appointment Reminder</p>
                                <p className="text-xs text-gray-600">Dr. Sarah Abiex - Tomorrow at 10:00 AM</p>
                                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 border-b hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Prescription Ready</p>
                                <p className="text-xs text-gray-600">Your prescription is ready for pickup</p>
                                <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                      {user.role === 'doctor' && (
                        <>
                          <div className="p-3 border-b hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">Urgent Consultation</p>
                                <p className="text-xs text-gray-600">Patient John Doe requires immediate attention</p>
                                <p className="text-xs text-gray-500 mt-1">10 minutes ago</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-3 border-b hover:bg-gray-50">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                              <div>
                                <p className="text-sm font-medium">New Appointment</p>
                                <p className="text-xs text-gray-600">Patient Mary Smith booked for Friday</p>
                                <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="p-3 border-t text-center">
                      <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                        View all notifications
                      </button>
                    </div>
                  </div>
                </div>

                {/* Role-specific links */}
                {user.role && roleSpecificLinks[user.role] && (
                  <div className="hidden lg:flex items-center space-x-2">
                    {roleSpecificLinks[user.role].map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive(link.path)
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}

                {/* User Info */}
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={onLogout}
                  className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4">
            <div className="space-y-2">
              {/* Emergency Button for Mobile */}
              <a 
                href="tel:911" 
                className="mx-3 mb-4 bg-red-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
              >
                <AlertTriangle className="w-4 h-4" />
                Emergency: 911
              </a>
              
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  Dashboard
                </Link>
              ) : null}
              
              {navLinks.slice(1).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Role-specific mobile links */}
              {user && user.role && roleSpecificLinks[user.role] && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  {roleSpecificLinks[user.role].map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        isActive(link.path)
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;