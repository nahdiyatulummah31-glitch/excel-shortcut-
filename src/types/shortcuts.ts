/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShortcutStep {
  timeMs: number; // Start timestamp in the 8-10s timeline
  durationMs: number;
  activeCell: { col: string; row: number };
  targetCell?: { col: string; row: number };
  copiedCell?: { col: string; row: number };
  cutCell?: { col: string; row: number };
  selectedRange?: { startCol: string; startRow: number; endCol: string; endRow: number };
  pressedKeys: string[]; // e.g. ['Ctrl'], ['Ctrl', 'C'], ['Ctrl', 'V']
  actionTitle: string; // Indonesian title for reel/shorts
  actionDetail: string; // Explanatory text
  sound?: 'key' | 'pop' | 'copy' | 'move' | 'whoosh';
  zoomLevel?: number; // Subtle camera zoom (e.g. 1.05 or 1.1)
  zoomCenter?: { xPercent: number; yPercent: number };
  sheetDataDelta?: Record<string, string>; // Changes to cell values
  cellFormattingDelta?: Record<string, { bold?: boolean; italic?: boolean; currency?: boolean; percent?: boolean; strikethrough?: boolean; highlight?: boolean }>;
  hiddenCols?: string[];
  hiddenRows?: number[];
}

export interface ShortcutScenario {
  id: string;
  category: string;
  categoryNo: number;
  shortcut: string;
  name: string;
  description: string;
  voiceScript?: string; // Penjelasan suara cewek kalem luwes berdurasi pas dengan panjang video
  defaultData: Record<string, string>;
  defaultFormatting?: Record<string, { bold?: boolean; italic?: boolean; currency?: boolean; percent?: boolean; strikethrough?: boolean }>;
  columns: string[];
  rows: number[];
  steps: ShortcutStep[];
  totalDurationMs: number; // e.g. 8500 - 9500 ms (8-10 seconds)
}
