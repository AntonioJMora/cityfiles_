import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import CharacterForm from '../forms/CharacterForm';

const STATUS_COLORS = { Activo: 'badge-green', Muerto: 'badge-red', Desaparecido: 'badge-yellow', Retirado: 'badge-gray' };
const FACTIONS = ['Todas', 'LSPD', 'LSFD', 'EMS', 'Gobierno', 'Ballas', 'Vagos', 'Marabunta', 'Lost MC', 'Empresario', 'Civil', 'Otra'];

export default function Characters() {
  const { user, isAdmin } = useAuth();
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [factionFilter, setFactionFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [showForm, setShowForm] = useState(false);

  const fetchCharacters = async () => {
    setLoading(true);
    const q = query(collection(db, 'characters'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    setCharacters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { fetchCharacters(); }, []);

  const handleDelete = async (e, id) => {
    e.preventDefault(); e.stopPropagation();
    if (!window.confirm('¿Eliminar este personaje?')) return;
    await deleteDoc(doc(db, 'characters', id));
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  const filtered = characters.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.serverName || '').toLowerCase().includes(search.toLowerCase());
    const matchFaction = factionFilter === 'Todas' || c.faction === factionFilter;
    const matchStatus = statusFilter === 'Todos' || c.status === statusFilter;
    return matchSearch && matchFaction && matchStatus;
  });

  return (
    <main className="main-content fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>Personajes</h1>
          <span className="page-subtitle">// {characters.length} fichas registradas</span>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)} id="btn-add-character">
          + Añadir Personaje
        </button>
      </div>

      {/* Filters */}
      <div className="search-bar">
        <input
          className="search-input"
          placeholder="Buscar por nombre o servidor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="search-characters"
        />
        <select className="filter-select" value={factionFilter} onChange={e => setFactionFilter(e.target.value)} id="filter-faction">
          {FACTIONS.map(f => <option key={f}>{f}</option>)}
        </select>
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} id="filter-status">
          {['Todos', 'Activo', 'Muerto', 'Desaparecido', 'Retirado'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="icon">🎭</div>
          <h3>No hay personajes</h3>
          <p>Sé el primero en añadir una ficha de personaje</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(char => (
            <Link key={char.id} to={`/characters/${char.id}`} className="card card-yellow" id={`char-card-${char.id}`} style={{ textDecoration: 'none', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <h3>{char.name}</h3>
                <span className={`badge ${STATUS_COLORS[char.status] || 'badge-gray'}`}>{char.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                <span className="badge badge-blue">{char.faction}</span>
                {char.rank && <span className="badge badge-gray">{char.rank}</span>}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
                <Link to={`/servers/${char.serverId}`} onClick={e => e.stopPropagation()} style={{ fontSize: '0.8rem', color: 'var(--neon-green)' }}>
                  🌆 {char.serverName}
                </Link>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{char.age ? `${char.age} años` : ''}</span>
              </div>
              {isAdmin && (
                <button
                  className="btn btn-danger btn-sm"
                  style={{ marginTop: 12 }}
                  onClick={(e) => handleDelete(e, char.id)}
                  id={`delete-char-${char.id}`}
                >
                  🗑 Eliminar
                </button>
              )}
            </Link>
          ))}
        </div>
      )}

      {showForm && (
        <CharacterForm
          onClose={() => setShowForm(false)}
          onCreated={() => { setShowForm(false); fetchCharacters(); }}
        />
      )}
    </main>
  );
}
