'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const CheckmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

function CopyButton({ value, label }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      className="copy-btn"
      title="Copy"
      aria-label={`Copy ${label}`}
      onClick={handleCopy}
      style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied ? '#fff' : 'var(--green-primary)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }}
    >
      {copied ? <CheckmarkIcon /> : <CopyIcon />}
    </button>
  );
}

export default function PaymentSection() {
  const [showDetails, setShowDetails] = useState(false);
  const [activeMethod, setActiveMethod] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
  const [bankData, setBankData] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMethodClick = (method) => {
    setActiveMethod(method);
    setShowDetails(true);
    setTimeout(() => {
      document.getElementById('paymentDetails')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  const handleVerifyPassword = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/bank-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setBankData(result.data);
        setShowPasswordPrompt(false);
        setError('');
      } else {
        setError(result.message || 'Incorrect password. Please try again.');
        setPassword('');
      }
    } catch (err) {
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const methods = [
    { name: 'Remitly', fee: '$0 fee', speed: 'Fast transfer', recommended: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
    { name: 'Taptap Send', fee: 'Low fee', speed: 'Fast transfer', recommended: true, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8l4 4-4 4M8 12h8"/></svg> },
    { name: 'Wise', fee: 'High fee', speed: 'Delayed transfer', recommended: false, icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green-primary)" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  ];

  const detailFields = bankData ? [
    { label: 'Bank Name', value: bankData.bankName },
    { label: 'A/C Number', value: bankData.acNumber, mono: true },
    { label: 'First Name', value: bankData.firstName },
    { label: 'Last Name', value: bankData.lastName },
    { label: 'Swift Code', value: bankData.swiftCode, mono: true },
    { label: 'Branch Code', value: bankData.branchCode, mono: true },
    { label: 'Routing No.', value: bankData.routingNo, mono: true },
    { label: 'Country', value: bankData.country },
    { label: 'City', value: bankData.city },
    { label: 'Postcode', value: bankData.postcode },
    { label: 'Branch', value: bankData.branch },
    { label: 'Email', value: bankData.email, isEmail: true },
    { label: 'Address', value: bankData.address, fullWidth: true },
  ] : [];

  return (
    <section className="payment section" id="payment">
      <div className="container">
        <div style={{ textAlign: 'center' }}>
          <motion.p className="section-label" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>Payment</motion.p>
          <motion.h2 className="section-title" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            Supported <span className="highlight">Payment Methods</span>
          </motion.h2>
          <motion.p className="section-desc" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} style={{ maxWidth: '600px', margin: '0 auto 40px' }}>
            We accept payments via Remitly, Taptap Send, and Wise. <strong>Remitly and Taptap Send are highly recommended</strong> due to their low fees and fast delivery times. Select a method to view bank details.
          </motion.p>
        </div>

        <motion.div
          style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {methods.map(m => (
            <motion.button
              key={m.name}
              className="payment-btn"
              onClick={() => handleMethodClick(m.name)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '16px 24px',
                borderRadius: '8px',
                border: activeMethod === m.name ? '1px solid var(--green-primary)' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: activeMethod === m.name ? '0 0 15px rgba(0, 255, 0, 0.2)' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: 'white',
                width: '250px',
                opacity: m.recommended ? 1 : 0.8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px' }}>
                {m.icon}
                {m.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-grey)', fontWeight: 'normal', lineHeight: 1.5, textAlign: 'center', marginTop: '4px' }}>
                <span style={{ color: m.recommended ? '#00ff00' : '#ff4d4d' }}>{m.fee}</span> • {m.speed}<br />
                {m.recommended ? (
                  <span style={{ color: '#fff', fontWeight: 500, display: 'inline-block', marginTop: '4px', padding: '2px 8px', background: 'rgba(0,255,0,0.1)', borderRadius: '4px' }}>Highly Recommended</span>
                ) : (
                  <span style={{ display: 'inline-block', marginTop: '4px', padding: '2px 8px', opacity: 0.7 }}>Not recommended</span>
                )}
              </div>
            </motion.button>
          ))}
        </motion.div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              id="paymentDetails"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ background: 'linear-gradient(135deg, #0d1f0d, #000)', padding: '40px', borderRadius: '12px', border: '1px solid rgba(0,255,0,0.1)', maxWidth: '800px', margin: '0 auto', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <h3 style={{ color: 'var(--green-primary)', marginBottom: '24px', textAlign: 'center', fontSize: '24px' }}>
                  Bank Details for {activeMethod}
                </h3>

                {showPasswordPrompt ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>
                    <p style={{ color: 'var(--text-grey)', marginBottom: '16px' }}>Please enter the client password to view the bank details.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', maxWidth: '400px', margin: '0 auto' }}>
                      <input
                        type="password"
                        placeholder="Enter password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
                        style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.5)', color: '#fff', outline: 'none', fontFamily: 'inherit' }}
                      />
                      <button
                        onClick={handleVerifyPassword}
                        disabled={loading}
                        style={{ background: 'var(--green-primary)', color: '#000', fontWeight: 'bold', padding: '0 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', transition: 'opacity 0.3s' }}
                      >
                        {loading ? 'Checking...' : 'Unlock'}
                      </button>
                    </div>
                    {error && <p style={{ color: '#ff4d4d', marginTop: '12px', fontSize: '14px' }}>{error}</p>}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}
                  >
                    {detailFields.map((field, i) => (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', ...(field.fullWidth ? { gridColumn: '1 / -1' } : {}) }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{field.label}</span>
                        <div style={{ display: 'flex', alignItems: field.fullWidth ? 'flex-start' : 'center', gap: '8px' }}>
                          <span
                            className="copy-value"
                            style={{ fontSize: '16px', fontWeight: 500, color: '#fff', ...(field.mono ? { fontFamily: 'monospace', letterSpacing: '1px' } : {}), ...(field.fullWidth ? { lineHeight: 1.5 } : {}) }}
                          >
                            {field.isEmail ? (
                              <a href={`mailto:${field.value}`} style={{ color: '#fff', textDecoration: 'none' }}>{field.value}</a>
                            ) : field.value}
                          </span>
                          <CopyButton value={field.value} label={field.label} />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
