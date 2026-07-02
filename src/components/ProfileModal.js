"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, User, AtSign, Camera, Check, Loader2, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { updateUserProfile, changePassword } from '@/actions/auth';

export default function ProfileModal({ isOpen, onClose, onProfileUpdated }) {
  const { currentUser } = useAuth();
  const overlayRef = useRef(null);
  
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  useEffect(() => {
    if (isOpen && currentUser) {
      setName(currentUser.name || '');
      setUsername(currentUser.username || '');
      setAvatarUrl(currentUser.avatarUrl || '');
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
      const res = await updateUserProfile({ name, username, avatarUrl });
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
                      setAvatarUrl(reader.result);
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
