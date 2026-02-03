import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

type User = {
  firstName: string;
  lastName?: string;
  email: string;
  avatarUrl?: string;
};

const SettingsPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get('http://localhost:4000/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const user = res.data.user;
        setUser(user);
        setAvatarPreview(`http://localhost:4000${user.avatarUrl || ''}`);
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        localStorage.setItem('user', JSON.stringify(user));
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    fetchUser();
  }, []);


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarClick = () => inputRef.current?.click();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // Prepare data for API (either FormData if image, or JSON for name change)
      let response;
      if (avatarFile) {
        const formData = new FormData();
        formData.append('firstName', firstName);
        formData.append('lastName', lastName);
        formData.append('avatar', avatarFile);
        response = await axios.patch(
          'http://localhost:4000/users/profile',
          formData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } else {
        // No image, just send JSON
        response = await axios.patch(
          'http://localhost:4000/users/profile',
          { firstName, lastName },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
      }

      setSuccessMessage('Profile updated!');
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setAvatarPreview(response.data.user.avatarUrl);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred while updating your profile.');
      }
    }
    setLoading(false);
  };

  if (!user) {
    return (
      <div className="max-w-lg mx-auto pt-20 text-center">
        <p className="text-lg text-gray-200">You must be logged in to edit your settings.</p>
        <button
          className="mt-6 px-4 py-2 rounded-lg bg-gray-200 text-gray-900 hover:bg-white"
          onClick={() => navigate('/login')}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pt-20 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold text-gray-100 mb-8">Settings</h1>
        <form
          onSubmit={handleSave}
          className="bg-gray-900 shadow-lg rounded-2xl p-8 flex flex-col gap-6"
          encType={avatarFile ? 'multipart/form-data' : 'application/json'}
        >
          <div className="flex flex-col items-center mb-4">
            {/* Avatar/preview */}
            <div
              onClick={handleAvatarClick}
              className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center border-4 border-gray-700 cursor-pointer hover:shadow-lg transition"
              title="Change Profile Picture"
            >
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-3xl text-gray-300 font-bold">
                  {user.firstName.charAt(0)}
                  {user.lastName && user.lastName.charAt(0)}
                </span>
              )}
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <span className="text-xs text-gray-500 mt-2">Click avatar to upload</span>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-300 text-sm font-semibold mb-1">
                First Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-600 outline-none"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-gray-300 text-sm font-semibold mb-1">
                Last Name
              </label>
              <input
                type="text"
                className="w-full border border-gray-700 bg-gray-800 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-gray-600 outline-none"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-300 text-sm font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full border border-gray-700 px-3 py-2 rounded-lg bg-gray-800 text-gray-500 cursor-not-allowed"
              value={user.email}
              disabled
            />
          </div>
          {/* Feedback */}
          {error && (
            <div className="text-red-500 text-center text-sm">{error}</div>
          )}
          {successMessage && (
            <div className="text-green-600 text-center text-sm">{successMessage}</div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="bg-gray-200 hover:bg-white text-gray-900 py-3 rounded-lg font-semibold tracking-wide shadow mt-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
