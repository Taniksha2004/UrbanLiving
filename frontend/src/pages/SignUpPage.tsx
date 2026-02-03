import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { ArrowRight, Shield } from 'lucide-react';

const SignUpPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: '',
    agreeToTerms: false
  });

  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value, type } = e.target;

  // Use a type assertion to safely access the 'checked' property
  const newValue = type === 'checkbox' 
    ? (e.target as HTMLInputElement).checked 
    : value;

  setFormData(prev => ({
    ...prev,
    [name]: newValue
  }));
};

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage('');

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4000/auth/signup', formData);
      console.log('Signup successful:', response.data);
      navigate('/login');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMessage(error.response.data?.message || 'Signup failed');
      } else {
        setErrorMessage('Signup failed');
      }
    }
  };

  // MERN stack approach: Redirect to the backend's Google Auth endpoint
  const handleGoogleSignIn = () => {
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-screen">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gray-200 p-3 rounded-2xl"></div>
              <span className="text-3xl font-bold text-gray-100">
                UrbanLiving
              </span>
            </Link>

            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-4xl lg:text-5xl font-bold text-gray-100 leading-tight"
              >
                Start Your
                <span className="block text-white">
                  Smart Co-Living
                </span>
                Journey Today
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-400 leading-relaxed"
              >
                Join thousands of students and young professionals who've transformed their urban living experience with our intelligent platform.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="grid grid-cols-3 gap-6 pt-8"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-200">50K+</div>
                <div className="text-gray-400 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-200">10K+</div>
                <div className="text-gray-400 text-sm">Matches Made</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-200">98%</div>
                <div className="text-gray-400 text-sm">Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-gray-900 rounded-3xl shadow-2xl p-8 lg:p-10"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-100 mb-2">Create Your Account</h2>
              <p className="text-gray-400">Join the future of urban living</p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleSignIn}
              className="w-full bg-gray-800 border-2 border-gray-700 text-gray-200 py-4 rounded-xl font-semibold hover:border-gray-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 mb-6"
            >
              <span>Continue with Google</span>
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-500">Or sign up with email</span>
              </div>
            </div>

            {errorMessage && <div className="text-red-500 font-semibold text-sm mb-4 text-center">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First Name"
                  className="w-full pl-4 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
                  required
                />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last Name"
                  className="w-full pl-4 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className="w-full pl-4 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
                required
              />

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone Number"
                className="w-full pl-4 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
                required
              />

              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
              >
                <option value="student">Student</option>
                <option value="vendor">vendor</option>
                <option value="property-owner">Property Owner</option>
              </select>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full pl-4 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
                required
              />

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full pl-4 pr-4 py-3 border border-gray-700 bg-gray-800 text-white rounded-xl focus:ring-2 focus:ring-gray-600 focus:border-transparent transition-all duration-200"
                required
              />

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleChange}
                  className="mt-1 h-4 w-4 text-gray-200 focus:ring-gray-600 border-gray-700 rounded bg-gray-800"
                  required
                />
                <label className="text-sm text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-gray-200 hover:text-white font-medium">
                    Terms of Service
                  </a>{' '} and{' '}
                  <a href="#" className="text-gray-200 hover:text-white font-medium">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-gray-200 text-gray-900 py-4 rounded-xl font-semibold hover:bg-white transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg"
              >
                <span>Create Account</span>
                <ArrowRight className="h-5 w-5" />
              </motion.button>
            </form>

            <div className="text-center mt-6">
              <p className="text-gray-400">
                Already have an account?{' '}
                <Link to="/login" className="text-gray-200 hover:text-white font-semibold">
                  Sign In
                </Link>
              </p>
            </div>

            <div className="flex items-center justify-center space-x-2 mt-6 text-gray-500 text-sm">
              <Shield className="h-4 w-4" />
              <span>Your data is secure and encrypted</span>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
