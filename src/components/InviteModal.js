"use client";

import React, { useState, useEffect } from 'react';
import { X, Link as LinkIcon, CheckCircle2, UserPlus, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import CustomSelect from './CustomSelect';
import { createInvite } from '@/actions/auth';

export default function InviteModal({ isOpen, onClose }) {
  const { currentUser, isSuperAdmin, isAdmin } = useAuth();
  
  const [role, setRole] = useState('Viewer');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setGeneratedLink('');
      setCopied(false);
      setRole('Viewer');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGenerateLink = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = await createInvite(role);
      const baseUrl = window.location.origin || 'http://localhost:3000';
      const link = `${baseUrl}/projects?inviteToken=${encodeURIComponent(token)}`;
      setGeneratedLink(link);
    } catch (err) {
      alert("Failed to generate invite link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="invite-modal-overlay">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="invite-modal-content"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <button className="invite-close-btn" onClick={onClose}>
              <X size={18} />
            </button>
            
            <div className="invite-header">
              <div className="invite-icon-wrapper">
                <UserPlus size={24} />
              </div>
              <h2>Share Workflow</h2>
              <p>Generate an invite link to let team members join the board.</p>
            </div>

            {generatedLink ? (
              <motion.div 
                className="invite-success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="invite-link-box">
                  <div className="invite-link-text">{generatedLink}</div>
                  <button className="invite-copy-btn" onClick={handleCopy}>
                    {copied ? <CheckCircle2 size={16} className="text-emerald" /> : <Copy size={16} />}
                  </button>
                </div>
                <p className="invite-link-desc">
                  {copied ? 'Link copied to clipboard!' : `Share this link to invite an ${role}`}
                </p>
                <button className="invite-submit-btn" onClick={() => setGeneratedLink('')} style={{marginTop: 16, width: '100%'}}>
                  Generate Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleGenerateLink} className="invite-form">
                <div className="invite-input-row" style={{ flexDirection: 'column' }}>
                  <label style={{ fontSize: 13, color: 'var(--text-grey)' }}>Role for new member:</label>
                  <CustomSelect 
                    value={role} 
                    onChange={(val) => setRole(val)}
                    options={[
                      { value: 'Viewer', label: 'Viewer' },
                      { value: 'Client', label: 'Client' },
                      { value: 'Editor', label: 'Editor' },
                      ...(isSuperAdmin ? [{ value: 'Admin', label: 'Admin' }] : [])
                    ]}
                  />
                </div>
                
                <button 
                  type="submit" 
                  className={`invite-submit-btn ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  <LinkIcon size={16} /> Generate Invite Link
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
