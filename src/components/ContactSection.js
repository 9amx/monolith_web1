'use client';
import { motion } from 'framer-motion';

export default function ContactSection() {
  return (
    <section className="contact section" id="contact">
      <div className="container">
        <motion.div
          className="contact__wrapper"
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="contact__title">Ready to Hire a Professional Video Editor? Let&apos;s Talk.</h2>
          <p className="contact__desc">Looking for a reliable video editing company to scale your brand? Book a free strategy call and let&apos;s build a high-retention content system together.</p>
          <div className="contact__cta">
            <motion.a
              href="https://wa.me/+8801940420383?text=Hello%20Alvi%2C%20I'm%20interested%20in%20booking%20a%20call%20with%20you.%20Kindly%20share%20your%20availability."
              className="btn btn-primary"
              target="_blank"
              rel="noopener"
              id="contactCtaBtn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Book a call</span>
              <span className="btn-icon">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </span>
            </motion.a>
          </div>
          <div className="contact__socials">
            <motion.a
              href="https://x.com/AlviKarim175590"
              className="contact__social-link"
              target="_blank"
              rel="noopener"
              aria-label="Twitter/X"
              whileHover={{ scale: 1.2, rotate: 5 }}
            >
              <svg viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </motion.a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
