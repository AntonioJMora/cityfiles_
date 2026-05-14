import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Home from './pages/Home';
import Servers from './pages/Servers';
import ServerDetail from './pages/ServerDetail';
import Characters from './pages/Characters';
import CharacterDetail from './pages/CharacterDetail';
import Roleplayers from './pages/Roleplayers';
import RoleplayerDetail from './pages/RoleplayerDetail';
import AdminPanel from './pages/AdminPanel';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <div className="app-layout">
      {user && <Navbar />}
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />

        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/servers" element={<ProtectedRoute><Servers /></ProtectedRoute>} />
        <Route path="/servers/:id" element={<ProtectedRoute><ServerDetail /></ProtectedRoute>} />
        <Route path="/characters" element={<ProtectedRoute><Characters /></ProtectedRoute>} />
        <Route path="/characters/:id" element={<ProtectedRoute><CharacterDetail /></ProtectedRoute>} />
        <Route path="/roleplayers" element={<ProtectedRoute><Roleplayers /></ProtectedRoute>} />
        <Route path="/roleplayers/:id" element={<ProtectedRoute><RoleplayerDetail /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
