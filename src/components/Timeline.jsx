import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import styles from './Timeline.module.css';

const eventsDay1 = [
  { time: '17h00', title: 'Takk Diakkaa', location: 'Yeumbeul Tableau Orange, Dakar' },
  { time: '20h00', title: 'Cérémonie (Nikah)', location: 'Yeumbeul Tableau Orange, Dakar' }
];

const eventsDay2 = [
  { time: 'Journée', title: 'Yendou à Niagg', location: 'Arrêt 81' }
];

const EventRow = ({ event }) => {
  return (
    <div className={styles.eventRow}>
      <motion.div 
        className={styles.eventNode}
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      />
      <motion.div 
        className={styles.eventCard}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        <div className={styles.eventName}>{event.title}</div>
        <div className={styles.eventLocation}>{event.location}</div>
        <div className={styles.eventTime}>{event.time}</div>
      </motion.div>
    </div>
  );
};

export default function Timeline() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section className={styles.timelineSection} id="programme">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className={styles.subtitle}>Le déroulé</div>
        <h2 className={styles.title}>Notre chemin, jour après jour</h2>
        <p className={styles.intro}>
          Suivez le sentier doré à travers nos deux jours de célébration.
        </p>
      </motion.div>

      <div className={styles.timelineContainer} ref={containerRef}>
        <div className={styles.goldenThreadWrapper}>
          <motion.div 
            className={styles.goldenThread}
            style={{ scaleY }}
          />
        </div>

        <div className={styles.dayBlock}>
          <motion.h3 
            className={styles.dayTitle}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            Samedi 11 Juillet 2026
          </motion.h3>
          {eventsDay1.map((ev, i) => (
            <EventRow key={i} event={ev} />
          ))}
        </div>

        <div className={styles.dayBlock}>
          <motion.h3 
            className={styles.dayTitle}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            Dimanche 12 Juillet 2026
          </motion.h3>
          {eventsDay2.map((ev, i) => (
            <EventRow key={i} event={ev} />
          ))}
        </div>
      </div>
    </section>
  );
}
