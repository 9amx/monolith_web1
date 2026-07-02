'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function CustomContextMenu() {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pathname = usePathname();

  useEffect(() => {
    const handleContextMenu = (e) => {
      // Allow native context menu on specific routes
      if (pathname === '/projects' || pathname?.startsWith('/dashboard')) {
        return;
      }

      e.preventDefault();
      
      // Ensure the menu stays within the viewport
      const x = Math.min(e.clientX, window.innerWidth - 150);
      const y = Math.min(e.clientY, window.innerHeight - 60);
      
      setPosition({ x, y });
      setVisible(true);
    };

    const handleClick = () => {
      if (visible) setVisible(false);
    };

    const handleScroll = () => {
      if (visible) setVisible(false);
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('click', handleClick);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [visible, pathname]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          style={{
            position: 'fixed',
            top: position.y,
            left: position.x,
            zIndex: 999999,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.02) 100%)',
            backdropFilter: 'blur(24px) saturate(140%)',
            WebkitBackdropFilter: 'blur(24px) saturate(140%)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderTopColor: 'rgba(255,255,255,0.3)',
            borderRadius: '12px',
            padding: '6px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '150px'
          }}
        >
          <a 
            href="#contact"
            onClick={() => setVisible(false)}
            style={{
              display: 'block',
              padding: '10px 16px',
              color: '#fff',
              textDecoration: 'none',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              fontWeight: '600',
              borderRadius: '8px',
              transition: 'background 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Hire Us
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
