/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShortcutScenario, ShortcutStep } from '../types/shortcuts';
import { getDefaultVoiceScript } from '../utils/voiceOver';

export interface RawShortcutDef {
  no: number;
  categoryNo: number;
  category: string;
  shortcut: string;
  name: string;
  keys: string[];
  actionType: 'nav' | 'select' | 'edit' | 'input' | 'format' | 'rowcol' | 'sheet' | 'find' | 'formula' | 'misc';
  fromCell?: { col: string; row: number };
  toCell?: { col: string; row: number };
  range?: { startCol: string; startRow: number; endCol: string; endRow: number };
  valBefore?: string;
  valAfter?: string;
  formatAfter?: { bold?: boolean; italic?: boolean; currency?: boolean; percent?: boolean; strikethrough?: boolean };
  hiddenRows?: number[];
  hiddenCols?: string[];
  sound?: 'key' | 'pop' | 'copy' | 'move' | 'whoosh';
}

export const RAW_100_SHORTCUTS: RawShortcutDef[] = [
  // 1. Basic / Navigasi (1 - 10)
  { no: 1, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Ctrl + Home', name: 'Lompat ke sel A1 (Awal sheet)', keys: ['Ctrl', 'Home'], actionType: 'nav', fromCell: { col: 'D', row: 6 }, toCell: { col: 'A', row: 1 }, sound: 'move' },
  { no: 2, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Ctrl + End', name: 'Lompat ke sel terakhir berisi data', keys: ['Ctrl', 'End'], actionType: 'nav', fromCell: { col: 'A', row: 1 }, toCell: { col: 'E', row: 6 }, sound: 'move' },
  { no: 3, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Arrow Keys', name: 'Pindah 1 sel ke arah panah', keys: ['→'], actionType: 'nav', fromCell: { col: 'B', row: 3 }, toCell: { col: 'C', row: 3 }, sound: 'move' },
  { no: 4, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Page Up / Page Down', name: 'Pindah layar atas/bawah', keys: ['Page Down'], actionType: 'nav', fromCell: { col: 'B', row: 2 }, toCell: { col: 'B', row: 7 }, sound: 'whoosh' },
  { no: 5, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Ctrl + ← / → / ↑ / ↓', name: 'Lompat ke ujung data', keys: ['Ctrl', '↓'], actionType: 'nav', fromCell: { col: 'B', row: 2 }, toCell: { col: 'B', row: 6 }, sound: 'move' },
  { no: 6, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Ctrl + Backspace', name: 'Fokus ke sel aktif', keys: ['Ctrl', '⌫'], actionType: 'nav', fromCell: { col: 'C', row: 3 }, toCell: { col: 'C', row: 3 }, sound: 'key' },
  { no: 7, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Ctrl + G / F5', name: 'Buka dialog Go To', keys: ['Ctrl', 'G'], actionType: 'nav', fromCell: { col: 'A', row: 1 }, toCell: { col: 'D', row: 4 }, sound: 'pop' },
  { no: 8, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Ctrl + . (titik)', name: 'Pindah ke sudut seleksi berikutnya', keys: ['Ctrl', '.'], actionType: 'nav', fromCell: { col: 'B', row: 2 }, toCell: { col: 'D', row: 5 }, range: { startCol: 'B', startRow: 2, endCol: 'D', endRow: 5 }, sound: 'move' },
  { no: 9, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Tab / Shift + Tab', name: 'Pindah kanan / kiri satu sel', keys: ['Tab'], actionType: 'nav', fromCell: { col: 'B', row: 3 }, toCell: { col: 'C', row: 3 }, sound: 'move' },
  { no: 10, categoryNo: 1, category: '1. Basic / Navigasi', shortcut: 'Enter / Shift + Enter', name: 'Pindah bawah / atas satu sel', keys: ['Enter'], actionType: 'nav', fromCell: { col: 'B', row: 3 }, toCell: { col: 'B', row: 4 }, sound: 'move' },

  // 2. Seleksi (11 - 20)
  { no: 11, categoryNo: 2, category: '2. Seleksi', shortcut: 'Shift + Arrow Keys', name: 'Blok sel per arah panah', keys: ['Shift', '→'], actionType: 'select', fromCell: { col: 'B', row: 2 }, range: { startCol: 'B', startRow: 2, endCol: 'D', endRow: 2 }, sound: 'key' },
  { no: 12, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + Shift + Arrow', name: 'Blok data sampai ujung tabel', keys: ['Ctrl', 'Shift', '↓'], actionType: 'select', fromCell: { col: 'B', row: 2 }, range: { startCol: 'B', startRow: 2, endCol: 'B', endRow: 6 }, sound: 'pop' },
  { no: 13, categoryNo: 2, category: '2. Seleksi', shortcut: 'Shift + Space', name: 'Pilih 1 baris penuh', keys: ['Shift', 'Space'], actionType: 'select', fromCell: { col: 'B', row: 3 }, range: { startCol: 'A', startRow: 3, endCol: 'E', endRow: 3 }, sound: 'key' },
  { no: 14, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + Space', name: 'Pilih 1 kolom penuh', keys: ['Ctrl', 'Space'], actionType: 'select', fromCell: { col: 'C', row: 2 }, range: { startCol: 'C', startRow: 1, endCol: 'C', endRow: 7 }, sound: 'key' },
  { no: 15, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + A', name: 'Pilih semua data (Area aktif)', keys: ['Ctrl', 'A'], actionType: 'select', fromCell: { col: 'B', row: 2 }, range: { startCol: 'A', startRow: 1, endCol: 'E', endRow: 6 }, sound: 'pop' },
  { no: 16, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + A (2x)', name: 'Pilih seluruh isi sheet', keys: ['Ctrl', 'A'], actionType: 'select', fromCell: { col: 'A', row: 1 }, range: { startCol: 'A', startRow: 1, endCol: 'E', endRow: 8 }, sound: 'pop' },
  { no: 17, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + Shift + Space', name: 'Pilih seluruh area aktif', keys: ['Ctrl', 'Shift', 'Space'], actionType: 'select', fromCell: { col: 'B', row: 3 }, range: { startCol: 'A', startRow: 1, endCol: 'E', endRow: 6 }, sound: 'pop' },
  { no: 18, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + Shift + End', name: 'Pilih dari sel aktif ke sel data terakhir', keys: ['Ctrl', 'Shift', 'End'], actionType: 'select', fromCell: { col: 'B', row: 3 }, range: { startCol: 'B', startRow: 3, endCol: 'E', endRow: 6 }, sound: 'pop' },
  { no: 19, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + Shift + Home', name: 'Pilih dari sel aktif ke sel A1', keys: ['Ctrl', 'Shift', 'Home'], actionType: 'select', fromCell: { col: 'C', row: 4 }, range: { startCol: 'A', startRow: 1, endCol: 'C', endRow: 4 }, sound: 'pop' },
  { no: 20, categoryNo: 2, category: '2. Seleksi', shortcut: 'Ctrl + Shift + *', name: 'Pilih area data sekitar aktif', keys: ['Ctrl', 'Shift', '*'], actionType: 'select', fromCell: { col: 'B', row: 3 }, range: { startCol: 'A', startRow: 1, endCol: 'E', endRow: 6 }, sound: 'pop' },

  // 3. Editing Cepat (21 - 30)
  { no: 21, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Ctrl + C', name: 'Copy (Salin sel data)', keys: ['Ctrl', 'C'], actionType: 'edit', fromCell: { col: 'B', row: 3 }, sound: 'copy' },
  { no: 22, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Ctrl + X', name: 'Cut (Potong / Pindahkan data)', keys: ['Ctrl', 'X'], actionType: 'edit', fromCell: { col: 'B', row: 3 }, sound: 'key' },
  { no: 23, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Ctrl + V', name: 'Paste (Tempelkan data)', keys: ['Ctrl', 'V'], actionType: 'edit', fromCell: { col: 'B', row: 7 }, valAfter: 'Dell XPS 15', sound: 'pop' },
  { no: 24, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Ctrl + Alt + V', name: 'Paste Special (Nilai/Format)', keys: ['Ctrl', 'Alt', 'V'], actionType: 'edit', fromCell: { col: 'B', row: 7 }, valAfter: 'Rp 24.000.000', sound: 'pop' },
  { no: 25, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Delete', name: 'Hapus isi sel', keys: ['Delete'], actionType: 'edit', fromCell: { col: 'B', row: 6 }, valAfter: '', sound: 'key' },
  { no: 26, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Alt + Enter', name: 'Buat baris baru di dalam sel', keys: ['Alt', 'Enter'], actionType: 'edit', fromCell: { col: 'B', row: 2 }, valAfter: 'MacBook Air\n(Chip M3)', sound: 'pop' },
  { no: 27, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Ctrl + D', name: 'Copy isi sel atas ke bawah (Fill Down)', keys: ['Ctrl', 'D'], actionType: 'edit', fromCell: { col: 'C', row: 3 }, range: { startCol: 'C', startRow: 2, endCol: 'C', endRow: 5 }, valAfter: 'Laptop', sound: 'pop' },
  { no: 28, categoryNo: 3, category: '3. Editing Cepat', shortcut: 'Ctrl + R', name: 'Copy isi sel kiri ke kanan (Fill Right)', keys: ['Ctrl', 'R'], actionType: 'edit', fromCell: { col: 'C', row: 2 }, range: { startCol: 'B', startRow: 2, endCol: 'C', endRow: 2 }, valAfter: 'MacBook Air M3', sound: 'pop' },
  { no: 29, categoryNo: 3, category: '3. Editing Cepat', shortcut: "Ctrl + Shift + ' (apostrof)", name: 'Copy nilai sel atas', keys: ['Ctrl', 'Shift', "'"], actionType: 'edit', fromCell: { col: 'B', row: 7 }, valAfter: 'Monitor LG 4K', sound: 'pop' },
  { no: 30, categoryNo: 3, category: '3. Editing Cepat', shortcut: "Ctrl + ' (apostrof)", name: 'Copy formula dari sel atas', keys: ['Ctrl', "'"], actionType: 'edit', fromCell: { col: 'D', row: 6 }, valAfter: '=SUM(D2:D5)', sound: 'pop' },

  // 4. Input Data (31 - 40)
  { no: 31, categoryNo: 4, category: '4. Input Data', shortcut: 'Ctrl + ;', name: 'Masukkan tanggal sekarang', keys: ['Ctrl', ';'], actionType: 'input', fromCell: { col: 'E', row: 2 }, valAfter: '02/10/2026', sound: 'pop' },
  { no: 32, categoryNo: 4, category: '4. Input Data', shortcut: 'Ctrl + Shift + ;', name: 'Masukkan waktu sekarang', keys: ['Ctrl', 'Shift', ';'], actionType: 'input', fromCell: { col: 'E', row: 2 }, valAfter: '14:30:00', sound: 'pop' },
  { no: 33, categoryNo: 4, category: '4. Input Data', shortcut: 'Ctrl + E', name: 'Flash Fill (Isi otomatis pola)', keys: ['Ctrl', 'E'], actionType: 'input', fromCell: { col: 'B', row: 3 }, valAfter: 'Pola Terisi', sound: 'pop' },
  { no: 34, categoryNo: 4, category: '4. Input Data', shortcut: 'Ctrl + K', name: 'Sisipkan hyperlink', keys: ['Ctrl', 'K'], actionType: 'input', fromCell: { col: 'B', row: 2 }, valAfter: 'https://excel.com', sound: 'pop' },
  { no: 35, categoryNo: 4, category: '4. Input Data', shortcut: 'Alt + =', name: 'Sisipkan fungsi AutoSum', keys: ['Alt', '='], actionType: 'input', fromCell: { col: 'D', row: 7 }, valAfter: '=SUM(D2:D6)', sound: 'pop' },
  { no: 36, categoryNo: 4, category: '4. Input Data', shortcut: 'F2', name: 'Edit isi sel langsung', keys: ['F2'], actionType: 'input', fromCell: { col: 'B', row: 3 }, valAfter: 'Dell XPS 15 (Edited)', sound: 'key' },
  { no: 37, categoryNo: 4, category: '4. Input Data', shortcut: 'Esc', name: 'Batalkan input sel', keys: ['Esc'], actionType: 'input', fromCell: { col: 'B', row: 3 }, sound: 'whoosh' },
  { no: 38, categoryNo: 4, category: '4. Input Data', shortcut: 'Enter', name: 'Simpan input sel', keys: ['Enter'], actionType: 'input', fromCell: { col: 'B', row: 3 }, sound: 'key' },
  { no: 39, categoryNo: 4, category: '4. Input Data', shortcut: 'Shift + F2', name: 'Tambah/Edit komentar sel', keys: ['Shift', 'F2'], actionType: 'input', fromCell: { col: 'B', row: 3 }, valAfter: 'Catatan Stok Ready', sound: 'pop' },
  { no: 40, categoryNo: 4, category: '4. Input Data', shortcut: 'Ctrl + Enter', name: 'Isi data sama ke semua sel terpilih', keys: ['Ctrl', 'Enter'], actionType: 'input', fromCell: { col: 'C', row: 3 }, range: { startCol: 'C', startRow: 3, endCol: 'C', endRow: 6 }, valAfter: 'Verified', sound: 'pop' },

  // 5. Format Sel (41 - 50)
  { no: 41, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + 1', name: 'Buka dialog Format Cells', keys: ['Ctrl', '1'], actionType: 'format', fromCell: { col: 'B', row: 3 }, sound: 'pop' },
  { no: 42, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + B', name: 'Tebalkan huruf (Bold)', keys: ['Ctrl', 'B'], actionType: 'format', fromCell: { col: 'B', row: 2 }, formatAfter: { bold: true }, sound: 'pop' },
  { no: 43, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + I', name: 'Miringkan teks (Italic)', keys: ['Ctrl', 'I'], actionType: 'format', fromCell: { col: 'B', row: 2 }, formatAfter: { italic: true }, sound: 'pop' },
  { no: 44, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + U', name: 'Garis bawah teks (Underline)', keys: ['Ctrl', 'U'], actionType: 'format', fromCell: { col: 'B', row: 2 }, formatAfter: { bold: true }, sound: 'pop' },
  { no: 45, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + 5', name: 'Coret teks (Strikethrough)', keys: ['Ctrl', '5'], actionType: 'format', fromCell: { col: 'B', row: 4 }, formatAfter: { strikethrough: true }, sound: 'pop' },
  { no: 46, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + Shift + $', name: 'Format mata uang (Currency)', keys: ['Ctrl', 'Shift', '$'], actionType: 'format', fromCell: { col: 'D', row: 2 }, range: { startCol: 'D', startRow: 2, endCol: 'D', endRow: 6 }, valAfter: 'Rp 18.500.000', sound: 'pop' },
  { no: 47, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + Shift + %', name: 'Format persentase (%)', keys: ['Ctrl', 'Shift', '%'], actionType: 'format', fromCell: { col: 'D', row: 2 }, valAfter: '85%', sound: 'pop' },
  { no: 48, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + Shift + #', name: 'Format tanggal (Date format)', keys: ['Ctrl', 'Shift', '#'], actionType: 'format', fromCell: { col: 'E', row: 2 }, valAfter: '02-Okt-26', sound: 'pop' },
  { no: 49, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + Shift + @', name: 'Format waktu (Time format)', keys: ['Ctrl', 'Shift', '@'], actionType: 'format', fromCell: { col: 'E', row: 2 }, valAfter: '02:30 PM', sound: 'pop' },
  { no: 50, categoryNo: 5, category: '5. Format Sel', shortcut: 'Ctrl + Shift + !', name: 'Format angka desimal (Number format)', keys: ['Ctrl', 'Shift', '!'], actionType: 'format', fromCell: { col: 'D', row: 2 }, valAfter: '18,500,000.00', sound: 'pop' },

  // 6. Baris & Kolom (51 - 60)
  { no: 51, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Ctrl + Shift + +', name: 'Sisipkan sel/baris/kolom baru', keys: ['Ctrl', 'Shift', '+'], actionType: 'rowcol', fromCell: { col: 'B', row: 3 }, sound: 'pop' },
  { no: 52, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Ctrl + -', name: 'Hapus sel/baris/kolom terpilih', keys: ['Ctrl', '-'], actionType: 'rowcol', fromCell: { col: 'B', row: 4 }, sound: 'pop' },
  { no: 53, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Ctrl + 0', name: 'Sembunyikan kolom', keys: ['Ctrl', '0'], actionType: 'rowcol', fromCell: { col: 'C', row: 2 }, hiddenCols: ['C'], sound: 'pop' },
  { no: 54, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Ctrl + Shift + 0', name: 'Tampilkan kolom yang tersembunyi', keys: ['Ctrl', 'Shift', '0'], actionType: 'rowcol', fromCell: { col: 'C', row: 2 }, sound: 'whoosh' },
  { no: 55, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Ctrl + 9', name: 'Sembunyikan baris', keys: ['Ctrl', '9'], actionType: 'rowcol', fromCell: { col: 'B', row: 4 }, hiddenRows: [4], sound: 'pop' },
  { no: 56, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Ctrl + Shift + 9', name: 'Tampilkan baris yang tersembunyi', keys: ['Ctrl', 'Shift', '9'], actionType: 'rowcol', fromCell: { col: 'B', row: 4 }, sound: 'whoosh' },
  { no: 57, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Shift + Alt + →', name: 'Group baris/kolom data', keys: ['Shift', 'Alt', '→'], actionType: 'rowcol', fromCell: { col: 'B', row: 2 }, range: { startCol: 'B', startRow: 2, endCol: 'B', endRow: 5 }, sound: 'key' },
  { no: 58, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Shift + Alt + ←', name: 'Ungroup baris/kolom data', keys: ['Shift', 'Alt', '←'], actionType: 'rowcol', fromCell: { col: 'B', row: 2 }, sound: 'key' },
  { no: 59, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Alt + H + O + I', name: 'AutoFit lebar kolom otomatis rapi', keys: ['Alt', 'H', 'O', 'I'], actionType: 'rowcol', fromCell: { col: 'B', row: 1 }, range: { startCol: 'A', startRow: 1, endCol: 'E', endRow: 6 }, sound: 'pop' },
  { no: 60, categoryNo: 6, category: '6. Baris & Kolom', shortcut: 'Alt + H + O + A', name: 'AutoFit tinggi baris otomatis rapi', keys: ['Alt', 'H', 'O', 'A'], actionType: 'rowcol', fromCell: { col: 'A', row: 1 }, range: { startCol: 'A', startRow: 1, endCol: 'E', endRow: 6 }, sound: 'pop' },

  // 7. Sheet Management (61 - 70)
  { no: 61, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Shift + F11', name: 'Buat sheet baru seketika', keys: ['Shift', 'F11'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 62, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Alt + O + H + R', name: 'Ganti nama tab sheet aktif', keys: ['Alt', 'O', 'H', 'R'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'key' },
  { no: 63, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Ctrl + Page Up', name: 'Pindah ke sheet sebelah kiri', keys: ['Ctrl', 'Page Up'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'move' },
  { no: 64, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Ctrl + Page Down', name: 'Pindah ke sheet sebelah kanan', keys: ['Ctrl', 'Page Down'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'move' },
  { no: 65, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Alt + H + O + M', name: 'Pindah atau salin lembar sheet', keys: ['Alt', 'H', 'O', 'M'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'key' },
  { no: 66, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Alt + E + L', name: 'Hapus tab sheet aktif', keys: ['Alt', 'E', 'L'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'key' },
  { no: 67, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Ctrl + Shift + Page Up', name: 'Pilih sheet aktif + sheet kiri (Group)', keys: ['Ctrl', 'Shift', 'Page Up'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 68, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Ctrl + Shift + Page Down', name: 'Pilih sheet aktif + sheet kanan (Group)', keys: ['Ctrl', 'Shift', 'Page Down'], actionType: 'sheet', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 69, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Ctrl + F3', name: 'Buka Name Manager', keys: ['Ctrl', 'F3'], actionType: 'sheet', fromCell: { col: 'B', row: 2 }, sound: 'pop' },
  { no: 70, categoryNo: 7, category: '7. Sheet Management', shortcut: 'Ctrl + Shift + F3', name: 'Create Name from Selection', keys: ['Ctrl', 'Shift', 'F3'], actionType: 'sheet', fromCell: { col: 'B', row: 1 }, sound: 'pop' },

  // 8. Pencarian & Revisi (71 - 80)
  { no: 71, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Ctrl + F', name: 'Cari data (Find)', keys: ['Ctrl', 'F'], actionType: 'find', fromCell: { col: 'B', row: 3 }, sound: 'pop' },
  { no: 72, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Ctrl + H', name: 'Ganti data otomatis (Replace)', keys: ['Ctrl', 'H'], actionType: 'find', fromCell: { col: 'B', row: 3 }, valAfter: 'Dell XPS 16 Max', sound: 'pop' },
  { no: 73, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Ctrl + Z', name: 'Batalkan aksi terakhir (Undo)', keys: ['Ctrl', 'Z'], actionType: 'find', fromCell: { col: 'B', row: 3 }, sound: 'whoosh' },
  { no: 74, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Ctrl + Y', name: 'Ulangi aksi yang dibatalkan (Redo)', keys: ['Ctrl', 'Y'], actionType: 'find', fromCell: { col: 'B', row: 3 }, sound: 'pop' },
  { no: 75, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'F4', name: 'Ulangi aksi terakhir (Repeat Action)', keys: ['F4'], actionType: 'find', fromCell: { col: 'B', row: 4 }, formatAfter: { bold: true }, sound: 'pop' },
  { no: 76, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Shift + F4', name: 'Cari kecocokan berikutnya (Find Next)', keys: ['Shift', 'F4'], actionType: 'find', fromCell: { col: 'B', row: 5 }, sound: 'move' },
  { no: 77, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Ctrl + Tab', name: 'Pindah antar jendela workbook Excel', keys: ['Ctrl', 'Tab'], actionType: 'find', fromCell: { col: 'A', row: 1 }, sound: 'whoosh' },
  { no: 78, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Ctrl + Q', name: 'Buka Quick Analysis', keys: ['Ctrl', 'Q'], actionType: 'find', fromCell: { col: 'B', row: 2 }, range: { startCol: 'B', startRow: 2, endCol: 'D', endRow: 6 }, sound: 'pop' },
  { no: 79, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'Alt + F1', name: 'Sisipkan Chart grafik instan di sheet', keys: ['Alt', 'F1'], actionType: 'find', fromCell: { col: 'B', row: 2 }, range: { startCol: 'B', startRow: 2, endCol: 'D', endRow: 6 }, sound: 'pop' },
  { no: 80, categoryNo: 8, category: '8. Pencarian & Revisi', shortcut: 'F11', name: 'Buat Chart grafik di sheet baru terpisah', keys: ['F11'], actionType: 'find', fromCell: { col: 'B', row: 2 }, range: { startCol: 'B', startRow: 2, endCol: 'D', endRow: 6 }, sound: 'pop' },

  // 9. Formula (81 - 90)
  { no: 81, categoryNo: 9, category: '9. Formula', shortcut: '=', name: 'Mulai mengetik formula rumus Excel', keys: ['='], actionType: 'formula', fromCell: { col: 'D', row: 7 }, valAfter: '=SUM(D2:D6)', sound: 'key' },
  { no: 82, categoryNo: 9, category: '9. Formula', shortcut: 'Shift + F9', name: 'Hitung kalkulasi sheet aktif', keys: ['Shift', 'F9'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, sound: 'pop' },
  { no: 83, categoryNo: 9, category: '9. Formula', shortcut: 'F9', name: 'Hitung semua rumus di seluruh workbook', keys: ['F9'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, sound: 'pop' },
  { no: 84, categoryNo: 9, category: '9. Formula', shortcut: 'Ctrl + ` (grave accent)', name: 'Tampilkan semua rumus di lembar kerja', keys: ['Ctrl', '`'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, valAfter: '=SUM(D2:D6)', sound: 'pop' },
  { no: 85, categoryNo: 9, category: '9. Formula', shortcut: 'Alt + M + F (atau Shift + F3)', name: 'Sisipkan fungsi / Insert Function', keys: ['Shift', 'F3'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, sound: 'pop' },
  { no: 86, categoryNo: 9, category: '9. Formula', shortcut: 'Ctrl + F3', name: 'Buka Name Manager rumus', keys: ['Ctrl', 'F3'], actionType: 'formula', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 87, categoryNo: 9, category: '9. Formula', shortcut: 'F3', name: 'Paste nama range ke dalam rumus', keys: ['F3'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, valAfter: '=SUM(Total_Penjualan)', sound: 'pop' },
  { no: 88, categoryNo: 9, category: '9. Formula', shortcut: 'Ctrl + Shift + U', name: 'Expand / Collapse Formula Bar', keys: ['Ctrl', 'Shift', 'U'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, sound: 'whoosh' },
  { no: 89, categoryNo: 9, category: '9. Formula', shortcut: 'Ctrl + Shift + A', name: 'Sisipkan argumen fungsi rumus lengkap', keys: ['Ctrl', 'Shift', 'A'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, valAfter: '=SUM(number1, [number2], ...)', sound: 'pop' },
  { no: 90, categoryNo: 9, category: '9. Formula', shortcut: 'F4', name: 'Toggle referensi absolut ($A$1 ↔ A1)', keys: ['F4'], actionType: 'formula', fromCell: { col: 'D', row: 7 }, valAfter: '=SUM($D$2:$D$6)', sound: 'pop' },

  // 10. Lain-lain (91 - 100)
  { no: 91, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Ctrl + N', name: 'Buka workbook baru kosong', keys: ['Ctrl', 'N'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 92, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Ctrl + O', name: 'Buka file Excel yang ada', keys: ['Ctrl', 'O'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 93, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Ctrl + S', name: 'Simpan file (Save workbook)', keys: ['Ctrl', 'S'], actionType: 'misc', fromCell: { col: 'B', row: 3 }, sound: 'pop' },
  { no: 94, categoryNo: 10, category: '10. Lain-lain', shortcut: 'F12', name: 'Simpan sebagai file baru (Save As)', keys: ['F12'], actionType: 'misc', fromCell: { col: 'B', row: 3 }, sound: 'pop' },
  { no: 95, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Ctrl + P', name: 'Buka jendela cetak / Print preview', keys: ['Ctrl', 'P'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 96, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Ctrl + W', name: 'Tutup workbook Excel yang aktif', keys: ['Ctrl', 'W'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'whoosh' },
  { no: 97, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Ctrl + F4', name: 'Tutup jendela window dokumen', keys: ['Ctrl', 'F4'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'whoosh' },
  { no: 98, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Alt + F4', name: 'Keluar dari aplikasi Microsoft Excel', keys: ['Alt', 'F4'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'whoosh' },
  { no: 99, categoryNo: 10, category: '10. Lain-lain', shortcut: 'F1', name: 'Buka pusat bantuan / Help', keys: ['F1'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'pop' },
  { no: 100, categoryNo: 10, category: '10. Lain-lain', shortcut: 'Alt', name: 'Aktifkan petunjuk huruf menu ribbon (Keytips)', keys: ['Alt'], actionType: 'misc', fromCell: { col: 'A', row: 1 }, sound: 'key' },
];

const DEFAULT_SALES_DATA: Record<string, string> = {
  A1: 'No', B1: 'Nama Produk', C1: 'Kategori', D1: 'Harga', E1: 'Status',
  A2: '1', B2: 'MacBook Air M3', C2: 'Laptop', D2: 'Rp 18.500.000', E2: 'Ready',
  A3: '2', B3: 'Dell XPS 15', C3: 'Laptop', D3: 'Rp 24.000.000', E3: 'Ready',
  A4: '3', B4: 'Logitech Master', C4: 'Mouse', D4: 'Rp 1.450.000', E4: 'Ready',
  A5: '4', B5: 'Keychron Q1 Pro', C5: 'Keyboard', D5: 'Rp 2.800.000', E5: 'Ready',
  A6: '5', B6: 'Monitor LG 4K', C6: 'Monitor', D6: 'Rp 6.200.000', E6: 'Ready',
  A7: '6', B7: '', C7: '', D7: '', E7: '',
};

const DEFAULT_FORMATTING = {
  A1: { bold: true }, B1: { bold: true }, C1: { bold: true }, D1: { bold: true }, E1: { bold: true },
};

/**
 * Transforms any RawShortcutDef into a complete 8.5-9s playable 9:16 vertical scenario
 */
export function buildScenarioFromDef(def: RawShortcutDef): ShortcutScenario {
  const from = def.fromCell || { col: 'B', row: 3 };
  const to = def.toCell || from;
  const fromCoord = `${from.col}${from.row}`;
  const toCoord = `${to.col}${to.row}`;

  // Unique ID
  const id = `sc-${def.no}-${def.shortcut.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  // Key array for animations
  const keys = def.keys;
  const modifierKeys = keys.slice(0, keys.length - 1);
  const primaryKey = keys[keys.length - 1];

  let steps: ShortcutStep[] = [];

  // Special case: Copy-Paste (No. 21 & No. 23)
  if (def.no === 21) {
    // Ctrl + C then Ctrl + V
    steps = [
      {
        timeMs: 0,
        durationMs: 1400,
        activeCell: { col: 'B', row: 3 },
        pressedKeys: [],
        actionTitle: '1. Pilih Sel Berisi Data',
        actionDetail: 'Kursor berada di sel B3 ("Dell XPS 15")',
        sound: 'move',
        zoomLevel: 1.0,
      },
      {
        timeMs: 1400,
        durationMs: 1200,
        activeCell: { col: 'B', row: 3 },
        pressedKeys: ['Ctrl'],
        actionTitle: '2. Tahan Tombol CTRL',
        actionDetail: 'Tekan dan tahan tombol Ctrl',
        sound: 'key',
        zoomLevel: 1.04,
      },
      {
        timeMs: 2600,
        durationMs: 1800,
        activeCell: { col: 'B', row: 3 },
        copiedCell: { col: 'B', row: 3 },
        pressedKeys: ['Ctrl', 'C'],
        actionTitle: '3. Tekan C (Ctrl + C = Salin)',
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
        actionDetail: 'Arahkan kursor seleksi ke sel B7 yang kosong',
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
        durationMs: 2000,
        activeCell: { col: 'B', row: 7 },
        copiedCell: { col: 'B', row: 3 },
        pressedKeys: ['Ctrl', 'V'],
        actionTitle: '6. Tekan V (Ctrl + V = Tempel)',
        actionDetail: 'Bimsalabim! Data langsung muncul rapi!',
        sound: 'pop',
        zoomLevel: 1.1,
        sheetDataDelta: {
          B7: 'Dell XPS 15',
        },
      },
    ];
  } else {
    // Standard choreography for all other 99 shortcuts
    steps = [
      {
        timeMs: 0,
        durationMs: 1600,
        activeCell: from,
        pressedKeys: [],
        actionTitle: `1. Letakkan Kursor (${fromCoord})`,
        actionDetail: `Target sel awal ${fromCoord}`,
        sound: 'move',
        zoomLevel: 1.0,
      },
      {
        timeMs: 1600,
        durationMs: 1400,
        activeCell: from,
        pressedKeys: modifierKeys.length > 0 ? modifierKeys : [primaryKey],
        actionTitle: modifierKeys.length > 0 ? `2. Tahan ${modifierKeys.join(' + ')}` : `2. Siapkan Tombol ${primaryKey}`,
        actionDetail: 'Menyiapkan kombinasi tombol',
        sound: 'key',
        zoomLevel: 1.04,
      },
      {
        timeMs: 3000,
        durationMs: 2800,
        activeCell: to,
        selectedRange: def.range,
        pressedKeys: keys,
        actionTitle: `3. Tekan ${def.shortcut}`,
        actionDetail: `${def.name} langsung aktif!`,
        sound: def.sound || 'pop',
        zoomLevel: 1.09,
        sheetDataDelta: def.valAfter !== undefined ? { [toCoord]: def.valAfter } : undefined,
        cellFormattingDelta: def.formatAfter !== undefined ? { [toCoord]: def.formatAfter } : undefined,
        hiddenRows: def.hiddenRows,
        hiddenCols: def.hiddenCols,
      },
      {
        timeMs: 5800,
        durationMs: 3000,
        activeCell: to,
        selectedRange: def.range,
        pressedKeys: [],
        actionTitle: `4. Selesai!`,
        actionDetail: `Fungsi #${def.no}: ${def.name}`,
        sound: 'whoosh',
        zoomLevel: 1.02,
        sheetDataDelta: def.valAfter !== undefined ? { [toCoord]: def.valAfter } : undefined,
        cellFormattingDelta: def.formatAfter !== undefined ? { [toCoord]: def.formatAfter } : undefined,
        hiddenRows: def.hiddenRows,
        hiddenCols: def.hiddenCols,
      },
    ];
  }

  return {
    id,
    category: def.category,
    categoryNo: def.categoryNo,
    shortcut: def.shortcut,
    name: `${def.no}. ${def.name}`,
    description: `Shortcut #${def.no} Excel Tanpa Mouse: ${def.shortcut} untuk ${def.name}.`,
    voiceScript: getDefaultVoiceScript(def.shortcut, def.name, `Shortcut Excel ${def.shortcut} untuk ${def.name}.`),
    columns: ['A', 'B', 'C', 'D', 'E'],
    rows: [1, 2, 3, 4, 5, 6, 7, 8],
    defaultData: { ...DEFAULT_SALES_DATA },
    defaultFormatting: { ...DEFAULT_FORMATTING },
    totalDurationMs: 8800,
    steps,
  };
}

export const ALL_100_SCENARIOS: ShortcutScenario[] = RAW_100_SHORTCUTS.map(buildScenarioFromDef);
