'use client';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, rotateX: -15, filter: 'blur(12px)' },
    visible: {
      opacity: 1,
      y: 0,
      rotateX: 0,
      filter: 'blur(0px)',
      transition: { type: 'spring', damping: 20, stiffness: 80 },
    },
  };

  return (
    <section className="hero section" id="hero">
      <motion.div
        className="container"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.p className="hero__label" variants={itemVariants}>
          Premium Video Editing Agency
        </motion.p>
        <motion.h1 className="hero__title" variants={itemVariants} style={{ perspective: 1000 }}>
          Scale Your Brand With <br />
          <span className="hero__title-highlight">High-Retention Edits</span>
        </motion.h1>
        <motion.p className="hero__desc" variants={itemVariants}>
          We craft scroll-stopping YouTube videos, cinematic documentaries, and high-converting VSLs that turn viewers into loyal customers.
        </motion.p>
        
        <motion.div className="hero__social-proof" variants={itemVariants}>
          <div className="hero__avatars">
            <div className="hero__avatar"><div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #107148, #00ff00)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>C</div></div>
            <div className="hero__avatar"><div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0d1f0d, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>J</div></div>
            <div className="hero__avatar"><div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #111, #444)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>T</div></div>
            <div className="hero__avatar"><div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #34d399, #107148)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold' }}>A</div></div>
            <div className="hero__avatar"><div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a0a0a, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>+</div></div>
          </div>
          <div className="hero__proof-text">
            <strong>100+ Creators</strong><br />trust Monolith Media
          </div>
        </motion.div>

        <motion.div className="hero__cta" variants={itemVariants}>
          <a
            href="https://wa.me/+8801940420383?text=Hello%20Alvi%2C%20I'm%20interested%20in%20booking%20a%20call%20with%20you.%20Kindly%20share%20your%20availability."
            className="btn btn-primary"
            target="_blank"
            rel="noopener"
          >
            <span>Book a call</span>
            <span className="btn-icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              </svg>
            </span>
          </a>
          <a href="#works" className="btn" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-white)' }}>
            View our work
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
