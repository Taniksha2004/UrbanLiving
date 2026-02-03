// src/components/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth(); // ✅ Get isLoading from context

  // ✅ If context is still loading, wait before deciding
  if (isLoading) {
    return null; // Or return a loading spinner component
  }

  // Now, if loading is finished, check the user
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.userType)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;