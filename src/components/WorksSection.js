'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const worksData = [
  { id: 'style1', tab: 'Immersive POV', title: '1. Immersive POV & Narrative Storytelling', ref: '(Reference: Your Life as Every Rank in the Yakuza)', style: 'A highly engaging, first-person narrative format designed to pull the viewer directly into the story.', expertise: 'We use deliberate pacing, deep atmospheric sound design, and rich audio-visual world-building to create a strong emotional connection and keep viewers invested from start to finish.', videoId: 'IDTV52TcM0E', isYoutube: true },
  { id: 'style2', tab: 'Historical Doc', title: '2. Dynamic Historical Documentary', ref: '(Reference: The Most Brutal Medieval Battles Explained)', style: 'A visually striking documentary format that breathes life into historical events.', expertise: 'We seamlessly integrate map animations, motion graphics, and archival illustrations with intense, suspenseful sound design to make complex history accessible and thrilling.', videoId: 'Hdnpq3LNF7o', isYoutube: true },
  { id: 'style3', tab: 'Cinematic Mystery', title: '3. Cinematic Mystery & Ecology', ref: '(Reference: Wild Boars Are Disappearing in Droves)', style: 'A high-end, documentary-style format that treats factual events like a suspenseful mystery.', expertise: 'We specialize in precise script pacing, premium color grading, and the strategic integration of cinematic B-roll to build curiosity and drive a compelling narrative.', videoId: 'ssfnMXYCUeo', isYoutube: true },
  { id: 'style4', tab: 'Archival Tension', title: '4. Archival Tension & Real-Time Documentary', ref: '(Reference: The Most Insane Tornado Ever Recorded)', style: 'A raw, urgency-driven format that places the viewer right in the middle of a major event.', expertise: 'We expertly blend raw archival video, live news broadcasts, and intense audio mixing (like radio scanners) to create an atmosphere of real-time tension and scale.', videoId: 'G0emZm2KgLA', isYoutube: true },
  { id: 'style5', tab: 'Infotainment', title: '5. Fast-Paced Infotainment (High-Retention)', ref: '(Reference: Every Popular Food That Shouldn\'t Exist)', style: 'A highly stimulating, fast-paced format optimized for the modern viewer\'s attention span.', expertise: 'We utilize snappy visual cuts, rapid information delivery, and eye-catching pop-up graphics to maximize viewer retention and engagement metrics.', videoId: 'z1z0Y2vlKjU', isYoutube: true },
  { id: 'style6', tab: 'Direct Address', title: '6. Direct Address & Explainer Format', ref: '(Reference: Terribly WRONG Facts CHRISTIANS Still Believe In)', style: 'A conversational, point-by-point breakdown format ideal for myth-busting and education.', expertise: 'We use a "direct-to-camera" flow supported by clean visual aids and on-screen text to simplify complex or debated topics, making them highly accessible and engaging.', videoId: 'KhQlLTOEYgI', isYoutube: true },
  { id: 'style7', tab: 'Historical Invest.', title: '7. Cinematic Historical Investigation', ref: '(Reference: Deep Future Daily - The Tutankhamun Mask Mystery)', style: 'A gripping, investigative documentary format that treats ancient history like a modern true-crime or sci-fi thriller.', expertise: 'We seamlessly blend rich historical visuals with sleek, modern sci-tech graphics to build a compelling mystery.', videoId: 'Timeline 1', ext: '.mov', isLocal: true, badge: 'Short Demo' },
  { id: 'style8', tab: 'Tech & Engineering', title: '8. Tech & Engineering Explainer (Eco-Tech Mini-Documentary)', ref: '(Reference: Archimedes Wind Turbine Explainer / REVISED.mp4)', style: 'A deep-dive, highly informative mini-documentary format that takes complex technical subjects and breaks them down into accessible, engaging narratives.', expertise: 'We specialize in technical storytelling that ensures "how it works" videos never feel dry or boring.', videoId: 'Timeline 2', ext: '.mov', isLocal: true, badge: 'Short Demo' },
];

export default function WorksSection() {
  const [activeTab, setActiveTab] = useState('style1');

  const handleTabClick = (tabId) => {
    // Pause all videos
    document.querySelectorAll('.works__content video').forEach(v => v.pause());
    setActiveTab(tabId);
  };

  return (
    <section className="works section" id="works">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <motion.p
            className="section-label"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 20, stiffness: 80 }}
          >
            Our Works
          </motion.p>
          <motion.h2
            className="section-title"
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.1 }}
          >
            Explore Our <span className="highlight">Best Edits</span>
          </motion.h2>
        </div>

        <motion.div
          className="works__tabs"
          initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{ type: 'spring', damping: 20, stiffness: 80, delay: 0.2 }}
        >
          {worksData.map(w => (
            <motion.button
              key={w.id}
              className={`works__tab ${activeTab === w.id ? 'active' : ''}`}
              onClick={() => handleTabClick(w.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ position: 'relative' }}
            >
              {activeTab === w.id && (
                <motion.div
                  layoutId="activeTabIndicator"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--green-primary)',
                    borderRadius: '100px',
                    zIndex: -1
                  }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span style={{ position: 'relative', zIndex: 1, color: activeTab === w.id ? '#000' : 'inherit' }}>
                {w.tab}
              </span>
            </motion.button>
          ))}
        </motion.div>

        <div className="works__contents">
          <AnimatePresence mode="wait">
            {worksData.map(w => w.id === activeTab && (
              <motion.div
                key={w.id}
                className="works__content active"
                initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -20, filter: 'blur(12px)' }}
                transition={{ type: 'spring', damping: 20, stiffness: 80 }}
              >
                <div className="works__info">
                  <h3>
                    {w.title}
                    {w.badge && (
                      <span className="glow-badge" style={{ position: 'relative', marginLeft: '10px', fontSize: '11px', padding: '4px 12px', animation: 'none', transform: 'translateY(-3px)' }}>
                        {w.badge}
                      </span>
                    )}
                  </h3>
                  <p className="works__ref">{w.ref}</p>

                </div>
                <VideoPlayer work={w} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function VideoPlayer({ work }) {
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = () => {
    if (isPlaying) return;
    const container = containerRef.current;
    if (!container) return;

    const videoEl = document.createElement('video');
    const ext = work.ext || '.mp4';
    videoEl.src = `/works_videos/${work.videoId}${ext}`;
    videoEl.controls = true;
    videoEl.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:3;object-fit:contain;background:#000;';

    container.appendChild(videoEl);
    setIsPlaying(true);

    const thumb = container.querySelector('.custom-video__thumb');
    const playBtn = container.querySelector('.custom-video__play');
    if (thumb) thumb.style.display = 'none';
    if (playBtn) playBtn.style.display = 'none';

    if (typeof window.Plyr !== 'undefined') {
      const player = new window.Plyr(videoEl, {
        controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'],
        hideControls: false,
      });
      player.play();
    } else {
      videoEl.play();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`works__video-wrapper custom-video ${isPlaying ? 'playing' : ''}`}
      onClick={handleClick}
    >
      <video
        src={`/works_videos/${work.videoId}${work.ext || '.mp4'}`}
        className="custom-video__thumb"
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        preload="metadata"
        muted
        playsInline
      />
      <motion.div
        className="custom-video__play"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 5v14l11-7z" /></svg>
      </motion.div>
    </div>
  );
}
