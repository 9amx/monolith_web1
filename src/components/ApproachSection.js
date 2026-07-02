'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

export default function ApproachSection() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const yVisual1 = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const yVisual2 = useTransform(scrollYProgress, [0, 1], [50, -50]);

  const stepVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <section className="approach section" id="approach" ref={ref}>
      <div className="container">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Our Approach
        </motion.p>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          Strategic Video Editing <span className="highlight">That Drives Leads For You</span>
        </motion.h2>

        <div className="approach__steps">
          {/* Step 1 */}
          <motion.div className="approach__step" variants={stepVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            <div className="approach__step-content">
              <p className="approach__step-label">Insight</p>
              <h3 className="approach__step-title">Deep Idea Analysis</h3>
              <p className="approach__step-desc">Leveraging industry knowledge, we dissect your ideas to uncover their true potential and market fit.</p>
            </div>
            <motion.div className="approach__step-visual" style={{ y: yVisual1, position: 'relative', background: 'linear-gradient(135deg,#0f3d0f,#000)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', minHeight: '200px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
                <span className="glow-badge" style={{ position: 'relative' }}>Coaches</span>
                <span className="glow-badge" style={{ position: 'relative', animationDelay: '0.3s' }}>Personal Brand</span>
                <span className="glow-badge" style={{ position: 'relative', animationDelay: '0.6s' }}>E-Commerce</span>
                <span className="glow-badge" style={{ position: 'relative', animationDelay: '0.9s' }}>Fashion</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Step 2 */}
          <motion.div className="approach__step" variants={stepVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            <div className="approach__step-content">
              <p className="approach__step-label">Scripting</p>
              <h3 className="approach__step-title">Your Story, Scripted</h3>
              <p className="approach__step-desc">We turn your ideas into powerful narratives that sell, inspire, and stick in people&apos;s minds.</p>
            </div>
            <motion.div className="approach__step-visual" style={{ y: yVisual2, background: '#111', display: 'flex', flexDirection: 'column', gap: '8px', padding: '32px', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div className="rotating-text-container" style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(28px,4vw,42px)', fontWeight: 800 }}>
                  <div className="rotating-text" style={{ height: '1.2em', minWidth: '120px' }}>
                    <span className="rotating-text__word" style={{ position: 'relative' }}>CTA</span>
                    <span className="rotating-text__word">VALUE</span>
                    <span className="rotating-text__word">HOOK</span>
                    <span className="rotating-text__word">TITLE</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ height: '8px', background: 'linear-gradient(90deg,var(--green-dark),transparent)', borderRadius: '4px', width: '100%' }}></div>
                <div style={{ height: '8px', background: 'linear-gradient(90deg,rgba(0,255,0,0.15),transparent)', borderRadius: '4px', width: '80%' }}></div>
                <div style={{ height: '8px', background: 'linear-gradient(90deg,rgba(0,255,0,0.1),transparent)', borderRadius: '4px', width: '65%' }}></div>
                <div style={{ height: '8px', background: 'linear-gradient(90deg,rgba(0,255,0,0.05),transparent)', borderRadius: '4px', width: '50%' }}></div>
              </div>
            </motion.div>
          </motion.div>

          {/* Step 3 */}
          <motion.div className="approach__step" variants={stepVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            <div className="approach__step-content">
              <p className="approach__step-label">Editing</p>
              <h3 className="approach__step-title">Next-Level Cuts</h3>
              <p className="approach__step-desc">Clean, dynamic edits with premium motion graphics that make your content unforgettable.</p>
            </div>
            <motion.div className="approach__step-visual" style={{ y: yVisual1, background: 'linear-gradient(135deg,#111,#0a0a0a)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', borderRadius: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <polygon points="23 7 16 12 23 17 23 7" />
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                </svg>
                <p style={{ color: 'var(--text-grey)', fontSize: '13px', marginTop: '12px' }}>Premium Motion Graphics</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Step 4 */}
          <motion.div className="approach__step" variants={stepVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            <div className="approach__step-content">
              <p className="approach__step-label">Thumbnail</p>
              <h3 className="approach__step-title">Crafting Scroll-Stopping Designs</h3>
              <p className="approach__step-desc">We analyze other thumbnails in your niche and are able to replicate best performing results.</p>
            </div>
            <motion.div className="approach__step-visual" style={{ y: yVisual2, background: 'linear-gradient(135deg,#0d1f0d,#000)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', borderRadius: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <p style={{ color: 'var(--text-grey)', fontSize: '13px', marginTop: '12px' }}>Click-Worthy Thumbnails</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Step 5 */}
          <motion.div className="approach__step" variants={stepVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }}>
            <div className="approach__step-content">
              <p className="approach__step-label">Post</p>
              <h3 className="approach__step-title">Go Live, Get Results</h3>
              <p className="approach__step-desc">Your video is ready to shine — now it&apos;s time to share it with the world and let the results roll in.</p>
            </div>
            <motion.div className="approach__step-visual" style={{ y: yVisual1, background: 'linear-gradient(135deg,#111,#050505)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px', borderRadius: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#00ff00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.8 }}>
                  <path d="M22 2L11 13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                <p style={{ color: 'var(--text-grey)', fontSize: '13px', marginTop: '12px' }}>Launch &amp; Grow</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
