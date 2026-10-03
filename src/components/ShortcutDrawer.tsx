/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Keyboard, 
  Sparkles, 
  Check, 
  FileSpreadsheet, 
  Search,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import { SHORTCUT_CATALOG } from '../data/shortcutCatalog';
import { ShortcutScenario } from '../types/shortcuts';

interface ShortcutDrawerProps {
  currentScenarioId: string;
  onSelectScenario: (scenario: ShortcutScenario) => void;
  isOpen: boolean;
  onClose: () => void;
  catalog?: ShortcutScenario[];
}

export const ShortcutDrawer: React.FC<ShortcutDrawerProps> = ({
  currentScenarioId,
  onSelectScenario,
  isOpen,
  onClose,
  catalog = SHORTCUT_CATALOG,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = [
    'Semua',
    '1. Basic / Navigasi',
    '2. Seleksi',
    '3. Editing Cepat',
    '4. Input Data',
    '5. Format Sel',
    '6. Baris & Kolom',
    '7. Sheet Management',
    '8. Pencarian & Revisi',
    '9. Formula',
    '10. Lain-lain',
  ];

  const filteredShortcuts = catalog.filter((item) => {
    const matchesCategory = selectedCategory === 'Semua' || item.category === selectedCategory;
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortcut.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md h-full bg-neutral-900 border-r border-neutral-800 text-neutral-100 flex flex-col shadow-2xl animate-in slide-in-from-left duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileSpreadsheet size={16} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Katalog Shortcut Excel</h2>
              <p className="text-[11px] text-neutral-400">100 Shortcut Excel Tanpa Mouse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs"
          >
            ✕
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-neutral-800">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari shortcut (misal: Ctrl + C, AutoSum, Format...)"
              className="w-full bg-neutral-800/80 border border-neutral-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto mt-2.5 pb-1 scrollbar-none text-[11px]">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat 
                    ? 'bg-emerald-600 text-white font-medium' 
                    : 'bg-neutral-800/70 text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Shortcut List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredShortcuts.map((item) => {
            const isSelected = item.id === currentScenarioId;

            return (
              <div
                key={item.id}
                onClick={() => {
                  onSelectScenario(item);
                  onClose();
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isSelected
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md ring-1 ring-emerald-500/30'
                    : 'bg-neutral-850 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-emerald-400 tracking-wider uppercase">
                    {item.category}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check size={10} /> Aktif
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-white bg-neutral-900 border border-neutral-700/80 px-2 py-0.5 rounded-md inline-block">
                    {item.shortcut}
                  </div>
                  <ChevronRight size={13} className="text-neutral-500" />
                </div>

                <div className="text-xs font-semibold text-neutral-200">
                  {item.name}
                </div>

                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-neutral-950 border-t border-neutral-800 text-[11px] text-neutral-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-emerald-400" />
            <span>Format Reel 9:16 Siap Pakai</span>
          </div>
          <span className="font-mono text-[10px] text-neutral-500">8 - 10 Detik</span>
        </div>
      </div>

      {/* Outside click closer */}
      <div className="flex-1" onClick={onClose} />
    </div>
  );
};
