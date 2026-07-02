export default function Footer() {
  return (
    <footer className="footer" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '60px', paddingBottom: '40px', marginTop: '40px', background: 'radial-gradient(circle at center top, rgba(52,211,153,0.03) 0%, transparent 70%)' }}>
      <div className="container">
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '40px' }}>
          <div style={{ flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <a href="/" className="brand-logo footer__logo" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'baseline' }}>
              <span className="brand-logo__main">MONOLITH</span>
              <span className="brand-logo__accent">media</span>
            </a>
            <p style={{ fontSize: '14px', color: 'var(--text-grey)', opacity: 0.7, margin: 0, paddingLeft: '2px' }}>
              &copy; 2026 <strong>MONOLITH</strong> | All rights reserved.
            </p>
          </div>
          <div style={{ flex: 2, minWidth: '300px', maxWidth: '700px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-grey)', lineHeight: 1.7, opacity: 0.4, textAlign: 'right' }}>
              Monolith Media is a top-tier video editing agency specializing in high-retention YouTube video editing, cinematic documentaries, short-form TikTok/Reels, and high-converting Video Sales Letters (VSLs). We provide professional video editing services for content creators, brands, and businesses looking to scale their organic reach. Hire an expert video editor today.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
