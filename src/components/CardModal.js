"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Tag,
  Users,
  Calendar,
  CheckSquare,
  MessageSquare,
  Trash2,
  Plus,
  Send,
  Link,
  File,
  Download,
} from "lucide-react";
import { TEAM_MEMBERS, LABELS } from "./KanbanBoard";
import { submitProject, notifyNewAssignees } from "@/actions/kanban";

export default function CardModal({
  card,
  columnTitle,
  teamMembers,
  clients = [],
  onClose,
  onUpdate,
  onDelete,
  onAddComment,
  onAddReply,
  onAddChecklistItem,
  onToggleChecklistItem,
  onDeleteChecklistItem,
  onAddClient,
  canEdit,
  currentUser,
}) {
  const [title, setTitle] = useState(card.title);
  const [projectFileName, setProjectFileName] = useState(card.projectFileName || "");
  const [clientPaymentAmount, setClientPaymentAmount] = useState(card.clientPaymentAmount || "");
  const [desc, setDesc] = useState(card.description || "");
  const [commentText, setCommentText] = useState("");
  const [checklistText, setChecklistText] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newRefLinkUrl, setNewRefLinkUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [deliveryVideoLink, setDeliveryVideoLink] = useState("");
  const [deliveryDuration, setDeliveryDuration] = useState("");
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'error') => {
    setToastMessage({ text: message, type });
    setTimeout(() => setToastMessage(null), 3000);
  };
  const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
  const [deliveryMsg, setDeliveryMsg] = useState("");
  const [showLabels, setShowLabels] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [dueDate, setDueDate] = useState(card.dueDate || "");
  const [deadlineHours, setDeadlineHours] = useState(card.deadlineHours || "");
  const [ratePerMinute, setRatePerMinute] = useState(card.ratePerMinute || "");
  const [localDeliveredDuration, setLocalDeliveredDuration] = useState(card.deliveredDuration || null);
  const [timerDisplay, setTimerDisplay] = useState("");
  const [newlyAssigned, setNewlyAssigned] = useState(new Set());
  const [isClosing, setIsClosing] = useState(false);
  const overlayRef = useRef(null);

  // Timer refresh logic
  useEffect(() => {
    if (!card.timerStartedAt || !card.deadlineHours) return;

    const updateTimer = () => {
      const start = new Date(card.timerStartedAt);
      const elapsedMs = new Date().getTime() - start.getTime();
      const deadlineMs = card.deadlineHours * 60 * 60 * 1000;
      
      let remainingMs = deadlineMs - elapsedMs;
      const isOverdue = remainingMs < 0;
      if (isOverdue) remainingMs = Math.abs(remainingMs);
      
      const hrs = Math.floor(remainingMs / (1000 * 60 * 60));
      const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((remainingMs % (1000 * 60)) / 1000);
      
      const timeString = `${hrs}h ${mins}m ${secs}s`;
      
      setTimerDisplay(
        `${timeString} ${isOverdue ? 'overdue' : 'remaining'} / ${card.deadlineHours} hrs total`
      );
    };

    const interval = setInterval(updateTimer, 1000); // update every second
    updateTimer(); // Initial calc

    return () => clearInterval(interval);
  }, [card.timerStartedAt, card.deadlineHours]);

  // Sync from prop if card changes
  useEffect(() => {
    setTitle(card.title);
    setProjectFileName(card.projectFileName || "");
    setDesc(card.description || "");
    setDueDate(card.dueDate || "");
    setDeadlineHours(card.deadlineHours || "");
    setRatePerMinute(card.ratePerMinute || "");
    setLocalDeliveredDuration(card.deliveredDuration || null);
  }, [card]);

  // Close on Escape
  const handleClose = async () => {
    if (isClosing) return;
    setIsClosing(true);
    
    if (newlyAssigned.size > 0) {
      try {
        const ids = Array.from(newlyAssigned);
        setNewlyAssigned(new Set()); // Clear early to prevent duplicates
        await notifyNewAssignees(card.id, ids);
      } catch (err) {
        console.error("Failed to notify assignees:", err);
      }
    }
    onClose();
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, newlyAssigned, isClosing]);

  // Close on overlay click
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const saveTitle = () => {
    if (title.trim() && title !== card.title)
      onUpdate(card.id, { title: title.trim() });
  };
  const saveProjectFileName = () => {
    if (projectFileName !== card.projectFileName) onUpdate(card.id, { projectFileName: projectFileName });
  };
  const saveClientPaymentAmount = () => {
    const amountNum = clientPaymentAmount ? parseInt(clientPaymentAmount) : null;
    if (amountNum !== card.clientPaymentAmount) {
      onUpdate(card.id, { clientPaymentAmount: amountNum });
    }
  };
  const saveDesc = () => {
    if (desc !== card.description) onUpdate(card.id, { description: desc });
  };
  const saveDueDate = (val) => {
    setDueDate(val);
    onUpdate(card.id, { dueDate: val || null });
  };
  const saveDeadline = () => {
    const val = parseInt(deadlineHours);
    if (!isNaN(val)) onUpdate(card.id, { deadlineHours: val });
    else onUpdate(card.id, { deadlineHours: null });
  };
  const saveRate = () => {
    const val = parseInt(ratePerMinute);
    if (!isNaN(val)) onUpdate(card.id, { ratePerMinute: val });
    else onUpdate(card.id, { ratePerMinute: null });
  };

  const toggleLabel = (labelId) => {
    const current = card.labels || [];
    const updated = current.includes(labelId)
      ? current.filter((l) => l !== labelId)
      : [...current, labelId];
    onUpdate(card.id, { labels: updated });
  };

  const toggleMember = (memberId) => {
    const current = card.assignees || [];
    const updated = current.includes(memberId)
      ? current.filter((m) => m !== memberId)
      : [...current, memberId];

    if (!current.includes(memberId)) {
      setNewlyAssigned(prev => new Set(prev).add(memberId));
    }

    // Pass local state to ensure the assignment email has the latest un-blurred data
    onUpdate(card.id, {
      assignees: updated,
      description: desc,
      title: title.trim() || card.title,
      deadlineHours: parseInt(deadlineHours) || card.deadlineHours,
    });
  };

  const submitComment = () => {
    if (commentText.trim()) {
      onAddComment(card.id, commentText.trim());
      setCommentText("");
    }
  };

  const submitReply = (commentId) => {
    if (replyText.trim() && onAddReply) {
      onAddReply(card.id, commentId, replyText.trim());
      setReplyText("");
      setReplyingTo(null);
    }
  };

  const submitChecklistItem = () => {
    if (checklistText.trim()) {
      onAddChecklistItem(card.id, checklistText.trim());
      setChecklistText("");
    }
  };

  const handleAddLink = () => {
    if (newLinkUrl.trim()) {
      let url = newLinkUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      const currentLinks = card.projectLinks || [];
      onUpdate(card.id, {
        projectLinks: [...currentLinks, { id: Date.now().toString(), url }],
      });
      setNewLinkUrl("");
    }
  };

  const handleDeleteLink = (linkId) => {
    const currentLinks = card.projectLinks || [];
    onUpdate(card.id, {
      projectLinks: currentLinks.filter((l) => l.id !== linkId),
    });
  };

  const handleAddRefLink = () => {
    if (newRefLinkUrl.trim()) {
      let url = newRefLinkUrl.trim();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      const currentLinks = card.referenceLinks || [];
      onUpdate(card.id, {
        referenceLinks: [...currentLinks, { id: Date.now().toString(), url }],
      });
      setNewRefLinkUrl("");
    }
  };

  const handleDeleteRefLink = (linkId) => {
    const currentLinks = card.referenceLinks || [];
    onUpdate(card.id, {
      referenceLinks: currentLinks.filter((l) => l.id !== linkId),
    });
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadError("");

    const formData = new FormData();
    for (const file of files) formData.append("files", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        const currentAtts = card.attachments || [];
        onUpdate(card.id, { attachments: [...currentAtts, ...data.files] });
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch (err) {
      setUploadError("Upload failed");
    } finally {
      setIsUploading(false);
      e.target.value = null; // reset input
    }
  };

  const handleDeleteFile = (fileId) => {
    const currentAtts = card.attachments || [];
    onUpdate(card.id, {
      attachments: currentAtts.filter((a) => a.id !== fileId),
    });
  };

  const checklistTotal = (card.checklist || []).length;
  const checklistDone = (card.checklist || []).filter((i) => i.done).length;
  const checklistPercent =
    checklistTotal > 0 ? Math.round((checklistDone / checklistTotal) * 100) : 0;

  const handleDeliverProject = async () => {
    const finalClientId =
      card.clientId ||
      clients.find((c) => c.name.toLowerCase() === card.title.toLowerCase())
        ?.id;

    if (!deliveryVideoLink || !deliveryDuration) {
      setDeliveryMsg("Please provide both video link and total duration.");
      return;
    }
    if (!finalClientId) {
      setDeliveryMsg(
        "Cannot deliver: No client associated with this card. Ensure the card title matches a client name or link a client.",
      );
      return;
    }

    setIsSubmittingDelivery(true);
    setDeliveryMsg("");
    try {
      const res = await submitProject(
        card.id,
        finalClientId,
        deliveryVideoLink,
        deliveryDuration,
      );
      if (res.success) {
        setDeliveryMsg("Project delivered successfully!");
        setDeliveryVideoLink("");
        setDeliveryDuration("");
        setLocalDeliveredDuration(deliveryDuration);
      } else {
        setDeliveryMsg("Failed to deliver project.");
      }
    } catch (e) {
      setDeliveryMsg(e.message || "Error occurred");
    }
    setIsSubmittingDelivery(false);
  };

  return (
    <div className="cm-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="cm-panel">
        {/* Header */}
        <div className="cm-header">
          <div className="cm-header-info">
            <span className="cm-column-tag">{columnTitle}</span>
          </div>
          <button className="cm-close" onClick={handleClose} disabled={isClosing}>
            {isClosing ? <span style={{ fontSize: "12px", padding: "0 4px" }}>...</span> : <X size={20} />}
          </button>
        </div>
        {/* Content */}
        <div className="cm-body">
          <div className="cm-layout">
            {/* MAIN CONTENT */}
            <div className="cm-main">
              {/* Title */}
              {canEdit ? (
                <input
                  className="cm-title-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.target.blur();
                    }
                  }}
                />
              ) : (
                <div className="cm-title-input" style={{ border: 'none', background: 'transparent' }}>
                  {title}
                </div>
              )}
              
              {/* Project File Name */}
              <div className="cm-section" style={{ marginTop: '12px' }}>
                <h4 className="cm-section-title" style={{ color: 'var(--emerald)' }}>
                  <File size={14} /> Project File Name
                </h4>
                {canEdit ? (
                  <input
                    type="text"
                    className="cm-desc-input"
                    placeholder="Enter project file name (e.g. ehh_v1_final)"
                    value={projectFileName}
                    onChange={(e) => setProjectFileName(e.target.value)}
                    onBlur={saveProjectFileName}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.target.blur();
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: 'rgba(0,0,0,0.2)',
                      color: 'var(--text-light)',
                      marginTop: '4px',
                      fontSize: '14px'
                    }}
                  />
                ) : (
                  <div style={{ color: "var(--text-light)", padding: "8px 12px", background: "rgba(0,0,0,0.2)", borderRadius: "6px", marginTop: "4px" }}>
                    {projectFileName || <span style={{ color: "var(--text-grey)", fontStyle: 'italic' }}>No project file name provided.</span>}
                  </div>
                )}
              </div>

              {/* Client Payment Amount */}
              {canEdit && (
                <div className="cm-section" style={{ marginTop: '12px' }}>
                  <h4 className="cm-section-title" style={{ color: 'var(--emerald)' }}>
                    <File size={14} /> Client Payment Amount ($)
                  </h4>
                  <input
                    type="number"
                    className="cm-desc-input"
                    placeholder={
                      canEdit
                        ? "e.g. 150"
                        : "No payment amount provided."
                    }
                    value={clientPaymentAmount}
                    onChange={(e) => setClientPaymentAmount(e.target.value)}
                    onBlur={saveClientPaymentAmount}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.target.blur();
                      }
                    }}
                    readOnly={!canEdit}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      borderRadius: '6px', 
                      border: '1px solid rgba(255,255,255,0.1)', 
                      background: 'rgba(0,0,0,0.2)',
                      color: '#fff',
                      marginTop: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              )}

              {/* Description */}
              <div className="cm-section">
                <h4 className="cm-section-title">
                  <MessageSquare size={14} /> Description
                </h4>
                {canEdit ? (
                  <textarea
                    className="cm-desc-input"
                    placeholder="Add a more detailed description..."
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    onBlur={saveDesc}
                    rows={4}
                  />
                ) : (
                  <div style={{ color: "var(--text-light)", whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.2)", padding: "12px", borderRadius: "6px" }}>
                    {desc || <span style={{ color: "var(--text-grey)", fontStyle: 'italic' }}>No description provided.</span>}
                  </div>
                )}
              </div>

              {/* Checklist */}
              <div className="cm-section">
                <h4 className="cm-section-title">
                  <CheckSquare size={14} /> Checklist
                </h4>
                {checklistTotal > 0 && (
                  <div className="cm-checklist-progress">
                    <span className="cm-checklist-pct">
                      {checklistPercent}%
                    </span>
                    <div className="cm-checklist-bar">
                      <div
                        className="cm-checklist-bar-fill"
                        style={{ width: `${checklistPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div className="cm-checklist-items">
                  {(card.checklist || []).map((item) => (
                    <div
                      key={item.id}
                      className={`cm-checklist-item ${item.done ? "done" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => onToggleChecklistItem(card.id, item.id)}
                        className="cm-checkbox"
                        disabled={!canEdit}
                      />
                      <span className="cm-checklist-text">{item.text}</span>
                      {canEdit && (
                        <button
                          className="cm-checklist-delete"
                          onClick={() =>
                            onDeleteChecklistItem(card.id, item.id)
                          }
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {canEdit && (
                  <div className="cm-checklist-add">
                    <input
                      className="cm-checklist-input"
                      placeholder="Add an item..."
                      value={checklistText}
                      onChange={(e) => setChecklistText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") submitChecklistItem();
                      }}
                    />
                    <button
                      className="cm-checklist-add-btn"
                      onClick={submitChecklistItem}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                )}

                {/* Project Assets */}
                <div className="cm-section" style={{ marginTop: "24px" }}>
                  <h4 className="cm-section-title">
                    <Link size={14} /> Project Assets
                  </h4>

                  {/* Links */}
                  <div style={{ marginBottom: "16px" }}>
                    <h5
                      style={{
                        fontSize: "12px",
                        color: "var(--text-grey)",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                      }}
                    >
                      Links
                    </h5>
                    {(card.projectLinks || []).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          marginBottom: "12px",
                        }}
                      >
                        {(card.projectLinks || []).map((link) => (
                          <div
                            key={link.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "var(--bg-dark)",
                              padding: "8px 12px",
                              borderRadius: "6px",
                            }}
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "var(--emerald)",
                                fontSize: "13px",
                                textDecoration: "none",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "80%",
                              }}
                            >
                              {link.url}
                            </a>
                            {canEdit && (
                              <button
                                onClick={() => handleDeleteLink(link.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-grey)",
                                  cursor: "pointer",
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {canEdit && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="url"
                          placeholder="Add a link (e.g. Frame.io, Google Drive)..."
                          className="cm-comment-input"
                          value={newLinkUrl}
                          onChange={(e) => setNewLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddLink();
                          }}
                          style={{ flex: 1, padding: "8px 12px" }}
                        />
                        <button
                          onClick={handleAddLink}
                          className="cm-comment-submit"
                          style={{
                            padding: "8px 16px",
                            background: "var(--dark-grey)",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Reference Links */}
                  <div style={{ marginBottom: "24px" }}>
                    <h5
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "var(--text-grey)",
                        textTransform: "uppercase",
                        marginBottom: "12px",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Reference Video Links
                    </h5>
                    {(card.referenceLinks || []).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          marginBottom: "12px",
                        }}
                      >
                        {(card.referenceLinks || []).map((link) => (
                          <div
                            key={link.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "var(--bg-dark)",
                              padding: "8px 12px",
                              borderRadius: "6px",
                            }}
                          >
                            <a
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                color: "var(--emerald)",
                                fontSize: "13px",
                                textDecoration: "none",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                maxWidth: "80%",
                              }}
                            >
                              {link.url}
                            </a>
                            {canEdit && (
                              <button
                                onClick={() => handleDeleteRefLink(link.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-grey)",
                                  cursor: "pointer",
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    {canEdit && (
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          type="url"
                          placeholder="Add a reference video link..."
                          className="cm-comment-input"
                          value={newRefLinkUrl}
                          onChange={(e) => setNewRefLinkUrl(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddRefLink();
                          }}
                          style={{ flex: 1, padding: "8px 12px" }}
                        />
                        <button
                          onClick={handleAddRefLink}
                          className="cm-comment-submit"
                          style={{
                            padding: "8px 16px",
                            background: "var(--dark-grey)",
                          }}
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Attachments */}
                  <div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "8px",
                      }}
                    >
                      <h5
                        style={{
                          fontSize: "12px",
                          color: "var(--text-grey)",
                          textTransform: "uppercase",
                          margin: 0,
                        }}
                      >
                        Files
                      </h5>
                      {(card.attachments || []).length > 0 && (
                        <a
                          href={`/api/download-zip?cardId=${card.id}`}
                          download
                          className="cm-comment-submit"
                          style={{
                            padding: "4px 10px",
                            fontSize: "11px",
                            background: "var(--emerald)",
                            color: "#000",
                            textDecoration: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Download size={12} /> ZIP All
                        </a>
                      )}
                    </div>

                    {(card.attachments || []).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          marginBottom: "12px",
                        }}
                      >
                        {(card.attachments || []).map((file) => (
                          <div
                            key={file.id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "var(--bg-dark)",
                              padding: "8px 12px",
                              borderRadius: "6px",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                overflow: "hidden",
                              }}
                            >
                              <File size={14} color="var(--text-grey)" />
                              <a
                                href={file.url}
                                download={file.name}
                                style={{
                                  color: "#fff",
                                  fontSize: "13px",
                                  textDecoration: "none",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {file.name}
                              </a>
                              <span
                                style={{
                                  fontSize: "10px",
                                  color: "var(--text-grey)",
                                }}
                              >
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            </div>
                            {canEdit && (
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--text-grey)",
                                  cursor: "pointer",
                                }}
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {canEdit && (
                      <div>
                        <label
                          style={{
                            display: "inline-block",
                            cursor: isUploading ? "not-allowed" : "pointer",
                            background: "var(--dark-grey)",
                            padding: "8px 16px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            color: "#fff",
                            opacity: isUploading ? 0.7 : 1,
                          }}
                        >
                          {isUploading ? "Uploading..." : "Upload Files"}
                          <input
                            type="file"
                            multiple
                            onChange={handleFileUpload}
                            disabled={isUploading}
                            style={{ display: "none" }}
                          />
                        </label>
                        {uploadError && (
                          <div
                            style={{
                              color: "red",
                              fontSize: "11px",
                              marginTop: "4px",
                            }}
                          >
                            {uploadError}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Project Delivery Section */}
              {canEdit && (
                <div
                  className="cm-section"
                  style={{
                    marginTop: "30px",
                    padding: "20px",
                    background: "rgba(52, 211, 153, 0.05)",
                    borderRadius: "8px",
                    border: "1px solid rgba(52, 211, 153, 0.2)",
                  }}
                >
                  <h4
                    className="cm-section-title"
                    style={{ color: "var(--emerald)" }}
                  >
                    <Send size={14} /> Deliver Project
                  </h4>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-grey)",
                      marginBottom: "16px",
                    }}
                  >
                    Submit your final video link to notify admins and mark this
                    project for review.
                  </p>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <input
                      type="url"
                      className="cm-comment-input"
                      style={{ width: "100%", padding: "10px" }}
                      placeholder="Final Video URL (e.g. Frame.io [Recommended], Google Drive)"
                      value={deliveryVideoLink}
                      onChange={(e) => setDeliveryVideoLink(e.target.value)}
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      className="cm-comment-input"
                      style={{ width: "100%", padding: "10px" }}
                      placeholder="Video Duration (in minutes, e.g. 15.5)"
                      value={deliveryDuration}
                      onChange={(e) => setDeliveryDuration(e.target.value)}
                    />
                    <button
                      className="cm-comment-submit"
                      style={{
                        alignSelf: "flex-start",
                        padding: "8px 16px",
                        background: "var(--emerald)",
                        color: "#000",
                        fontWeight: "600",
                      }}
                      onClick={handleDeliverProject}
                      disabled={
                        isSubmittingDelivery ||
                        !deliveryVideoLink ||
                        !deliveryDuration
                      }
                    >
                      {isSubmittingDelivery
                        ? "Delivering..."
                        : "Submit Delivery"}
                    </button>
                    {deliveryMsg && (
                      <p
                        style={{
                          fontSize: "12px",
                          color: deliveryMsg.includes("success")
                            ? "var(--emerald)"
                            : "red",
                        }}
                      >
                        {deliveryMsg}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Comments */}
              <div className="cm-section">
                <h4 className="cm-section-title">
                  <MessageSquare size={14} /> Comments
                </h4>
                <div className="cm-comment-form">
                  <textarea
                    className="cm-comment-input"
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        submitComment();
                      }
                    }}
                    rows={2}
                  />
                  <button
                    className="cm-comment-submit"
                    onClick={submitComment}
                    disabled={!commentText.trim()}
                  >
                    Send
                  </button>
                </div>
                <div className="cm-comments-list">
                  {(card.comments || [])
                    .filter(comment => {
                      const isSuperAdmin = currentUser?.role === 'Super Admin';
                      if (isSuperAdmin) return true;
                      
                      const author = teamMembers.find(m => m.id?.toString() === comment.author);
                      return comment.author === currentUser?.id?.toString() || author?.role === 'Super Admin';
                    })
                    .slice()
                    .reverse()
                    .map((comment) => {
                      const author = teamMembers.find(
                        (m) => m.id?.toString() === comment.author,
                      );
                      
                      const isSuperAdmin = currentUser?.role === 'Super Admin';
                      const filteredReplies = (comment.replies || []).filter(reply => {
                        if (isSuperAdmin) return true;
                        const replyAuthor = teamMembers.find(m => m.id?.toString() === reply.author);
                        return reply.author === currentUser?.id?.toString() || replyAuthor?.role === 'Super Admin';
                      });

                      return (
                        <div
                          key={comment.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          <div className="cm-comment">
                            <div
                              className="cm-comment-avatar"
                              style={{
                                background: author?.avatarUrl
                                  ? `url(${author.avatarUrl}) center/cover`
                                  : author?.gradient || "#555",
                              }}
                            >
                              {!author?.avatarUrl && (author?.initials || "?")}
                            </div>
                            <div className="cm-comment-body">
                              <span className="cm-comment-author">
                                {author?.name || "Unknown User"}
                              </span>
                              <p className="cm-comment-text">{comment.text}</p>
                              <button
                                onClick={() => {
                                  setReplyingTo(comment.id);
                                  setReplyText("");
                                }}
                                style={{
                                  background: "transparent",
                                  border: "none",
                                  color: "var(--emerald)",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                  marginTop: "4px",
                                  padding: 0,
                                }}
                              >
                                Reply
                              </button>
                            </div>
                          </div>

                          {/* Replies */}
                          {filteredReplies.length > 0 && (
                            <div
                              style={{
                                paddingLeft: "38px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "8px",
                              }}
                            >
                              {filteredReplies.map((reply) => {
                                const replyAuthor = teamMembers.find(
                                  (m) => m.id?.toString() === reply.author,
                                );
                                return (
                                  <div
                                    key={reply.id}
                                    className="cm-comment"
                                    style={{ gap: "8px" }}
                                  >
                                    <div
                                      className="cm-comment-avatar"
                                      style={{
                                        width: "22px",
                                        height: "22px",
                                        fontSize: "8px",
                                        background: replyAuthor?.avatarUrl
                                          ? `url(${replyAuthor.avatarUrl}) center/cover`
                                          : replyAuthor?.gradient || "#555",
                                      }}
                                    >
                                      {!replyAuthor?.avatarUrl &&
                                        (replyAuthor?.initials || "?")}
                                    </div>
                                    <div className="cm-comment-body">
                                      <span
                                        className="cm-comment-author"
                                        style={{ fontSize: "11px" }}
                                      >
                                        {replyAuthor?.name || "Unknown User"}
                                      </span>
                                      <p
                                        className="cm-comment-text"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {reply.text}
                                      </p>
                                      <button
                                        onClick={() => {
                                          setReplyingTo(comment.id);
                                          setReplyText(
                                            `@${replyAuthor?.name || "User"} `,
                                          );
                                        }}
                                        style={{
                                          background: "transparent",
                                          border: "none",
                                          color: "var(--emerald)",
                                          fontSize: "10px",
                                          cursor: "pointer",
                                          marginTop: "2px",
                                          padding: 0,
                                        }}
                                      >
                                        Reply
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Reply Input Form */}
                          {replyingTo === comment.id && (
                            <div
                              style={{ paddingLeft: "38px", marginTop: "4px" }}
                            >
                              <div
                                className="cm-comment-form"
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <input
                                  type="text"
                                  className="cm-comment-input"
                                  style={{
                                    flex: 1,
                                    padding: "6px 10px",
                                    fontSize: "12px",
                                  }}
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      submitReply(comment.id);
                                    } else if (e.key === "Escape")
                                      setReplyingTo(null);
                                  }}
                                  autoFocus
                                />
                                <button
                                  className="cm-comment-submit"
                                  style={{ padding: "6px 12px" }}
                                  onClick={() => submitReply(comment.id)}
                                  disabled={!replyText.trim()}
                                >
                                  Reply
                                </button>
                                <button
                                  onClick={() => setReplyingTo(null)}
                                  style={{
                                    background: "transparent",
                                    border: "none",
                                    color: "var(--text-grey)",
                                    cursor: "pointer",
                                    padding: "6px",
                                  }}
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* SIDEBAR */}
            <div className="cm-sidebar">
              {canEdit && (
                <div className="cm-section">
                  <h4 className="cm-section-title">Add to card</h4>
                  <div className="cm-quick-actions">
                    <button
                      className={`cm-action-btn ${showLabels ? "active" : ""}`}
                      onClick={() => {
                        setShowLabels(!showLabels);
                        setShowMembers(false);
                      }}
                    >
                      <Tag size={14} /> Labels
                    </button>
                    <button
                      className={`cm-action-btn ${showMembers ? "active" : ""}`}
                      onClick={() => {
                        if (!showMembers) {
                          const links = card.projectLinks || [];
                          if (!projectFileName || projectFileName.trim() === '' || links.length === 0) {
                            showToast("You must provide a Project File Name and add at least one Project Link before assigning an editor.");
                            return;
                          }
                        }
                        setShowMembers(!showMembers);
                        setShowLabels(false);
                      }}
                    >
                      <Users size={14} /> Members
                    </button>
                  </div>
                </div>
              )}

              {/* Labels Picker */}
              {showLabels && (
                <div className="cm-picker">
                  <h4 className="cm-picker-title">Labels</h4>
                  <div className="cm-picker-grid">
                    {LABELS.map((label) => (
                      <button
                        key={label.id}
                        className={`cm-label-btn ${(card.labels || []).includes(label.id) ? "selected" : ""}`}
                        style={{ "--label-color": label.color }}
                        onClick={() => toggleLabel(label.id)}
                      >
                        <span
                          className="cm-label-dot"
                          style={{ background: label.color }}
                        ></span>
                        {label.name}
                        {(card.labels || []).includes(label.id) && (
                          <span className="cm-label-check">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Members Picker */}
              {showMembers && (
                <div className="cm-picker">
                  <h4 className="cm-picker-title">Members</h4>
                  <input
                    type="text"
                    placeholder="Search members"
                    className="cm-picker-search"
                    autoFocus
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const btns = document.querySelectorAll(".cm-member-btn");
                      btns.forEach((btn) => {
                        if (btn.textContent.toLowerCase().includes(val)) {
                          btn.style.display = "flex";
                        } else {
                          btn.style.display = "none";
                        }
                      });
                    }}
                  />
                  <div
                    className="cm-picker-grid"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      marginTop: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "600",
                        color: "var(--text-grey)",
                        marginBottom: "4px",
                      }}
                    >
                      Board members
                    </span>
                    {teamMembers.map((member) => (
                      <button
                        key={member.id}
                        className={`cm-member-btn ${(card.assignees || []).includes(member.id) ? "selected" : ""}`}
                        onClick={() => toggleMember(member.id)}
                        style={{ justifyContent: "flex-start" }}
                      >
                        <div
                          className="cm-member-avatar"
                          style={{
                            background: member.avatarUrl
                              ? `url(${member.avatarUrl}) center/cover`
                              : member.gradient,
                          }}
                        >
                          {!member.avatarUrl && member.initials}
                        </div>
                        {member.name}
                        {(card.assignees || []).includes(member.id) && (
                          <span
                            className="cm-label-check"
                            style={{ marginLeft: "auto" }}
                          >
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Labels Display */}
              {(card.labels || []).length > 0 && (
                <div className="cm-section">
                  <h4 className="cm-section-title">
                    <Tag size={14} /> Labels
                  </h4>
                  <div className="cm-labels-display">
                    {(card.labels || []).map((id) => {
                      const l = LABELS.find((lb) => lb.id === id);
                      return l ? (
                        <span
                          key={l.id}
                          className="cm-label-tag"
                          style={{ background: l.color }}
                        >
                          {l.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Current Members Display */}
              <div className="cm-section">
                <h4 className="cm-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} /> Members
                  </div>
                  {canEdit && (
                    <button
                      onClick={() => {
                        if (!showMembers) {
                          const links = card.projectLinks || [];
                          if (!projectFileName || projectFileName.trim() === '' || links.length === 0 || !deadlineHours || Number(deadlineHours) <= 0) {
                            showToast("You must provide a Project File Name, add at least one Project Link, and set a valid Deadline before assigning an editor.");
                            return;
                          }
                        }
                        setShowMembers(!showMembers);
                        setShowLabels(false);
                      }}
                      style={{
                        background: 'transparent', border: 'none', color: 'var(--emerald)', 
                        fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px'
                      }}
                    >
                      <Plus size={12} /> {card.assignees?.length > 0 ? "Change" : "Add"}
                    </button>
                  )}
                </h4>
                {(card.assignees || []).length > 0 ? (
                  <div className="cm-members-display">
                    {(card.assignees || []).map((id) => {
                      const m = teamMembers.find((mb) => mb.id === id);
                      return m ? (
                        <div key={m.id} className="cm-member-chip" style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: canEdit ? '8px' : '12px' }}>
                          <div
                            className="cm-member-avatar-sm"
                            style={{
                              background: m.avatarUrl
                                ? `url(${m.avatarUrl}) center/cover`
                                : m.gradient,
                            }}
                          >
                            {!m.avatarUrl && m.initials}
                          </div>
                          {m.name}
                          {canEdit && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleMember(m.id);
                              }}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '2px',
                                borderRadius: '4px',
                                marginLeft: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--red, #ef4444)'}
                              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>
                    No members assigned yet.
                  </div>
                )}
              </div>

              {/* Schedule & Deadline */}
              <div className="cm-section">
                <h4 className="cm-section-title">
                  <Calendar size={14} /> Properties
                </h4>
                <div className="cm-property-row">
                  <span className="cm-property-label">Deadline (Hours)</span>
                  {canEdit ? (
                    <input
                      type="number"
                      min="1"
                      className="cm-comment-input"
                      value={deadlineHours}
                      onChange={(e) => setDeadlineHours(e.target.value)}
                      onBlur={saveDeadline}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveDeadline();
                      }}
                      placeholder="e.g. 10"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    />
                  ) : (
                    <div style={{ color: "var(--emerald)", fontWeight: "600", fontSize: "14px" }}>
                      {card.deadlineHours ? `${card.deadlineHours} Hours` : "Not set"}
                    </div>
                  )}
                </div>
                <div className="cm-property-row">
                  <span className="cm-property-label">
                    Rate per Minute (TK)
                  </span>
                  {canEdit ? (
                    <input
                      type="number"
                      min="1"
                      className="cm-comment-input"
                      value={ratePerMinute}
                      onChange={(e) => setRatePerMinute(e.target.value)}
                      onBlur={saveRate}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveRate();
                      }}
                      placeholder="e.g. 100"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.03)",
                      }}
                    />
                  ) : (
                    <div style={{ color: "var(--text-light)", fontWeight: "500", fontSize: "14px" }}>
                      {card.ratePerMinute ? `${card.ratePerMinute} TK` : "Not set"}
                    </div>
                  )}
                </div>
              </div>
              {!!card.timerStartedAt && !!card.deadlineHours && !localDeliveredDuration && (
                <div
                  style={{
                    padding: "12px",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "6px",
                    fontSize: "13px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                      marginBottom: "8px",
                    }}
                  >
                    <span style={{ color: "var(--text-grey)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.5px" }}>Timer</span>
                    <span style={{ color: timerDisplay.includes('overdue') ? "var(--red, #ef4444)" : "var(--emerald)", fontWeight: 600, fontSize: "15px" }}>
                      {timerDisplay || "Calculating..."}
                    </span>
                  </div>
                  <div style={{ color: "var(--text-grey)", fontSize: "11px" }}>
                    Started: {new Date(card.timerStartedAt).toLocaleString()}
                  </div>
                </div>
              )}
              {card.penaltyPercent > 0 && (
                <div
                  style={{
                    padding: "12px",
                    background: "rgba(239, 68, 68, 0.1)",
                    border: "1px solid rgba(239, 68, 68, 0.2)",
                    borderRadius: "6px",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      color: "#ef4444",
                      fontWeight: 600,
                      fontSize: "11px",
                    }}
                  >
                    LATE PENALTY
                  </span>
                  <span
                    style={{
                      color: "#ef4444",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    -{card.penaltyPercent}%
                  </span>
                </div>
              )}
              {/* Footer */}
              <div className="cm-footer">
                <button
                  className="cm-delete-btn"
                  onClick={() => onDelete(card.id)}
                >
                  <Trash2 size={14} /> Delete Card
                </button>
              </div>

              {/* Editor Payment Display */}
              {card.deliveredDuration && card.ratePerMinute ? (
                <div
                  className="cm-section"
                  style={{
                    marginTop: "20px",
                    padding: "16px",
                    background: "var(--bg-dark)",
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <h4
                    className="cm-section-title"
                    style={{ marginBottom: "12px" }}
                  >
                    Editor Payment Details
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "13px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-grey)",
                      }}
                    >
                      <span>Video Duration:</span>
                      <span>{card.deliveredDuration} minutes</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-grey)",
                      }}
                    >
                      <span>Rate per Minute:</span>
                      <span>{card.ratePerMinute} TK</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "var(--text-grey)",
                      }}
                    >
                      <span>Subtotal:</span>
                      <span>
                        {card.ratePerMinute * card.deliveredDuration} TK
                      </span>
                    </div>
                    {card.penaltyPercent > 0 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          color: "#ef4444",
                        }}
                      >
                        <span>Late Penalty (-{card.penaltyPercent}%):</span>
                        <span>
                          -
                          {Math.round(
                            card.ratePerMinute *
                              card.deliveredDuration *
                              (card.penaltyPercent / 100),
                          )}{" "}
                          TK
                        </span>
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        color: "#fff",
                        fontWeight: "600",
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      <span>Total Payout:</span>
                      <span style={{ color: "var(--emerald)" }}>
                        {Math.round(
                          card.ratePerMinute * card.deliveredDuration -
                            card.ratePerMinute *
                              card.deliveredDuration *
                              (card.penaltyPercent / 100),
                        )}{" "}
                        TK
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Custom Centered Alert */}
        {toastMessage && (
          <>
            <div style={{
              position: 'fixed',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 99999,
              transition: 'all 0.3s ease'
            }} />
            <div style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#18181b',
              border: toastMessage.type === 'error' ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(52, 211, 153, 0.5)',
              padding: '32px 24px',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              zIndex: 100000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              maxWidth: '400px',
              width: '90%',
              gap: '16px',
            }}>
              <div style={{ 
                width: '56px', height: '56px', borderRadius: '50%', 
                background: toastMessage.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(52, 211, 153, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: toastMessage.type === 'error' ? '#ef4444' : '#34d399',
                marginBottom: '8px'
              }}>
                {toastMessage.type === 'error' ? <X size={28} strokeWidth={2.5} /> : <CheckSquare size={28} strokeWidth={2.5} />}
              </div>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 600 }}>
                {toastMessage.type === 'error' ? 'Action Required' : 'Success'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5', color: '#a1a1aa' }}>
                {toastMessage.text}
              </p>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
