import { useState, useCallback, useEffect, useRef } from 'react';
import { TierDefinition, TierItem, DEFAULT_TIERS } from './types';
import { TierList } from './components/TierList';
import { UnrankedColumn } from './components/UnrankedColumn';
import { AddItemsModal } from './components/AddItemsModal';
import { toPng } from 'html-to-image';
import { renderTierBoardToCanvas } from './utils/canvasExport';

const STORAGE_KEY_ITEMS = 'tier_ranker_items_v1';
const STORAGE_KEY_TIERS = 'tier_ranker_tiers_v1';
const STORAGE_KEY_COL_WIDTH = 'tier_ranker_col_width_v1';
const DEFAULT_COL_WIDTH = 340;
const MIN_COL_WIDTH = 220;

export function App() {
  const [tiers, setTiers] = useState<TierDefinition[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_TIERS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load tiers from cache:', e);
      }
    }
    return DEFAULT_TIERS;
  });

  const [items, setItems] = useState<TierItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_ITEMS);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load items from cache:', e);
      }
    }
    return [];
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('fullscreen') === 'true';
    }
    return false;
  });

  const [columnWidth, setColumnWidth] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_COL_WIDTH);
        if (saved) {
          const parsed = Number(saved);
          if (!isNaN(parsed) && parsed >= MIN_COL_WIDTH) {
            return parsed;
          }
        }
      } catch (e) {
        console.warn('Failed to load column width from cache:', e);
      }
    }
    return DEFAULT_COL_WIDTH;
  });
  const [isResizing, setIsResizing] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  const unrankedItems = items.filter((item) => item.tierId === null);

  // Automatically persist column width
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_COL_WIDTH, String(columnWidth));
    } catch (e) {
      console.warn('Failed to save column width to cache:', e);
    }
  }, [columnWidth]);

  // Resizing mouse drag handlers
  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.clientX;
    const startWidth = columnWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      // The unranked column is on the right side of the screen
      // Dragging left (moveEvent.clientX < startX) increases sidebar width
      const deltaX = startX - moveEvent.clientX;
      const maxColWidth = Math.floor(window.innerWidth * 0.7);
      const newWidth = Math.min(Math.max(startWidth + deltaX, MIN_COL_WIDTH), maxColWidth);
      setColumnWidth(newWidth);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  }, [columnWidth]);

  // Automatically persist items and tiers to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save items to cache:', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TIERS, JSON.stringify(tiers));
    } catch (e) {
      console.warn('Failed to save tiers to cache:', e);
    }
  }, [tiers]);

  // Sync native browser fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'f' || e.key === 'F') &&
        !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {
        setIsFullscreen(true);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
      }
    }
  };

  // Move item to tier (supports targetIndex for reordering/inserting)
  const handleMoveToTier = useCallback((itemId: string, targetTierId: string, targetIndex?: number) => {
    setItems((prev) => {
      const itemToMove = prev.find((item) => item.id === itemId);
      if (!itemToMove) return prev;

      const otherItems = prev.filter((item) => item.id !== itemId);
      const updatedItem = { ...itemToMove, tierId: targetTierId };

      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        const tierItems = otherItems.filter((i) => i.tierId === targetTierId);
        const nonTierItems = otherItems.filter((i) => i.tierId !== targetTierId);
        tierItems.splice(targetIndex, 0, updatedItem);
        return [...nonTierItems, ...tierItems];
      }

      return [...otherItems, updatedItem];
    });
  }, []);

  // Send item back to unranked column
  const handleUnrank = useCallback((itemId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, tierId: null } : item
      )
    );
  }, []);

  // Delete item
  const handleDeleteItem = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  }, []);

  // Edit item text
  const handleEditItem = useCallback((itemId: string, newTitle: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, title: newTitle } : item
      )
    );
  }, []);

  // Add single item
  const handleAddItem = useCallback((title: string) => {
    const newItem: TierItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: title.trim().toUpperCase(),
      tierId: null,
      createdAt: Date.now(),
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  // Add multiple items
  const handleAddItems = useCallback((titles: string[]) => {
    const newItems: TierItem[] = titles.map((title, idx) => ({
      id: `item-${Date.now()}-${idx}`,
      title: title.trim().toUpperCase(),
      tierId: null,
      createdAt: Date.now() + idx,
    }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Update tier label
  const handleUpdateTier = useCallback((tierId: string, updates: Partial<TierDefinition>) => {
    setTiers((prev) =>
      prev.map((t) => (t.id === tierId ? { ...t, ...updates } : t))
    );
  }, []);

  // Export board as high-res PNG with multi-stage fallback
  const handleExportImage = async () => {
    setIsExporting(true);

    try {
      let dataUrl: string | null = null;
      const node = document.getElementById('tier-list-board');

      if (node) {
        try {
          dataUrl = await toPng(node, {
            quality: 1,
            pixelRatio: 2,
            backgroundColor: '#111111',
            skipFonts: true,
            cacheBust: true,
          });
        } catch (domErr) {
          console.warn('DOM toPng failed, falling back to Canvas renderer:', domErr);
        }
      }

      // If toPng returned null, was blank, or failed, use canvas renderer
      if (!dataUrl || dataUrl.length < 500) {
        dataUrl = renderTierBoardToCanvas(tiers, items);
      }

      // Trigger download reliably with Blob URL
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.download = `tier-ranker-${Date.now()}.png`;
      link.href = objectUrl;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
        URL.revokeObjectURL(objectUrl);
      }, 1000);
    } catch (err) {
      console.error('Export error, using canvas fallback:', err);
      try {
        const fallbackUrl = renderTierBoardToCanvas(tiers, items);
        const link = document.createElement('a');
        link.download = `tier-ranker-${Date.now()}.png`;
        link.href = fallbackUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (link.parentNode) link.parentNode.removeChild(link);
        }, 1000);
      } catch (canvasErr) {
        console.error('All export methods failed:', canvasErr);
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Clear all
  const handleReset = () => {
    if (items.length === 0) return;
    if (window.confirm('Clear all items?')) {
      setItems([]);
      try {
        localStorage.removeItem(STORAGE_KEY_ITEMS);
      } catch (e) {
        console.warn('Failed to clear items from cache:', e);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex select-none overflow-hidden bg-[#111111] p-0 m-0"
    >
      {/* ================= Main Tier Ranker Board (Takes full height) ================= */}
      <main className="flex-1 h-full overflow-hidden flex flex-col">
        <TierList
          tiers={tiers}
          items={items}
          isFullscreen={isFullscreen}
          onMoveToTier={handleMoveToTier}
          onUnrank={handleUnrank}
          onDelete={handleDeleteItem}
          onEditItem={handleEditItem}
          onUpdateTier={handleUpdateTier}
        />
      </main>

      {/* ================= Fullscreen capture overlay during resize ================= */}
      {isResizing && (
        <div
          className="fixed inset-0 z-50 cursor-col-resize select-none pointer-events-auto"
        />
      )}

      {/* ================= Draggable Vertical Resizer Handle ================= */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuenow={columnWidth}
        title="Drag to resize column • Double-click to reset"
        onMouseDown={startResizing}
        onDoubleClick={() => setColumnWidth(DEFAULT_COL_WIDTH)}
        className={`w-2 hover:w-2.5 h-full cursor-col-resize select-none shrink-0 z-30 flex items-center justify-center transition-all group relative border-l border-r border-black ${
          isResizing ? 'bg-amber-400 w-2.5' : 'bg-[#0d0d0e] hover:bg-amber-400 active:bg-amber-400'
        }`}
      >
        <div
          className={`w-0.5 h-7 rounded transition-colors ${
            isResizing ? 'bg-black' : 'bg-neutral-600 group-hover:bg-black'
          }`}
        />
      </div>

      {/* ================= Right Drag & Drop Ranking Column ================= */}
      <UnrankedColumn
        width={columnWidth}
        unrankedItems={unrankedItems}
        tiers={tiers}
        onAddItem={handleAddItem}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onRankItem={handleMoveToTier}
        onDeleteItem={handleDeleteItem}
        onEditItem={handleEditItem}
        onDropToUnrank={handleUnrank}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        onExportImage={handleExportImage}
        isExporting={isExporting}
        onReset={handleReset}
      />

      {/* Batch Add Modal */}
      <AddItemsModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddItems={handleAddItems}
      />
    </div>
  );
}
export default App;
