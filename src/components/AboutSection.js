'use client';
import { motion } from 'framer-motion';

export default function AboutSection() {
  const checkItems = [
    '40+ Skilled Professionals In-House',
    'Focused on Real, Measurable Results',
    'Trusted by Over 100 Satisfied Clients',
    'Ready-to-Launch Content Funnel System',
    'Custom-Built CRM for Your Business',
    '24/7 Support, Anytime You Need Us',
  ];

  const iconBoxes = [
    { bg: 'linear-gradient(135deg,#0f3d0f,#000)', label: 'Coaches', svg: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg> },
    { bg: 'linear-gradient(135deg,#0d1f0d,#000)', label: 'Content Creator', svg: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg> },
    { bg: 'linear-gradient(135deg,#1a0d0d,#000)', label: 'YouTube', svg: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg> },
    { bg: 'linear-gradient(135deg,#0d0d1a,#000)', label: 'Monetization', svg: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg> },
  ];

  const CheckIcon = () => (
    <svg className="check-icon" viewBox="0 0 512 512">
      <path fill="#00FF00" d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z" />
    </svg>
  );

  return (
    <section className="about section" id="about">
      <div className="container">
        <div className="about__grid">
          <motion.div
            className="about__images"
            initial={{ opacity: 0, x: -60, rotateY: -20, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, x: 0, rotateY: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: 'spring', damping: 20, stiffness: 80 }}
            style={{ perspective: 1000 }}
          >
            {iconBoxes.map((box, i) => (
              <motion.div
                key={i}
                className="about__image-box"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  background: box.bg,
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {box.svg}
                <p style={{ color: '#8B8E97', fontSize: '13px', marginTop: '12px', textAlign: 'center' }}>
                  {box.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="about__content"
            initial={{ opacity: 0, x: 60, filter: 'blur(12px)' }}
            whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: 'spring', damping: 20, stiffness: 80, staggerChildren: 0.1 }}
          >
            <motion.p className="section-label" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}>About MONOLITH</motion.p>
            <motion.h2 className="section-title" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}>Why Choose <span className="highlight">Monolith Media</span></motion.h2>
            <motion.p className="section-desc" initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }} whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}>From scripting to final delivery, we handle every piece of the puzzle so you can focus on growing your brand.</motion.p>
            <div className="about__checklist">
              {checkItems.map((item, i) => (
                <motion.div
                  key={i}
                  className="about__check-item"
                  initial={{ opacity: 0, x: 20, filter: 'blur(6px)' }}
                  whileInView={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  viewport={{ once: true }}
                  transition={{ type: 'spring', damping: 20, stiffness: 80, delay: i * 0.1 }}
                >
                  <CheckIcon />
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
