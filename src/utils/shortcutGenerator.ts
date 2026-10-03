/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShortcutScenario, ShortcutStep } from '../types/shortcuts';
import { getDefaultVoiceScript } from './voiceOver';

interface GenerateOptions {
  shortcut: string;
  name?: string;
  category?: string;
  dataType?: 'sales' | 'students' | 'salary' | 'inventory';
}

const DATA_PRESETS = {
  sales: {
    columns: ['A', 'B', 'C', 'D', 'E'],
    rows: [1, 2, 3, 4, 5, 6, 7],
    defaultData: {
      A1: 'No', B1: 'Produk', C1: 'Kategori', D1: 'Harga', E1: 'Status',
      A2: '1', B2: 'MacBook Air M3', C2: 'Laptop', D2: '18500000', E2: 'Ready',
      A3: '2', B3: 'Dell XPS 15', C3: 'Laptop', D3: '24000000', E3: 'Ready',
      A4: '3', B4: 'Logitech Master', C4: 'Mouse', D4: '1450000', E4: 'Ready',
      A5: '4', B5: 'Keychron Pro', C5: 'Keyboard', D5: '2800000', E5: 'Ready',
      A6: '5', B6: 'Monitor LG 4K', C6: 'Monitor', D6: '6200000', E6: 'Ready',
    },
    defaultFormatting: {
      A1: { bold: true }, B1: { bold: true }, C1: { bold: true }, D1: { bold: true }, E1: { bold: true },
    },
  },
  students: {
    columns: ['A', 'B', 'C', 'D'],
    rows: [1, 2, 3, 4, 5, 6],
    defaultData: {
      A1: 'NIM', B1: 'Nama Mahasiswa', C1: 'Nilai Ujian', D1: 'Grade',
      A2: '101', B2: 'Budi Santoso', C2: '88', D2: 'A',
      A3: '102', B3: 'Siti Aminah', C3: '92', D3: 'A',
      A4: '103', B4: 'Reza Pratama', C4: '75', D4: 'B',
      A5: '104', B5: 'Dewi Lestari', C5: '84', D5: 'B+',
    },
    defaultFormatting: {
      A1: { bold: true }, B1: { bold: true }, C1: { bold: true }, D1: { bold: true },
    },
  },
  salary: {
    columns: ['A', 'B', 'C', 'D'],
    rows: [1, 2, 3, 4, 5, 6],
    defaultData: {
      A1: 'ID', B1: 'Karyawan', C1: 'Divisi', D1: 'Gaji Pokok',
      A2: 'E-01', B2: 'Ahmad Fauzi', C2: 'Finance', D2: '8500000',
      A3: 'E-02', B3: 'Intan Permata', C3: 'Marketing', D3: '7200000',
      A4: 'E-03', B4: 'Dimas Kurnia', C4: 'Engineering', D4: '12000000',
      A5: 'E-04', B5: 'Citra Kirana', C5: 'HRD', D5: '7800000',
    },
    defaultFormatting: {
      A1: { bold: true }, B1: { bold: true }, C1: { bold: true }, D1: { bold: true },
    },
  },
  inventory: {
    columns: ['A', 'B', 'C', 'D'],
    rows: [1, 2, 3, 4, 5, 6],
    defaultData: {
      A1: 'Kode', B1: 'Barang', C1: 'Stok', D1: 'Gudang',
      A2: 'BRG-01', B2: 'Kertas A4', C2: '120', D2: 'Gudang Utama',
      A3: 'BRG-02', B3: 'Tinta Printer', C3: '45', D3: 'Gudang Utama',
      A4: 'BRG-03', B4: 'Stapler Besar', C4: '80', D4: 'Gudang B',
      A5: 'BRG-04', B5: 'Map Dokumen', C5: '350', D5: 'Gudang B',
    },
    defaultFormatting: {
      A1: { bold: true }, B1: { bold: true }, C1: { bold: true }, D1: { bold: true },
    },
  },
};

/**
 * Automatically creates a full 8-10s video scenario from a shortcut string!
 */
export function generateScenarioFromShortcut(options: GenerateOptions): ShortcutScenario {
  const rawShortcut = options.shortcut.trim();
  const cleanedShortcut = rawShortcut.replace(/\s+/g, ' ');
  const keys = cleanedShortcut
    .replace('→', '+')
    .split('+')
    .map((k) => k.trim())
    .filter(Boolean);

  const dataType = options.dataType || 'sales';
  const preset = DATA_PRESETS[dataType];

  const lower = cleanedShortcut.toLowerCase();
  const id = `custom-${lower.replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;

  // Auto-detect action semantics
  let name = options.name || '';
  let category = options.category || 'Shortcut Otomatis';
  let steps: ShortcutStep[] = [];

  // Default duration ~8.5 seconds (8500ms)
  const totalDurationMs = 8800;

  // Case 1: Copy-Paste (Ctrl + C then Ctrl + V)
  if ((lower.includes('ctrl + c') && lower.includes('v')) || lower === 'ctrl + c') {
    name = name || 'Copy & Paste Kilat (Salin & Tempel Data)';
    category = '3. Editing Cepat';
    steps = [
      {
        timeMs: 0,
        durationMs: 1400,
        activeCell: { col: 'B', row: 3 },
        pressedKeys: [],
        actionTitle: '1. Pilih Sel Berisi Data',
        actionDetail: 'Kursor berada di sel B3',
        sound: 'move',
        zoomLevel: 1.0,
      },
      {
        timeMs: 1400,
        durationMs: 1200,
        activeCell: { col: 'B', row: 3 },
        pressedKeys: ['Ctrl'],
        actionTitle: '2. Tahan Tombol CTRL',
        actionDetail: 'Tahan tombol modifier',
        sound: 'key',
        zoomLevel: 1.04,
      },
      {
        timeMs: 2600,
        durationMs: 1800,
        activeCell: { col: 'B', row: 3 },
        copiedCell: { col: 'B', row: 3 },
        pressedKeys: ['Ctrl', 'C'],
        actionTitle: '3. Tekan C (Ctrl + C)',
        actionDetail: 'Garis putus-putus berputar: Data berhasil disalin!',
        sound: 'copy',
        zoomLevel: 1.08,
      },
      {
        timeMs: 4400,
        durationMs: 1400,
        activeCell: { col: 'B', row: 7 },
        copiedCell: { col: 'B', row: 3 },
        pressedKeys: [],
        actionTitle: '4. Pindah ke Sel Tujuan',
        actionDetail: 'Arahkan ke sel kosong B7',
        sound: 'move',
        zoomLevel: 1.03,
      },
      {
        timeMs: 5800,
        durationMs: 1200,
        activeCell: { col: 'B', row: 7 },
        copiedCell: { col: 'B', row: 3 },
        pressedKeys: ['Ctrl'],
        actionTitle: '5. Tahan Tombol CTRL',
        actionDetail: 'Persiapan menempelkan isi sel',
        sound: 'key',
        zoomLevel: 1.05,
      },
      {
        timeMs: 7000,
        durationMs: 1800,
        activeCell: { col: 'B', row: 7 },
        copiedCell: { col: 'B', row: 3 },
        pressedKeys: ['Ctrl', 'V'],
        actionTitle: '6. Tekan V (Ctrl + V)',
        actionDetail: 'Selesai! Data langsung muncul rapi!',
        sound: 'pop',
        zoomLevel: 1.1,
        sheetDataDelta: {
          B7: preset.defaultData['B3'] || 'Data Ter-copy',
        },
      },
    ];
  } 
  // Case 2: AutoSum (Alt + =)
  else if (lower.includes('alt') && (lower.includes('=') || lower.includes('plus'))) {
    name = name || 'AutoSum Penjumlahan Otomatis';
    category = '4. Input Data';
    steps = [
      {
        timeMs: 0,
        durationMs: 1600,
        activeCell: { col: 'D', row: 6 },
        pressedKeys: [],
        actionTitle: '1. Letakkan Kursor di Bawah Kolom Angka',
        actionDetail: 'Pilih sel D6 untuk menaruh hasil penjumlahan',
        sound: 'move',
        zoomLevel: 1.0,
      },
      {
        timeMs: 1600,
        durationMs: 1400,
        activeCell: { col: 'D', row: 6 },
        pressedKeys: ['Alt'],
        actionTitle: '2. Tahan Tombol ALT',
        actionDetail: 'Persiapan perintah AutoSum',
        sound: 'key',
        zoomLevel: 1.04,
      },
      {
        timeMs: 3000,
        durationMs: 2500,
        activeCell: { col: 'D', row: 6 },
        selectedRange: { startCol: 'D', startRow: 2, endCol: 'D', endRow: 5 },
        pressedKeys: ['Alt', '='],
        actionTitle: '3. Tekan = (Alt + =)',
        actionDetail: 'Rumus otomatis: =SUM(D2:D5)',
        sound: 'copy',
        zoomLevel: 1.08,
        sheetDataDelta: {
          D6: '=SUM(D2:D5)',
        },
      },
      {
        timeMs: 5500,
        durationMs: 3300,
        activeCell: { col: 'D', row: 6 },
        pressedKeys: ['Enter'],
        actionTitle: '4. Tekan Enter',
        actionDetail: 'Hasil langsung dihitung seketika: 52.950.000!',
        sound: 'pop',
        zoomLevel: 1.1,
        sheetDataDelta: {
          D6: 'Rp 52.950.000',
        },
        cellFormattingDelta: {
          D6: { bold: true },
        },
      },
    ];
  }
  // Case 3: Bold / Italic / Format (Ctrl + B, Ctrl + I, Ctrl + U)
  else if (lower.includes('ctrl + b') || lower.includes('ctrl + i') || lower.includes('ctrl + u')) {
    const isBold = lower.includes('b');
    const isItalic = lower.includes('i');
    name = name || (isBold ? 'Bold Teks Tebal Instan' : isItalic ? 'Italic Miring Cepat' : 'Underline Garis Bawah');
    category = '5. Format Sel';
    const keyLetter = isBold ? 'B' : isItalic ? 'I' : 'U';

    steps = [
      {
        timeMs: 0,
        durationMs: 1600,
        activeCell: { col: 'B', row: 2 },
        selectedRange: { startCol: 'B', startRow: 2, endCol: 'B', endRow: 5 },
        pressedKeys: [],
        actionTitle: '1. Blok Data Sel',
        actionDetail: 'Pilih sel yang ingin diubah gayanya',
        sound: 'move',
        zoomLevel: 1.0,
      },
      {
        timeMs: 1600,
        durationMs: 1500,
        activeCell: { col: 'B', row: 2 },
        selectedRange: { startCol: 'B', startRow: 2, endCol: 'B', endRow: 5 },
        pressedKeys: ['Ctrl'],
        actionTitle: '2. Tahan Tombol CTRL',
        actionDetail: 'Shortcut format cepat',
        sound: 'key',
        zoomLevel: 1.04,
      },
      {
        timeMs: 3100,
        durationMs: 3000,
        activeCell: { col: 'B', row: 2 },
        selectedRange: { startCol: 'B', startRow: 2, endCol: 'B', endRow: 5 },
        pressedKeys: ['Ctrl', keyLetter],
        actionTitle: `3. Tekan ${keyLetter} (Ctrl + ${keyLetter})`,
        actionDetail: `Format ${name} langsung aktif!`,
        sound: 'pop',
        zoomLevel: 1.09,
        cellFormattingDelta: {
          B2: { bold: isBold, italic: isItalic },
          B3: { bold: isBold, italic: isItalic },
          B4: { bold: isBold, italic: isItalic },
          B5: { bold: isBold, italic: isItalic },
        },
      },
      {
        timeMs: 6100,
        durationMs: 2700,
        activeCell: { col: 'B', row: 2 },
        pressedKeys: [],
        actionTitle: '4. Selesai!',
        actionDetail: 'Tampilan teks berubah tegas & profesional',
        sound: 'whoosh',
        zoomLevel: 1.02,
        cellFormattingDelta: {
          B2: { bold: isBold, italic: isItalic },
          B3: { bold: isBold, italic: isItalic },
          B4: { bold: isBold, italic: isItalic },
          B5: { bold: isBold, italic: isItalic },
        },
      },
    ];
  }
  // Case 4: General Smart Shortcut Generator (any combination e.g. Ctrl + T, Ctrl + ;, Ctrl + Shift + L, etc.)
  else {
    name = name || `Shortcut Cepat ${cleanedShortcut}`;
    const modifierKeys = keys.slice(0, keys.length - 1);
    const triggerKey = keys[keys.length - 1] || 'Enter';

    steps = [
      {
        timeMs: 0,
        durationMs: 1600,
        activeCell: { col: 'B', row: 2 },
        pressedKeys: [],
        actionTitle: `1. Letakkan Kursor di Tabel`,
        actionDetail: `Kursor aktif di sel B2`,
        sound: 'move',
        zoomLevel: 1.0,
      },
      {
        timeMs: 1600,
        durationMs: 1600,
        activeCell: { col: 'B', row: 2 },
        pressedKeys: modifierKeys.length > 0 ? modifierKeys : [triggerKey],
        actionTitle: modifierKeys.length > 0 ? `2. Tahan ${modifierKeys.join(' + ')}` : `2. Siapkan Tombol ${triggerKey}`,
        actionDetail: `Persiapan eksekusi shortcut`,
        sound: 'key',
        zoomLevel: 1.05,
      },
      {
        timeMs: 3200,
        durationMs: 2800,
        activeCell: { col: 'B', row: 2 },
        pressedKeys: keys,
        actionTitle: `3. Tekan ${cleanedShortcut}`,
        actionDetail: `Perintah ${name} berhasil dijalankan!`,
        sound: 'pop',
        zoomLevel: 1.1,
        sheetDataDelta: lower.includes(';') ? {
          B2: '02/10/2026',
        } : lower.includes('t') ? {
          B1: 'Produk ▼', C1: 'Kategori ▼', D1: 'Harga ▼'
        } : undefined,
        cellFormattingDelta: {
          B2: { bold: true },
        },
      },
      {
        timeMs: 6000,
        durationMs: 2800,
        activeCell: { col: 'B', row: 3 },
        pressedKeys: [],
        actionTitle: `4. Selesai!`,
        actionDetail: `Proses sukses dalam sekejap tanpa mouse ⚡`,
        sound: 'whoosh',
        zoomLevel: 1.02,
      },
    ];
  }

  return {
    id,
    category,
    categoryNo: 99,
    shortcut: cleanedShortcut,
    name,
    description: `Animasi video reel vertikal 9:16 shortcut ${cleanedShortcut}.`,
    voiceScript: getDefaultVoiceScript(cleanedShortcut, name, `Animasi video reel vertikal 9:16 shortcut ${cleanedShortcut}.`),
    columns: preset.columns,
    rows: preset.rows,
    defaultData: preset.defaultData,
    defaultFormatting: preset.defaultFormatting,
    totalDurationMs,
    steps,
  };
}

/**
 * Parses multi-line pasted list of shortcuts:
 * Format:
 * Ctrl + C : Copy data
 * Alt + = : AutoSum
 */
export function parseShortcutBatchText(text: string): ShortcutScenario[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const scenarios: ShortcutScenario[] = [];

  for (const line of lines) {
    let shortcut = '';
    let name = '';

    if (line.includes(':')) {
      const [s, n] = line.split(':');
      shortcut = s.trim();
      name = n.trim();
    } else if (line.includes('-')) {
      const [s, n] = line.split('-');
      shortcut = s.trim();
      name = n.trim();
    } else {
      shortcut = line.trim();
    }

    if (shortcut) {
      scenarios.push(
        generateScenarioFromShortcut({
          shortcut,
          name,
        })
      );
    }
  }

  return scenarios;
}
