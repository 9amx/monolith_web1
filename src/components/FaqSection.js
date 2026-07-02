'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqData = [
  { q: 'What types of videos do you edit?', a: 'We specialize in a wide range of video types including talking head videos, infographic videos, documentaries, real estate videos, gaming content, VSLs (Video Sales Letters), short-form content (Reels/Shorts), and long-form YouTube videos.' },
  { q: 'How fast is your turnaround time?', a: 'Our standard turnaround is 24-48 hours for short-form content and 3-5 business days for long-form videos. Rush delivery is also available upon request.' },
  { q: 'Do you offer revisions?', a: "Yes! The first 2 revisions are completely free. We want to make sure you're 100% satisfied with the final product before it goes live." },
  { q: "What's the pricing structure?", a: "We offer flexible pricing based on your needs — from per-video pricing to monthly retainer packages. Book a call with us to get a custom quote tailored to your business." },
  { q: 'Can I see samples of your work?', a: "Usually, we don't provide free samples, but if a client is genuinely interested, we're happy to create a sample edit for a small fee to demonstrate our quality and style." },
];

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(-1);

  const toggleFaq = (index) => {
    setActiveIndex(prev => prev === index ? -1 : index);
  };

  return (
    <section className="faq section" id="faq">
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            FAQ
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Frequently Asked <span className="highlight">Questions</span>
          </motion.h2>
        </div>

        <motion.div
          className="faq__list"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            visible: { transition: { staggerChildren: 0.15 } },
            hidden: {}
          }}
        >
          {faqData.map((item, i) => (
            <motion.div
              key={i}
              className={`faq__item ${activeIndex === i ? 'active' : ''}`}
              variants={{
                hidden: { opacity: 0, y: 40 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
              }}
              layout
            >
              <motion.button className="faq__question" onClick={() => toggleFaq(i)} layout>
                <span>{item.q}</span>
                <motion.span
                  className="faq__icon"
                  animate={{ rotate: activeIndex === i ? 135 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <svg viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" />
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </motion.span>
              </motion.button>
              
              <AnimatePresence initial={false}>
                {activeIndex === i && (
                  <motion.div
                    className="faq__answer"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                  >
                    <div className="faq__answer-inner">{item.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
