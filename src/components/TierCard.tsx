import React, { useState } from 'react';
import { TierItem, TierDefinition } from '../types';

interface TierCardProps {
  item: TierItem;
  index: number;
  tiers: TierDefinition[];
  currentTierId: string | null;
  onMoveToTier: (itemId: string, targetTierId: string, targetIndex?: number) => void;
  onUnrank: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onEdit: (itemId: string, newTitle: string) => void;
}

export const TierCard: React.FC<TierCardProps> = ({
  item,
  index,
  tiers,
  currentTierId,
  onMoveToTier,
  onUnrank,
  onDelete,
  onEdit,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.title);
  const [showOptions, setShowOptions] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    (window as any).__draggedTierItemId = item.id;
    e.dataTransfer.setData('application/x-tier-item-id', item.id);
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    (window as any).__draggedTierItemId = null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const draggedId = e.dataTransfer.getData('application/x-tier-item-id')
      || e.dataTransfer.getData('text/plain')
      || (window as any).__draggedTierItemId;

    if (draggedId && currentTierId) {
      onMoveToTier(draggedId, currentTierId, index);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEdit(item.id, editText.trim().toUpperCase());
    } else {
      setEditText(item.title);
    }
    setIsEditing(false);
  };

  const getCardFontSize = (text: string) => {
    const len = text.length;
    if (len <= 15) return 'text-2xl sm:text-3xl md:text-4xl leading-[1.05]';
    if (len <= 30) return 'text-xl sm:text-2xl md:text-[26px] leading-[1.08]';
    if (len <= 55) return 'text-base sm:text-lg md:text-xl leading-[1.1]';
    if (len <= 85) return 'text-sm sm:text-base leading-[1.12]';
    return 'text-xs sm:text-sm leading-[1.15]';
  };

  return (
    <div
      draggable={!isEditing}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowOptions(true);
      }}
      className={`tier-card relative flex items-center justify-center p-3 select-none self-stretch shrink-0 group transition-all ${
        isDragging ? 'opacity-30 scale-95' : 'opacity-100'
      } ${isDragOver ? 'border-l-8 border-l-amber-400 bg-neutral-100' : ''}`}
      style={{
        width: '210px',
        minWidth: '170px',
      }}
      title="Drag to reorder • Double-click to edit • Right-click for options"
    >
      {isEditing ? (
        <textarea
          autoFocus
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSaveEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSaveEdit();
            }
            if (e.key === 'Escape') {
              setIsEditing(false);
              setEditText(item.title);
            }
          }}
          className="w-full h-full text-base font-black uppercase text-center resize-none bg-yellow-100 text-black outline-none p-2 border border-black font-sans leading-tight"
        />
      ) : (
        <span
          onDoubleClick={() => setIsEditing(true)}
          className={`overflow-hidden break-words px-1.5 whitespace-pre-line ${getCardFontSize(item.title)}`}
          style={{
            color: '#000000',
            fontFamily: 'Impact, "Arial Black", Arial, sans-serif',
            fontWeight: 900,
          }}
        >
          {item.title}
        </span>
      )}

      {/* Simple corner delete button */}
      {!isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black text-white hover:bg-red-600 text-[10px] w-4 h-4 flex items-center justify-center font-bold"
          title="Delete"
        >
          ✕
        </button>
      )}

      {/* Simple right-click menu */}
      {showOptions && (
        <div
          className="absolute top-2 left-2 z-50 bg-black text-white border-2 border-white p-2 text-xs font-sans shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-bold text-[10px] uppercase text-neutral-400 mb-1">Move to:</div>
          <div className="flex flex-col gap-1 mb-2">
            {tiers.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onMoveToTier(item.id, t.id);
                  setShowOptions(false);
                }}
                disabled={t.id === currentTierId}
                className="px-2 py-0.5 text-black font-bold text-left text-xs"
                style={{ backgroundColor: t.color }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-1 border-t border-neutral-700 pt-1">
            <button
              type="button"
              onClick={() => {
                onUnrank(item.id);
                setShowOptions(false);
              }}
              className="text-left text-amber-300 hover:underline"
            >
              Send back to Stack
            </button>
            <button
              type="button"
              onClick={() => {
                onDelete(item.id);
                setShowOptions(false);
              }}
              className="text-left text-red-400 hover:underline"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setShowOptions(false)}
              className="text-left text-neutral-400 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
