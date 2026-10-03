/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { Download, Film, CheckCircle2, Sparkles, X, RefreshCw, Volume2, Music2 } from 'lucide-react';
import { ShortcutScenario } from '../types/shortcuts';

interface VideoExporterProps {
  isOpen: boolean;
  onClose: () => void;
  scenario: ShortcutScenario;
  onStartExportRecord: () => void;
  isRecording: boolean;
  recordingProgress: number; // 0 to 100
  downloadUrl: string | null;
}

export const VideoExporter: React.FC<VideoExporterProps> = ({
  isOpen,
  onClose,
  scenario,
  onStartExportRecord,
  isRecording,
  recordingProgress,
  downloadUrl,
}) => {
  // If opened and not recording and no download url yet, auto-start recording!
  useEffect(() => {
    if (isOpen && !isRecording && !downloadUrl) {
      onStartExportRecord();
    }
  }, [isOpen, isRecording, downloadUrl, onStartExportRecord]);

  if (!isOpen) return null;

  const fileName = `Excel_Shortcut_${scenario.shortcut.replace(/[^a-zA-Z0-9]/g, '_')}_9x16.mp4`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-neutral-900 border border-neutral-700/80 rounded-2xl shadow-2xl p-5 text-neutral-100 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Download size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Download Video Vertikal 9:16</span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                  .MP4
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">Format MP4 resmi untuk TikTok, Instagram Reels & Shorts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center text-xs"
          >
            <X size={14} />
          </button>
        </div>

        {/* Shortcut Info Card */}
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-3 flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
              {scenario.category}
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              Format: MP4 (H.264/AAC)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-mono text-base font-bold text-white bg-neutral-900 px-2.5 py-0.5 rounded border border-neutral-700 shadow-inner">
              {scenario.shortcut}
            </span>
            <span className="text-[11px] font-mono text-neutral-400">
              720 × 1280 • 9:16 Vertikal
            </span>
          </div>
          <p className="text-xs text-neutral-200 font-medium mt-0.5">
            {scenario.name}
          </p>

          {/* Audio voiceover feature badge */}
          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-neutral-300 bg-neutral-900/90 px-2.5 py-1.5 rounded-lg border border-neutral-800">
            <Volume2 size={13} className="text-emerald-400 shrink-0" />
            <span className="text-emerald-300 font-medium">Audio:</span>
            <span className="text-neutral-300 truncate">Suara Cewek Kalem Luwes + Efek Keyboard Mekanikal</span>
          </div>
        </div>

        {/* Recording State */}
        {isRecording ? (
          <div className="flex flex-col items-center justify-center py-6 gap-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-3 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Film size={22} className="text-emerald-400 animate-pulse" />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">Sedang Memproses & Merender Video MP4...</div>
              <div className="text-xs text-neutral-400 mt-1">
                Menyinkronkan animasi Excel, suara cewek & efek keyboard ({Math.round(recordingProgress)}%)
              </div>
            </div>
            <div className="w-4/5 h-2.5 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 transition-all duration-150"
                style={{ width: `${recordingProgress}%` }}
              />
            </div>
            <div className="text-[10px] text-neutral-500">
              Proses rekaman 30 FPS berkecepatan tinggi tanpa kompresi buram.
            </div>
          </div>
        ) : downloadUrl ? (
          <div className="flex flex-col items-center justify-center py-4 gap-3.5 bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-400/40">
              <CheckCircle2 size={28} />
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-white">Video MP4 Siap Didownload!</div>
              <p className="text-xs text-neutral-300 mt-0.5">
                Video 9:16 sudah berisi suara narasi cewek kalem dan efek keyboard.
              </p>
            </div>

            {/* Video Preview Player */}
            <div className="w-48 aspect-[9/16] bg-black rounded-lg overflow-hidden border border-neutral-700 shadow-md">
              <video 
                src={downloadUrl} 
                controls 
                playsInline 
                autoPlay 
                loop 
                className="w-full h-full object-cover" 
              />
            </div>

            <a
              href={downloadUrl}
              download={fileName}
              className="mt-1 w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/60 active:scale-98 transition-all"
            >
              <Download size={16} />
              <span>Download File MP4 ({fileName})</span>
            </a>

            <div className="flex items-center gap-3">
              <button
                onClick={onStartExportRecord}
                className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={11} />
                <span>Render Ulang</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-xs text-neutral-300 flex flex-col gap-2">
            <div className="flex items-start gap-2 bg-neutral-950/60 p-3 rounded-lg border border-neutral-800/80">
              <Sparkles size={16} className="text-emerald-400 shrink-0 mt-0.5" />
              <span>
                Klik tombol di bawah untuk membuat file video MP4 (9:16) vertikal lengkap dengan suara cewek dan suara keyboard tanpa watermark.
              </span>
            </div>

            <button
              onClick={onStartExportRecord}
              className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-98 transition-all"
            >
              <Download size={15} />
              <span>Mulai Render MP4 Sekarang</span>
            </button>
          </div>
        )}

        <div className="text-[10px] text-neutral-500 text-center flex items-center justify-center gap-2">
          <span>Format: MP4 (9:16 Vertikal)</span>
          <span>•</span>
          <span>Resolusi: 720 × 1280</span>
          <span>•</span>
          <span>Suara Cewek & Efek Audio Aktif</span>
        </div>
      </div>
    </div>
  );
};
