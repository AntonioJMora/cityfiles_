import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const STATUS_COLORS = { Activo: 'badge-green', Muerto: 'badge-red', Desaparecido: 'badge-yellow', Retirado: 'badge-gray' };
const ALIGNMENT_LABELS = {
  'Legal Bueno': '⚖️ Legal Bueno', 'Neutral Bueno': '🤝 Neutral Bueno', 'Caótico Bueno': '💥 Caótico Bueno',
  'Legal Neutral': '📋 Legal Neutral', 'Neutral': '⚪ Neutral', 'Caótico Neutral': '🌀 Caótico Neutral',
  'Legal Malvado': '🕴️ Legal Malvado', 'Neutral Malvado': '🐍 Neutral Malvado', 'Caótico Malvado': '💀 Caótico Malvado',
};

export default function CharacterDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'characters', id));
      if (!snap.exists()) { navigate('/characters'); return; }
      setCharacter({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    load();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este personaje?')) return;
    await deleteDoc(doc(db, 'characters', id));
    navigate('/characters');
  };

  if (loading) return <main className="main-content"><div className="loading"><div className="spinner" /></div></main>;

  const c = character;

  return (
    <main className="main-content fade-in">
      <Link to="/characters" className="back-link">← Volver a Personajes</Link>

      <div className="detail-grid">
        {/* Sidebar */}
        <div className="detail-sidebar">
          {c.imageUrl && (
            <div style={{ marginBottom: 20, textAlign: 'center' }}>
              <img src={c.imageUrl} alt={c.name} style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--neon-yellow)' }} />
            </div>
          )}
          <h1 style={{ fontSize: '1.6rem', marginBottom: 8, textAlign: c.imageUrl ? 'center' : 'left' }}>{c.name}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, justifyContent: c.imageUrl ? 'center' : 'flex-start' }}>
            <span className={`badge ${STATUS_COLORS[c.status] || 'badge-gray'}`}>{c.status}</span>
            <span className="badge badge-blue">{c.job || 'Sin empleo'}</span>
            {c.rank && <span className="badge badge-gray">{c.rank}</span>}
          </div>

          <div className="info-block" style={{ marginBottom: 16 }}>
            <h3>Datos básicos</h3>
            <div className="info-row"><span className="label">Edad</span><span className="value">{c.age ? `${c.age} años` : '—'}</span></div>
            <div className="info-row"><span className="label">Origen</span><span className="value">{c.race || '—'}</span></div>
            <div className="info-row"><span className="label">Tipo</span><span className="value">{c.legalType || '—'}</span></div>
            {c.illegalGroup && <div className="info-row"><span className="label">Grupo Ilegal</span><span className="value">{c.illegalGroup}</span></div>}
            <div className="info-row"><span className="label">Alineamiento</span><span className="value">{ALIGNMENT_LABELS[c.alignment] || c.alignment || '—'}</span></div>
            <div className="info-row">
              <span className="label">Servidor</span>
              <Link to={`/servers/${c.serverId}`} style={{ fontSize: '0.85rem' }}>{c.serverName}</Link>
            </div>
            <div className="info-row">
              <span className="label">Jugador</span>
              <span className="mono">{c.player || '—'}</span>
            </div>
          </div>

          {isAdmin && (
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDelete} id="btn-delete-character">
              🗑 Eliminar Personaje
            </button>
          )}
        </div>

        {/* Main */}
        <div className="detail-main">
          {c.appearance && (
            <div className="info-block">
              <h3>Aspecto físico</h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{c.appearance}</p>
            </div>
          )}
          {c.backstory && (
            <div className="info-block">
              <h3>Historia</h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{c.backstory}</p>
            </div>
          )}
          {c.personality && (
            <div className="info-block">
              <h3>Personalidad</h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{c.personality}</p>
            </div>
          )}
          {c.skills && (
            <div className="info-block">
              <h3>Habilidades</h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{c.skills}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
