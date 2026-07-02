'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function FloatingElements() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 400]);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 50,
        y: (e.clientY / window.innerHeight - 0.5) * 50,
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <motion.div
        className="hero__floating-element hero__floating-element--1"
        aria-hidden="true"
        style={{
          y: y1,
          x: mousePosition.x,
        }}
        animate={{
          x: mousePosition.x,
          y: mousePosition.y, // combined with useTransform scroll, Framer handles this beautifully by layering transforms if done carefully, but for simplicity let's stick to simple parallax
        }}
        transition={{ type: 'spring', damping: 40, stiffness: 100 }}
      />
      <motion.div
        className="hero__floating-element hero__floating-element--2"
        aria-hidden="true"
        style={{
          y: y2,
          x: -mousePosition.x * 1.3,
        }}
        animate={{
          x: -mousePosition.x * 1.3,
          y: -mousePosition.y * 1.3,
        }}
        transition={{ type: 'spring', damping: 50, stiffness: 80 }}
      />
    </>
  );
}
