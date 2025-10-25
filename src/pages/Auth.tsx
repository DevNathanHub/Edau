
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" replace />;
  }

  // Redirect to login page by default
  // This maintains backward compatibility for any existing links to /auth
  return <Navigate to="/login" replace />;
};

export default Auth;
