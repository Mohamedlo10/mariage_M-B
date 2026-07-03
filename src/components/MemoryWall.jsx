import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, CheckCircle, X, ChevronLeft, ChevronRight, Download, CheckSquare, Square, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { compressImage } from '../lib/compressImage';
import styles from './MemoryWall.module.css';

// Photos de base — toujours affichées en premier
const PREDEFINED_PHOTOS = [
  { id: 'base-1', src: '/assets/photo-05-forehead.jpg', subtitle: 'Un instant suspendu', rotation: -5, isBase: true },
  { id: 'base-2', src: '/assets/photo-04-ring.jpg', subtitle: 'Une complicité éternelle', rotation: 3, isBase: true },
  { id: 'base-3', src: '/assets/photo-03-heart.jpg', subtitle: 'Notre amour', rotation: -3, isBase: true },
  { id: 'base-4', src: '/assets/photo-09-sunset.jpg', subtitle: 'M & B', rotation: 6, isBase: true },
];

// Toast rendered via portal to escape transform context
function Toast({ show, name }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <CheckCircle size={20} />
          <span>Merci {name} ! Votre photo a été partagée avec succès.</span>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Lightbox component via portal
function Lightbox({ photos, currentIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  if (currentIndex < 0 || !photos[currentIndex]) return null;
  const photo = photos[currentIndex];
  const imgSrc = photo.src || photo.image_url;

  return createPortal(
    <motion.div
      className={styles.lightboxOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button className={styles.lightboxClose} onClick={onClose}><X size={24} /></button>

      {currentIndex > 0 && (
        <button className={`${styles.lightboxNav} ${styles.lightboxPrev}`} onClick={(e) => { e.stopPropagation(); onPrev(); }}>
          <ChevronLeft size={28} />
        </button>
      )}

      <motion.img
        key={imgSrc}
        src={imgSrc}
        alt={photo.subtitle || photo.author_name || 'Photo'}
        className={styles.lightboxImage}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      />

      <div className={styles.lightboxCaption} onClick={(e) => e.stopPropagation()}>
        {photo.subtitle || photo.author_name}
      </div>

      <div className={styles.lightboxCounter}>
        {currentIndex + 1} / {photos.length}
      </div>

      {currentIndex < photos.length - 1 && (
        <button className={`${styles.lightboxNav} ${styles.lightboxNext}`} onClick={(e) => { e.stopPropagation(); onNext(); }}>
          <ChevronRight size={28} />
        </button>
      )}
    </motion.div>,
    document.body
  );
}

export default function MemoryWall() {
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [authorName, setAuthorName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [lastUploadedId, setLastUploadedId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastName, setToastName] = useState('');

  // Gallery state
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [downloading, setDownloading] = useState(false);

  const fileInputRef = useRef(null);

  // All photos combined for the lightbox navigation
  const allPhotos = [...PREDEFINED_PHOTOS, ...uploadedPhotos];

  useEffect(() => {
    fetchPhotos();
  }, []);

  // Auto-clear the gold highlight after 8 seconds
  useEffect(() => {
    if (!lastUploadedId) return;
    const timer = setTimeout(() => setLastUploadedId(null), 8000);
    return () => clearTimeout(timer);
  }, [lastUploadedId]);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setUploadedPhotos(data);
      }
    } catch (e) {
      console.error('Error fetching photos:', e);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!authorName.trim()) {
      alert('Veuillez entrer votre nom avant de partager une photo.');
      return;
    }

    setUploading(true);
    setUploadProgress('Compression…');

    try {
      const compressedFile = await compressImage(file);
      const fileExt = 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

      setUploadProgress('Upload…');

      const { error: uploadError } = await supabase.storage
        .from('memory-wall')
        .upload(fileName, compressedFile, { contentType: 'image/jpeg', upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('memory-wall')
        .getPublicUrl(fileName);

      const { data: insertedData, error: insertError } = await supabase
        .from('photos')
        .insert({ image_url: urlData.publicUrl, author_name: authorName.trim() })
        .select()
        .single();

      if (insertError) throw insertError;

      // Show toast & highlight
      const uploadedName = authorName.trim();
      setLastUploadedId(insertedData.id);
      setToastName(uploadedName);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);

      setUploadProgress('');
      setAuthorName('');
      await fetchPhotos();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Erreur lors du partage de la photo. Veuillez réessayer.');
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Selection helpers
  const toggleSelect = (photoId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(photoId)) next.delete(photoId);
      else next.add(photoId);
      return next;
    });
  };

  const selectAll = () => {
    const allIds = allPhotos.map(p => p.id);
    setSelectedIds(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  // Download selected photos
  const downloadSelected = async () => {
    if (selectedIds.size === 0) return;
    setDownloading(true);

    const selected = allPhotos.filter(p => selectedIds.has(p.id));

    for (const photo of selected) {
      const url = photo.src || photo.image_url;
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = photo.subtitle || photo.author_name || 'photo';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        // Small delay between downloads
        await new Promise(r => setTimeout(r, 300));
      } catch (err) {
        console.error('Download error for:', url, err);
      }
    }

    setDownloading(false);
  };

  // Lightbox navigation
  const openLightbox = useCallback((index) => {
    if (!selectMode) setLightboxIndex(index);
  }, [selectMode]);

  const closeLightbox = useCallback(() => setLightboxIndex(-1), []);
  const prevLightbox = useCallback(() => setLightboxIndex(i => Math.max(0, i - 1)), []);
  const nextLightbox = useCallback(() => setLightboxIndex(i => Math.min(allPhotos.length - 1, i + 1)), [allPhotos.length]);

  // Click handler for gallery items
  const handlePhotoClick = (globalIndex, photoId) => {
    if (selectMode) {
      toggleSelect(photoId);
    } else {
      openLightbox(globalIndex);
    }
  };

  // Random heights for masonry effect on uploaded photos
  const getMasonrySpan = (index) => {
    const spans = [2, 3, 2, 4, 3, 2, 3, 2, 4, 3];
    return spans[index % spans.length];
  };

  return (
    <section className={styles.memoryWallSection}>
      {/* Toast via portal */}
      <Toast show={showToast} name={toastName} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className={styles.subtitle}>Souvenirs</div>
        <h2 className={styles.title}>Mur des souvenirs</h2>
        <p className={styles.intro}>
          Partagez vos plus beaux moments avec nous. Chaque photo raconte une histoire.
        </p>
      </motion.div>

      {/* Upload Controls */}
      <motion.div
        className={styles.uploadControls}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <input
          type="text"
          placeholder="Votre nom"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className={styles.inputName}
          disabled={uploading}
        />
        <label className={styles.uploadLabel} style={uploading ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
          <Upload size={18} />
          {uploading ? uploadProgress : 'Partager une photo'}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className={styles.uploadInput}
            disabled={uploading}
          />
        </label>
      </motion.div>

      {/* Gallery toolbar */}
      <motion.div
        className={styles.galleryToolbar}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <button
          className={`${styles.toolbarBtn} ${selectMode ? styles.toolbarBtnActive : ''}`}
          onClick={() => {
            if (selectMode) clearSelection();
            else setSelectMode(true);
          }}
        >
          {selectMode ? <XCircle size={16} /> : <CheckSquare size={16} />}
          {selectMode ? 'Annuler' : 'Sélectionner'}
        </button>

        {selectMode && (
          <>
            <button className={styles.toolbarBtn} onClick={selectAll}>
              <CheckSquare size={16} /> Tout sélectionner
            </button>
            {selectedIds.size > 0 && (
              <button
                className={`${styles.toolbarBtn} ${styles.toolbarBtnDownload}`}
                onClick={downloadSelected}
                disabled={downloading}
              >
                <Download size={16} />
                {downloading ? 'Téléchargement…' : `Télécharger (${selectedIds.size})`}
              </button>
            )}
          </>
        )}
      </motion.div>

      {/* Photos de base — Polaroid style */}
      <div className={styles.polaroidBoard}>
        <AnimatePresence>
          {PREDEFINED_PHOTOS.map((photo, index) => (
            <motion.div
              key={photo.id}
              className={`${styles.polaroid} ${selectMode && selectedIds.has(photo.id) ? styles.polaroidSelected : ''}`}
              initial={{ opacity: 0, scale: 0.8, rotate: photo.rotation - 10, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, rotate: photo.rotation, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: index * 0.2, type: 'spring', damping: 15, stiffness: 100 }}
              onClick={() => handlePhotoClick(index, photo.id)}
            >
              {selectMode && (
                <div className={styles.selectCheckbox}>
                  {selectedIds.has(photo.id) ? <CheckSquare size={22} /> : <Square size={22} />}
                </div>
              )}
              <img src={photo.src} alt={photo.subtitle} className={styles.polaroidPhoto} draggable="false" loading="lazy" />
              <div className={styles.polaroidAuthor}>{photo.subtitle}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Photos des invités — Pinterest masonry grid */}
      {uploadedPhotos.length > 0 && (
        <>
          <motion.div
            className={styles.guestSeparator}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <div className={styles.separatorLine} />
            <div className={styles.separatorText}>
              <ImageIcon size={16} />
              Photos des invités · {uploadedPhotos.length}
            </div>
            <div className={styles.separatorLine} />
          </motion.div>

          <div className={styles.masonryGrid}>
            {uploadedPhotos.map((photo, index) => {
              const globalIndex = PREDEFINED_PHOTOS.length + index;
              const isLatest = photo.id === lastUploadedId;
              const isSelected = selectedIds.has(photo.id);

              return (
                <motion.div
                  key={photo.id}
                  className={`${styles.masonryItem} ${isLatest ? styles.masonryItemHighlight : ''} ${isSelected ? styles.masonryItemSelected : ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ delay: (index % 6) * 0.1, duration: 0.5 }}
                  onClick={() => handlePhotoClick(globalIndex, photo.id)}
                >
                  {selectMode && (
                    <div className={styles.selectCheckbox}>
                      {isSelected ? <CheckSquare size={22} /> : <Square size={22} />}
                    </div>
                  )}
                  <img
                    src={photo.image_url}
                    alt={`Photo de ${photo.author_name}`}
                    className={styles.masonryPhoto}
                    draggable="false"
                    loading="lazy"
                  />
                  <div className={styles.masonryOverlay}>
                    <span className={styles.masonryAuthor}>{photo.author_name}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex >= 0 && (
          <Lightbox
            photos={allPhotos}
            currentIndex={lightboxIndex}
            onClose={closeLightbox}
            onPrev={prevLightbox}
            onNext={nextLightbox}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
