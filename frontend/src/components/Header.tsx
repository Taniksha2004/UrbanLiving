import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import {
  Home,
  Users,
  Receipt,
  Building,
  ShoppingBasket,
  Menu,
  X,
  UserPlus,
  BarChart3,
  LogOut,
  Settings,
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<{
    firstName: string;
    lastName?: string;
    email: string;
    avatarUrl?: string;
  } | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      setIsLoggedIn(!!token);
      setShowProfileMenu(false); // close dropdown when route changes

      if (!token) {
        setUser(null);
        return;
      }

      try {
        const response = await axios.get('http://localhost:4000/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = response.data.user;
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } catch (error) {
        console.error('🚫 Error fetching profile in header:', error);
        setUser(null);
      }
    };

    fetchUser();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setShowProfileMenu(false);
    navigate('/login');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'HomeMatch', href: '/homematch', icon: Users },
    { name: 'BillSplit+', href: '/billsplit', icon: Receipt },
    { name: 'Properties', href: '/properties', icon: Building },
    { name: 'QuickBasket', href: '/quickbasket', icon: ShoppingBasket },
  ];

  if (isLoggedIn) {
    navigation.push({ name: 'Dashboard', href: '/dashboard', icon: BarChart3 });
  }

  const isActive = (path: string) => location.pathname === path;

  const renderAvatar = (user?: {
    firstName: string;
    lastName?: string;
    avatarUrl?: string;
  }) => {
    if (!user) return null;

    if (user.avatarUrl) {
      return (
        <img
          src={`http://localhost:4000${user.avatarUrl}`}
          alt="User Avatar"
          className="w-8 h-8 rounded-full object-cover border border-gray-300"
        />
      );
    }

    const initials =
      user.firstName.charAt(0).toUpperCase() +
      (user.lastName ? user.lastName.charAt(0).toUpperCase() : '');

    return (
      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-white font-bold text-sm">
        {initials}
      </div>
    );
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="bg-gray-900 p-2 rounded-xl"
            >
              <Home className="h-6 w-6 text-white" />
            </motion.div>
            <span className="text-2xl font-bold text-gray-900">
              UrbanLiving
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-gray-200 text-gray-900'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth/Profile */}
          <div className="hidden md:flex items-center space-x-4 relative">
            {!isLoggedIn || !user ? (
              <Link
                to="/signup"
                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2"
              >
                <UserPlus className="h-4 w-4" />
                <span>Sign Up</span>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="text-gray-800 font-medium flex items-center space-x-2 hover:underline"
                >
                  {renderAvatar(user)}
                  <span>{user.firstName}</span>
                </button>

                {showProfileMenu && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white shadow-lg rounded-lg p-4 z-50">
                    <div className="flex items-center space-x-3 mb-3">
                      {renderAvatar(user)}
                      <div>
                        <p className="font-semibold text-gray-800">{user.firstName}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        navigate('/settings');
                      }}
                      className="text-left w-full text-gray-700 hover:text-black font-medium mb-2 flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="text-left w-full text-gray-800 hover:text-black font-medium flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation & Profile Info */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4"
          >
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gray-200 text-gray-900'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}

              {!isLoggedIn || !user ? (
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-gray-900 text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-700 transition-all duration-200 flex items-center space-x-2 mt-4"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </Link>
              ) : (
                <>
                  <div className="px-4 pt-2 flex items-center space-x-3">
                    {renderAvatar(user)}
                    <div>
                      <p className="text-sm text-gray-700 font-semibold">{user.firstName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      navigate('/settings');
                    }}
                    className="text-left w-full text-gray-700 hover:text-black px-4 py-3 font-medium flex items-center space-x-2"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      handleLogout();
                    }}
                    className="text-left w-full text-gray-800 hover:text-black px-4 py-3 font-medium flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;