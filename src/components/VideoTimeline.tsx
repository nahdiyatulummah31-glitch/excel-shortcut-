/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Repeat, 
  Sparkles,
  Download
} from 'lucide-react';

interface VideoTimelineProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onRestart: () => void;
  currentTimeMs: number;
  totalDurationMs: number;
  onSeek: (targetMs: number) => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isFullScreenMode: boolean;
  onToggleFullScreen: () => void;
  onOpenExportModal?: () => void;
}

export const VideoTimeline: React.FC<VideoTimelineProps> = ({
  isPlaying,
  onTogglePlay,
  onRestart,
  currentTimeMs,
  totalDurationMs,
  onSeek,
  playbackSpeed,
  onChangeSpeed,
  isLooping,
  onToggleLoop,
  isMuted,
  onToggleMute,
  isFullScreenMode,
  onToggleFullScreen,
  onOpenExportModal,
}) => {
  const progressPercent = Math.min(100, Math.max(0, (currentTimeMs / totalDurationMs) * 100));

  const formatSec = (ms: number) => {
    const s = (ms / 1000).toFixed(1);
    return `${s}s`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * totalDurationMs);
  };

  return (
    <div className="w-full bg-neutral-900/90 backdrop-blur-md border-t border-neutral-800 text-neutral-200 px-3 sm:px-4 py-2.5 flex flex-col gap-2 shrink-0 select-none z-50">
      {/* 1. PROGRESS BAR (Reels/TikTok style scrubber) */}
      <div 
        className="w-full h-2.5 bg-neutral-800 hover:h-3 rounded-full cursor-pointer relative overflow-hidden transition-all group"
        onClick={handleProgressBarClick}
      >
        {/* Background track */}
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-[width] duration-75 relative"
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover:scale-100 transition-transform" />
        </div>
      </div>

      {/* 2. CONTROLS BAR */}
      <div className="flex items-center justify-between text-xs gap-2">
        {/* Left: Play/Pause, Restart, Time */}
        <div className="flex items-center gap-2">
          <button
            onClick={onTogglePlay}
            className="w-8 h-8 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-md"
            title={isPlaying ? 'Jeda Video' : 'Putar Video'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
          </button>

          <button
            onClick={onRestart}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
            title="Ulangi dari Awal"
          >
            <RotateCcw size={13} />
          </button>

          {/* Time text */}
          <div className="font-mono text-[11px] text-neutral-400 tabular-nums ml-1">
            <span className="text-white font-bold">{formatSec(currentTimeMs)}</span>
            <span className="text-neutral-500 mx-1">/</span>
            <span>{formatSec(totalDurationMs)}</span>
          </div>
        </div>

        {/* Right: Controls (Loop, Speed, Audio, Fullscreen) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Loop toggle */}
          <button
            onClick={onToggleLoop}
            className={`p-1.5 rounded-md text-xs flex items-center gap-1 transition-colors ${
              isLooping 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                : 'text-neutral-400 hover:bg-neutral-800'
            }`}
            title="Putar Ulang Otomatis (Loop Reel)"
          >
            <Repeat size={13} />
            <span className="hidden md:inline text-[10px]">Loop</span>
          </button>

          {/* Speed selector */}
          <div className="flex items-center bg-neutral-800 rounded-lg p-0.5 border border-neutral-700/60">
            {[0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => onChangeSpeed(spd)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-medium transition-colors ${
                  playbackSpeed === spd 
                    ? 'bg-emerald-600 text-white font-bold' 
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-md transition-colors ${
              isMuted ? 'text-neutral-500 hover:bg-neutral-800' : 'text-emerald-400 hover:bg-neutral-800'
            }`}
            title={isMuted ? 'Suara Hening' : 'Suara Keyboard Mekanikal Aktif'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          {/* Full Screen 9:16 toggle */}
          <button
            onClick={onToggleFullScreen}
            className={`p-1.5 rounded-md transition-colors ${
              isFullScreenMode ? 'bg-emerald-600 text-white' : 'text-neutral-300 hover:bg-neutral-800'
            }`}
            title={isFullScreenMode ? 'Keluar Mode Layar Penuh' : 'Mode Layar Penuh 9:16 Excel'}
          >
            {isFullScreenMode ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Download Video button (Always visible and prominent) */}
          {onOpenExportModal && (
            <button
              onClick={onOpenExportModal}
              className="px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 active:scale-95 transition-all shrink-0"
              title="Download Video 9:16 Siap Upload ke TikTok/Reels"
            >
              <Download size={13} className="animate-bounce" />
              <span>Download Video</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
