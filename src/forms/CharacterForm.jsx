import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const FACTIONS   = ['LSPD', 'LSFD', 'EMS', 'Gobierno', 'Ballas', 'Vagos', 'Marabunta', 'Lost MC', 'Empresario', 'Civil', 'Otra'];
const STATUSES   = ['Activo', 'Muerto', 'Desaparecido', 'Retirado'];
const ALIGNMENTS = ['Legal Bueno', 'Neutral Bueno', 'Caótico Bueno', 'Legal Neutral', 'Neutral', 'Caótico Neutral', 'Legal Malvado', 'Neutral Malvado', 'Caótico Malvado'];

export default function CharacterForm({ preselectedServer, onClose, onCreated }) {
  const { user } = useAuth();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', serverId: preselectedServer?.id || '', serverName: preselectedServer?.name || '',
    age: '', race: '', faction: 'Civil', rank: '', status: 'Activo',
    appearance: '', backstory: '', personality: '', skills: '',
    alignment: 'Neutral', player: '',
  });

  useEffect(() => {
    if (!preselectedServer) {
      getDocs(query(collection(db, 'servers'), orderBy('name'))).then(snap => {
        setServers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }
  }, [preselectedServer]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleServerChange = (e) => {
    const id = e.target.value;
    const srv = servers.find(s => s.id === id);
    setForm(prev => ({ ...prev, serverId: id, serverName: srv?.name || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.serverId) return;
    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'characters'), {
        ...form,
        age: form.age ? Number(form.age) : null,
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
          <h2>🎭 Nueva Ficha de Personaje</h2>
          <button className="modal-close" onClick={onClose} id="close-char-form">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Nombre */}
            <div className="form-group span-2">
              <label>Nombre del personaje *</label>
              <input className="form-control" placeholder="Ej: John Mercer" value={form.name} onChange={e => set('name', e.target.value)} required id="input-char-name" />
            </div>

            {/* Servidor */}
            <div className="form-group span-2">
              <label>Servidor *</label>
              {preselectedServer ? (
                <input className="form-control" value={preselectedServer.name} disabled />
              ) : (
                <select className="form-control" value={form.serverId} onChange={handleServerChange} required id="select-char-server">
                  <option value="">— Selecciona un servidor —</option>
                  {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>

            {/* Facción */}
            <div className="form-group">
              <label>Facción</label>
              <select className="form-control" value={form.faction} onChange={e => set('faction', e.target.value)} id="select-char-faction">
                {FACTIONS.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            {/* Rango */}
            <div className="form-group">
              <label>Rango / Cargo</label>
              <input className="form-control" placeholder="Ej: Detective" value={form.rank} onChange={e => set('rank', e.target.value)} id="input-char-rank" />
            </div>

            {/* Estado */}
            <div className="form-group">
              <label>Estado del personaje</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)} id="select-char-status">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Alineamiento */}
            <div className="form-group">
              <label>Alineamiento</label>
              <select className="form-control" value={form.alignment} onChange={e => set('alignment', e.target.value)} id="select-char-alignment">
                {ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
              </select>
            </div>

            {/* Edad */}
            <div className="form-group">
              <label>Edad</label>
              <input className="form-control" type="number" placeholder="Ej: 28" value={form.age} onChange={e => set('age', e.target.value)} id="input-char-age" />
            </div>

            {/* Origen */}
            <div className="form-group">
              <label>Origen / Etnia</label>
              <input className="form-control" placeholder="Ej: Afroamericano" value={form.race} onChange={e => set('race', e.target.value)} id="input-char-race" />
            </div>

            {/* Jugador */}
            <div className="form-group span-2">
              <label>Nick del jugador</label>
              <input className="form-control" placeholder="Tu nick en el servidor" value={form.player} onChange={e => set('player', e.target.value)} id="input-char-player" />
            </div>

            {/* Aspecto */}
            <div className="form-group span-2">
              <label>Aspecto físico</label>
              <textarea className="form-control" placeholder="Describe el aspecto del personaje..." value={form.appearance} onChange={e => set('appearance', e.target.value)} rows={3} id="input-char-appearance" />
            </div>

            {/* Historia */}
            <div className="form-group span-2">
              <label>Historia / Backstory</label>
              <textarea className="form-control" placeholder="Historia del personaje..." value={form.backstory} onChange={e => set('backstory', e.target.value)} rows={4} id="input-char-backstory" />
            </div>

            {/* Personalidad */}
            <div className="form-group span-2">
              <label>Personalidad</label>
              <textarea className="form-control" placeholder="Cómo es el personaje..." value={form.personality} onChange={e => set('personality', e.target.value)} rows={3} id="input-char-personality" />
            </div>

            {/* Habilidades */}
            <div className="form-group span-2">
              <label>Habilidades</label>
              <textarea className="form-control" placeholder="Habilidades y capacidades..." value={form.skills} onChange={e => set('skills', e.target.value)} rows={3} id="input-char-skills" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} id="submit-char-form">
              {loading ? 'Guardando...' : '+ Crear Personaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
