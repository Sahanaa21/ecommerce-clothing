import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <p className="text-center mt-10 text-gray-600">Loading...</p>;
  if (!user.isAdmin) return <Navigate to="/" />;

  return children;
};

export default AdminRoute;
