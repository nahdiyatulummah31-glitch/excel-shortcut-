/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, Zap, Sparkles, Check, ChevronDown, ListPlus, Download } from 'lucide-react';
import { ShortcutScenario } from '../types/shortcuts';
import { generateScenarioFromShortcut } from '../utils/shortcutGenerator';

interface QuickShortcutInputBarProps {
  catalog: ShortcutScenario[];
  currentScenario: ShortcutScenario;
  onSelectScenario: (scenario: ShortcutScenario) => void;
  onOpenBatchModal: () => void;
  onDownloadVideo?: () => void;
}

export const QuickShortcutInputBar: React.FC<QuickShortcutInputBarProps> = ({
  catalog,
  currentScenario,
  onSelectScenario,
  onOpenBatchModal,
  onDownloadVideo,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Suggestions based on input
  const suggestions = React.useMemo(() => {
    if (!inputValue.trim()) return [];
    const query = inputValue.toLowerCase().trim();
    return catalog.filter((item) => {
      const matchShortcut = item.shortcut.toLowerCase().includes(query);
      const matchName = item.name.toLowerCase().includes(query);
      const matchCat = item.category.toLowerCase().includes(query);
      return matchShortcut || matchName || matchCat;
    }).slice(0, 8); // Top 8 suggestions
  }, [inputValue, catalog]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputValue.trim();
    if (!query) return;

    // Check if query matches any in catalog
    const matched = catalog.find(
      (item) =>
        item.shortcut.toLowerCase() === query.toLowerCase() ||
        item.shortcut.toLowerCase().replace(/\s+/g, '') === query.toLowerCase().replace(/\s+/g, '') ||
        item.name.toLowerCase().includes(query.toLowerCase())
    );

    if (matched) {
      onSelectScenario(matched);
      setInputValue('');
      setIsFocused(false);
    } else {
      // Auto-generate fresh scenario on the fly!
      const generated = generateScenarioFromShortcut({
        shortcut: query,
        name: `Shortcut Kustom: ${query}`,
      });
      onSelectScenario(generated);
      setInputValue('');
      setIsFocused(false);
    }
  };

  const handleSelectSuggestion = (scenario: ShortcutScenario) => {
    onSelectScenario(scenario);
    setInputValue('');
    setIsFocused(false);
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const quickPills = [
    { label: 'Ctrl + C & V', target: 'Ctrl + C' },
    { label: 'Ctrl + Home', target: 'Ctrl + Home' },
    { label: 'Ctrl + End', target: 'Ctrl + End' },
    { label: 'Ctrl + A', target: 'Ctrl + A' },
    { label: 'Alt + =', target: 'Alt + =' },
    { label: 'Ctrl + 9', target: 'Ctrl + 9' },
    { label: 'Ctrl + ;', target: 'Ctrl + ;' },
    { label: 'F4', target: 'F4' },
    { label: 'Ctrl + B', target: 'Ctrl + B' },
  ];

  return (
    <div className="w-full relative z-40" ref={dropdownRef}>
      {/* 1. MAIN INPUT FORM */}
      <form
        onSubmit={handleSubmit}
        className="w-full flex items-center bg-neutral-900 border-2 border-emerald-500/60 focus-within:border-emerald-400 rounded-2xl p-1.5 shadow-2xl transition-all"
      >
        <div className="pl-3 pr-2 text-emerald-400 shrink-0">
          <Zap size={18} className="text-amber-300 fill-amber-300 animate-pulse" />
        </div>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Ketik shortcut apa saja (misal: Ctrl + A, Ctrl + Home, Alt + =, F4)..."
          className="flex-1 bg-transparent border-none text-xs sm:text-sm font-semibold text-white placeholder-neutral-400 focus:outline-none focus:ring-0 px-1 py-1"
        />

        <button
          type="submit"
          className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
        >
          <Sparkles size={13} />
          <span>Generate & Putar</span>
        </button>
      </form>

      {/* 2. AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
      {isFocused && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden py-1 z-50 animate-in fade-in duration-100 max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-neutral-400 border-b border-neutral-800 flex items-center justify-between">
            <span>Ditemukan {suggestions.length} Shortcut:</span>
            <span className="text-emerald-400 font-normal">Klik untuk langsung putar</span>
          </div>

          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full px-3 py-2 text-left hover:bg-neutral-800/80 flex items-center justify-between transition-colors group border-b border-neutral-800/40 last:border-none"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="font-mono text-xs font-bold text-emerald-400 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-700 shrink-0">
                  {item.shortcut}
                </span>
                <span className="text-xs text-neutral-200 group-hover:text-white truncate font-medium">
                  {item.name}
                </span>
              </div>
              <span className="text-[10px] text-neutral-500 shrink-0 font-mono ml-2">
                {item.category.split('.')[1] || item.category}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* 3. QUICK SHORTCUT PILLS FOR 1-CLICK ACCESS */}
      <div className="flex items-center gap-1.5 overflow-x-auto mt-2 pb-0.5 scrollbar-none text-[11px]">
        <span className="text-[10px] text-neutral-400 uppercase font-bold shrink-0 mr-1">
          Cepat:
        </span>
        {quickPills.map((pill) => (
          <button
            key={pill.label}
            type="button"
            onClick={() => {
              const matched = catalog.find((c) => c.shortcut.toLowerCase().includes(pill.target.toLowerCase()));
              if (matched) onSelectScenario(matched);
            }}
            className={`px-2 py-0.5 rounded-lg border text-[11px] font-mono whitespace-nowrap transition-all ${
              currentScenario.shortcut.toLowerCase().includes(pill.target.toLowerCase())
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold'
                : 'bg-neutral-850 hover:bg-neutral-800 border-neutral-700/80 text-neutral-300'
            }`}
          >
            {pill.label}
          </button>
        ))}

        {onDownloadVideo && (
          <button
            type="button"
            onClick={onDownloadVideo}
            className="px-2.5 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] whitespace-nowrap flex items-center gap-1 transition-all shadow-sm shrink-0 active:scale-95"
          >
            <Download size={11} className="animate-bounce" />
            <span>Download Video</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenBatchModal}
          className="px-2 py-0.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-300 text-[11px] font-semibold whitespace-nowrap flex items-center gap-1 transition-colors"
        >
          <ListPlus size={11} />
          <span>+ Paste Banyak</span>
        </button>
      </div>
    </div>
  );
};
