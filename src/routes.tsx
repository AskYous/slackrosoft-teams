import { UnauthenticatedTemplate } from '@azure/msal-react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <UnauthenticatedTemplate>
          <Login />
        </UnauthenticatedTemplate>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      {/* Catch-all route to redirect unknown paths to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes; 