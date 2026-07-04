"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, User, AtSign, Camera, Check, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { updateUserProfile, changePassword } from '@/actions/auth';
import CustomSelect from './CustomSelect';

export default function ProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { currentUser } = useAuth();
  const overlayRef = useRef(null);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');

  const [rocketNumber, setRocketNumber] = useState('');
  const [rocketName, setRocketName] = useState('');

  const [binancePayId, setBinancePayId] = useState('');
  const [binanceName, setBinanceName] = useState('');

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      let initialBank = { bankName: '', accountNumber: '', holderName: '' };
      try { const b = JSON.parse(currentUser.bankDetails); if (b && typeof b === 'object') initialBank = b; } catch(e) {}
      
      let initialRocket = { rocketNumber: '', rocketName: '' };
      try { const r = JSON.parse(currentUser.rocketAccount); if (r && typeof r === 'object') initialRocket = r; } catch(e) {}
      
      let initialBinance = { binancePayId: '', binanceName: '' };
      try { const bn = JSON.parse(currentUser.binancePayId); if (bn && typeof bn === 'object') initialBinance = bn; } catch(e) {}

      setBankName(initialBank.bankName || currentUser.bankDetails || '');
      setBankAccountNumber(initialBank.accountNumber || '');
      setBankHolderName(initialBank.holderName || '');

      setRocketNumber(initialRocket.rocketNumber || currentUser.rocketAccount || '');
      setRocketName(initialRocket.rocketName || '');

      setBinancePayId(initialBinance.binancePayId || currentUser.binancePayId || '');
      setBinanceName(initialBinance.binanceName || '');
      
      if (currentUser.bankDetails) setSelectedPaymentMethod('bank');
      else if (currentUser.rocketAccount) setSelectedPaymentMethod('rocket');
      else if (currentUser.binancePayId) setSelectedPaymentMethod('binance');
      else setSelectedPaymentMethod('');

      setNewPassword('');
      setSaveMessage(null);
    }
  }, [isOpen, currentUser]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleOverlayClick = (e) => { if (e.target === overlayRef.current) onClose(); };

  const initials = (name || currentUser?.email || '?').slice(0, 2).toUpperCase();

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      let finalBankDetails = '';
      if (selectedPaymentMethod === 'bank') finalBankDetails = JSON.stringify({ bankName, accountNumber: bankAccountNumber, holderName: bankHolderName });
      let finalRocketAccount = '';
      if (selectedPaymentMethod === 'rocket') finalRocketAccount = JSON.stringify({ rocketNumber, rocketName });
      let finalBinancePayId = '';
      if (selectedPaymentMethod === 'binance') finalBinancePayId = JSON.stringify({ binancePayId, binanceName });

      const res = await updateUserProfile({ 
        name, 
        username, 
        avatarUrl,
        bankDetails: finalBankDetails,
        rocketAccount: finalRocketAccount,
        binancePayId: finalBinancePayId
      });
      let passRes = { success: true };
      if (newPassword.trim()) {
        passRes = await changePassword(newPassword.trim());
      }
      
      if (res.error || passRes.error) {
        setSaveMessage({ type: 'error', text: res.error || passRes.error });
      } else {
        setSaveMessage({ type: 'success', text: 'Profile updated!' });
        setNewPassword('');
        if (onProfileUpdated) onProfileUpdated();
        // Trigger auth-change so AuthContext reloads user data
        window.dispatchEvent(new Event('auth-change'));
        setTimeout(() => onClose(), 800);
      }
    } catch (e) {
      setSaveMessage({ type: 'error', text: 'Something went wrong.' });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    name !== (currentUser?.name || '') || 
    username !== (currentUser?.username || '') || 
    avatarUrl !== (currentUser?.avatarUrl || '') ||
    (selectedPaymentMethod === 'bank' ? JSON.stringify({ bankName, accountNumber: bankAccountNumber, holderName: bankHolderName }) : '') !== (currentUser?.bankDetails || '') ||
    (selectedPaymentMethod === 'rocket' ? JSON.stringify({ rocketNumber, rocketName }) : '') !== (currentUser?.rocketAccount || '') ||
    (selectedPaymentMethod === 'binance' ? JSON.stringify({ binancePayId, binanceName }) : '') !== (currentUser?.binancePayId || '') ||
    newPassword.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="profile-modal-overlay"
          ref={overlayRef}
          onClick={handleOverlayClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="profile-modal"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="profile-modal-header">
              <h3>Edit Profile</h3>
              <button className="profile-modal-close" onClick={onClose}><X size={18} /></button>
            </div>

            {/* Avatar Preview & Upload */}
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                marginBottom: '32px',
                marginTop: '10px'
              }}
            >
              <div 
                style={{ 
                  position: 'relative', 
                  width: '96px', 
                  height: '96px', 
                  borderRadius: '50%', 
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 12px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)',
                  transition: 'all 0.3s cubic-bezier(0.25,0.46,0.45,0.94)'
                }}
                onClick={() => document.getElementById('avatar-upload-modern').click()}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(52,211,153,0.6)';
                  e.currentTarget.style.transform = 'scale(1.06)';
                  e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.6), 0 0 30px rgba(52,211,153,0.2)';
                  e.currentTarget.querySelector('.avatar-overlay').style.opacity = '1';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.1)';
                  e.currentTarget.querySelector('.avatar-overlay').style.opacity = '0';
                }}
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(145deg, #1e293b, #0f172a)', color: 'rgba(255,255,255,0.9)', fontSize: '32px', fontWeight: 'bold' }}>
                    {initials}
                  </div>
                )}
                
                <div 
                  className="avatar-overlay"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(3,5,8,0.65)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    backdropFilter: 'blur(3px)',
                    WebkitBackdropFilter: 'blur(3px)'
                  }}
                >
                  <Camera size={26} color="#34d399" style={{ marginBottom: '6px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                  <span style={{ fontSize: '10px', color: '#fff', fontWeight: '700', letterSpacing: '1px' }}>UPDATE</span>
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '18px' }}>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#fff', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                  {name || currentUser?.email}
                </div>
                <div style={{ fontSize: '13px', color: '#34d399', fontWeight: '600', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  {currentUser?.role || 'User'}
                </div>
              </div>
              
              <input
                type="file"
                id="avatar-upload-modern"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const img = new Image();
                      img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_SIZE = 250;
                        let width = img.width;
                        let height = img.height;
                        if (width > height) {
                          if (width > MAX_SIZE) {
                            height = Math.round(height * (MAX_SIZE / width));
                            width = MAX_SIZE;
                          }
                        } else {
                          if (height > MAX_SIZE) {
                            width = Math.round(width * (MAX_SIZE / height));
                            height = MAX_SIZE;
                          }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
                        setAvatarUrl(compressedDataUrl);
                      };
                      img.src = reader.result;
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: 'none' }}
              />
            </div>

            {/* Form */}
            <div className="profile-form">
              <div className="profile-field">
                <label><User size={14} /> Display Name</label>
                <input
                  type="text"
                  placeholder="Your display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="profile-field">
                <label><AtSign size={14} /> Username</label>
                <input
                  type="text"
                  placeholder="your_username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))}
                />
              </div>
              
              {currentUser?.role === 'Editor' && (
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '16px' }}>
                  <label style={{ fontSize: '13px', color: 'var(--text-grey)', marginBottom: '12px', display: 'block', fontWeight: 600 }}>Payment Method (For Editor Payouts)</label>
                  <CustomSelect 
                    value={selectedPaymentMethod} 
                    onChange={(val) => {
                      setSelectedPaymentMethod(val);
                      setBankName(''); setBankAccountNumber(''); setBankHolderName('');
                      setRocketNumber(''); setRocketName('');
                      setBinancePayId(''); setBinanceName('');
                    }}
                    options={[
                      { value: '', label: 'Choose a payment method...' },
                      { value: 'bank', label: 'Bank Account' },
                      { value: 'rocket', label: 'Rocket Account' },
                      { value: 'binance', label: 'Binance Pay' }
                    ]}
                    style={{ width: '100%', marginBottom: '12px' }}
                  />

                  {selectedPaymentMethod === 'bank' && (
                    <>
                      <div className="profile-field" style={{ marginBottom: '12px' }}>
                        <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ marginTop: 0 }} />
                      </div>
                      <div className="profile-field" style={{ marginBottom: '12px' }}>
                        <input type="text" placeholder="Account Number" value={bankAccountNumber} onChange={(e) => setBankAccountNumber(e.target.value)} style={{ marginTop: 0 }} />
                      </div>
                      <div className="profile-field" style={{ marginBottom: 0 }}>
                        <input type="text" placeholder="Account Holder Name" value={bankHolderName} onChange={(e) => setBankHolderName(e.target.value)} style={{ marginTop: 0 }} />
                      </div>
                    </>
                  )}
                  {selectedPaymentMethod === 'rocket' && (
                    <>
                      <div className="profile-field" style={{ marginBottom: '12px' }}>
                        <input type="text" placeholder="Rocket Number (12 digit)" value={rocketNumber} onChange={(e) => setRocketNumber(e.target.value)} style={{ marginTop: 0 }} />
                      </div>
                      <div className="profile-field" style={{ marginBottom: 0 }}>
                        <input type="text" placeholder="Rocket Account Name" value={rocketName} onChange={(e) => setRocketName(e.target.value)} style={{ marginTop: 0 }} />
                      </div>
                    </>
                  )}
                  {selectedPaymentMethod === 'binance' && (
                    <>
                      <div className="profile-field" style={{ marginBottom: '12px' }}>
                        <input type="text" placeholder="Binance Pay ID" value={binancePayId} onChange={(e) => setBinancePayId(e.target.value)} style={{ marginTop: 0 }} />
                      </div>
                      <div className="profile-field" style={{ marginBottom: 0 }}>
                        <input type="text" placeholder="Name on Binance" value={binanceName} onChange={(e) => setBinanceName(e.target.value)} style={{ marginTop: 0 }} />
                      </div>
                    </>
                  )}
                  {selectedPaymentMethod && (
                    <div style={{ padding: '10px 12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'flex-start', marginTop: '12px' }}>
                      <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.85)', lineHeight: '1.4' }}>
                        <strong style={{ color: '#f59e0b' }}>Important:</strong> Please double-check your payment details. Providing incorrect information will result in payout delays or permanent loss of funds.
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="profile-field">
                <label><Lock size={14} /> Change Password</label>
                <input
                  type="password"
                  placeholder="New password (leave blank to keep current)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              {/* Status message */}
              {saveMessage && (
                <div className={`profile-message profile-message-${saveMessage.type}`}>
                  {saveMessage.type === 'success' ? <Check size={14} /> : <X size={14} />}
                  {saveMessage.text}
                </div>
              )}

              {/* Actions */}
              <div className="profile-actions">
                <button className="profile-cancel-btn" onClick={onClose} disabled={isSaving}>Cancel</button>
                <button 
                  className="profile-save-btn" 
                  onClick={handleSave} 
                  disabled={isSaving || !hasChanges}
                >
                  {isSaving ? <><Loader2 size={14} className="profile-spinner" /> Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
