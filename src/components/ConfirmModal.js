'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';

export default function ConfirmModal({ isOpen, title, message, type = 'confirm', isDanger = true, onConfirm, onCancel, confirmText }) {
  if (!isOpen) return null;

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
            style={{ maxWidth: '400px', textAlign: 'center', padding: '32px 24px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: (type === 'confirm' && isDanger) ? '#ef4444' : 'var(--emerald)' }}>
              {(type === 'confirm' && isDanger) ? <AlertTriangle size={48} /> : <Info size={48} />}
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              {title || (type === 'confirm' ? 'Are you sure?' : 'Alert')}
            </h2>
            
            <p style={{ color: 'var(--text-grey)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
              {message}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              {type === 'confirm' && (
                <button 
                  onClick={onCancel}
                  className="kb-toolbar-btn"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  Cancel
                </button>
              )}
              <button 
                onClick={onConfirm}
                className={(type === 'confirm' && isDanger) ? "kb-toolbar-btn kb-toolbar-btn-danger" : "kb-toolbar-btn kb-toolbar-btn-primary"}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                {confirmText || (type === 'confirm' ? 'Delete' : 'OK')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
