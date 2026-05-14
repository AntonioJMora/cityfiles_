import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import ServerForm from '../forms/ServerForm';

const SERVER_TYPES = ['Todos', 'Realista', 'Semirealista', 'Temático', 'Hardcore', 'Casual'];
const STATUS_COLORS = { Activo: 'badge-green', 'En desarrollo': 'badge-yellow', Cerrado: 'badge-red' };

export default function Servers() {
  const { user, isAdmin } = useAuth();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [showForm, setShowForm] = useState(false);

  const fetchServers = async () => {
    setLoading(true);
    const q = query(collection(db, 'servers'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setServers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchServers(); }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('¿Eliminar este servidor y todos sus personajes?')) return;
    await deleteDoc(doc(db, 'servers', id));
    setServers(prev => prev.filter(s => s.id !== id));
  };

  const filtered = servers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'Todos' || s.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <main className="main-content fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Servidores</h1>
          <span className="page-subtitle">// {servers.length} servidores registrados</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-add-server">
          + Añadir Servidor
        </button>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Buscar servidor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-servers"
        />
        <select className="filter-select" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} id="filter-server-type">
          {SERVER_TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🌆</div>
          <h3>No hay servidores</h3>
          <p>Sé el primero en añadir un servidor de GTA V RP</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(server => (
            <Link key={server.id} to={`/servers/${server.id}`} className="card" id={`server-${server.id}`} style={{ textDecoration: 'none', position: 'relative' }}>
              <div className="server-accent" style={{ background: server.color || 'var(--neon-green)' }} />
              <div style={{ paddingLeft: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <h3 style={{ color: server.color || 'var(--neon-green)' }}>{server.name}</h3>
                  <span className={`badge ${STATUS_COLORS[server.status] || 'badge-gray'}`}>{server.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                  <span className="badge badge-gray">{server.type}</span>
                  {server.slots && <span className="mono" style={{ fontSize: '0.8rem' }}>{server.slots} slots</span>}
                </div>
                <p style={{ fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {server.description}
                </p>
                {(isAdmin || server.createdBy === user.uid) && (
                  <button
                    className="btn btn-danger btn-sm"
                    style={{ marginTop: 12 }}
                    onClick={(e) => handleDelete(e, server.id)}
                    id={`delete-server-${server.id}`}
                  >
                    🗑 Eliminar
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <ServerForm
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); fetchServers(); }}
        />
      )}
    </main>
  );
}
