import React, { useState } from "react";
import axios from "axios";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { motion } from "framer-motion";

interface LoginForm {
  email: string;
  password: string;
}

// Reusable logout function to be used anywhere in your app (e.g., in a header component)
export const handleLogout = (navigate: NavigateFunction) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  navigate("/login");
};

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginForm>({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:4000/auth/login", formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error) &&
        error.response &&
        typeof error.response.data?.message === 'string'
      ) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // MERN stack approach: Redirect to the backend's Google Auth endpoint
  const handleGoogleSignIn = () => {
    setLoading(true);
    // The backend will handle the OAuth flow and redirect back to the client
    window.location.href = "http://localhost:4000/auth/google";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="w-full max-w-md bg-gray-900 p-8 rounded-2xl shadow-xl">
        <h1 className="text-3xl font-bold text-gray-100 text-center mb-8">Sign In</h1>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
              Email address
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-700 bg-gray-800 text-white focus:ring-2 focus:ring-gray-600 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          {errorMessage && (
            <div className="text-sm text-red-500 font-semibold text-center">{errorMessage}</div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gray-200 text-gray-900 py-3 rounded-xl font-semibold hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </motion.button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-900 px-2 text-gray-400">or</span>
          </div>
        </div>

        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full flex items-center justify-center space-x-2 py-3 border border-gray-700 rounded-xl font-semibold bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><g fill="none" fillRule="evenodd"><path d="M14.93 12.012h.001"/><path d="M11.977 12a.013.013 0 1 1 0-.026a.013.013 0 0 1 0 .026z" fill="currentColor"/><path d="M12 2C6.48 2 2 6.48 2 12c0 4.67 3.442 8.52 7.915 9.387c.224.04.307-.098.307-.217v-1.18c-3.348.72-4.053-1.61-4.053-1.61c-.547-1.39-1.334-1.76-1.334-1.76c-1.09-.748.083-.733.083-.733c1.206.085 1.838 1.24 1.838 1.24c1.07 1.838 2.809 1.306 3.504.996c.108-.775.419-1.306.76-1.606c-2.665-.3-5.474-1.332-5.474-5.93c0-1.31.467-2.38 1.23-3.22-.124-.31-.534-1.52.116-3.17c0 0 1.002-.32 3.284 1.22c.954-.265 1.97-.398 2.992-.403c1.02.005 2.036.138 2.99.403c2.28-1.54 3.282-1.22 3.282-1.22c.65 1.65.24 2.86.116 3.17c.764.84 1.23 1.91 1.23 3.22c0 4.59-2.81 5.62-5.475 5.92c.43.37.818 1.102.818 2.22c0 1.608-.014 2.898-.014 3.29c0 .12.083.257.31.216C19.558 20.52 23 16.67 23 12c0-5.52-4.48-10-10-10z"/></g></svg>
          <span>Sign In with Google</span>
        </motion.button>
        <p className="text-sm text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <a href="/signup" className="text-gray-800 hover:underline font-medium">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
