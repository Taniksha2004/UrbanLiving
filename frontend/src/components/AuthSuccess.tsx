import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const user = searchParams.get('user');

    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', decodeURIComponent(user));
      navigate('/dashboard');
    } else {
      // Handle the case where the redirect doesn't contain a token or user
      navigate('/login?error=auth-failed');
    }
  }, [searchParams, navigate]);

  return <div>Loading...</div>; // Or a more elaborate loading spinner
};

export default AuthSuccess;
