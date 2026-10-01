import React, { useState } from 'react';

interface AddItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItems: (titles: string[]) => void;
}

export const AddItemsModal: React.FC<AddItemsModalProps> = ({
  isOpen,
  onClose,
  onAddItems,
}) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const items = text
      .split('\n')
      .flatMap((line) => line.split(','))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length > 0) {
      onAddItems(items);
      setText('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
      <div
        className="w-full max-w-lg bg-[#18181a] border-2 border-black p-4 text-white font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-2 border-b border-neutral-700 mb-3">
          <h3 className="font-bold text-sm text-white uppercase tracking-wider">Paste Items to Rank</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-white font-bold text-sm px-2"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <p className="text-xs text-neutral-400 mb-2">
            Enter one item per line (or comma-separated):
          </p>
          <textarea
            autoFocus
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Item 1
Item 2
Item 3`}
            className="w-full bg-black border border-neutral-700 focus:border-white p-2.5 text-xs text-white font-mono resize-none outline-none"
          />

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white border border-neutral-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!text.trim()}
              className="px-4 py-1.5 text-xs font-bold bg-white text-black hover:bg-neutral-200 disabled:opacity-40 border border-black"
            >
              Add to Stack
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
