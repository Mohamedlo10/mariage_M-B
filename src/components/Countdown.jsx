import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styles from './Countdown.module.css';

const WEDDING_DATE = new Date(2026, 6, 11, 17, 0, 0).getTime(); // 11 July 2026, 17:00

const CircleProgress = ({ value, max, label }) => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  // Calculate percentage correctly so it fills up as value goes up
  // Actually, for countdown it's nice if it drains down. So strokeDashoffset increases as value decreases.
  const strokeDashoffset = circumference - (value / max) * circumference;

  return (
    <div className={styles.item}>
      <div className={styles.circle}>
        <svg className={styles.svgCircle} width="120" height="120" viewBox="0 0 120 120">
          <circle className={styles.circleBg} cx="60" cy="60" r={radius} />
          <circle 
            className={styles.circleProgress} 
            cx="60" cy="60" r={radius} 
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <span className={styles.value}>{String(value).padStart(2, '0')}</span>
      </div>
      <span className={styles.label}>{label}</span>
    </div>
  );
};

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, total: 1
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const diff = WEDDING_DATE - now;
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
        clearInterval(timer);
        return;
      }
      
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        total: diff
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isToday = timeLeft.total === 0;

  return (
    <section className={styles.countdownSection}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className={styles.subtitle}>Le compte à rebours</div>
        <h2 className={styles.title}>Vers notre grand jour</h2>
      </motion.div>

      {isToday ? (
        <motion.div
          className={styles.today}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          C'est aujourd'hui !
        </motion.div>
      ) : (
        <motion.div 
          className={styles.grid}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <CircleProgress value={timeLeft.days} max={365} label="Jours" />
          <CircleProgress value={timeLeft.hours} max={24} label="Heures" />
          <CircleProgress value={timeLeft.minutes} max={60} label="Minutes" />
          <CircleProgress value={timeLeft.seconds} max={60} label="Secondes" />
        </motion.div>
      )}
    </section>
  );
}
