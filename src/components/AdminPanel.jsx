import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Users, Calendar, Download, Trash2, Image as ImageIcon, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import styles from './AdminPanel.module.css';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

export default function AdminPanel() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [rsvpList, setRsvpList] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [activeTab, setActiveTab] = useState('rsvp');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authenticated) {
      fetchData();
    }
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPasswordError('');
    } else {
      setPasswordError('Mot de passe incorrect');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rsvpRes, photosRes] = await Promise.all([
        supabase.from('rsvp').select('*').order('created_at', { ascending: false }),
        supabase.from('photos').select('*').order('created_at', { ascending: false }),
      ]);

      if (rsvpRes.data) setRsvpList(rsvpRes.data);
      if (photosRes.data) setPhotos(photosRes.data);
    } catch (e) {
      console.error('Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const deletePhoto = async (photo) => {
    if (!confirm(`Supprimer la photo de ${photo.author_name} ?`)) return;

    try {
      // Extract filename from URL
      const urlParts = photo.image_url.split('/');
      const fileName = urlParts[urlParts.length - 1];

      // Delete from Storage
      await supabase.storage.from('memory-wall').remove([fileName]);

      // Delete from DB
      await supabase.from('photos').delete().eq('id', photo.id);

      setPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (e) {
      console.error('Delete error:', e);
      alert('Erreur lors de la suppression.');
    }
  };

  const exportCSV = () => {
    const headers = ['Nom', 'Téléphone', 'Jours', 'Date de confirmation'];
    const dayLabels = { 1: 'Samedi 11', 2: 'Dimanche 12' };

    const rows = rsvpList.map(r => [
      r.name,
      r.phone || '',
      r.days.map(d => dayLabels[d] || d).join(' + '),
      new Date(r.created_at).toLocaleDateString('fr-FR', {
        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      }),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rsvp-mariage-mb-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats
  const totalGuests = rsvpList.length;
  const saturdayCount = rsvpList.filter(r => r.days.includes(1)).length;
  const sundayCount = rsvpList.filter(r => r.days.includes(2)).length;
  const bothDaysCount = rsvpList.filter(r => r.days.includes(1) && r.days.includes(2)).length;

  // ── Login Screen ──
  if (!authenticated) {
    return (
      <div className={styles.loginContainer}>
        <motion.form
          className={styles.loginForm}
          onSubmit={handleLogin}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Lock size={32} className={styles.lockIcon} />
          <h1 className={styles.loginTitle}>Administration</h1>
          <p className={styles.loginSubtitle}>Espace réservé aux organisateurs</p>
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className={styles.loginInput}
            autoFocus
          />
          {passwordError && <div className={styles.loginError}>{passwordError}</div>}
          <button type="submit" className={styles.loginBtn}>Accéder</button>
          <a href="#/" className={styles.backLink}>← Retour au site</a>
        </motion.form>
      </div>
    );
  }

  // ── Admin Dashboard ──
  return (
    <div className={styles.adminContainer}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.headerTitle}>Admin — M & B</h1>
        </div>
        <div className={styles.headerRight}>
          <button onClick={fetchData} className={styles.headerBtn} disabled={loading}>
            {loading ? '⏳' : '🔄'} Rafraîchir
          </button>
          <a href="#/" className={styles.headerBtn}>
            <LogOut size={16} /> Quitter
          </a>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <Users size={24} />
          <div className={styles.statValue}>{totalGuests}</div>
          <div className={styles.statLabel}>Total confirmés</div>
        </div>
        <div className={styles.statCard}>
          <Calendar size={24} />
          <div className={styles.statValue}>{saturdayCount}</div>
          <div className={styles.statLabel}>Samedi 11</div>
        </div>
        <div className={styles.statCard}>
          <Calendar size={24} />
          <div className={styles.statValue}>{sundayCount}</div>
          <div className={styles.statLabel}>Dimanche 12</div>
        </div>
        <div className={styles.statCard}>
          <Users size={24} />
          <div className={styles.statValue}>{bothDaysCount}</div>
          <div className={styles.statLabel}>Les deux jours</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'rsvp' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('rsvp')}
        >
          <Users size={16} /> RSVP ({totalGuests})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'photos' ? styles.tabActive : ''}`}
          onClick={() => setActiveTab('photos')}
        >
          <ImageIcon size={16} /> Photos ({photos.length})
        </button>
      </div>

      {/* RSVP Tab */}
      <AnimatePresence mode="wait">
        {activeTab === 'rsvp' && (
          <motion.div
            key="rsvp"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.tabContent}
          >
            <div className={styles.tableActions}>
              <button onClick={exportCSV} className={styles.exportBtn}>
                <Download size={16} /> Exporter CSV
              </button>
            </div>

            {rsvpList.length === 0 ? (
              <div className={styles.emptyState}>Aucune confirmation pour le moment.</div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nom</th>
                      <th>Téléphone</th>
                      <th>Jours</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvpList.map((rsvp, i) => (
                      <tr key={rsvp.id}>
                        <td>{i + 1}</td>
                        <td className={styles.cellName}>{rsvp.name}</td>
                        <td>{rsvp.phone || '—'}</td>
                        <td>
                          <div className={styles.dayBadges}>
                            {rsvp.days.includes(1) && <span className={styles.badge}>Sam 11</span>}
                            {rsvp.days.includes(2) && <span className={styles.badge}>Dim 12</span>}
                          </div>
                        </td>
                        <td className={styles.cellDate}>
                          {new Date(rsvp.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <motion.div
            key="photos"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.tabContent}
          >
            {photos.length === 0 ? (
              <div className={styles.emptyState}>Aucune photo uploadée pour le moment.</div>
            ) : (
              <div className={styles.photoGrid}>
                {photos.map((photo) => (
                  <div key={photo.id} className={styles.photoCard}>
                    <img src={photo.image_url} alt={`Photo de ${photo.author_name}`} className={styles.photoImg} />
                    <div className={styles.photoInfo}>
                      <span className={styles.photoAuthor}>{photo.author_name}</span>
                      <span className={styles.photoDate}>
                        {new Date(photo.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric', month: 'short'
                        })}
                      </span>
                    </div>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => deletePhoto(photo)}
                      title="Supprimer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
