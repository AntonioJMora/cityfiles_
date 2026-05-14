import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const GENRES       = ['Policial', 'Criminal', 'Político', 'Empresarial', 'Médico', 'Terror', 'Aventura', 'Romántico', 'Drama', 'Cómico'];
const EXPERIENCES  = ['Principiante', 'Intermedio', 'Avanzado', 'Veterano'];
const AVAILABILITY = ['Mañanas', 'Tardes', 'Noches', 'Mañanas/Tardes', 'Tardes/Noches', 'Fines de semana', 'Flexible'];

export default function RoleplayerForm({ onClose, onCreated }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [serverInput, setServerInput] = useState('');
  const [serverList, setServerList] = useState([]);
  const [form, setForm] = useState({
    username: '', bio: '', style: '',
    experience: 'Intermedio', availability: 'Flexible', discord: '',
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const toggleGenre = (g) => {
    setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const addServer = () => {
    const s = serverInput.trim();
    if (s && !serverList.includes(s)) setServerList(prev => [...prev, s]);
    setServerInput('');
  };

  const removeServer = (s) => setServerList(prev => prev.filter(x => x !== s));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim()) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'roleplayers'), {
        ...form,
        favoriteGenres: selectedGenres,
        servers: serverList,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      onCreated({ id: docRef.id, ...form, favoriteGenres: selectedGenres, servers: serverList });
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
          <h2>👤 Nuevo Perfil de Roleador</h2>
          <button className="modal-close" onClick={onClose} id="close-rp-form">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Username */}
            <div className="form-group span-2">
              <label>Nick / Nombre de usuario *</label>
              <input className="form-control" placeholder="Ej: DarkWolf_RP" value={form.username} onChange={e => set('username', e.target.value)} required id="input-rp-username" />
            </div>

            {/* Experiencia */}
            <div className="form-group">
              <label>Nivel de experiencia</label>
              <select className="form-control" value={form.experience} onChange={e => set('experience', e.target.value)} id="select-rp-exp">
                {EXPERIENCES.map(e => <option key={e}>{e}</option>)}
              </select>
            </div>

            {/* Disponibilidad */}
            <div className="form-group">
              <label>Disponibilidad</label>
              <select className="form-control" value={form.availability} onChange={e => set('availability', e.target.value)} id="select-rp-avail">
                {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            {/* Discord */}
            <div className="form-group span-2">
              <label>Discord (opcional)</label>
              <input className="form-control" placeholder="Ej: usuario#1234" value={form.discord} onChange={e => set('discord', e.target.value)} id="input-rp-discord" />
            </div>

            {/* Bio */}
            <div className="form-group span-2">
              <label>Sobre mí</label>
              <textarea className="form-control" placeholder="Cuéntanos quién eres como roleador..." value={form.bio} onChange={e => set('bio', e.target.value)} rows={3} id="input-rp-bio" />
            </div>

            {/* Estilo */}
            <div className="form-group span-2">
              <label>Estilo de rol</label>
              <textarea className="form-control" placeholder="¿Cómo describes tu estilo de roleplay?" value={form.style} onChange={e => set('style', e.target.value)} rows={3} id="input-rp-style" />
            </div>

            {/* Géneros favoritos */}
            <div className="form-group span-2">
              <label>Géneros favoritos (selecciona varios)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
                {GENRES.map(g => (
                  <button
                    type="button" key={g}
                    className={`badge ${selectedGenres.includes(g) ? 'badge-green' : 'badge-gray'}`}
                    style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '6px 12px' }}
                    onClick={() => toggleGenre(g)}
                    id={`genre-${g}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Servidores */}
            <div className="form-group span-2">
              <label>Servidores donde juegas</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input
                  className="form-control"
                  placeholder="Nombre del servidor y Enter"
                  value={serverInput}
                  onChange={e => setServerInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addServer(); }}}
                  id="input-rp-server"
                />
                <button type="button" className="btn btn-secondary btn-sm" onClick={addServer} id="btn-add-rp-server">
                  Añadir
                </button>
              </div>
              {serverList.length > 0 && (
                <div className="tags">
                  {serverList.map(s => (
                    <span key={s} className="badge badge-green" style={{ cursor: 'pointer' }} onClick={() => removeServer(s)}>
                      {s} ✕
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-rp-form">
              {loading ? 'Guardando...' : '+ Crear Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
