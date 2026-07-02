'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MenuOverlay({ hideRightItems = false }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const menuLinks = [
    { name: 'Home', href: '#hero' },
    { name: 'Showreel', href: '#showreel' },
    { name: 'About', href: '#about' },
    { name: 'Works', href: '#works' },
    { name: 'Services', href: '#services' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <>
      <Navbar isMenuOpen={isMenuOpen} toggleMenu={toggleMenu} scrolled={scrolled} hideRightItems={hideRightItems} />

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="menu-overlay"
            initial={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 60px) 40px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at calc(100% - 60px) 40px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at calc(100% - 60px) 40px)', transition: { delay: 0.5, duration: 0.9, ease: [0.34, 1.56, 0.64, 1] } }}
            transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ display: 'flex' }}
          >
            <div className="menu-overlay__close" onClick={closeMenu}>
            </div>
            
            <div className="menu-overlay__content" style={{ marginTop: '80px' }}>
              <nav className="menu-overlay__nav">
                <ul className="menu-overlay__list">
                  {menuLinks.map((link, i) => (
                    <motion.li
                      key={link.name}
                      className="menu-overlay__item"
                      initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', damping: 20, stiffness: 100, delay: 0.1 + i * 0.05 } }}
                      exit={{ opacity: 0, y: 30, filter: 'blur(16px)', transition: { type: 'spring', damping: 25, stiffness: 60, delay: (menuLinks.length - i) * 0.08 } }}
                    >
                      <a href={link.href} className="menu-overlay__link" onClick={closeMenu}>
                        {link.name}
                      </a>
                    </motion.li>
                  ))}
                </ul>
              </nav>
            </div>
            
            <div className="menu-overlay__bg-deco">
              <div className="menu-overlay__bg-deco-circle"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Navbar({ isMenuOpen, toggleMenu, scrolled, hideRightItems }) {
  return (
    <motion.header
      className={`navbar ${scrolled ? 'scrolled' : ''}`}
      id="navbar"
      initial={{ y: -100, filter: 'blur(10px)' }}
      animate={{ y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', damping: 20, stiffness: 100 }}
    >
      <div className="container">
        <a href="/" className="brand-logo" style={{ opacity: isMenuOpen ? 0 : 1, transition: 'opacity 0.3s' }}>
          <span className="brand-logo__main">MONOLITH</span>
          <span className="brand-logo__accent">media</span>
        </a>
        
        {!hideRightItems && (
          <div className="navbar__right">
            <a
              href="https://wa.me/+8801940420383?text=Hello%20Alvi%2C%20I'm%20interested%20in%20booking%20a%20call%20with%20you.%20Kindly%20share%20your%20availability."
              className="btn btn-primary nav-btn"
              target="_blank"
              rel="noopener"
              style={{ opacity: isMenuOpen ? 0 : 1, transition: 'opacity 0.3s' }}
            >
              Hire Us
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </span>
            </a>
            <motion.div
              className={`burger ${isMenuOpen ? 'active' : ''}`}
              onClick={toggleMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="line line1">
                <div className="triangle"></div>
                <div className="short-line"></div>
              </div>
              <div className="line line2"></div>
              <div className="line line3"></div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
