import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const EXP_COLORS = { 'Principiante': 'badge-gray', 'Intermedio': 'badge-blue', 'Avanzado': 'badge-yellow', 'Veterano': 'badge-green' };

export default function RoleplayerDetail() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [rp, setRp] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'roleplayers', id));
      if (!snap.exists()) { navigate('/roleplayers'); return; }
      setRp({ id: snap.id, ...snap.data() });
      setLoading(false);
    }
    load();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar este perfil?')) return;
    await deleteDoc(doc(db, 'roleplayers', id));
    navigate('/roleplayers');
  };

  if (loading) return <main className="main-content"><div className="loading"><div className="spinner" /></div></main>;

  return (
    <main className="main-content fade-in">
      <Link to="/roleplayers" className="back-link">← Volver a Roleadores</Link>

      <div className="detail-grid">
        {/* Sidebar */}
        <div className="detail-sidebar">
          <div style={{ fontSize: '3.5rem', textAlign: 'center', marginBottom: 16 }}>👤</div>
          <h1 style={{ fontSize: '1.6rem', textAlign: 'center', color: 'var(--neon-blue)', marginBottom: 8 }}>
            {rp.username}
          </h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            <span className={`badge ${EXP_COLORS[rp.experience] || 'badge-gray'}`}>{rp.experience}</span>
          </div>

          <div className="info-block" style={{ marginBottom: 16 }}>
            <h3>Información</h3>
            <div className="info-row"><span className="label">Disponibilidad</span><span className="value">{rp.availability || '—'}</span></div>
            {rp.discord && <div className="info-row"><span className="label">Discord</span><span className="mono" style={{ fontSize: '0.8rem' }}>{rp.discord}</span></div>}
          </div>

          {rp.favoriteGenres?.length > 0 && (
            <div className="info-block" style={{ marginBottom: 16 }}>
              <h3>Géneros favoritos</h3>
              <div className="tags" style={{ marginTop: 8 }}>
                {rp.favoriteGenres.map(g => <span key={g} className="badge badge-blue">{g}</span>)}
              </div>
            </div>
          )}

          {rp.servers?.length > 0 && (
            <div className="info-block" style={{ marginBottom: 16 }}>
              <h3>Servidores activos</h3>
              <div className="tags" style={{ marginTop: 8 }}>
                {rp.servers.map(s => <span key={s} className="badge badge-green">{s}</span>)}
              </div>
            </div>
          )}

          {isAdmin && (
            <button className="btn btn-danger" style={{ width: '100%', justifyContent: 'center' }} onClick={handleDelete} id="btn-delete-rp">
              🗑 Eliminar Perfil
            </button>
          )}
        </div>

        {/* Main */}
        <div className="detail-main">
          {rp.bio && (
            <div className="info-block">
              <h3>Sobre mí</h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{rp.bio}</p>
            </div>
          )}

          {rp.style && (
            <div className="info-block">
              <h3>Estilo de rol</h3>
              <p style={{ color: 'var(--text-primary)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{rp.style}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
