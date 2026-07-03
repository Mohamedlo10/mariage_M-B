import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './Envelope3D.module.css';

export default function Envelope3D({ onComplete }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);
    
    // Animation Sequence timing:
    // 0.0s - 0.8s: Flap opens
    // 0.8s - 1.8s: Letter slides up
    // 2.0s - 3.2s: Letter scales up to fill view, envelope body fades out
    // 4.5s - 5.5s: Everything fades out into main site
    
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onComplete();
      }, 1000); // fade out duration
    }, 5000);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div 
          className={styles.container}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
        >
          <motion.div 
            className={styles.envelopeWrapper}
            onClick={handleOpen}
            animate={{ 
              scale: isOpen ? 0.9 : 1,
              y: isOpen ? '10vh' : 0
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            {/* Back of envelope */}
            <motion.div 
              className={styles.envelopeBack} 
              animate={{ opacity: isOpen ? [1, 1, 0] : 1 }}
              transition={{ times: [0, 0.8, 1], delay: 2.0, duration: 0.8 }}
            />
            
            {/* The Letter (Invitation Image) */}
            <motion.div 
              className={styles.letter}
              initial={{ y: 0, scale: 1, zIndex: 0 }}
              animate={{ 
                y: isOpen ? '-45vh' : 0, 
                scale: isOpen ? 1.6 : 1,
                zIndex: isOpen ? 10 : 0
              }}
              transition={{ 
                y: { delay: 0.8, duration: 1.2, ease: [0.34, 1.56, 0.64, 1] }, // Springy exit
                scale: { delay: 2.2, duration: 1.5, ease: "easeInOut" },
                zIndex: { delay: 1.5 }
              }}
            >
              <img src="/assets/invitation.jpg" alt="Invitation Officielle" className={styles.letterImage} />
            </motion.div>

            {/* Front flaps (Left, Right, Bottom) */}
            <motion.div 
              className={styles.envelopeFront}
              animate={{ opacity: isOpen ? [1, 1, 0] : 1 }}
              transition={{ times: [0, 0.8, 1], delay: 2.0, duration: 0.8 }}
            >
              <div className={styles.envelopeFrontLeft} />
              <div className={styles.envelopeFrontRight} />
              <div className={styles.envelopeFrontBottom} />
            </motion.div>

            {/* Top Flap (Opens) */}
            <motion.div 
              className={styles.envelopeFlapTop}
              animate={{ 
                rotateX: isOpen ? 180 : 0, 
                opacity: isOpen ? [1, 1, 0] : 1 
              }}
              transition={{ 
                rotateX: { duration: 0.8, ease: "easeInOut" },
                opacity: { times: [0, 0.8, 1], delay: 2.0, duration: 0.8 }
              }}
            >
              <motion.div 
                className={styles.seal}
                animate={{ opacity: isOpen ? 0 : 1 }}
                transition={{ duration: 0.3 }}
              >
                M&B
              </motion.div>
            </motion.div>
            
            <AnimatePresence>
              {!isOpen && (
                <motion.div 
                  className={styles.hint}
                  exit={{ opacity: 0 }}
                >
                  Touchez le sceau pour ouvrir
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
