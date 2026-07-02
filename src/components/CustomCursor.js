'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function CustomCursor() {
  const pathname = usePathname();
  const [isTouchDevice, setIsTouchDevice] = useState(true); // default true to avoid hydration mismatch, check on mount
  const [isHovering, setIsHovering] = useState(false);

  // Motion values for cursor position
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  
  // Spring physics config for smooth following
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  const followerSpringConfig = { damping: 30, stiffness: 200, mass: 0.8 };
  const followerXSpring = useSpring(cursorX, followerSpringConfig);
  const followerYSpring = useSpring(cursorY, followerSpringConfig);

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    if (isTouch) return;

    const moveCursor = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };

    window.addEventListener('mousemove', moveCursor);

    // Add event listeners for hover effects
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, .faq__question, .works__tab');
      if (target) setIsHovering(true);
    };
    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, .faq__question, .works__tab');
      if (target) setIsHovering(false);
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, [cursorX, cursorY]);

  if (isTouchDevice) return null;

  return (
    <>
      <motion.div
        className={`custom-cursor ${isHovering ? 'hovering' : ''}`}
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
      <motion.div
        className={`custom-cursor-follower ${isHovering ? 'hovering' : ''}`}
        style={{
          x: followerXSpring,
          y: followerYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
      />
    </>
  );
}
