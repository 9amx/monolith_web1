'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

function TiltCard({ children, className }) {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 15, stiffness: 400, mass: 0.5 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1200,
      }}
    >
      <div style={{ transform: 'translateZ(30px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function ServicesSection() {
  const row1Services = [
    { title: 'Infographic Videos', desc: 'Visually break down complex info into clear, engaging animated graphics.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg> },
    { title: 'Talking Head Videos', desc: 'Clean, polished edits that keep the focus on your message and delivery.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
    { title: 'Documentary Videos', desc: 'Craft real stories with cinematic pacing, voice, and emotion.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg> },
    { title: 'Real Estate Videos', desc: 'Highlight properties with sleek visuals and smooth, premium edits.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
  ];

  const row2Services = [
    { title: 'Gaming Videos', desc: 'High-energy edits packed with effects, syncs, and sharp transitions.', icon: <svg viewBox="0 0 640 512" fill="currentColor"><path d="M480.07 96H160a160 160 0 1 0 114.24 272h91.52A160 160 0 1 0 480.07 96zM248 268a12 12 0 0 1-12 12h-52v52a12 12 0 0 1-12 12h-24a12 12 0 0 1-12-12v-52H84a12 12 0 0 1-12-12v-24a12 12 0 0 1 12-12h52v-52a12 12 0 0 1 12-12h24a12 12 0 0 1 12 12v52h52a12 12 0 0 1 12 12zm216 76a40 40 0 1 1 40-40 40 40 0 0 1-40 40zm64-96a40 40 0 1 1 40-40 40 40 0 0 1-40 40z" /></svg> },
    { title: 'VSL (Video Sales Letters)', desc: 'Persuasive, fast-paced edits that drive conversions and sales.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg> },
    { title: 'Shorts / Reels', desc: 'Scroll-stopping vertical videos tailored for fast social media impact.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg> },
    { title: 'Long Forms', desc: 'Structured, story-driven edits ideal for YouTube or detailed content.', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></svg> },
  ];

  const renderCards = (services) => (
    <>
      {services.map((s, i) => (
        <TiltCard key={`orig-${i}`} className="service-card tilt-card">
          <div className="service-card__icon">{s.icon}</div>
          <h3 className="service-card__title">{s.title}</h3>
          <p className="service-card__desc">{s.desc}</p>
        </TiltCard>
      ))}
      {services.map((s, i) => (
        <TiltCard key={`dup-${i}`} className="service-card tilt-card">
          <div className="service-card__icon">{s.icon}</div>
          <h3 className="service-card__title">{s.title}</h3>
          <p className="service-card__desc">{s.desc}</p>
        </TiltCard>
      ))}
    </>
  );

  return (
    <section className="services section" id="services">
      <div className="container">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        >
          Services
        </motion.p>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.1 }}
        >
          What We <span className="highlight">Specialize In</span>
        </motion.h2>
      </div>

      <motion.div
        className="services__carousel-wrapper"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className="services__track services__track--left">
          {renderCards(row1Services)}
        </div>
      </motion.div>

      <motion.div
        className="services__carousel-wrapper"
        style={{ marginTop: '20px' }}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <div className="services__track services__track--right">
          {renderCards(row2Services)}
        </div>
      </motion.div>
    </section>
  );
}
