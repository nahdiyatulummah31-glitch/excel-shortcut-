/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Plus, 
  FileText, 
  Zap, 
  X, 
  Check, 
  ListPlus,
  Play
} from 'lucide-react';
import { generateScenarioFromShortcut, parseShortcutBatchText } from '../utils/shortcutGenerator';
import { ShortcutScenario } from '../types/shortcuts';

interface ShortcutGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScenarioGenerated: (scenario: ShortcutScenario) => void;
  onBatchScenariosGenerated: (scenarios: ShortcutScenario[]) => void;
}

export const ShortcutGeneratorModal: React.FC<ShortcutGeneratorModalProps> = ({
  isOpen,
  onClose,
  onScenarioGenerated,
  onBatchScenariosGenerated,
}) => {
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  // Single shortcut state
  const [shortcutKey, setShortcutKey] = useState('Ctrl + T');
  const [shortcutTitle, setShortcutTitle] = useState('Buat Tabel Otomatis');
  const [dataType, setDataType] = useState<'sales' | 'students' | 'salary' | 'inventory'>('sales');

  // Batch shortcuts state
  const [batchText, setBatchText] = useState(
    `Ctrl + C : Copy / Salin Data Sel
Ctrl + V : Paste / Tempelkan Data
Alt + = : AutoSum Penjumlahan Kilat
Ctrl + B : Tebalkan Huruf (Bold)
Ctrl + E : Flash Fill Pola Otomatis
Ctrl + ; : Masukkan Tanggal Hari Ini
Ctrl + 9 : Sembunyikan Baris Rahasia
Alt + H + O + I : AutoFit Lebar Kolom`
  );

  const sampleShortcuts = [
    { key: 'Ctrl + T', name: 'Buat Tabel Cepat' },
    { key: 'Ctrl + Shift + L', name: 'Pasang Filter Otomatis' },
    { key: 'Alt + =', name: 'AutoSum Penjumlahan' },
    { key: 'Ctrl + E', name: 'Flash Fill Ekstrak Teks' },
    { key: 'Ctrl + ;', name: 'Input Tanggal Sekarang' },
    { key: 'Ctrl + B', name: 'Format Bold Huruf' },
  ];

  if (!isOpen) return null;

  const handleGenerateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shortcutKey.trim()) return;

    const generated = generateScenarioFromShortcut({
      shortcut: shortcutKey.trim(),
      name: shortcutTitle.trim() || undefined,
      dataType,
    });

    onScenarioGenerated(generated);
    onClose();
  };

  const handleGenerateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchText.trim()) return;

    const scenarios = parseShortcutBatchText(batchText);
    if (scenarios.length > 0) {
      onBatchScenariosGenerated(scenarios);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-neutral-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Generate Video Shortcut Sendiri</h3>
              <p className="text-[11px] text-neutral-400">Input shortcut lalu video 9:16 langsung ter-generate otomatis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs"
          >
            <X size={14} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-neutral-800 px-4 pt-2 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('single')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'single' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Input 1 Shortcut Cepat
            {activeTab === 'single' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('batch')}
            className={`pb-2 transition-colors relative ${
              activeTab === 'batch' ? 'text-emerald-400' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Paste Daftar Banyak Shortcut
            {activeTab === 'batch' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-emerald-500" />
            )}
          </button>
        </div>

        {/* Tab 1: Single Shortcut Input */}
        {activeTab === 'single' ? (
          <form onSubmit={handleGenerateSingle} className="p-4 flex flex-col gap-3.5">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Tombol Shortcut Keyboard:
              </label>
              <input
                type="text"
                value={shortcutKey}
                onChange={(e) => setShortcutKey(e.target.value)}
                placeholder="Contoh: Ctrl + T atau Alt + = atau Ctrl + Shift + L"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                required
              />
              {/* Quick Pills */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {sampleShortcuts.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => {
                      setShortcutKey(s.key);
                      setShortcutTitle(s.name);
                    }}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 rounded text-[10px] font-mono transition-colors"
                  >
                    {s.key}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Nama / Fungsi Shortcut:
              </label>
              <input
                type="text"
                value={shortcutTitle}
                onChange={(e) => setShortcutTitle(e.target.value)}
                placeholder="Contoh: Buat Tabel Otomatis"
                className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Pilih Contoh Tabel Data Excel:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'sales', label: 'Laporan Penjualan' },
                  { id: 'students', label: 'Nilai Mahasiswa' },
                  { id: 'salary', label: 'Gaji Karyawan' },
                  { id: 'inventory', label: 'Stok Barang Gudang' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setDataType(item.id as any)}
                    className={`p-2 rounded-lg border text-left font-medium transition-colors ${
                      dataType === item.id
                        ? 'bg-emerald-950/60 border-emerald-500 text-white font-bold ring-1 ring-emerald-500/40'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
            >
              <Sparkles size={14} />
              <span>⚡ Generate Video Reel Otomatis</span>
            </button>
          </form>
        ) : (
          /* Tab 2: Batch Shortcut Input */
          <form onSubmit={handleGenerateBatch} className="p-4 flex flex-col gap-3">
            <div className="text-[11px] text-neutral-400">
              Paste daftar shortcut dari buku / catatan Anda (format: <code className="text-emerald-400">Shortcut : Keterangan</code>):
            </div>

            <textarea
              rows={8}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed"
              placeholder="Ctrl + C : Copy&#10;Ctrl + V : Paste"
              required
            />

            <button
              type="submit"
              className="mt-1 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
            >
              <ListPlus size={14} />
              <span>🚀 Generate Semua Jadi Playlist Video</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
