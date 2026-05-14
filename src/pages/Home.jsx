import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ servers: 0, characters: 0, roleplayers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [s, c, r] = await Promise.all([
          getCountFromServer(collection(db, 'servers')),
          getCountFromServer(collection(db, 'characters')),
          getCountFromServer(collection(db, 'roleplayers')),
        ]);
        setStats({
          servers: s.data().count,
          characters: c.data().count,
          roleplayers: r.data().count,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <main className="main-content fade-in">
      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">// LOS SANTOS ROLEPLAY //</div>
        <h1>Bienvenido, {user?.displayName?.split(' ')[0]}</h1>
        <p>
          Explora servidores de GTA V RP, fichas de personajes y perfiles de roleadores.
          Añade el tuyo y forma parte de la comunidad.
        </p>
        <div className="hero-actions">
          <Link to="/servers" className="btn btn-primary" id="btn-hero-servers">
            🌆 Ver Servidores
          </Link>
          <Link to="/characters" className="btn btn-secondary" id="btn-hero-characters">
            🎭 Ver Personajes
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ marginBottom: 48 }}>
        <div className="grid-3" style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="stat-card">
            <div className="stat-number">{loading ? '—' : stats.servers}</div>
            <div className="stat-label">Servidores</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--neon-yellow)', textShadow: '0 0 30px rgba(255,215,0,0.4)' }}>
              {loading ? '—' : stats.characters}
            </div>
            <div className="stat-label">Personajes</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--neon-blue)', textShadow: '0 0 30px rgba(0,207,255,0.4)' }}>
              {loading ? '—' : stats.roleplayers}
            </div>
            <div className="stat-label">Roleadores</div>
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section>
        <h2 style={{ marginBottom: 20 }}>Secciones</h2>
        <div className="grid-3">
          <Link to="/servers" className="card" id="link-home-servers" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌆</div>
            <h3>Servidores</h3>
            <p style={{ marginTop: 6, fontSize: '0.9rem' }}>
              Descubre servidores de GTA V RP: realistas, semirealistas, temáticos...
            </p>
          </Link>

          <Link to="/characters" className="card card-yellow" id="link-home-characters" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎭</div>
            <h3>Personajes</h3>
            <p style={{ marginTop: 6, fontSize: '0.9rem' }}>
              Fichas detalladas de personajes: facción, historia, personalidad, habilidades...
            </p>
          </Link>

          <Link to="/roleplayers" className="card" id="link-home-roleplayers" style={{ textDecoration: 'none' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👤</div>
            <h3>Roleadores</h3>
            <p style={{ marginTop: 6, fontSize: '0.9rem' }}>
              Perfiles de jugadores: experiencia, disponibilidad, géneros favoritos...
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
