'use client';
import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

function TiltCard({ children, className, delay = 0 }) {
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
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
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
      initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true }}
      transition={{ type: 'spring', damping: 20, stiffness: 80, delay }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1200,
      }}
    >
      <div style={{ transform: 'translateZ(40px)' }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function ComparisonSection() {
  const CheckIcon = () => (
    <svg className="icon icon--check" viewBox="0 0 512 512">
      <path d="M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z" />
    </svg>
  );

  const CrossIcon = () => (
    <svg className="icon icon--cross" viewBox="0 0 24 24">
      <path d="M18.36 5.64a1 1 0 0 0-1.41 0L12 10.59 7.05 5.64a1 1 0 1 0-1.41 1.41L10.59 12l-4.95 4.95a1 1 0 1 0 1.41 1.41L12 13.41l4.95 4.95a1 1 0 0 0 1.41-1.41L13.41 12l4.95-4.95a1 1 0 0 0 0-1.41z" />
    </svg>
  );

  const monolithItems = [
    '40+ Skilled Professionals In-House',
    'Focused on Real, Measurable Results',
    'First 2 revisions are free',
  ];

  const othersItems = [
    'Extra charges apply for every revision',
    'Unreliable freelancers with slow delivery timelines',
    'Edits that don\'t drive engagement or conversions',
    'Weak thumbnails & titles lacking CTR strategy',
    'No system for effective content distribution',
    'Little to no funnel or lead capture expertise',
    'Slow replies and poor communication flow',
  ];

  return (
    <section className="comparison section" id="why-MONOLITH">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 20, stiffness: 80 }}
          >
            Why MONOLITH
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.1 }}
          >
            MONOLITH vs <span className="highlight">Other Agencies</span>
          </motion.h2>
        </div>
        
        <div className="comparison__grid">
          <TiltCard className="comparison__card comparison__card--MONOLITH tilt-card" delay={0.1}>
            <h3 className="comparison__card-title" style={{ color: 'var(--green-primary)' }}>Extra Value, Just for You</h3>
            <div className="comparison__list">
              {monolithItems.map((item, i) => (
                <div key={i} className="comparison__item">
                  <CheckIcon />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </TiltCard>
          
          <TiltCard className="comparison__card comparison__card--others tilt-card" delay={0.3}>
            <h3 className="comparison__card-title" style={{ color: '#ff4d4d' }}>Other Agencies</h3>
            <div className="comparison__list">
              {othersItems.map((item, i) => (
                <div key={i} className="comparison__item">
                  <CrossIcon />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </TiltCard>
        </div>
        
        <motion.p
          className="comparison__note"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          😊 Usually, we don&apos;t provide samples, but if a client is genuinely interested to see our works, we&apos;re happy to create one for a small fee.
        </motion.p>
      </div>
    </section>
  );
}
