import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import styles from './Hero.module.css';

const fadeUpParams = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" }
};

export default function Hero() {
  // Generate random particles for the magical effect
  const particles = useMemo(() => {
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2px to 6px
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      duration: Math.random() * 10 + 10, // 10s to 20s
      delay: Math.random() * 5
    }));
  }, []);

  return (
    <section className={styles.heroSection}>
      {/* Magical Particles Background */}
      <div className={styles.particles}>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            className={styles.particle}
            style={{
              width: p.size,
              height: p.size,
              left: p.left,
              top: p.top,
            }}
            animate={{
              y: [0, -100, -200],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 0.8, 0]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className={styles.content}>
        <motion.div 
          className={styles.bismillah}
          {...fadeUpParams}
          transition={{ duration: 1, delay: 0.2 }}
        >
          Par la grâce d'Allah
        </motion.div>
        
        <motion.h1 
          className={styles.names}
          {...fadeUpParams}
          transition={{ duration: 1.2, delay: 0.4 }}
        >
          Mamadou<br/>& Binetou
        </motion.h1>
        
        <motion.div 
          className={styles.quote}
          {...fadeUpParams}
          transition={{ duration: 1, delay: 0.6 }}
        >
          « Et parmi Ses signes, Il a créé pour vous, de vous-mêmes, des épouses afin que vous trouviez auprès d'elles la tranquillité, et Il a placé entre vous de l'amour et de la miséricorde. »<br/>
          <span style={{ fontSize: '14px', marginTop: '10px', display: 'block', color: 'var(--color-gold)' }}>— Sourate Ar-Rum, 30:21</span>
        </motion.div>

        <motion.div 
          className={styles.details}
          {...fadeUpParams}
          transition={{ duration: 1, delay: 0.8 }}
        >
          <span>11 — 12 Juillet 2026</span>
          <span className={styles.diamond}></span>
          <span>Dakar, Sénégal</span>
        </motion.div>

        <motion.div 
          className={styles.scrollDown}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <motion.div 
            className={styles.scrollLine}
            animate={{ scaleY: [0, 1, 0], transformOrigin: ['top', 'top', 'bottom'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className={styles.scrollText}>Découvrir</div>
        </motion.div>
      </div>
    </section>
  );
}
