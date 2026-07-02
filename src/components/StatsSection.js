'use client';
import { motion } from 'framer-motion';

export default function StatsSection() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
    }
  };

  return (
    <section className="stats section" id="stats">
      <div className="container">
        <h2 className="visually-hidden">Our Impact in Numbers</h2>
        <motion.div
          className="stats__grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          <motion.div className="stat" variants={itemVariants}>
            <div className="stat__number">2.5M+</div>
            <div className="stat__label">More Engagement</div>
            <div className="stat__sublabel">Viral Edits</div>
          </motion.div>
          <motion.div className="stat" variants={itemVariants}>
            <div className="stat__number">50M+</div>
            <div className="stat__label">More Reach</div>
            <div className="stat__sublabel">Growth Boost</div>
          </motion.div>
          <motion.div className="stat" variants={itemVariants}>
            <div className="stat__number">450+</div>
            <div className="stat__label">Projects Done</div>
            <div className="stat__sublabel">Industry Trust</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
