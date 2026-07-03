"use client";

import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { MessageSquare, CheckSquare, Clock, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { LABELS } from './KanbanBoard';
import { useAuth } from './AuthContext';

export default function KanbanCard({ card, index, teamMembers, clients = [], onClick, onDelete, canEdit, isClone, provided, snapshot }) {
  const { isSuperAdmin } = useAuth();
  const cardLabels = (card.labels || []).map(id => LABELS.find(l => l.id === id)).filter(Boolean);
  const cardMembers = (card.assignees || []).map(id => teamMembers.find(m => m.id === id)).filter(Boolean);
  const commentCount = (card.comments || []).length;
  const checklistTotal = (card.checklist || []).length;
  const checklistDone = (card.checklist || []).filter(i => i.done).length;
  
  const client = clients.find(c => c.id === card.clientId);

  const content = (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className={`kanban-card ${snapshot?.isDragging ? 'is-dragging' : ''}`}
      style={provided?.draggableProps?.style}
      onClick={onClick}
    >
          {/* Actions on hover */}
          <div className="kanban-card-hover-actions">
            {isSuperAdmin && (
              <button className="kanban-card-action-btn" onClick={(e) => { e.stopPropagation(); if (onDelete) onDelete(); }} title="Delete card">
                <Trash2 size={12} />
              </button>
            )}
            <button className="kanban-card-action-btn" onClick={(e) => { e.stopPropagation(); onClick(); }} title="Open card">
              <Pencil size={12} />
            </button>
          </div>

          {/* Label dots */}
          {cardLabels.length > 0 && (
            <div className="kanban-card-labels">
              {cardLabels.map(label => (
                <span key={label.id} className="kanban-label-pill" style={{ background: label.color }} title={label.name}>
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <div className="kanban-card-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', flex: 1, overflow: 'hidden' }}>
              <CheckCircle2 size={14} className="kanban-card-status-icon" style={{ marginTop: '2px', flexShrink: 0 }} />
              <h4 className="kanban-card-title">{card.title}</h4>
            </div>
            {cardMembers.length > 0 && (
              <div className="kanban-card-avatars" style={{ flexShrink: 0, marginLeft: '8px' }}>
                {cardMembers.map(m => (
                  <div key={m.id} className="kanban-avatar" style={{ background: m.avatarUrl ? `url(${m.avatarUrl}) center/cover` : m.gradient, width: '20px', height: '20px', fontSize: '9px' }} title={m.name}>
                    {!m.avatarUrl && m.initials}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Name */}
          {client && (
            <div style={{ fontSize: '11px', color: 'var(--text-white)', marginTop: '4px', marginBottom: '8px', fontWeight: '500' }}>
              {client.name}
            </div>
          )}

          {/* Bottom info row */}
          {(commentCount > 0 || checklistTotal > 0 || card.dueDate) && (
            <div className="kanban-card-footer">
              <div className="kanban-card-badges">
                {card.dueDate && (
                  <span className="kanban-card-badge">
                    <Clock size={12} /> {card.dueDate}
                  </span>
                )}
                {commentCount > 0 && (
                  <span className="kanban-card-badge">
                    <MessageSquare size={12} /> {commentCount}
                  </span>
                )}
                {checklistTotal > 0 && (
                  <span className={`kanban-card-badge ${checklistDone === checklistTotal ? 'done' : ''}`}>
                    <CheckSquare size={12} /> {checklistDone}/{checklistTotal}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
  );

  if (isClone) return content;

  return (
    <Draggable draggableId={card.id} index={index} isDragDisabled={!canEdit}>
      {(dragProvided, dragSnapshot) => (
        <KanbanCard
          card={card}
          index={index}
          teamMembers={teamMembers}
          clients={clients}
          onClick={onClick}
          onDelete={onDelete}
          canEdit={canEdit}
          isClone={true}
          provided={dragProvided}
          snapshot={dragSnapshot}
        />
      )}
    </Draggable>
  );
}
