"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { X, Users, Trash2, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from './AuthContext';
import { getAllUsers, deleteUser } from '@/actions/auth';
import ConfirmModal from './ConfirmModal';

export default function TeamManagementModal({ isOpen, onClose }) {
  const { currentUser, isSuperAdmin, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [isPending, startTransition] = useTransition();
  const [confirmDialog, setConfirmDialog] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = () => {
    startTransition(async () => {
      const all = await getAllUsers();
      setUsers(all);
    });
  };

  if (!isOpen) return null;

  const handleRemoveUser = (id, role, email) => {
    if (role === 'Super Admin') {
      setConfirmDialog({ type: 'alert', title: 'Cannot Remove', message: 'Cannot remove Super Admin' });
      return;
    }
    if (role === 'Admin' && !isSuperAdmin) {
      setConfirmDialog({ type: 'alert', title: 'Permission Denied', message: 'Only Super Admins can remove Admins' });
      return;
    }
    
    setConfirmDialog({
      type: 'confirm',
      title: 'Remove User',
      message: `Are you sure you want to remove ${email}?`,
      onConfirm: () => {
        startTransition(async () => {
          await deleteUser(id);
          loadUsers();
        });
        setConfirmDialog(null);
      }
    });
  };

  return (
    <div className="invite-modal-overlay">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className="invite-modal-content"
            style={{ maxWidth: 600 }}
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <button className="invite-close-btn" onClick={onClose} disabled={isPending}>
              <X size={18} />
            </button>
            
            <div className="invite-header">
              <div className="invite-icon-wrapper" style={{ color: 'var(--emerald)', background: 'rgba(52,211,153,0.1)' }}>
                <Users size={24} />
              </div>
              <h2>Team Management</h2>
              <p>Manage members of this workflow.</p>
            </div>

            <div className="team-list" style={{ opacity: isPending ? 0.5 : 1 }}>
              {users.map((u) => {
                const isSelf = u.id === currentUser?.id;
                let canRemove = false;
                if (!isSelf) {
                  if (isSuperAdmin && u.role !== 'Super Admin') canRemove = true;
                  if (isAdmin && !isSuperAdmin && u.role !== 'Super Admin' && u.role !== 'Admin') canRemove = true;
                }

                return (
                  <div key={u.id} className="team-member-row">
                    <div className="team-member-info">
                      <div className="team-member-avatar" style={{ background: u.avatarUrl ? `url(${u.avatarUrl}) center/cover` : undefined }}>
                        {!u.avatarUrl && (u.name?.charAt(0) || u.email.charAt(0)).toUpperCase()}
                      </div>
                      <div>
                        <div className="team-member-name">
                          {u.name || u.username || u.email.split('@')[0]} {isSelf && <span className="team-badge self">You</span>}
                        </div>
                        <div className="team-member-email" style={{ color: 'var(--emerald)' }}>
                          @{u.username || u.email.split('@')[0]}
                        </div>
                      </div>
                    </div>
                    <div className="team-member-actions">
                      <span className={`team-badge role-${(u.role || '').replace(' ', '').toLowerCase()}`}>
                        {u.role === 'Super Admin' && <ShieldAlert size={12} style={{marginRight: 4}} />}
                        {u.role}
                      </span>
                      {canRemove && (
                        <button className="team-remove-btn" onClick={() => handleRemoveUser(u.id, u.role, u.email)} title="Remove user" disabled={isPending}>
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={!!confirmDialog}
        type={confirmDialog?.type}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        onConfirm={() => {
          if (confirmDialog?.onConfirm) confirmDialog.onConfirm();
          else setConfirmDialog(null); // Alert ok button
        }}
        onCancel={() => setConfirmDialog(null)}
      />
    </div>
  );
}
