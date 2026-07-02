'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  'Recording_20260627_003606.jpg',
  'Recording_20260627_003640.jpg',
  'Recording_20260627_003711.jpg',
  'Recording_20260627_003804.jpg',
  'Recording_20260627_003824.jpg',
  'Recording_20260627_004357.jpg',
  'Recording_20260627_004413.jpg',
  'Recording_20260627_004433.jpg',
  'Recording_20260627_004444.jpg',
];

export default function ReviewsSection() {
  const [reviewIndex, setReviewIndex] = useState(0);
  const autoPlayRef = useRef(null);
  const totalReviews = testimonials.length;

  const startAutoPlay = () => {
    autoPlayRef.current = setInterval(() => {
      setReviewIndex(prev => (prev + 1) % totalReviews);
    }, 2500);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
  };

  useEffect(() => {
    startAutoPlay();
    return () => stopAutoPlay();
  }, []);

  const goNext = () => setReviewIndex(prev => (prev + 1) % totalReviews);
  const goPrev = () => setReviewIndex(prev => (prev - 1 + totalReviews) % totalReviews);

  return (
    <section className="reviews section" id="reviews">
      <div className="container">
        <motion.p
          className="section-label"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Client Reviews
        </motion.p>
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          What Our Clients <span className="highlight">Say About Us</span>
        </motion.h2>

        <motion.div
          className="reviews__slider"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
        >
          <div className="reviews__track-wrapper">
            <motion.div
              className="reviews__track"
              animate={{ x: `-${reviewIndex * 100}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {testimonials.map((img, i) => (
                <div key={i} className="review-card image-review">
                  <img
                    src={`/testimonials/${img}`}
                    alt="Client Testimonial"
                    className="review-image"
                  />
                </div>
              ))}
            </motion.div>
          </div>
          <div className="reviews__arrows">
            <motion.button className="reviews__arrow" onClick={goPrev} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
            </motion.button>
            <motion.button className="reviews__arrow" onClick={goNext} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <svg viewBox="0 0 24 24"><polyline points="9 6 15 12 9 18" /></svg>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
