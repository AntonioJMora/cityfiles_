import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        CITY<span>FILES</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/"          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end>
          Inicio
        </NavLink>
        <NavLink to="/servers"   className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Servidores
        </NavLink>
        <NavLink to="/characters" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Personajes
        </NavLink>
        <NavLink to="/roleplayers" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          Roleadores
        </NavLink>
        {isAdmin && (
          <span className="badge badge-yellow" style={{ alignSelf: 'center', marginLeft: 8 }}>
            Admin
          </span>
        )}
      </div>

      <div className="navbar-user">
        {user?.photoURL && (
          <img src={user.photoURL} alt="avatar" className="user-avatar" />
        )}
        <span className="user-name">{user?.displayName?.split(' ')[0]}</span>
        <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
}
