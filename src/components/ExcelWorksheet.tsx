/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Undo2, 
  Redo2, 
  Search, 
  Minus, 
  Square, 
  X, 
  ChevronDown, 
  Clipboard, 
  Scissors, 
  Copy, 
  Paintbrush, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  DollarSign, 
  Percent, 
  Plus 
} from 'lucide-react';
import { ShortcutScenario, ShortcutStep } from '../types/shortcuts';

interface ExcelWorksheetProps {
  scenario: ShortcutScenario;
  currentStep: ShortcutStep;
  elapsedMs: number;
  data: Record<string, string>;
  isFullScreenMode?: boolean;
  isDarkTheme?: boolean;
}

export const ExcelWorksheet: React.FC<ExcelWorksheetProps> = ({
  scenario,
  currentStep,
  data,
  isFullScreenMode = false,
  isDarkTheme = true,
}) => {
  const activeCol = currentStep.activeCell.col;
  const activeRow = currentStep.activeCell.row;
  const activeCellCoord = `${activeCol}${activeRow}`;

  // Formula bar value
  const activeFormulaVal = data[activeCellCoord] || '';

  // Copied cell coordinates
  const copiedCell = currentStep.copiedCell;
  const isCopied = (col: string, row: number) => {
    return copiedCell && copiedCell.col === col && copiedCell.row === row;
  };

  // Check if cell is active
  const isActive = (col: string, row: number) => {
    return activeCol === col && activeRow === row;
  };

  // Check if cell is within selected range
  const isSelected = (col: string, row: number) => {
    if (isActive(col, row)) return true;
    if (!currentStep.selectedRange) return false;
    const { startCol, startRow, endCol, endRow } = currentStep.selectedRange;
    const colIdx = scenario.columns.indexOf(col);
    const startColIdx = scenario.columns.indexOf(startCol);
    const endColIdx = scenario.columns.indexOf(endCol);
    const minCol = Math.min(startColIdx, endColIdx);
    const maxCol = Math.max(startColIdx, endColIdx);
    const minRow = Math.min(startRow, endRow);
    const maxRow = Math.max(startRow, endRow);
    return colIdx >= minCol && colIdx <= maxCol && row >= minRow && row <= maxRow;
  };

  // Dynamic zoom calculations
  const zoomScale = currentStep.zoomLevel || 1.0;
  const zoomX = currentStep.zoomCenter?.xPercent ?? 50;
  const zoomY = currentStep.zoomCenter?.yPercent ?? 50;

  return (
    <div 
      className={`relative w-full h-full font-sans flex flex-col select-none overflow-hidden transition-colors duration-200 ${
        isDarkTheme ? 'bg-[#18181b] text-neutral-100' : 'bg-[#f3f3f3] text-neutral-800'
      }`}
      style={{
        fontFamily: "'Segoe UI', Aptos, -apple-system, BlinkMacSystemFont, Roboto, sans-serif"
      }}
    >
      {/* 1. TOP GREEN EXCEL TITLE BAR */}
      <header className="bg-[#107c41] text-white flex items-center justify-between px-2.5 py-1 text-xs select-none shrink-0 z-30 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Excel Icon Badge */}
          <div className="w-5 h-5 bg-white text-[#107c41] rounded-sm font-bold flex items-center justify-center text-[11px] shadow-sm tracking-tighter">
            X
          </div>

          {/* Quick Access Icons */}
          <div className="flex items-center gap-1.5 opacity-90 pl-1 border-r border-emerald-600/60 pr-2">
            <button className="hover:bg-white/20 p-1 rounded transition-colors" title="Simpan (Ctrl + S)">
              <Save size={13} className="text-white" />
            </button>
            <button className="hover:bg-white/20 p-1 rounded transition-colors" title="Undo (Ctrl + Z)">
              <Undo2 size={13} className="text-white" />
            </button>
            <button className="hover:bg-white/20 p-1 rounded transition-colors" title="Redo (Ctrl + Y)">
              <Redo2 size={13} className="text-white" />
            </button>
          </div>

          {/* File Name */}
          <span className="font-semibold tracking-wide text-[11px] truncate max-w-[130px] sm:max-w-none">
            Laporan_Penjualan_2026.xlsx - Excel
          </span>
        </div>

        {/* Center Search Bar */}
        <div className="hidden sm:flex items-center bg-[#0d6535] hover:bg-[#0c592f] transition-colors rounded px-2.5 py-0.5 text-[11px] text-white/80 w-44">
          <Search size={11} className="mr-1.5 opacity-70" />
          <span className="truncate">Search (Alt + Q)</span>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-2 text-white/80">
          <div className="w-4 h-4 rounded-full bg-emerald-300 text-[#107c41] font-bold text-[9px] flex items-center justify-center">
            A
          </div>
          <div className="flex items-center ml-1">
            <button className="p-1 hover:bg-white/20 rounded-sm">
              <Minus size={11} />
            </button>
            <button className="p-1 hover:bg-white/20 rounded-sm">
              <Square size={10} />
            </button>
            <button className="p-1 hover:bg-red-600 rounded-sm">
              <X size={11} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. EXCEL MENU TABS */}
      <nav className={`border-b flex items-center px-1 text-[11px] font-medium shrink-0 z-20 ${
        isDarkTheme 
          ? 'bg-[#202023] border-[#2e2e33] text-neutral-300' 
          : 'bg-[#f3f3f3] border-[#dadada] text-neutral-700'
      }`}>
        <span className="px-2.5 py-1 text-emerald-400 hover:bg-white/10 cursor-pointer">File</span>
        <div className={`relative px-2.5 py-1 text-[#107c41] font-semibold border-t-2 border-[#107c41] rounded-t-sm shadow-xs ${
          isDarkTheme ? 'bg-[#27272a] text-emerald-400 border-x border-[#3f3f46]' : 'bg-white text-[#107c41] border-x border-[#dadada]'
        }`}>
          Home
        </div>
        <span className="px-2.5 py-1 hover:bg-white/10 cursor-pointer text-neutral-400 hidden xs:inline">Insert</span>
        <span className="px-2.5 py-1 hover:bg-white/10 cursor-pointer text-neutral-400 hidden sm:inline">Page Layout</span>
        <span className="px-2.5 py-1 hover:bg-white/10 cursor-pointer text-neutral-400">Formulas</span>
        <span className="px-2.5 py-1 hover:bg-white/10 cursor-pointer text-neutral-400 hidden xs:inline">Data</span>
        <span className="px-2.5 py-1 hover:bg-white/10 cursor-pointer text-neutral-400 hidden sm:inline">Review</span>
        <span className="px-2.5 py-1 hover:bg-white/10 cursor-pointer text-neutral-400">View</span>
      </nav>

      {/* 3. COMPACT REALISTIC EXCEL RIBBON TOOLBAR */}
      <div className={`border-b px-2 py-1 flex items-center gap-2 text-xs shrink-0 shadow-xs overflow-x-auto z-20 scrollbar-none ${
        isDarkTheme ? 'bg-[#242427] border-[#2e2e33] text-neutral-200' : 'bg-white border-[#dadada] text-neutral-700'
      }`}>
        {/* Clipboard Group */}
        <div className={`flex items-center gap-1 border-r pr-2 ${isDarkTheme ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <div className={`p-1 rounded flex flex-col items-center justify-center transition-colors ${
            currentStep.pressedKeys.includes('V') 
              ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500' 
              : 'hover:bg-neutral-800 text-neutral-300'
          }`}>
            <Clipboard size={14} />
            <span className="text-[9px] font-medium mt-0.5">Paste</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <button className={`p-0.5 rounded flex items-center gap-1 ${currentStep.pressedKeys.includes('X') ? 'bg-amber-500/20 text-amber-300' : 'hover:bg-neutral-800 text-neutral-400'}`}>
              <Scissors size={11} />
            </button>
            <button className={`p-0.5 rounded flex items-center gap-1 ${currentStep.pressedKeys.includes('C') ? 'bg-emerald-500/20 text-emerald-300' : 'hover:bg-neutral-800 text-neutral-400'}`}>
              <Copy size={11} />
            </button>
          </div>
        </div>

        {/* Font Group */}
        <div className={`flex items-center gap-1 border-r pr-2 ${isDarkTheme ? 'border-neutral-700' : 'border-neutral-200'}`}>
          <div className={`flex items-center gap-1 border rounded px-1.5 py-0.5 text-[10px] ${
            isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
          }`}>
            <span>Aptos</span>
            <ChevronDown size={10} className="text-neutral-400" />
          </div>
          <div className={`border rounded px-1.5 py-0.5 text-[10px] ${
            isDarkTheme ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-neutral-50 border-neutral-200 text-neutral-800'
          }`}>
            <span>11</span>
          </div>
          <div className="flex items-center gap-0.5 ml-1">
            <button className={`p-1 rounded font-bold text-[10px] ${currentStep.pressedKeys.includes('B') ? 'bg-emerald-600/30 text-emerald-300 font-black ring-1 ring-emerald-400' : 'hover:bg-neutral-800'}`}>
              <Bold size={11} />
            </button>
            <button className={`p-1 rounded text-[10px] italic ${currentStep.pressedKeys.includes('I') ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-400' : 'hover:bg-neutral-800'}`}>
              <Italic size={11} />
            </button>
            <button className="p-1 rounded text-[10px] hover:bg-neutral-800">
              <Underline size={11} />
            </button>
            <div className="w-3.5 h-3.5 bg-yellow-400 border border-neutral-700 rounded-xs mx-0.5" title="Fill Color" />
          </div>
        </div>

        {/* Alignment & Format */}
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-neutral-800">
            <AlignLeft size={11} />
          </button>
          <button className="p-1 rounded hover:bg-neutral-800">
            <AlignCenter size={11} />
          </button>
          <button className={`p-1 rounded text-[10px] font-semibold ${currentStep.pressedKeys.includes('$') ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500' : 'hover:bg-neutral-800'}`} title="Format Currency ($)">
            <DollarSign size={11} />
          </button>
          <button className={`p-1 rounded text-[10px] font-semibold ${currentStep.pressedKeys.includes('%') ? 'bg-emerald-600/30 text-emerald-300 ring-1 ring-emerald-500' : 'hover:bg-neutral-800'}`} title="Format Percent (%)">
            <Percent size={11} />
          </button>
        </div>
      </div>

      {/* 4. FORMULA BAR & NAME BOX */}
      <div className={`border-b px-2 py-1 flex items-center gap-1.5 text-xs shrink-0 z-20 ${
        isDarkTheme ? 'bg-[#1e1e21] border-[#2e2e33]' : 'bg-[#f9f9f9] border-[#dadada]'
      }`}>
        {/* Name Box */}
        <div className={`border font-mono text-[11px] font-semibold px-2 py-0.5 rounded-sm w-16 text-center shadow-inner ${
          isDarkTheme ? 'bg-[#27272a] border-[#3f3f46] text-emerald-400' : 'bg-white border-[#c4c4c4] text-neutral-800'
        }`}>
          {activeCellCoord}
        </div>

        {/* Function Symbols */}
        <div className={`flex items-center gap-1 px-1 border-r ${isDarkTheme ? 'border-neutral-700 text-neutral-400' : 'border-neutral-300 text-neutral-500'}`}>
          <span className="text-[10px] hover:text-white cursor-pointer font-bold">✕</span>
          <span className="text-[10px] hover:text-emerald-400 cursor-pointer font-bold">✓</span>
          <span className="font-serif italic text-[11px] text-[#107c41] font-bold px-1 hover:bg-neutral-700 rounded">fx</span>
        </div>

        {/* Formula Input */}
        <div className={`flex-1 border rounded-sm px-2 py-0.5 text-[11px] font-mono truncate shadow-inner ${
          isDarkTheme ? 'bg-[#27272a] border-[#3f3f46] text-neutral-100' : 'bg-white border-[#c4c4c4] text-neutral-900'
        }`}>
          {activeFormulaVal}
        </div>
      </div>

      {/* 5. SPREADSHEET GRID VIEWPORT WITH DYNAMIC ZOOM */}
      <div className={`flex-1 relative overflow-auto flex flex-col ${isDarkTheme ? 'bg-[#18181b]' : 'bg-white'}`}>
        {/* Dynamic Zoom Container */}
        <div 
          className="relative min-w-full min-h-full transition-transform duration-500 ease-out origin-top-left"
          style={{
            transform: `scale(${zoomScale})`,
            transformOrigin: `${zoomX}% ${zoomY}%`,
          }}
        >
          {/* Column Header Row */}
          <div className={`flex sticky top-0 z-10 border-b ${
            isDarkTheme ? 'bg-[#222225] border-[#2e2e33]' : 'bg-[#f3f3f3] border-[#dadada]'
          }`}>
            {/* Top Left All-Select Corner */}
            <div className={`w-10 sm:w-12 h-6 border-r flex items-center justify-center shrink-0 ${
              isDarkTheme ? 'bg-[#1c1c1f] border-[#2e2e33]' : 'bg-[#e6e6e6] border-[#dadada]'
            }`}>
              <div className="w-0 h-0 border-l-[7px] border-l-transparent border-b-[7px] border-b-neutral-400" />
            </div>

            {/* Columns A, B, C, D, E... */}
            {scenario.columns.map((col) => {
              const isColActive = activeCol === col;
              const isColHidden = currentStep.hiddenCols?.includes(col);
              if (isColHidden) return null;

              return (
                <div
                  key={col}
                  className={`flex-1 min-w-[70px] sm:min-w-[95px] h-6 flex items-center justify-center font-semibold text-[11px] border-r transition-colors ${
                    isColActive 
                      ? 'bg-[#107c41] text-white shadow-xs' 
                      : isDarkTheme 
                        ? 'bg-[#222225] text-neutral-400 border-[#2e2e33] hover:bg-[#2a2a2e]' 
                        : 'bg-[#f3f3f3] text-neutral-600 border-[#dadada] hover:bg-[#e8e8e8]'
                  }`}
                >
                  {col}
                </div>
              );
            })}
          </div>

          {/* Table Rows & Cells */}
          {scenario.rows.map((row) => {
            const isRowActive = activeRow === row;
            const isRowHidden = currentStep.hiddenRows?.includes(row);
            if (isRowHidden) return null;

            return (
              <div key={row} className={`flex border-b transition-colors ${
                isDarkTheme ? 'border-[#27272a] hover:bg-neutral-800/40' : 'border-[#e0e0e0] hover:bg-neutral-50/50'
              }`}>
                {/* Row Header 1, 2, 3... */}
                <div
                  className={`w-10 sm:w-12 h-8 flex items-center justify-center text-[11px] font-semibold border-r shrink-0 transition-colors ${
                    isRowActive 
                      ? 'bg-[#107c41] text-white shadow-xs' 
                      : isDarkTheme 
                        ? 'bg-[#222225] text-neutral-400 border-[#2e2e33]' 
                        : 'bg-[#f3f3f3] text-neutral-600 border-[#dadada]'
                  }`}
                >
                  {row}
                </div>

                {/* Cells in Row */}
                {scenario.columns.map((col) => {
                  const coord = `${col}${row}`;
                  const cellVal = data[coord] || '';
                  const active = isActive(col, row);
                  const copied = isCopied(col, row);
                  const inRange = isSelected(col, row);
                  const isHeader = row === 1;

                  // Formatting details
                  const formatting = {
                    ...scenario.defaultFormatting?.[coord],
                    ...currentStep.cellFormattingDelta?.[coord],
                  };

                  return (
                    <div
                      key={coord}
                      className={`relative flex-1 min-w-[70px] sm:min-w-[95px] h-8 px-2 flex items-center text-[11px] border-r truncate transition-all duration-200 ${
                        isDarkTheme
                          ? isHeader 
                            ? 'bg-[#222226] font-bold text-neutral-100 border-[#27272a]' 
                            : 'bg-[#18181b] text-neutral-200 border-[#27272a]'
                          : isHeader 
                            ? 'bg-neutral-100/90 font-bold text-neutral-900 border-[#e0e0e0]' 
                            : 'bg-white text-neutral-800 border-[#e0e0e0]'
                      } ${formatting?.bold ? 'font-bold' : ''} ${
                        formatting?.italic ? 'italic' : ''
                      } ${inRange && !active ? (isDarkTheme ? 'bg-emerald-500/20' : 'bg-emerald-500/10') : ''}`}
                    >
                      {/* Cell Value */}
                      <span className="truncate w-full select-none">
                        {cellVal}
                      </span>

                      {/* ACTIVE CELL OUTLINE (Authentic Thick Green Border with Fill Handle) */}
                      {active && (
                        <div className="absolute inset-0 pointer-events-none border-2 border-emerald-500 z-20 shadow-xs">
                          {/* Fill Handle Square at Bottom Right */}
                          <div className="absolute -bottom-[3px] -right-[3px] w-[6px] h-[6px] bg-emerald-500 border border-white" />
                        </div>
                      )}

                      {/* MARCHING ANTS ANIMATION FOR COPIED CELL (Authentic Excel Marquee as shown in reference) */}
                      {copied && (
                        <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
                          <svg className="w-full h-full absolute inset-0 overflow-visible">
                            <rect
                              x="1"
                              y="1"
                              width="98%"
                              height="94%"
                              fill="none"
                              stroke={isDarkTheme ? '#34d399' : '#107c41'}
                              strokeWidth="2.5"
                              strokeDasharray="5 3"
                              className="animate-marching-ants"
                            />
                          </svg>
                          {/* Subtle copied pulse badge */}
                          <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[8px] px-1 font-bold rounded-bl uppercase tracking-wider shadow">
                            Copied
                          </div>
                        </div>
                      )}

                      {/* SATISFYING PASTE / FILL BURST EFFECT */}
                      {active && currentStep.sound === 'pop' && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0.8 }}
                          animate={{ scale: 1.4, opacity: 0 }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="absolute inset-0 bg-emerald-400/40 rounded-sm pointer-events-none z-30"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. BOTTOM SHEET TABS & STATUS BAR */}
      <footer className={`border-t flex items-center justify-between px-2 py-0.5 text-[10px] shrink-0 z-20 ${
        isDarkTheme ? 'bg-[#202023] border-[#2e2e33] text-neutral-400' : 'bg-[#f3f3f3] border-[#dadada] text-neutral-600'
      }`}>
        {/* Left: Sheet Tabs */}
        <div className="flex items-center gap-1">
          <div className={`border-t-2 border-[#107c41] px-3 py-1 font-semibold rounded-t-sm shadow-2xs ${
            isDarkTheme ? 'bg-[#27272a] text-emerald-400 border-x border-[#3f3f46]' : 'bg-white text-[#107c41] border-x border-[#dadada]'
          }`}>
            Penjualan Q1
          </div>
          <div className="px-2 py-1 text-neutral-400 hover:bg-white/10 rounded-t-sm cursor-pointer hidden xs:inline">
            Sheet2
          </div>
          <button className="p-1 hover:bg-white/10 rounded text-neutral-400" title="Add Sheet (Shift + F11)">
            <Plus size={11} />
          </button>
        </div>

        {/* Right: Ready status and Zoom */}
        <div className="flex items-center gap-2 font-mono">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-medium ${
            isDarkTheme ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-emerald-100/80 text-emerald-800'
          }`}>
            Ready
          </span>
          <div className="hidden sm:flex items-center gap-1">
            <span>100%</span>
            <div className={`w-12 h-1 rounded-full relative ${isDarkTheme ? 'bg-neutral-700' : 'bg-neutral-300'}`}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
          </div>
        </div>
      </footer>

      {/* Custom CSS for Marching Ants */}
      <style>{`
        @keyframes marchingAnts {
          0% {
            stroke-dashoffset: 0;
          }
          100% {
            stroke-dashoffset: 16;
          }
        }
        .animate-marching-ants {
          animation: marchingAnts 0.3s linear infinite;
        }
      `}</style>
    </div>
  );
};
