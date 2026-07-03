"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import KanbanCard from './KanbanCard';
import { MoreHorizontal, Trash2, Pencil, Plus } from 'lucide-react';

export default function KanbanColumn({ column, index, cards, teamMembers, clients, allCardsCount, onAddCard, onDeleteCard, onOpenCard, onRename, onDeleteColumn, canEdit }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [colTitle, setColTitle] = useState(column.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const titleRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => { if (editingTitle && titleRef.current) titleRef.current.focus(); }, [editingTitle]);
  useEffect(() => { setColTitle(column.title); }, [column.title]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);



  const submitRename = () => {
    if (colTitle.trim() && colTitle.trim() !== column.title) {
      onRename(column.id, colTitle.trim());
    } else {
      setColTitle(column.title);
    }
    setEditingTitle(false);
  };

  return (
    <div className="kanban-column">
      {/* Header */}
      <div className="kanban-column-header">
        <div className="kanban-column-title-area">
          {editingTitle ? (
            <input
              ref={titleRef}
              className="kanban-col-title-input"
              value={colTitle}
              onChange={e => setColTitle(e.target.value)}
              onBlur={submitRename}
              onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') { setColTitle(column.title); setEditingTitle(false); } }}
            />
          ) : (
            <h3 className="kanban-column-title" onClick={() => canEdit && setEditingTitle(true)} title={canEdit ? "Click to rename" : ""}>
              {column.title}
            </h3>
          )}
          <span className="kanban-column-badge">{allCardsCount}</span>
        </div>
        {canEdit && (
          <div className="kanban-column-actions" ref={menuRef}>
            <button className="kanban-icon-btn" onClick={() => setMenuOpen(!menuOpen)} title="More options">
              <MoreHorizontal size={16} />
            </button>
            {menuOpen && (
              <div className="kanban-col-menu">
                <button onClick={() => { setEditingTitle(true); setMenuOpen(false); }}>
                  <Pencil size={14} /> Rename
                </button>
                <button className="danger" onClick={() => { onDeleteColumn(column.id); setMenuOpen(false); }}>
                  <Trash2 size={14} /> Delete List
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cards List */}
      <Droppable 
        droppableId={column.id} 
        type="card"
        isCombineEnabled={false}
        ignoreContainerClipping={false}
      >
        {(provided, snapshot) => (
          <div
            className={`kanban-cards-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {cards.length === 0 ? (
              <div className="kanban-empty">Drop a card here</div>
            ) : cards.map((card, index) => (
              <KanbanCard
                key={card.id}
                card={card}
                index={index}
                teamMembers={teamMembers}
                clients={clients}
                onDelete={() => onDeleteCard(card.id)}
                onClick={() => onOpenCard(card.id)}
                canEdit={canEdit}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      {/* Footer - Add Card Button */}
      {canEdit && (
        <div className="kanban-column-footer">
          <button className="kanban-add-btn" onClick={() => onAddCard(column.id)}>
            <Plus size={16} />
            <span>Add a card</span>
          </button>
        </div>
      )}
    </div>
  );
}
