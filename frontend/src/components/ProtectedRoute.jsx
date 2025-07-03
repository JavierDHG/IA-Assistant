import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  // Si el usuario está autenticado, renderiza el componente de la ruta solicitada.
  // <Outlet /> es el marcador de posición de react-router para la página anidada (ej: <Chat />).
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Si no está autenticado, lo redirige a la página de login.
  return <Navigate to="/login" />;
};

export default ProtectedRoute;