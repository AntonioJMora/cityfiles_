import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, getDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const [edits, setEdits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEdits = async () => {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'pendingEdits')));
    const editsData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    const withDiffs = await Promise.all(editsData.map(async (edit) => {
      try {
        const originalSnap = await getDoc(doc(db, edit.targetCollection, edit.targetDocId));
        const originalData = originalSnap.exists() ? originalSnap.data() : {};
        
        const diff = {};
        for (const key in edit.newData) {
          // Ignorar metadata
          if (key === 'createdAt' || key === 'createdBy') continue;
          
          if (JSON.stringify(edit.newData[key]) !== JSON.stringify(originalData[key])) {
             diff[key] = {
               old: originalData[key],
               new: edit.newData[key]
             };
          }
        }
        return { ...edit, diff };
      } catch (err) {
        return { ...edit, diff: { 'Error': { old: 'N/A', new: 'No se pudo cargar el original' } } };
      }
    }));
    
    setEdits(withDiffs);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) fetchEdits();
  }, [isAdmin]);

  const handleApprove = async (editId, targetCollection, targetDocId, newData) => {
    try {
      await updateDoc(doc(db, targetCollection, targetDocId), newData);
      await deleteDoc(doc(db, 'pendingEdits', editId));
      setEdits(prev => prev.filter(e => e.id !== editId));
    } catch (e) {
      console.error(e);
      alert('Error aprobando la edición');
    }
  };

  const handleReject = async (editId) => {
    if (!window.confirm('¿Rechazar esta sugerencia?')) return;
    try {
      await deleteDoc(doc(db, 'pendingEdits', editId));
      setEdits(prev => prev.filter(e => e.id !== editId));
    } catch (e) {
      console.error(e);
      alert('Error rechazando la edición');
    }
  };

  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <main className="main-content fade-in">
      <div className="page-header">
        <div className="page-title">
          <h1>🛡️ Panel de Administración</h1>
          <span className="page-subtitle">// Ediciones pendientes de moderación</span>
        </div>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : edits.length === 0 ? (
        <div className="empty-state">
          <div className="icon">✅</div>
          <h3>Todo limpio</h3>
          <p>No hay ediciones pendientes de revisar.</p>
        </div>
      ) : (
        <div className="grid-3">
          {edits.map(edit => (
            <div key={edit.id} className="card card-yellow" style={{ position: 'relative' }}>
              <h3 style={{ marginBottom: 8 }}>{edit.targetName}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: 16 }}>
                Colección: <strong style={{ color: 'var(--text-primary)' }}>{edit.targetCollection}</strong><br/>
                Sugerido por: <span className="mono">{edit.suggestedBy}</span>
              </p>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 4, marginBottom: 16 }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--neon-yellow)', marginBottom: 8, fontWeight: 'bold' }}>Cambios propuestos:</p>
                {edit.diff && Object.keys(edit.diff).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {Object.entries(edit.diff).map(([key, vals]) => (
                      <div key={key} style={{ fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 4 }}>
                        <strong style={{ color: 'var(--text-primary)' }}>{key}</strong>
                        <div style={{ color: 'var(--badge-red-text)', textDecoration: 'line-through' }}>
                          - {JSON.stringify(vals.old)}
                        </div>
                        <div style={{ color: 'var(--badge-green-text)' }}>
                          + {JSON.stringify(vals.new)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>No hay cambios (o es idéntico al original).</p>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleApprove(edit.id, edit.targetCollection, edit.targetDocId, edit.newData)}>
                  ✓ Aprobar
                </button>
                <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleReject(edit.id)}>
                  ✕ Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
