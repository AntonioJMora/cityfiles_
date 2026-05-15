import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const LEGAL_TYPES = ['Legal', 'Civil legal', 'Civil ilegal', 'Ilegal'];
const STATUSES = ['Activo', 'Muerto', 'Desaparecido', 'Retirado'];

// Valida que una URL sea http/https y no un esquema peligroso
function isValidImageUrl(url) {
  if (!url) return true; // campo opcional, vacío es válido
  try {
    const u = new URL(url);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

export default function CharacterForm({ initialData, preselectedServer, onClose, onCreated }) {
  const { user, isAdmin } = useAuth();
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState('');
  const [form, setForm] = useState(initialData || {
    name: '', serverId: preselectedServer?.id || '', serverName: preselectedServer?.name || '',
    age: '', race: '', job: '', rank: '', legalType: 'Civil legal', illegalGroup: '', status: 'Activo',
    appearance: '', backstory: '', personality: '', skills: '', curiosities: '', player: '', imageUrl: ''
  });

  useEffect(() => {
    if (!preselectedServer && !initialData) {
      import('firebase/firestore').then(({ getDocs, query, collection, orderBy }) => {
        getDocs(query(collection(db, 'servers'), orderBy('name'))).then(snap => {
          setServers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      });
    }
  }, [preselectedServer, initialData]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleImageChange = (e) => {
    const url = e.target.value;
    set('imageUrl', url);
    if (url && !isValidImageUrl(url)) {
      setImageError('La URL debe empezar por https:// o http://');
    } else {
      setImageError('');
    }
  };

  const handleServerChange = (e) => {
    const id = e.target.value;
    const srv = servers.find(s => s.id === id);
    setForm(prev => ({ ...prev, serverId: id, serverName: srv?.name || '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.serverId) return;

    // Validación de imagen antes de enviar
    if (form.imageUrl && !isValidImageUrl(form.imageUrl)) {
      setImageError('La URL debe empezar por https:// o http://');
      return;
    }

    setLoading(true);
    try {
      const charData = {
        ...form,
        illegalGroup: (form.legalType === 'Civil ilegal' || form.legalType === 'Ilegal') ? form.illegalGroup : '',
        age: form.age ? Number(form.age) : null,
      };

      if (initialData) {
        if (isAdmin || initialData.createdBy === user.uid) {
          await updateDoc(doc(db, 'characters', initialData.id), charData);
          onCreated({ ...initialData, ...charData });
        } else {
          await addDoc(collection(db, 'pendingEdits'), {
            targetCollection: 'characters',
            targetDocId: initialData.id,
            targetName: initialData.name,
            suggestedBy: user.displayName || user.email,
            newData: charData,
            createdAt: serverTimestamp()
          });
          alert('Tu sugerencia de edición ha sido enviada a moderación.');
          onClose();
        }
      } else {
        const docRef = await addDoc(collection(db, 'characters'), {
          ...charData,
          createdBy: user.uid,
          createdAt: serverTimestamp(),
        });
        onCreated({ id: docRef.id, ...charData });
      }
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
          <h2>{initialData ? '✏️ Editar Personaje' : '🎭 Nueva Ficha de Personaje'}</h2>
          <button className="modal-close" onClick={onClose} id="close-char-form">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {/* Nombre */}
            <div className="form-group span-2">
              <label>Nombre del personaje *</label>
              <input className="form-control" placeholder="Ej: John Mercer" value={form.name} onChange={e => set('name', e.target.value)} required id="input-char-name" />
            </div>

            {/* Foto URL */}
            <div className="form-group span-2">
              <label>URL de Foto del personaje (opcional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="Ej: https://imgur.com/foto.jpg"
                value={form.imageUrl}
                onChange={handleImageChange}
                id="input-char-image"
                style={imageError ? { borderColor: '#E24B4A' } : {}}
              />
              {imageError && (
                <span style={{ fontSize: '0.78rem', color: '#A32D2D', marginTop: 4, display: 'block' }}>
                  {imageError}
                </span>
              )}
            </div>

            {/* Servidor */}
            <div className="form-group span-2">
              <label>Servidor *</label>
              {(preselectedServer || initialData) ? (
                <input className="form-control" value={form.serverName} disabled />
              ) : (
                <select className="form-control" value={form.serverId} onChange={handleServerChange} required id="select-char-server">
                  <option value="">— Selecciona un servidor —</option>
                  {servers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              )}
            </div>

            {/* Trabajo */}
            <div className="form-group">
              <label>Trabajo / Ocupación</label>
              <input className="form-control" placeholder="Ej: Mecánico" value={form.job} onChange={e => set('job', e.target.value)} id="input-char-job" />
            </div>

            {/* Rango */}
            <div className="form-group">
              <label>Rango / Cargo</label>
              <input className="form-control" placeholder="Ej: Jefe de taller" value={form.rank} onChange={e => set('rank', e.target.value)} id="input-char-rank" />
            </div>

            {/* Legalidad */}
            <div className="form-group">
              <label>Tipo de legalidad</label>
              <select className="form-control" value={form.legalType} onChange={e => set('legalType', e.target.value)} id="select-char-legal">
                {LEGAL_TYPES.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>

            {/* Grupo Ilegal */}
            {(form.legalType === 'Civil ilegal' || form.legalType === 'Ilegal') && (
              <div className="form-group">
                <label>Grupo Ilegal</label>
                <input className="form-control" placeholder="Ej: Ballas, Vagos..." value={form.illegalGroup} onChange={e => set('illegalGroup', e.target.value)} id="input-char-illegalgroup" />
              </div>
            )}

            {/* Estado */}
            <div className="form-group">
              <label>Estado del personaje</label>
              <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)} id="select-char-status">
                {STATUSES.map(s => <option key={s}>{s}</option>)}
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

            {/* Curiosidades */}
            <div className="form-group span-2">
              <label>Curiosidades</label>
              <textarea className="form-control" placeholder="Manías, miedos, detalles interesantes..." value={form.curiosities} onChange={e => set('curiosities', e.target.value)} rows={3} id="input-char-curiosities" />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading || !!imageError} id="submit-char-form">
              {loading ? 'Guardando...' : initialData ? 'Guardar Cambios' : '+ Crear Personaje'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}