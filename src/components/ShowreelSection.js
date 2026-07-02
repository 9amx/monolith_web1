'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function ShowreelSection() {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (isPlaying) return;
    const container = containerRef.current;
    if (!container) return;

    const videoEl = document.createElement('video');
    videoEl.src = '/works_videos/IDTV52TcM0E.mp4';
    videoEl.controls = true;
    videoEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;object-fit:cover;border-radius:16px;background:#000;';

    container.appendChild(videoEl);
    setIsPlaying(true);

    const playBtn = container.querySelector('.showreel__play');
    if (playBtn) playBtn.style.display = 'none';

    if (typeof window.Plyr !== 'undefined') {
      const player = new window.Plyr(videoEl, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
      });
      player.play();
    } else {
      videoEl.play();
    }
  };

  return (
    <section className="showreel section" id="showreel">
      <div className="container">
        <motion.div
          className="showreel__wrapper"
          id="showreelWrapper"
          ref={containerRef}
          initial={{ opacity: 0, scale: 0.95, y: 40, filter: 'blur(12px)' }}
          whileInView={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ type: 'spring', damping: 20, stiffness: 80 }}
        >
          <img src="https://img.youtube.com/vi/IDTV52TcM0E/maxresdefault.jpg" alt="Showreel Cover" className="showreel__cover" />
          <motion.div
            className="showreel__play"
            id="showreelPlay"
            onClick={handlePlay}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5v14l11-7z" fill="currentColor" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
