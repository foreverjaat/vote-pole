import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/shared/Sidebar';
import Spinner from './components/shared/Spinner';

// for navbar
import Navbar from './components/shared/Navbar';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import StudentDashboard from './pages/student/StudentDashboard';
import VoteListPage from './pages/student/VoteListPage';
import VotePage from './pages/student/VotePage';
import ResultsListPage from './pages/student/ResultsListPage';
import ResultsPage from './pages/student/ResultsPage';
import ProfilePage from './pages/student/ProfilePage';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageElections from './pages/admin/ManageElections';
import ManageCandidates from './pages/admin/ManageCandidates';
import AdminResults from './pages/admin/AdminResults';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  return children;
}

function AppLayout({ children }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
      <Sidebar />
      <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>{children}</main>
    </div>
  );
}

// NEW ROUTES 

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/*  Public Routes WITH Navbar */}
      <Route path="/login" element={
        <PublicRoute>
          <>
            <Navbar />
            <Login />
          </>
        </PublicRoute>
      } />

      <Route path="/register" element={
        <PublicRoute>
          <>
            <Navbar />
            <Register />
          </>
        </PublicRoute>
      } />

      <Route path="/forgot-password" element={
        <PublicRoute>
          <>
            <Navbar />
            <ForgotPassword />
          </>
        </PublicRoute>
      } />

      {/* Private Routes (NO Navbar, only Sidebar via AppLayout) */}
      <Route path="/dashboard" element={<PrivateRoute><AppLayout><StudentDashboard /></AppLayout></PrivateRoute>} />
      <Route path="/vote-list" element={<PrivateRoute><AppLayout><VoteListPage /></AppLayout></PrivateRoute>} />
      <Route path="/vote/:electionId" element={<PrivateRoute><AppLayout><VotePage /></AppLayout></PrivateRoute>} />
      <Route path="/results-list" element={<PrivateRoute><AppLayout><ResultsListPage /></AppLayout></PrivateRoute>} />
      <Route path="/results/:electionId" element={<PrivateRoute><AppLayout><ResultsPage /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><ProfilePage /></AppLayout></PrivateRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<PrivateRoute adminOnly><AppLayout><AdminDashboard /></AppLayout></PrivateRoute>} />
      <Route path="/admin/elections" element={<PrivateRoute adminOnly><AppLayout><ManageElections /></AppLayout></PrivateRoute>} />
      <Route path="/admin/candidates" element={<PrivateRoute adminOnly><AppLayout><ManageCandidates /></AppLayout></PrivateRoute>} />
      <Route path="/admin/results/:electionId" element={<PrivateRoute adminOnly><AppLayout><AdminResults /></AppLayout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} newestOnTop theme="light" />
      </Router>
    </AuthProvider>
  );
}
