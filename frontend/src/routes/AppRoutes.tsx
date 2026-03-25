// src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/common/ProtectedRoute';

// Auth Components
import Login from '../components/Auth/Login';
import Signup from '../components/Auth/Signup';

// Dashboard Components
import Dashboard from '../components/Dashboard/Dashboard';

// Interview Components
import InterviewScreen from '../components/Interview/InterviewScreen';

// Feedback Components
import FeedbackScreen from '../components/Feedback/FeedbackScreen';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <InterviewScreen />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/feedback/:sessionId"
        element={
          <ProtectedRoute>
            <FeedbackScreen />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;