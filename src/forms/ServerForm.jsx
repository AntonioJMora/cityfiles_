import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const TYPES    = ['Realista', 'Semirealista', 'Temático', 'Hardcore', 'Casual'];
const STATUSES = ['Activo', 'En desarrollo', 'Cerrado'];
const COLORS   = ['#00ff88', '#ffd700', '#00cfff', '#ff3b5c', '#bf9fff', '#ff8c00', '#00e5ff'];

export default function ServerForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'Semirealista', status: 'Activo',
    slots: '', whitelist: '', description: '', rules: '',
    discord: '', color: '#00ff88',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'servers'), {
        ...form,
        slots: form.slots ? Number(form.slots) : null,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      onCreated({ id: docRef.id, ...form });
    } catch (err) {
      console.error(err);
      alert('Error al guardar. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>🌆 Nuevo Servidor</h2>
          <button className="modal-close" onClick={onClose} id="close-server-form">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Nombre */}
            <div className="form-group span-2">
              <label>Nombre del servidor *</label>
              <input className="form-control" placeholder="Ej: WTLS RP" value={form.name} onChange={e => set('name', e.target.value)} required id="input-server-name" />
            </div>

            {/* Tipo */}
            <div className="form-group">
              <label>Tipo</label>
              <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)} id="select-server-type">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            {/* Estado */}
            <div className="form-group">
              <label>Estado</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)} id="select-server-status">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Slots */}
            <div className="form-group">
              <label>Slots</label>
              <input className="form-control" type="number" placeholder="Ej: 64" value={form.slots} onChange={e => set('slots', e.target.value)} id="input-server-slots" />
            </div>

            {/* Whitelist */}
            <div className="form-group">
              <label>Whitelist</label>
              <input className="form-control" placeholder="Ej: Formulario Discord" value={form.whitelist} onChange={e => set('whitelist', e.target.value)} id="input-server-whitelist" />
            </div>

            {/* Color */}
            <div className="form-group span-2">
              <label>Color de acento</label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {COLORS.map(c => (
                  <button type="button" key={c} onClick={() => set('color', c)}
                    style={{ width: 32, height: 32, borderRadius: '50%', background: c, border: form.color === c ? '3px solid #fff' : '2px solid transparent', cursor: 'pointer' }}
                    id={`color-${c.replace('#', '')}`}
                  />
                ))}
                <input type="color" value={form.color} onChange={e => set('color', e.target.value)} style={{ width: 40, height: 32, border: 'none', borderRadius: 6, background: 'none', cursor: 'pointer' }} />
              </div>
            </div>

            {/* Discord */}
            <div className="form-group span-2">
              <label>Enlace Discord</label>
              <input className="form-control" placeholder="https://discord.gg/..." value={form.discord} onChange={e => set('discord', e.target.value)} id="input-server-discord" />
            </div>

            {/* Descripción */}
            <div className="form-group span-2">
              <label>Descripción *</label>
              <textarea className="form-control" placeholder="Describe el servidor..." value={form.description} onChange={e => set('description', e.target.value)} rows={4} id="input-server-desc" />
            </div>

            {/* Normas */}
            <div className="form-group span-2">
              <label>Normas (opcional)</label>
              <textarea className="form-control" placeholder="Normas del servidor..." value={form.rules} onChange={e => set('rules', e.target.value)} rows={3} id="input-server-rules" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-server-form">
              {loading ? 'Guardando...' : '+ Crear Servidor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
