"use client";

import React, { useState, useEffect, useCallback, useRef, useTransition } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import CardModal from './CardModal';
import InviteModal from './InviteModal';
import TeamManagementModal from './TeamManagementModal';
import ProfileModal from './ProfileModal';
import ConfirmModal from './ConfirmModal';
import { Plus, Search, Home, LayoutGrid, Share2, LogOut, Users, ChevronLeft, ChevronRight, BarChart2, User } from 'lucide-react';
import { useAuth } from './AuthContext';
import { logout } from '@/actions/auth';
import { getKanbanData, addCard, deleteCard, addColumn, updateBoardState, updateColumnOrder, updateCard, renameColumn, deleteColumn, addClientFromBoard } from '@/actions/kanban';
import { useRouter } from 'next/navigation';

export const LABELS = [
  { id: 'urgent', name: 'Urgent', color: '#ef4444' },
  { id: 'youtube', name: 'YouTube', color: '#ff0000' },
  { id: 'documentary', name: 'Documentary', color: '#a855f7' },
  { id: 'shorts', name: 'Shorts', color: '#f59e0b' },
  { id: 'vsl', name: 'VSL', color: '#ec4899' },
  { id: 'thumbnail', name: 'Thumbnail', color: '#14b8a6' },
  { id: 'motion', name: 'Motion GFX', color: '#3b82f6' },
  { id: 'coloring', name: 'Color Grade', color: '#8b5cf6' },
];

export default function KanbanBoard() {
  const router = useRouter();
  const [data, setData] = useState({ columns: {}, cards: {}, columnOrder: [], users: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeCardId, setActiveCardId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const isDraggingRef = useRef(false);
  const boardRef = useRef(null);
  const [isPending, startTransition] = useTransition();

  const { isAdmin, isSuperAdmin, currentUser } = useAuth();
  const canEdit = isAdmin || isSuperAdmin;

  const loadData = async () => {
    try {
      const fetchedData = await getKanbanData();
      setData(fetchedData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto-polling for real-time sync
  useEffect(() => {
    let timeoutId;
    let isMountedFlag = true;

    const poll = async () => {
      // Suspend polling if user is actively interacting with the board
      const isInteractive = isDraggingRef.current || activeCardId || isInviteModalOpen || isTeamModalOpen || isProfileOpen || confirmDialog;
      if (!isInteractive) {
        try {
          const dbData = await getKanbanData();
          if (isMountedFlag) {
            // Only update state if data actually changed to prevent unnecessary re-renders
            setData(prev => JSON.stringify(prev) === JSON.stringify(dbData) ? prev : dbData);
          }
        } catch (err) {
          console.error('Kanban poll error:', err);
        }
      }
      
      if (isMountedFlag) {
        timeoutId = setTimeout(poll, 15000); // 15 seconds
      }
    };

    timeoutId = setTimeout(poll, 15000);

    return () => {
      isMountedFlag = false;
      clearTimeout(timeoutId);
    };
  }, [activeCardId, isInviteModalOpen, isTeamModalOpen, isProfileOpen, confirmDialog]);

  const handleLogout = async () => {
    await logout();
    window.dispatchEvent(new Event('auth-change'));
  };

  /* ---- helpers ---- */
  const findColumnForCard = useCallback((cardId) => {
    for (const col of Object.values(data.columns)) {
      if (col.cardIds.includes(cardId)) return col.id;
    }
    return null;
  }, [data.columns]);

  /* ---- Drag & Drop ---- */
  const onDragEnd = useCallback((result) => {
    if (!canEdit) {
      isDraggingRef.current = false;
      return;
    }
    const { destination, source, draggableId, type } = result;
    if (!destination) {
      isDraggingRef.current = false;
      return;
    }
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      isDraggingRef.current = false;
      return;
    }

    if (type === 'column') {
      setData(prev => {
        const newOrder = Array.from(prev.columnOrder);
        newOrder.splice(source.index, 1);
        newOrder.splice(destination.index, 0, draggableId);
        return { ...prev, columnOrder: newOrder };
      });

      const newOrder = Array.from(data.columnOrder);
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, draggableId);

      startTransition(async () => {
        try {
          await updateColumnOrder(newOrder);
        } catch (err) {
          console.error('Failed to persist column order:', err);
        } finally {
          isDraggingRef.current = false;
        }
      });
      return;
    }

    const startCol = data.columns[source.droppableId];
    const endCol = data.columns[destination.droppableId];
    if (!startCol || !endCol) {
      isDraggingRef.current = false;
      return;
    }

    let newColumns;
    if (startCol.id === endCol.id) {
      const ids = Array.from(startCol.cardIds);
      ids.splice(source.index, 1);
      ids.splice(destination.index, 0, draggableId);
      setData(prev => ({ ...prev, columns: { ...prev.columns, [startCol.id]: { ...startCol, cardIds: ids } } }));
      
      newColumns = [{ id: startCol.id, cardIds: ids }];
    } else {
      const isCopy = source.droppableId !== destination.droppableId;
      const startIds = Array.from(startCol.cardIds);
      if (!isCopy) {
        startIds.splice(source.index, 1);
      }
      
      let movedCardId = draggableId;
      let newCardData = null;

      if (isCopy) {
        movedCardId = `c_${Date.now()}_copy`;
        const originalCard = data.cards[draggableId];
        
        newCardData = {
          ...originalCard,
          id: movedCardId,
          columnId: endCol.id,
        };
      }

      const endIds = Array.from(endCol.cardIds);
      endIds.splice(destination.index, 0, movedCardId);

      setData(prev => {
        const nextData = {
          ...prev,
          columns: {
            ...prev.columns,
            [startCol.id]: { ...startCol, cardIds: startIds },
            [endCol.id]: { ...endCol, cardIds: endIds },
          },
        };

        if (isCopy) {
          nextData.cards = { ...prev.cards, [movedCardId]: newCardData };
        } else {
          const movedCard = prev.cards[draggableId];
          if (movedCard) {
            nextData.cards = { ...prev.cards, [draggableId]: { ...movedCard, columnId: endCol.id } };
          }
        }

        return nextData;
      });

      if (isCopy) {
        startTransition(async () => {
          try {
            await addCard(newCardData);
            await updateBoardState([{ id: endCol.id, cardIds: endIds }]);
          } finally {
            isDraggingRef.current = false;
          }
        });
        return;
      }

      newColumns = [
        { id: startCol.id, cardIds: startIds },
        { id: endCol.id, cardIds: endIds }
      ];
    }

    startTransition(async () => {
      try {
        await updateBoardState(newColumns);
      } finally {
        isDraggingRef.current = false;
      }
    });

  }, [data.cards, data.columns, data.columnOrder, canEdit]);

  /* ---- Card CRUD ---- */
  const handleAddCard = useCallback((columnId, title) => {
    const id = `c_${Date.now()}`;
    const cardData = {
      id,
      columnId,
      title: title || 'New Card',
      labels: [],
      assignees: [],
      comments: [],
      checklist: []
    };

    // Optimistic UI update
    setData(prev => ({
      ...prev,
      cards: { ...prev.cards, [id]: cardData },
      columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], cardIds: [...prev.columns[columnId].cardIds, id] } }
    }));

    // Server update
    startTransition(async () => {
      await addCard(cardData);
    });
  }, []);

  const handleUpdateCard = useCallback((cardId, updates) => {
    setData(prev => ({
      ...prev,
      cards: { ...prev.cards, [cardId]: { ...prev.cards[cardId], ...updates } },
    }));

    startTransition(async () => {
      await updateCard(cardId, updates);
    });
  }, []);

  const handleDeleteCard = useCallback((cardId) => {
    setData(prev => {
      const newCards = { ...prev.cards };
      delete newCards[cardId];
      const newCols = {};
      for (const [k, col] of Object.entries(prev.columns)) {
        newCols[k] = { ...col, cardIds: col.cardIds.filter(id => id !== cardId) };
      }
      return { ...prev, cards: newCards, columns: newCols };
    });
    if (activeCardId === cardId) setActiveCardId(null);

    startTransition(async () => {
      await deleteCard(cardId);
    });
  }, [activeCardId]);

  /* ---- Column CRUD ---- */
  const handleAddColumn = useCallback((title) => {
    const id = `col_${Date.now()}`;
    setData(prev => ({
      ...prev,
      columns: { ...prev.columns, [id]: { id, title, cardIds: [] } },
      columnOrder: [...prev.columnOrder, id],
    }));

    startTransition(async () => {
      await addColumn(id, title);
    });
  }, []);

  const handleRenameColumn = useCallback((columnId, title) => {
    setData(prev => ({
      ...prev,
      columns: { ...prev.columns, [columnId]: { ...prev.columns[columnId], title } },
    }));

    startTransition(async () => {
      await renameColumn(columnId, title);
    });
  }, []);

  const handleDeleteColumn = useCallback((columnId) => {
    setConfirmDialog({
      title: 'Delete List',
      message: 'Are you sure you want to delete this list and all cards inside it?',
      onConfirm: () => {
        setData(prev => {
          const col = prev.columns[columnId];
          if (!col) return prev;
          
          const newCards = { ...prev.cards };
          col.cardIds.forEach(id => delete newCards[id]);
          
          const newCols = { ...prev.columns };
          delete newCols[columnId];
          
          return { 
            ...prev, 
            cards: newCards, 
            columns: newCols, 
            columnOrder: prev.columnOrder.filter(id => id !== columnId) 
          };
        });

        startTransition(async () => {
          await deleteColumn(columnId);
        });
        setConfirmDialog(null);
      }
    });
  }, []);

  const handleAddClient = useCallback(async (name) => {
    try {
      const newClient = await addClientFromBoard(name);
      setData(prev => ({
        ...prev,
        clients: [...(prev.clients || []), newClient]
      }));
      return newClient;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  /* ---- Comments & Checklist (Updates via handleUpdateCard) ---- */
  const addComment = useCallback((cardId, text) => {
    const authorId = currentUser ? currentUser.id.toString() : 'unknown';
    const comment = { id: `cm-${Date.now()}`, text, author: authorId, timestamp: Date.now(), replies: [] };
    const currentComments = data.cards[cardId]?.comments || [];
    handleUpdateCard(cardId, { comments: [...currentComments, comment] });
  }, [data.cards, handleUpdateCard, currentUser]);

  const addReply = useCallback((cardId, commentId, text) => {
    const authorId = currentUser ? currentUser.id.toString() : 'unknown';
    const reply = { id: `rp-${Date.now()}`, text, author: authorId, timestamp: Date.now() };
    const currentComments = data.cards[cardId]?.comments || [];
    const updatedComments = currentComments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: [...(c.replies || []), reply] };
      }
      return c;
    });
    handleUpdateCard(cardId, { comments: updatedComments });
  }, [data.cards, handleUpdateCard, currentUser]);

  const addChecklistItem = useCallback((cardId, text) => {
    const item = { id: `ck-${Date.now()}`, text, done: false };
    const currentChecklist = data.cards[cardId]?.checklist || [];
    handleUpdateCard(cardId, { checklist: [...currentChecklist, item] });
  }, [data.cards, handleUpdateCard]);

  const toggleChecklistItem = useCallback((cardId, itemId) => {
    const currentChecklist = data.cards[cardId]?.checklist || [];
    const updatedChecklist = currentChecklist.map(i => i.id === itemId ? { ...i, done: !i.done } : i);
    handleUpdateCard(cardId, { checklist: updatedChecklist });
  }, [data.cards, handleUpdateCard]);

  const deleteChecklistItem = useCallback((cardId, itemId) => {
    const currentChecklist = data.cards[cardId]?.checklist || [];
    const updatedChecklist = currentChecklist.filter(i => i.id !== itemId);
    handleUpdateCard(cardId, { checklist: updatedChecklist });
  }, [data.cards, handleUpdateCard]);

  if (isLoading) {
    return (
      <div className="kb-loading">
        {[1,2,3,4].map(i => <div key={i} className="kb-loading-pulse" />)}
      </div>
    );
  }

  const activeCard = activeCardId ? data.cards[activeCardId] : null;
  const activeCardColumn = activeCardId ? findColumnForCard(activeCardId) : null;
  const totalCards = Object.keys(data.cards).length;

  const teamMembers = data.users.map(u => ({
    id: u.id.toString(),
    name: u.name || u.email.split('@')[0],
    initials: (u.name || u.email).substring(0, 2).toUpperCase(),
    gradient: 'linear-gradient(135deg, var(--emerald), #10b981)',
    avatarUrl: u.avatarUrl
  }));

  return (
    <div className="kb-wrapper" data-lenis-prevent="true">
      {/* Header */}
      <header className="kb-header">
        <div className="kb-header-left">
          <h1 className="kb-page-title">Monolith Workflow</h1>
        </div>
      </header>

      {/* Toolbar */}
      <div className="kb-toolbar">
        <div className="kb-toolbar-left">
          <div className="kb-search">
            <Search size={15} className="kb-search-icon" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="kb-search-input"
            />
          </div>
          <span className="kb-stat-pill"><LayoutGrid size={13} /> {totalCards} cards</span>
          {isPending && <span className="kb-stat-pill" style={{color: 'var(--emerald)', borderColor: 'var(--emerald)'}}>Saving...</span>}
        </div>
        <div className="kb-toolbar-right">
          <div className="kb-avatars">
            {teamMembers.slice(0, 5).map(m => {
              const isCurrentUser = currentUser && m.id === currentUser.id.toString();
              return (
                <div 
                  key={m.id} 
                  className="kb-avatar" 
                  style={{ 
                    background: m.avatarUrl ? `url(${m.avatarUrl}) center/cover` : m.gradient,
                    cursor: isCurrentUser ? 'pointer' : 'default',
                    boxShadow: isCurrentUser ? '0 0 0 2px var(--emerald)' : 'none'
                  }} 
                  title={isCurrentUser ? 'Edit your profile' : m.name}
                  onClick={isCurrentUser ? () => setIsProfileOpen(true) : undefined}
                >
                  {!m.avatarUrl && m.initials}
                </div>
              );
            })}
            {teamMembers.length > 5 && (
              <div className="kb-avatar" style={{ background: '#333' }}>
                +{teamMembers.length - 5}
              </div>
            )}
          </div>
          {(isAdmin || isSuperAdmin) && (
            <>
              <button className="kb-toolbar-btn" onClick={() => setIsTeamModalOpen(true)} title="Manage Team">
                <Users size={16} /> Team
              </button>
              <button className="kb-toolbar-btn" onClick={() => setIsInviteModalOpen(true)}>
                <Share2 size={16} /> Share
              </button>
            </>
          )}
          {currentUser?.hasDashboardAccess && (
            <button className="kb-toolbar-btn" onClick={() => router.push('/dashboard')} title="Go to Dashboard">
              <BarChart2 size={16} /> Dashboard
            </button>
          )}
          <button className="kb-toolbar-btn" onClick={() => boardRef.current?.scrollTo({ left: 0, behavior: 'smooth' })} title="Scroll to first list">
            <ChevronLeft size={16} /> Start
          </button>
          <button className="kb-toolbar-btn" onClick={() => boardRef.current?.scrollTo({ left: boardRef.current?.scrollWidth || 0, behavior: 'smooth' })} title="Scroll to last list">
            <ChevronRight size={16} /> End
          </button>
          <button className="kb-toolbar-btn" onClick={() => setIsProfileOpen(true)} title="Edit Profile">
            <User size={16} />
          </button>
          <button className="kb-toolbar-btn kb-toolbar-btn-danger" onClick={handleLogout} title="Log Out">
            <LogOut size={16} />
          </button>
          {canEdit && <AddColumnBtn onAdd={handleAddColumn} />}
        </div>
      </div>

      {/* Board */}
      <DragDropContext onDragStart={() => { isDraggingRef.current = true; }} onDragEnd={onDragEnd}>
        <Droppable droppableId="board" type="column" direction="horizontal">
          {(provided) => (
            <div 
              className="kanban-board-container"
              ref={(el) => {
                provided.innerRef(el);
                boardRef.current = el;
              }}
              {...provided.droppableProps}
            >
              {data.columnOrder.map((colId, index) => {
                const col = data.columns[colId];
                if (!col) return null;
                const cards = col.cardIds
                  .map(id => data.cards[id])
                  .filter(Boolean)
                  .filter(c => !searchQuery || c.title.toLowerCase().includes(searchQuery.toLowerCase()));
                return (
                  <Draggable key={col.id} draggableId={col.id} index={index} isDragDisabled={!canEdit}>
                    {(dragProvided, dragSnapshot) => (
                      <div
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        className={`draggable-column-wrapper ${dragSnapshot.isDragging ? 'is-dragging' : ''}`}
                        style={{ ...dragProvided.draggableProps.style, display: 'flex' }}
                      >
                        <KanbanColumn
                          column={col}
                          index={index}
                          cards={cards}
                          teamMembers={teamMembers}
                          clients={data.clients || []}
                          allCardsCount={col.cardIds.length}
                          onAddCard={handleAddCard}
                          onDeleteCard={handleDeleteCard}
                          onOpenCard={setActiveCardId}
                          onRename={handleRenameColumn}
                          onDeleteColumn={handleDeleteColumn}
                          canEdit={canEdit}
                        />
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Card Detail Panel */}
      {activeCard && (
        <CardModal
          card={data.cards[activeCardId]}
          columnTitle={data.columns[data.cards[activeCardId]?.columnId]?.title || ''}
          teamMembers={data.users}
          clients={data.clients || []}
          currentUser={currentUser}
          onClose={() => setActiveCardId(null)}
          onUpdate={handleUpdateCard}
          onDelete={() => handleDeleteCard(activeCardId)}
          onAddComment={addComment}
          onAddReply={addReply}
          onAddChecklistItem={addChecklistItem}
          onToggleChecklistItem={toggleChecklistItem}
          onDeleteChecklistItem={deleteChecklistItem}
          onAddClient={handleAddClient}
          canEdit={canEdit}
        />
      )}

      {/* Invite Modal */}
      <InviteModal 
        isOpen={isInviteModalOpen} 
        onClose={() => setIsInviteModalOpen(false)} 
      />

      {/* Team Management Modal */}
      <TeamManagementModal 
        isOpen={isTeamModalOpen} 
        onClose={() => setIsTeamModalOpen(false)} 
      />

      <ConfirmModal
        isOpen={!!confirmDialog}
        title={confirmDialog?.title}
        message={confirmDialog?.message}
        onConfirm={confirmDialog?.onConfirm}
        onCancel={() => setConfirmDialog(null)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={loadData}
      />
    </div>
  );
}

/* ---- Add Column Button ---- */
function AddColumnBtn({ onAdd }) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => { if (adding && inputRef.current) inputRef.current.focus(); }, [adding]);

  const submit = () => {
    if (title.trim()) { onAdd(title.trim()); setTitle(''); setAdding(false); }
  };

  if (!adding) {
    return (
      <button className="kb-toolbar-btn kb-toolbar-btn-primary" onClick={() => setAdding(true)}>
        <Plus size={15} /> Add List
      </button>
    );
  }

  return (
    <div className="kb-add-col-form">
      <input
        ref={inputRef}
        className="kb-add-col-input"
        placeholder="Enter list title..."
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') setAdding(false); }}
      />
      <button className="kb-add-col-submit" onClick={submit}>Add</button>
      <button className="kb-add-col-cancel" onClick={() => setAdding(false)}>✕</button>
    </div>
  );
}
