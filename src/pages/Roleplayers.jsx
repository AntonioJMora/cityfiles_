import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import RoleplayerForm from '../forms/RoleplayerForm';

const EXP_COLORS = { 'Principiante': 'badge-gray', 'Intermedio': 'badge-blue', 'Avanzado': 'badge-yellow', 'Veterano': 'badge-green' };

export default function Roleplayers() {
  const { isAdmin } = useAuth();
  const [roleplayers, setRoleplayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expFilter, setExpFilter] = useState('Todos');
  const [showForm, setShowForm] = useState(false);

  const fetchRoleplayers = async () => {
    setLoading(true);
    const q = query(collection(db, 'roleplayers'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setRoleplayers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchRoleplayers(); }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('¿Eliminar este perfil?')) return;
    await deleteDoc(doc(db, 'roleplayers', id));
    setRoleplayers(prev => prev.filter(r => r.id !== id));
  };

  const filtered = roleplayers.filter(r => {
    const matchSearch = r.username.toLowerCase().includes(search.toLowerCase());
    const matchExp = expFilter === 'Todos' || r.experience === expFilter;
    return matchSearch && matchExp;
  });

  return (
    <main className="main-content fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Roleadores</h1>
          <span className="page-subtitle">// {roleplayers.length} perfiles registrados</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-add-roleplayer">
          + Añadir Perfil
        </button>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-roleplayers"
        />
        <select className="filter-select" value={expFilter} onChange={e => setExpFilter(e.target.value)} id="filter-experience">
          {['Todos', 'Principiante', 'Intermedio', 'Avanzado', 'Veterano'].map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">👤</div>
          <h3>No hay roleadores</h3>
          <p>Sé el primero en añadir tu perfil</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(rp => (
            <Link key={rp.id} to={`/roleplayers/${rp.id}`} className="card" id={`rp-card-${rp.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <h3 style={{ color: 'var(--neon-blue)' }}>
                  <span style={{ marginRight: 8 }}>👤</span>{rp.username}
                </h3>
                <span className={`badge ${EXP_COLORS[rp.experience] || 'badge-gray'}`}>{rp.experience}</span>
              </div>

              {rp.bio && (
                <p style={{ fontSize: '0.88rem', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {rp.bio}
                </p>
              )}

              {rp.favoriteGenres?.length > 0 && (
                <div className="tags">
                  {rp.favoriteGenres.map(g => (
                    <span key={g} className="badge badge-gray">{g}</span>
                  ))}
                </div>
              )}

              {rp.availability && (
                <p style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 10 }}>
                  🕐 {rp.availability}
                </p>
              )}

              {isAdmin && (
                <button
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={(e) => handleDelete(e, rp.id)}
                  id={`delete-rp-${rp.id}`}
                >
                  🗑 Eliminar
                </button>
              )}
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <RoleplayerForm
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); fetchRoleplayers(); }}
        />
      )}
    </main>
  );
}
