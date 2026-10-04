/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Download, 
  Sun, 
  Moon, 
  FileSpreadsheet, 
  Plus, 
  Zap,
  Mic,
  MicOff,
  Volume1,
  Headphones
} from 'lucide-react';
import { SHORTCUT_CATALOG } from './data/shortcutCatalog';
import { ShortcutScenario, ShortcutStep } from './types/shortcuts';
import { ExcelWorksheet } from './components/ExcelWorksheet';
import { KeyboardOverlay } from './components/KeyboardOverlay';
import { VideoTimeline } from './components/VideoTimeline';
import { ShortcutDrawer } from './components/ShortcutDrawer';
import { VideoExporter } from './components/VideoExporter';
import { ShortcutGeneratorModal } from './components/ShortcutGeneratorModal';
import { QuickShortcutInputBar } from './components/QuickShortcutInputBar';
import { soundFx } from './utils/soundEffects';
import { recordShortcutVideo, downloadVideoBlob } from './utils/videoRecorder';
import { getDefaultVoiceScript, playVoiceNarration, stopVoiceOver } from './utils/voiceOver';

export default function App() {
  // Playlist of scenarios (contains all 100 shortcuts by default + any user custom generated ones)
  const [catalog, setCatalog] = useState<ShortcutScenario[]>(SHORTCUT_CATALOG);

  // Current active shortcut scenario (Default: Shortcut #21 / Ctrl + C then Ctrl + V)
  const [currentScenario, setCurrentScenario] = useState<ShortcutScenario>(
    SHORTCUT_CATALOG.find((s) => s.shortcut === 'Ctrl + C') || SHORTCUT_CATALOG[0]
  );
  
  // Dark mode Excel theme (matching the user's reference image with dark charcoal grid and glass capsule)
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  // Screen reference for high-fidelity DOM video recording (100% sama plek)
  const screenRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [currentTimeMs, setCurrentTimeMs] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullScreenMode, setIsFullScreenMode] = useState<boolean>(false);

  // Female voiceover narration state
  const [isVoiceOverEnabled, setIsVoiceOverEnabled] = useState<boolean>(true);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);

  // UI Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isGeneratorModalOpen, setIsGeneratorModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingProgress, setRecordingProgress] = useState<number>(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // Floating controls auto-hide in full-screen mode
  const [showFloatingControls, setShowFloatingControls] = useState<boolean>(true);
  const floatingControlsTimeout = useRef<number | null>(null);

  // Keep track of sound played per step to avoid multi-triggers
  const lastStepSoundTriggered = useRef<number>(-1);

  // Animation frame reference
  const lastFrameTime = useRef<number>(performance.now());
  const reqAnimRef = useRef<number | null>(null);

  // Calculate current active step based on currentTimeMs
  const currentStepIndex = Math.max(
    0,
    currentScenario.steps.reduce((acc, step, idx) => {
      return currentTimeMs >= step.timeMs ? idx : acc;
    }, 0)
  );

  const currentStep: ShortcutStep = currentScenario.steps[currentStepIndex] || currentScenario.steps[0];

  // Derive dynamic spreadsheet data based on steps up to current step
  const spreadsheetData = React.useMemo(() => {
    let data = { ...currentScenario.defaultData };
    for (let i = 0; i <= currentStepIndex; i++) {
      const step = currentScenario.steps[i];
      if (step.sheetDataDelta) {
        data = { ...data, ...step.sheetDataDelta };
      }
    }
    return data;
  }, [currentScenario, currentStepIndex]);

  // Audio trigger effect when step changes
  useEffect(() => {
    if (lastStepSoundTriggered.current !== currentStepIndex) {
      lastStepSoundTriggered.current = currentStepIndex;
      const soundType = currentStep.sound;
      if (soundType && !isMuted) {
        switch (soundType) {
          case 'key':
            soundFx.playKeyClick();
            break;
          case 'copy':
            soundFx.playCopySound();
            break;
          case 'pop':
            soundFx.playPastePop();
            // Trigger joyful mini confetti pop
            confetti({
              particleCount: 28,
              spread: 60,
              origin: { y: 0.65 },
              colors: ['#10b981', '#34d399', '#6ee7b7', '#059669'],
              ticks: 120,
              scalar: 0.8,
            });
            break;
          case 'move':
            soundFx.playMoveTick();
            break;
          case 'whoosh':
            soundFx.playWhoosh();
            break;
        }
      }
    }
  }, [currentStepIndex, currentStep.sound, isMuted]);

  // Calm, fluent female voiceover trigger during playback
  useEffect(() => {
    if (isPlaying && isVoiceOverEnabled && !isMuted && currentTimeMs < 800) {
      const script = currentScenario.voiceScript || getDefaultVoiceScript(
        currentScenario.shortcut,
        currentScenario.name,
        currentScenario.description
      );
      const rawCtx = soundFx.getRawAudioContext();
      if (rawCtx) {
        setIsVoiceSpeaking(true);
        playVoiceNarration(script, rawCtx, undefined, 0.95, () => {
          setIsVoiceSpeaking(false);
        });
      }
    } else if (!isPlaying || isMuted || !isVoiceOverEnabled) {
      stopVoiceOver();
      setIsVoiceSpeaking(false);
    }
    return () => {
      stopVoiceOver();
    };
  }, [currentScenario.id, isPlaying, isVoiceOverEnabled, isMuted, currentTimeMs < 800]);

  // Animation loop
  const updatePlayback = useCallback((now: number) => {
    if (isPlaying) {
      const delta = (now - lastFrameTime.current) * playbackSpeed;
      setCurrentTimeMs((prevTime) => {
        const nextTime = prevTime + delta;
        if (nextTime >= currentScenario.totalDurationMs) {
          if (isLooping) {
            lastStepSoundTriggered.current = -1;
            return 0;
          } else {
            setIsPlaying(false);
            return currentScenario.totalDurationMs;
          }
        }
        return nextTime;
      });
    }
    lastFrameTime.current = now;
    reqAnimRef.current = requestAnimationFrame(updatePlayback);
  }, [isPlaying, playbackSpeed, currentScenario.totalDurationMs, isLooping]);

  useEffect(() => {
    lastFrameTime.current = performance.now();
    reqAnimRef.current = requestAnimationFrame(updatePlayback);
    return () => {
      if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current);
    };
  }, [updatePlayback]);

  // Switch scenario handler
  const handleSelectScenario = (scenario: ShortcutScenario) => {
    stopVoiceOver();
    setIsVoiceSpeaking(false);
    setCurrentScenario(scenario);
    setCurrentTimeMs(0);
    lastStepSoundTriggered.current = -1;
    setIsPlaying(true);
  };

  // Handle newly generated custom single scenario
  const handleScenarioGenerated = (newScenario: ShortcutScenario) => {
    stopVoiceOver();
    setIsVoiceSpeaking(false);
    setCatalog((prev) => [newScenario, ...prev]);
    setCurrentScenario(newScenario);
    setCurrentTimeMs(0);
    lastStepSoundTriggered.current = -1;
    setIsPlaying(true);
  };

  // Handle batch generated scenarios
  const handleBatchScenariosGenerated = (newScenarios: ShortcutScenario[]) => {
    if (newScenarios.length === 0) return;
    stopVoiceOver();
    setIsVoiceSpeaking(false);
    setCatalog((prev) => [...newScenarios, ...prev]);
    setCurrentScenario(newScenarios[0]);
    setCurrentTimeMs(0);
    lastStepSoundTriggered.current = -1;
    setIsPlaying(true);
  };

  const handleRestart = () => {
    stopVoiceOver();
    setIsVoiceSpeaking(false);
    setCurrentTimeMs(0);
    lastStepSoundTriggered.current = -1;
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleSeek = (targetMs: number) => {
    setCurrentTimeMs(targetMs);
    lastStepSoundTriggered.current = -1;
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    soundFx.setMuted(nextMute);
    if (nextMute) {
      stopVoiceOver();
      setIsVoiceSpeaking(false);
    }
  };

  // Preview voice narration on demand
  const handleTestVoice = () => {
    stopVoiceOver();
    const script = currentScenario.voiceScript || getDefaultVoiceScript(
      currentScenario.shortcut,
      currentScenario.name,
      currentScenario.description
    );
    const rawCtx = soundFx.getRawAudioContext();
    if (rawCtx) {
      setIsVoiceSpeaking(true);
      playVoiceNarration(script, rawCtx, undefined, 0.95, () => {
        setIsVoiceSpeaking(false);
      });
    }
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'KeyR') {
        handleRestart();
      } else if (e.code === 'KeyF') {
        setIsFullScreenMode((prev) => !prev);
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMuted]);

  // Auto-hide floating controls during full-screen mode
  const handleMouseMoveFullScreen = () => {
    setShowFloatingControls(true);
    if (floatingControlsTimeout.current) {
      window.clearTimeout(floatingControlsTimeout.current);
    }
    floatingControlsTimeout.current = window.setTimeout(() => {
      setShowFloatingControls(false);
    }, 2400);
  };

  // Export video trigger with auto download MP4
  const handleStartExportRecord = async () => {
    setIsRecording(true);
    setRecordingProgress(0);
    setDownloadUrl(null);

    try {
      const videoBlob = await recordShortcutVideo(
        currentScenario, 
        isDarkTheme, 
        (percent) => {
          setRecordingProgress(percent);
        },
        screenRef.current
      );
      const url = URL.createObjectURL(videoBlob);
      setDownloadUrl(url);

      // Trigger immediate automatic browser download with .mp4 extension!
      const fileName = `Excel_Shortcut_${currentScenario.shortcut.replace(/[^a-zA-Z0-9]/g, '_')}_9x16.mp4`;
      downloadVideoBlob(videoBlob, fileName);

      // Confetti celebration
      confetti({
        particleCount: 50,
        spread: 75,
        origin: { y: 0.5 },
      });
    } catch (err) {
      console.error('Error generating MP4 video:', err);
    } finally {
      setIsRecording(false);
    }
  };

  const activeVoiceScript = currentScenario.voiceScript || getDefaultVoiceScript(
    currentScenario.shortcut,
    currentScenario.name,
    currentScenario.description
  );

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white relative overflow-x-hidden">
      {/* 1. TOP BAR (Only visible when NOT in full-screen mode) */}
      {!isFullScreenMode && (
        <header className="border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md px-4 sm:px-6 py-2.5 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
              X
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
                <span>Excel Shortcut 9:16 Video Generator</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                  100 Shortcut
                </span>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 font-mono px-2 py-0.5 rounded-full border border-teal-500/30">
                  MP4
                </span>
              </h1>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Ketik shortcut apa saja lalu tonton video reel vertikal 9:16 dengan keyboard 3D dan suara cewek kalem!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* FEMALE VOICEOVER TOGGLE BUTTON */}
            <button
              onClick={() => setIsVoiceOverEnabled(!isVoiceOverEnabled)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                isVoiceOverEnabled
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 shadow-sm'
                  : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:text-white'
              }`}
              title={isVoiceOverEnabled ? 'Suara Cewek Kalem Aktif (Klik untuk Matikan)' : 'Nyalakan Suara Cewek Kalem'}
            >
              {isVoiceOverEnabled ? (
                <Mic size={14} className={isVoiceSpeaking ? 'text-emerald-400 animate-pulse' : 'text-emerald-400'} />
              ) : (
                <MicOff size={14} className="text-neutral-500" />
              )}
              <span className="hidden sm:inline">Suara Cewek</span>
              <span className={`text-[10px] px-1 rounded ${isVoiceOverEnabled ? 'bg-emerald-500/30 text-emerald-300' : 'bg-neutral-700 text-neutral-400'}`}>
                {isVoiceOverEnabled ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* DIRECT DOWNLOAD MP4 VIDEO BUTTON */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-all active:scale-95 shrink-0"
              title="Download Video 9:16 Format MP4"
            >
              <Download size={13} className="animate-bounce" />
              <span>Download MP4</span>
            </button>

            {/* Dark/Light Excel Grid Theme Switcher */}
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs flex items-center gap-1 border border-neutral-700 transition-colors"
              title={isDarkTheme ? 'Ganti ke Tema Terang (Excel White)' : 'Ganti ke Tema Gelap (Excel Dark Grid)'}
            >
              {isDarkTheme ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-neutral-400" />}
            </button>

            {/* Open Shortcut Catalog */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-neutral-700 transition-colors"
            >
              <FileSpreadsheet size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Koleksi 100</span>
            </button>
          </div>
        </header>
      )}

      {/* 2. MAIN CONTENT AREA */}
      <main
        className={`flex-1 flex items-center justify-center transition-all ${
          isFullScreenMode ? 'w-screen h-screen p-0 bg-black' : 'p-2 sm:p-6'
        }`}
        onMouseMove={isFullScreenMode ? handleMouseMoveFullScreen : undefined}
      >
        {/* CENTER REEL WRAPPER WITH DIRECT INPUT BAR */}
        <div className={`flex flex-col items-center gap-2.5 w-full ${isFullScreenMode ? 'h-full justify-center' : 'max-w-[430px]'}`}>
          
          {/* A. DIRECT QUICK INPUT BAR (Always visible in studio mode!) */}
          {!isFullScreenMode && (
            <QuickShortcutInputBar
              catalog={catalog}
              currentScenario={currentScenario}
              onSelectScenario={handleSelectScenario}
              onOpenBatchModal={() => setIsGeneratorModalOpen(true)}
              onDownloadVideo={() => setIsExportModalOpen(true)}
            />
          )}

          {/* B. THE 9:16 VERTICAL REEL FRAME */}
          <div
            ref={screenRef}
            id="excel-vertical-screen"
            className={`relative flex flex-col bg-white overflow-hidden shadow-2xl transition-all duration-300 w-full ${
              isFullScreenMode
                ? 'h-full max-w-[56.25vh] aspect-[9/16]' // Perfectly fills full screen in 9:16 ratio
                : 'aspect-[9/16] rounded-3xl border-4 border-neutral-800 ring-1 ring-neutral-700'
            }`}
          >
            {/* SPREADSHEET CANVAS */}
            <div className="flex-1 w-full relative overflow-hidden flex flex-col">
              <ExcelWorksheet
                scenario={currentScenario}
                currentStep={currentStep}
                elapsedMs={currentTimeMs}
                data={spreadsheetData}
                isFullScreenMode={isFullScreenMode}
                isDarkTheme={isDarkTheme}
              />

              {/* ANIMATED FLOATING MECHANICAL KEYBOARD OVERLAY (Matching ineffblgrl on Threads.png) */}
              <div className="absolute bottom-1 sm:bottom-4 inset-x-0 pointer-events-none z-30">
                <KeyboardOverlay
                  currentStep={currentStep}
                  shortcutTitle={currentScenario.shortcut}
                  isDarkTheme={isDarkTheme}
                />
              </div>
            </div>

            {/* BOTTOM TIMELINE & CONTROLS */}
            <VideoTimeline
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onRestart={handleRestart}
              currentTimeMs={currentTimeMs}
              totalDurationMs={currentScenario.totalDurationMs}
              onSeek={handleSeek}
              playbackSpeed={playbackSpeed}
              onChangeSpeed={setPlaybackSpeed}
              isLooping={isLooping}
              onToggleLoop={() => setIsLooping(!isLooping)}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              isFullScreenMode={isFullScreenMode}
              onToggleFullScreen={() => setIsFullScreenMode(!isFullScreenMode)}
              onOpenExportModal={() => setIsExportModalOpen(true)}
            />

            {/* FLOATING EXIT FULLSCREEN BUTTON IN FULLSCREEN MODE */}
            {isFullScreenMode && showFloatingControls && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-2 animate-in fade-in duration-200">
                <button
                  onClick={() => setIsVoiceOverEnabled(!isVoiceOverEnabled)}
                  className={`p-1.5 rounded-full border shadow-lg text-xs ${
                    isVoiceOverEnabled ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-black/80 text-neutral-400 border-neutral-700'
                  }`}
                  title="Toggle Suara Cewek"
                >
                  <Mic size={13} />
                </button>
                <button
                  onClick={() => setIsExportModalOpen(true)}
                  className="px-2.5 py-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white text-[11px] font-bold rounded-full border border-emerald-400/40 flex items-center gap-1 shadow-lg shrink-0"
                  title="Download Video 9:16 MP4"
                >
                  <Download size={12} className="animate-bounce" />
                  <span>Download MP4</span>
                </button>
                <button
                  onClick={() => setIsGeneratorModalOpen(true)}
                  className="px-2.5 py-1 bg-emerald-600/90 hover:bg-emerald-600 text-white text-[11px] font-bold rounded-full border border-emerald-400/40 flex items-center gap-1 shadow-lg"
                >
                  <Zap size={12} className="text-amber-300 fill-amber-300" />
                  <span>Input Shortcut</span>
                </button>
                <button
                  onClick={() => setIsDrawerOpen(true)}
                  className="px-2.5 py-1 bg-black/80 hover:bg-black text-white text-[11px] font-semibold rounded-full border border-neutral-700 flex items-center gap-1 shadow-lg"
                >
                  <FileSpreadsheet size={12} className="text-emerald-400" />
                  <span>Daftar 100</span>
                </button>
                <button
                  onClick={() => setIsDarkTheme(!isDarkTheme)}
                  className="p-1.5 bg-black/80 hover:bg-black text-white rounded-full border border-neutral-700 shadow-lg text-xs"
                  title="Ganti Tema Excel"
                >
                  {isDarkTheme ? <Sun size={12} className="text-amber-400" /> : <Moon size={12} />}
                </button>
                <button
                  onClick={() => setIsFullScreenMode(false)}
                  className="p-1.5 bg-black/80 hover:bg-black text-white rounded-full border border-neutral-700 shadow-lg text-xs"
                  title="Keluar Layar Penuh"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        {/* C. SIDE INFO PANEL (Only shown in Studio desktop layout) */}
        {!isFullScreenMode && (
          <aside className="hidden lg:flex flex-col gap-3.5 ml-6 w-84 shrink-0">
            {/* Active Shortcut Summary */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1 font-semibold uppercase">
                <span>{currentScenario.category}</span>
                <span className="text-neutral-500">
                  {currentScenario.categoryNo <= 10 ? `Kategori ${currentScenario.categoryNo}` : 'Kustom'}
                </span>
              </div>
              <div className="text-xl font-black font-mono text-white bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800 my-2 inline-block">
                {currentScenario.shortcut}
              </div>
              <h3 className="text-sm font-bold text-neutral-200">
                {currentScenario.name}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {currentScenario.description}
              </p>

              {/* Female Narration Script Card */}
              <div className="mt-3.5 bg-neutral-950 border border-emerald-500/30 rounded-xl p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Headphones size={13} />
                    <span>Naskah Suara Cewek Kalem:</span>
                  </div>
                  <button
                    onClick={handleTestVoice}
                    className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Volume1 size={11} />
                    <span>Tes Suara</span>
                  </button>
                </div>
                <p className="text-[11px] text-neutral-300 italic leading-relaxed bg-neutral-900/60 p-2 rounded-lg border border-neutral-800">
                  "{activeVoiceScript}"
                </p>
                <div className="text-[10px] text-neutral-500 flex items-center justify-between">
                  <span>Intonasi: Kalem & Luwes</span>
                  <span>Durasi: Sesuai Video (~9s)</span>
                </div>
              </div>

              {/* Step Sequence Checklist */}
              <div className="mt-4 border-t border-neutral-800/80 pt-3 flex flex-col gap-2">
                <span className="text-[11px] font-bold text-neutral-300">Urutan Adegan Video (8-10 Detik):</span>
                {currentScenario.steps.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={idx}
                      onClick={() => handleSeek(step.timeMs)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 font-semibold'
                          : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200'
                      }`}
                    >
                      <span className="truncate">{step.actionTitle}</span>
                      <span className="font-mono text-[10px] text-neutral-500 shrink-0 ml-1">
                        {(step.timeMs / 1000).toFixed(1)}s
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick 100 Cheatsheet Browser CTA */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-3.5 shadow-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileSpreadsheet size={14} className="text-emerald-400" />
                  <span>Koleksi 100 Shortcut</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">
                  Lengkap dari 10 halaman buku panduan
                </div>
              </div>
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition-colors"
              >
                Buka
              </button>
            </div>

            {/* Export Call-to-Action */}
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/40 active:scale-98 transition-all"
            >
              <Download size={14} />
              <span>Download Video Vertikal (.MP4)</span>
            </button>
          </aside>
        )}
      </main>

      {/* 3. SHORTCUT DRAWER MODAL */}
      <ShortcutDrawer
        currentScenarioId={currentScenario.id}
        onSelectScenario={handleSelectScenario}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        catalog={catalog}
      />

      {/* 4. SHORTCUT GENERATOR MODAL */}
      <ShortcutGeneratorModal
        isOpen={isGeneratorModalOpen}
        onClose={() => setIsGeneratorModalOpen(false)}
        onScenarioGenerated={handleScenarioGenerated}
        onBatchScenariosGenerated={handleBatchScenariosGenerated}
      />

      {/* 5. VIDEO EXPORTER MODAL */}
      <VideoExporter
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        scenario={currentScenario}
        onStartExportRecord={handleStartExportRecord}
        isRecording={isRecording}
        recordingProgress={recordingProgress}
        downloadUrl={downloadUrl}
      />
    </div>
  );
}
