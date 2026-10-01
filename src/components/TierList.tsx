import React, { useState } from 'react';
import { TierDefinition, TierItem } from '../types';
import { TierCard } from './TierCard';

interface TierListProps {
  tiers: TierDefinition[];
  items: TierItem[];
  isFullscreen?: boolean;
  onMoveToTier: (itemId: string, targetTierId: string, targetIndex?: number) => void;
  onUnrank: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onEditItem: (itemId: string, newTitle: string) => void;
  onUpdateTier: (tierId: string, updates: Partial<TierDefinition>) => void;
}

export const TierList: React.FC<TierListProps> = ({
  tiers,
  items,
  onMoveToTier,
  onUnrank,
  onDelete,
  onEditItem,
  onUpdateTier,
}) => {
  const [dragOverTierId, setDragOverTierId] = useState<string | null>(null);
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState<string>('');

  const handleDragOver = (e: React.DragEvent, tierId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverTierId !== tierId) {
      setDragOverTierId(tierId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, tierId: string) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverTierId === tierId) {
      setDragOverTierId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, tierId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverTierId(null);
    const itemId = e.dataTransfer.getData('application/x-tier-item-id')
      || e.dataTransfer.getData('text/plain')
      || (window as any).__draggedTierItemId;
    if (itemId) {
      onMoveToTier(itemId, tierId);
    }
  };

  const startEditTier = (tier: TierDefinition) => {
    setEditingTierId(tier.id);
    setEditingLabel(tier.label);
  };

  const saveEditTier = (tierId: string) => {
    if (editingLabel.trim()) {
      onUpdateTier(tierId, { label: editingLabel.trim().toUpperCase() });
    }
    setEditingTierId(null);
  };

  return (
    <div
      id="tier-list-board"
      className="tier-table w-full h-full flex-1 flex flex-col select-none border-0 overflow-hidden"
    >
      <div className="flex flex-col flex-1 h-full w-full">
        {tiers.map((tier) => {
          const tierItems = items.filter((item) => item.tierId === tier.id);
          const isOver = dragOverTierId === tier.id;

          return (
            <div
              key={tier.id}
              className={`tier-row flex-1 h-full flex items-stretch border-b-2 border-black transition-colors ${
                isOver ? 'bg-[#2b2426]' : 'bg-[#1e1a1b]'
              }`}
              onDragOver={(e) => handleDragOver(e, tier.id)}
              onDragLeave={(e) => handleDragLeave(e, tier.id)}
              onDrop={(e) => handleDrop(e, tier.id)}
            >
              {/* Left Column: Flat Solid Color Tier Label */}
              <div
                className="tier-label w-36 sm:w-44 md:w-52 min-w-[140px] flex items-center justify-center p-2 text-center relative select-none shrink-0"
                style={{ backgroundColor: tier.color }}
              >
                {editingTierId === tier.id ? (
                  <input
                    autoFocus
                    type="text"
                    value={editingLabel}
                    onChange={(e) => setEditingLabel(e.target.value)}
                    onBlur={() => saveEditTier(tier.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditTier(tier.id);
                      if (e.key === 'Escape') setEditingTierId(null);
                    }}
                    className="w-full text-sm sm:text-base font-black uppercase text-center bg-white text-black p-1.5 border-2 border-black outline-none"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEditTier(tier)}
                    className="text-lg sm:text-2xl md:text-3xl font-black tracking-wider break-words line-clamp-2 select-none px-2"
                    style={{ color: '#222222' }}
                    title="Double-click to rename"
                  >
                    {tier.label}
                  </span>
                )}
              </div>

              {/* Right Column: Cards sitting flush along the row */}
              <div
                className="flex-1 h-full flex flex-wrap items-stretch content-stretch overflow-hidden"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverTierId !== tier.id) {
                    setDragOverTierId(tier.id);
                  }
                }}
                onDrop={(e) => handleDrop(e, tier.id)}
              >
                {tierItems.map((item, idx) => (
                  <TierCard
                    key={item.id}
                    item={item}
                    index={idx}
                    tiers={tiers}
                    currentTierId={tier.id}
                    onMoveToTier={onMoveToTier}
                    onUnrank={onUnrank}
                    onDelete={onDelete}
                    onEdit={onEditItem}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
