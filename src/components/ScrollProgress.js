'use client';
import { useEffect } from 'react';

export default function ScrollProgress() {
  useEffect(() => {
    const progressBar = document.getElementById('scrollProgress');
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollTop / docHeight) * 100;
      if (progressBar) progressBar.style.width = `${scrollPercent}%`;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <div className="scroll-progress" id="scrollProgress"></div>;
}
