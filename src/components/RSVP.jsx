import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { supabase } from '../lib/supabaseClient';
import styles from './RSVP.module.css';

export default function RSVP() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [days, setDays] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [rsvpCount, setRsvpCount] = useState(0);

  useEffect(() => {
    fetchCount();
  }, []);

  const fetchCount = async () => {
    try {
      const { count, error } = await supabase
        .from('rsvp')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setRsvpCount(count);
      }
    } catch (e) {
      // Silently fail — count is cosmetic
    }
  };

  const toggleDay = (day) => {
    setDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || days.length === 0) return;

    setSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('rsvp')
        .insert({
          name: name.trim(),
          phone: phone.trim() || null,
          days: days,
        });

      if (insertError) {
        throw insertError;
      }

      setSubmitted(true);
      setName('');
      setPhone('');
      setDays([]);
      setRsvpCount(prev => prev + 1);

      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error('RSVP error:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const rsvpCountText = rsvpCount > 1
    ? `${rsvpCount} invités ont déjà confirmé leur présence`
    : rsvpCount === 1
      ? '1 invité a déjà confirmé sa présence'
      : 'Soyez parmi les premiers à confirmer';

  return (
    <section className={styles.rsvpSection} id="rsvp">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        <div className={styles.subtitle}>Confirmation</div>
        <h2 className={styles.title}>Serez-vous des nôtres ?</h2>
        <p className={styles.intro}>
          Merci de confirmer votre présence.
        </p>
      </motion.div>

      <motion.form
        className={styles.form}
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className={styles.field}>
          <label className={styles.label}>Votre nom</label>
          <input
            type="text"
            placeholder="Prénom et nom"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Téléphone <span style={{ opacity: 0.5, fontWeight: 300, letterSpacing: 0 }}>(optionnel)</span></label>
          <input
            type="tel"
            placeholder="+221 XX XXX XX XX"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Je serai présent(e) le</label>
          <div className={styles.chipGroup}>
            <div
              className={clsx(styles.chip, days.includes(1) && styles.selected)}
              onClick={() => toggleDay(1)}
            >
              Samedi 11 juillet
            </div>
            <div
              className={clsx(styles.chip, days.includes(2) && styles.selected)}
              onClick={() => toggleDay(2)}
            >
              Dimanche 12 juillet
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={!name.trim() || days.length === 0 || submitting}
        >
          {submitting ? 'Envoi en cours…' : 'Confirmer ma présence'}
        </button>

        {error && (
          <div className={styles.errorMessage}>{error}</div>
        )}

        {submitted && (
          <motion.div
            className={styles.successMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Merci ! Votre présence est confirmée avec joie.
          </motion.div>
        )}
      </motion.form>

      <motion.div
        className={styles.countText}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 1 }}
      >
        {rsvpCountText}
      </motion.div>
    </section>
  );
}
