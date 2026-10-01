import React, { useState, useRef } from 'react';
import { TierItem, TierDefinition } from '../types';

interface UnrankedColumnProps {
  width?: number;
  unrankedItems: TierItem[];
  tiers: TierDefinition[];
  onAddItem: (title: string) => void;
  onOpenAddModal: () => void;
  onRankItem: (itemId: string, tierId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem?: (itemId: string, newTitle: string) => void;
  onDropToUnrank: (itemId: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onExportImage: () => void;
  isExporting: boolean;
  onReset: () => void;
}

// Dedicated single unranked card matching Image 1
const UnrankedCard: React.FC<{
  item: TierItem;
  tiers: TierDefinition[];
  isSelected: boolean;
  onSelect: () => void;
  onRankItem: (itemId: string, tierId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onEditItem?: (itemId: string, newTitle: string) => void;
}> = ({
  item,
  tiers,
  isSelected,
  onSelect,
  onRankItem,
  onDeleteItem,
  onEditItem,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.title);

  const handleSaveEdit = () => {
    if (editText.trim()) {
      onEditItem?.(item.id, editText.trim().toUpperCase());
    } else {
      setEditText(item.title);
    }
    setIsEditing(false);
  };

  const getUnrankedCardFontSize = (text: string) => {
    const len = text.length;
    if (len <= 15) return 'text-lg sm:text-xl md:text-2xl leading-[1.08]';
    if (len <= 30) return 'text-sm sm:text-base md:text-lg leading-[1.1]';
    if (len <= 55) return 'text-xs sm:text-sm leading-[1.12]';
    return 'text-[11px] sm:text-xs leading-[1.15]';
  };

  const [isDragging, setIsDragging] = useState(false);
  const isDragRef = useRef(false);

  return (
    <div
      draggable={!isEditing}
      onDragStart={(e) => {
        isDragRef.current = true;
        setIsDragging(true);
        (window as any).__draggedTierItemId = item.id;
        e.dataTransfer.setData('application/x-tier-item-id', item.id);
        e.dataTransfer.setData('text/plain', item.id);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onDragEnd={() => {
        setIsDragging(false);
        (window as any).__draggedTierItemId = null;
        setTimeout(() => {
          isDragRef.current = false;
        }, 150);
      }}
      onClick={() => {
        if (!isDragRef.current) {
          onSelect();
        }
      }}
      className={`group relative flex items-center justify-center p-3 cursor-grab active:cursor-grabbing bg-white text-black border-2 border-black select-none min-h-[92px] transition-all hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#000000] ${
        isDragging ? 'opacity-30 scale-95' : 'opacity-100'
      } ${isSelected ? 'ring-2 ring-black outline outline-2 outline-amber-400' : ''}`}
      style={{
        fontFamily: 'Impact, "Arial Black", Arial, sans-serif',
        fontWeight: 900,
        textTransform: 'uppercase',
        textAlign: 'center',
        lineHeight: 1.15,
      }}
      title="Drag onto any tier, or click to choose tier"
    >
      {/* Corner delete button on hover */}
      {!isEditing && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteItem(item.id);
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black text-white hover:bg-red-600 text-[10px] w-4 h-4 flex items-center justify-center font-bold z-10 transition-opacity"
          title="Delete"
        >
          ✕
        </button>
      )}

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
          className="w-full h-full text-sm font-black uppercase text-center resize-none bg-yellow-100 text-black outline-none p-1 border border-black font-sans leading-tight"
        />
      ) : (
        <span
          onDoubleClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className={`break-words line-clamp-3 overflow-hidden ${getUnrankedCardFontSize(item.title)}`}
        >
          {item.title}
        </span>
      )}

      {/* Quick rank popover on click */}
      {isSelected && (
        <div
          className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-50 bg-black border-2 border-white p-1.5 shadow-2xl flex flex-col gap-1 text-xs w-[160px]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between text-[10px] text-neutral-400 font-bold uppercase pb-1 border-b border-neutral-800">
            <span>Rank in:</span>
            <button
              type="button"
              onClick={onSelect}
              className="hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="flex flex-col gap-1">
            {tiers.map((t, tIdx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onRankItem(item.id, t.id)}
                className="flex items-center justify-between px-2 py-1 text-black font-bold text-[11px] border border-black hover:opacity-90 transition-opacity"
                style={{ backgroundColor: t.color }}
              >
                <span>{t.label}</span>
                <span className="text-[9px] bg-black/20 text-black px-1 font-mono font-bold">
                  {tIdx + 1}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-1 flex items-center justify-between border-t border-neutral-800 text-[10px]">
            <span className="text-neutral-500">Or drag to tier</span>
            <button
              type="button"
              onClick={() => onDeleteItem(item.id)}
              className="text-red-400 hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const UnrankedColumn: React.FC<UnrankedColumnProps> = ({
  width,
  unrankedItems,
  tiers,
  onAddItem,
  onOpenAddModal,
  onRankItem,
  onDeleteItem,
  onEditItem,
  onDropToUnrank,
  isFullscreen,
  onToggleFullscreen,
  onExportImage,
  isExporting,
  onReset,
}) => {
  const [inputVal, setInputVal] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDragOverColumn, setIsDragOverColumn] = useState(false);

  // Keyboard shortcut when card selected: 1-5 to rank, Esc to deselect, Del to delete
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItemId) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Escape') {
        setSelectedItemId(null);
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        onDeleteItem(selectedItemId);
        setSelectedItemId(null);
      } else {
        const num = parseInt(e.key, 10);
        if (num >= 1 && num <= tiers.length) {
          onRankItem(selectedItemId, tiers[num - 1].id);
          setSelectedItemId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedItemId, tiers, onRankItem, onDeleteItem]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    onAddItem(inputVal.trim());
    setInputVal('');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDragOverColumn(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragOverColumn(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverColumn(false);
    const itemId = e.dataTransfer.getData('application/x-tier-item-id')
      || e.dataTransfer.getData('text/plain')
      || (window as any).__draggedTierItemId;
    if (itemId) {
      onDropToUnrank(itemId);
    }
  };

  return (
    <aside
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={width ? { width: `${width}px`, minWidth: `${width}px`, maxWidth: `${width}px` } : undefined}
      className={`${width ? '' : 'w-72 sm:w-80 md:w-96'} h-full bg-[#18181a] flex flex-col select-none shrink-0 z-20 ${
        isDragOverColumn ? 'bg-[#222228]' : ''
      }`}
    >
      {/* Top Header & Actions */}
      <div className="px-2.5 py-2 bg-black border-b-2 border-black flex items-center justify-between shrink-0 gap-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="font-black text-xs uppercase tracking-wider text-neutral-100">
            Unranked
          </span>
          <span className="bg-red-600 text-white text-[11px] font-mono font-bold px-1.5 py-0.5">
            {unrankedItems.length}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`text-xs font-bold px-2 py-1 border transition-colors ${
              isFullscreen
                ? 'bg-amber-400 text-black border-black'
                : 'bg-[#1e1e24] text-neutral-300 hover:text-white border-neutral-700'
            }`}
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? 'Exit' : width && width < 310 ? 'Full' : 'Fullscreen'}
          </button>

          <button
            type="button"
            onClick={onExportImage}
            disabled={isExporting}
            className="text-xs font-bold px-2 py-1 bg-[#1e1e24] text-neutral-300 hover:text-white border border-neutral-700 disabled:opacity-40"
            title="Export PNG"
          >
            {isExporting ? '...' : 'Export'}
          </button>

          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold px-2 py-1 bg-[#1e1e24] text-neutral-400 hover:text-red-400 border border-neutral-700 hover:border-red-500"
            title="Clear all cards"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Input box to add what to rank */}
      <div className="p-2.5 border-b-2 border-black bg-[#141416] shrink-0">
        <form onSubmit={handleSubmit} className="flex gap-1.5">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={width && width < 300 ? 'Type to rank...' : 'Type what to rank & Enter...'}
            className="flex-1 min-w-0 bg-black border border-neutral-700 focus:border-white text-white px-2.5 py-1.5 text-xs sm:text-sm outline-none font-sans placeholder:text-neutral-500"
          />
          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="bg-white text-black font-black text-xs px-2.5 py-1.5 hover:bg-neutral-200 disabled:opacity-30 border border-black uppercase tracking-wider shrink-0"
          >
            ADD
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="bg-[#222228] text-neutral-300 hover:text-white font-bold text-xs px-2 py-1.5 border border-neutral-700 hover:border-neutral-500 uppercase tracking-wider shrink-0"
            title="Paste bulk list"
          >
            +LIST
          </button>
        </form>
      </div>

      {/* Draggable cards grid in the stack */}
      <div className="flex-1 overflow-y-auto p-3">
        {unrankedItems.length > 0 && (
          <div
            className={`grid gap-2.5 items-start ${
              !width || (width >= 290 && width < 480)
                ? 'grid-cols-2'
                : width < 290
                ? 'grid-cols-1'
                : width < 660
                ? 'grid-cols-3'
                : 'grid-cols-4'
            }`}
          >
            {unrankedItems.map((item) => (
              <UnrankedCard
                key={item.id}
                item={item}
                tiers={tiers}
                isSelected={selectedItemId === item.id}
                onSelect={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                onRankItem={onRankItem}
                onDeleteItem={onDeleteItem}
                onEditItem={onEditItem}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
