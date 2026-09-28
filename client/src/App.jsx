import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Layout & Route Guards
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import CreateTicket from './pages/CreateTicket';
import TicketDetails from './pages/TicketDetails';
import UsersManagement from './pages/UsersManagement';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Authenticated Protected Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/admin/dashboard" element={<Navigate to="/dashboard" replace />} />

              <Route path="/tickets" element={<Tickets />} />
              <Route path="/admin/tickets" element={<Navigate to="/tickets" replace />} />
              <Route path="/tickets/new" element={<CreateTicket />} />
              <Route path="/tickets/:id" element={<TicketDetails />} />

              <Route path="/notifications" element={<Notifications />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin Only Route */}
              <Route
                path="/admin/users"
                element={
                  <RoleRoute allowedRoles={['ADMIN']}>
                    <UsersManagement />
                  </RoleRoute>
                }
              />

              {/* Catch-all 404 inside layout */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
