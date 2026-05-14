import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import CharacterForm from '../forms/CharacterForm';
import ServerForm from '../forms/ServerForm';

const STATUS_COLORS = { Activo: 'badge-green', Muerto: 'badge-red', Desaparecido: 'badge-yellow', Retirado: 'badge-gray' };

export default function ServerDetail() {
  const { id } = useParams();
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const [server, setServer] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCharForm, setShowCharForm] = useState(false);
  const [showEditServer, setShowEditServer] = useState(false);

  useEffect(() => {
    async function load() {
      const serverSnap = await getDoc(doc(db, 'servers', id));
      if (!serverSnap.exists()) { navigate('/servers'); return; }
      setServer({ id: serverSnap.id, ...serverSnap.data() });

      const q = query(
        collection(db, 'characters'),
        where('serverId', '==', id),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      setCharacters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    load();
  }, [id, navigate]);

  const handleDeleteServer = async () => {
    if (!window.confirm('¿Eliminar este servidor?')) return;
    await deleteDoc(doc(db, 'servers', id));
    navigate('/servers');
  };

  if (loading) return <main className="main-content"><div className="loading"><div className="spinner" /></div></main>;

  const accent = server.color || 'var(--neon-green)';

  return (
    <main className="main-content fade-in">
      <Link to="/servers" className="back-link">← Volver a Servidores</Link>

      <div className="detail-grid">
        {/* Sidebar info */}
        <div className="detail-sidebar">
          <div style={{ borderLeft: `4px solid ${accent}`, paddingLeft: 16, marginBottom: 20 }}>
            <h1 style={{ color: accent, fontSize: '1.8rem' }}>{server.name}</h1>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              <span className="badge badge-gray">{server.type}</span>
              <span className={`badge ${server.status === 'Activo' ? 'badge-green' : server.status === 'Cerrado' ? 'badge-red' : 'badge-yellow'}`}>
                {server.status}
              </span>
            </div>
          </div>

          <div className="info-block" style={{ marginBottom: 16 }}>
            <h3>Información</h3>
            <div className="info-row"><span className="label">Slots</span><span className="value">{server.slots || '—'}</span></div>
            <div className="info-row"><span className="label">Whitelist</span><span className="value">{server.whitelist || '—'}</span></div>
            <div className="info-row"><span className="label">Personajes</span><span className="value">{characters.length}</span></div>
          </div>

          {server.discord && (
            <a href={server.discord} target="_blank" rel="noreferrer" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }}>
              Discord ↗
            </a>
          )}

          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }} onClick={() => setShowCharForm(true)} id="btn-add-char">
            + Añadir Personaje
          </button>

          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginBottom: 12 }} onClick={() => setShowEditServer(true)}>
            {isAdmin || server.createdBy === user.uid ? '✏️ Editar Servidor' : '📝 Sugerir Edición'}
          </button>

          {(isAdmin || server.createdBy === user.uid) && (
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDeleteServer} id="btn-delete-server">
              🗑 Eliminar Servidor
            </button>
          )}
        </div>

        {/* Main content */}
        <div className="detail-main">
          <div className="info-block">
            <h3>Descripción</h3>
            <p style={{ color: 'var(--text-primary)', lineHeight: 1.8 }}>{server.description || 'Sin descripción.'}</p>
          </div>

          {server.rules && (
            <div className="info-block">
              <h3>Normas</h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{server.rules}</p>
            </div>
          )}

          {/* Characters list */}
          <div>
            <h2 style={{ marginBottom: 16 }}>Personajes del servidor</h2>
            {characters.length === 0 ? (
              <div className="empty-state">
                <div className="icon">🎭</div>
                <h3>Sin personajes</h3>
                <p>Añade el primero</p>
              </div>
            ) : (
              <div className="grid-2">
                {characters.map(char => (
                  <Link key={char.id} to={`/characters/${char.id}`} className="card card-yellow" style={{ textDecoration: 'none' }} id={`char-${char.id}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <h3>{char.name}</h3>
                      <span className={`badge ${STATUS_COLORS[char.status] || 'badge-gray'}`}>{char.status}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span className="badge badge-blue">{char.job || 'Sin empleo'}</span>
                      <span className="badge badge-gray">{char.legalType}</span>
                      {char.illegalGroup && <span className="badge badge-red">{char.illegalGroup}</span>}
                      {char.rank && <span className="badge badge-gray">{char.rank}</span>}
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>Jugador: <span className="mono">{char.player || '—'}</span></p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCharForm && (
        <CharacterForm
          preselectedServer={{ id, name: server.name }}
          onClose={() => setShowCharForm(false)}
          onCreated={(newChar) => { setShowCharForm(false); setCharacters(prev => [newChar, ...prev]); }}
        />
      )}

      {showEditServer && (
        <ServerForm
          initialData={server}
          onClose={() => setShowEditServer(false)}
          onCreated={(newData) => {
            if (isAdmin || server.createdBy === user.uid) setServer(newData);
            setShowEditServer(false);
          }}
        />
      )}
    </main>
  );
}
