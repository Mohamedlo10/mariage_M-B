import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation2 } from 'lucide-react';
import clsx from 'clsx';
import styles from './InteractiveMap.module.css';

const LOCATIONS = [
  {
    id: 1,
    label: 'Samedi · Yeumbeul Tableau Orange',
    query: 'QJCV+9M5 Boutique Orange Yeumbeul, Yeumbeul Sud, Yeumbeul',
    link: 'https://maps.app.goo.gl/4vciZetmH6yBfRtR6'
  },
  {
    id: 2,
    label: 'Dimanche · Niagg, arrêt 81',
    query: '14°48\'39.3"N 17°15\'32.1"W'
  }
];

export default function InteractiveMap() {
  const [activeLoc, setActiveLoc] = useState(LOCATIONS[0]);

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(activeLoc.query)}&output=embed`;
  const gmapsHref = activeLoc.link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeLoc.query)}`;
  const wazeHref = `https://waze.com/ul?q=${encodeURIComponent(activeLoc.query)}&navigate=yes`;

  return (
    <section className={styles.mapSection}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className={styles.subtitle}>S'y rendre</div>
        <h2 className={styles.title}>Le chemin jusqu'à nous</h2>
      </motion.div>

      <motion.div 
        className={styles.tabs}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        {LOCATIONS.map((loc) => (
          <button
            key={loc.id}
            className={clsx(styles.tabBtn, activeLoc.id === loc.id && styles.active)}
            onClick={() => setActiveLoc(loc)}
          >
            {loc.label}
          </button>
        ))}
      </motion.div>

      <motion.div 
        className={styles.mapContainer}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        <div className={styles.iframeWrapper}>
          <AnimatePresence mode="wait">
            <motion.iframe
              key={activeLoc.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              title="Carte du lieu"
              src={mapSrc}
              className={styles.iframe}
              loading="lazy"
            />
          </AnimatePresence>
        </div>
      </motion.div>

      <motion.div 
        className={styles.actions}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8, duration: 1 }}
      >
        <a href={gmapsHref} target="_blank" rel="noopener noreferrer" className={clsx(styles.actionBtn, styles.btnPrimary)}>
          <MapPin size={18} />
          <span>Ouvrir dans Maps</span>
        </a>
        <a href={wazeHref} target="_blank" rel="noopener noreferrer" className={clsx(styles.actionBtn, styles.btnOutline)}>
          <Navigation2 size={18} />
          <span>Ouvrir dans Waze</span>
        </a>
      </motion.div>
    </section>
  );
}
