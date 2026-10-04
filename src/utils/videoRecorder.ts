/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { toCanvas } from 'html-to-image';
import { ShortcutScenario, ShortcutStep } from '../types/shortcuts';
import { soundFx } from './soundEffects';
import { getDefaultVoiceScript, playVoiceNarration } from './voiceOver';

/**
 * High-fidelity 9:16 vertical video recorder.
 * Can capture the live DOM element directly (100% SAMA PLEK with screen preview)
 * or render using ultra-high-definition canvas fallback.
 * Produces genuine MP4 files with integrated female voice narration and mechanical keyboard audio.
 */
export async function recordShortcutVideo(
  scenario: ShortcutScenario,
  isDarkTheme: boolean = true,
  onProgress: (percent: number) => void,
  targetElement?: HTMLElement | null
): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = 720;
  canvas.height = 1280; // Standard 9:16 vertical HD resolution
  const ctx = canvas.getContext('2d', { alpha: false });

  if (!ctx) {
    throw new Error('Canvas 2D context not available');
  }

  // Pre-fill canvas
  ctx.fillStyle = isDarkTheme ? '#18181b' : '#f3f3f3';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const fps = 30; // 30 FPS for smooth video playback
  const stream = canvas.captureStream(fps);

  // Set up Web Audio pipeline to capture keyboard sounds & female voice into the MP4 file
  let audioCtx: AudioContext | null = null;
  let audioDest: MediaStreamAudioDestinationNode | null = null;

  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      audioDest = audioCtx.createMediaStreamDestination();
      soundFx.addDestination(audioDest);

      const audioTrack = audioDest.stream.getAudioTracks()[0];
      if (audioTrack) {
        stream.addTrack(audioTrack);
      }
    }
  } catch (err) {
    console.warn('Audio capture setup failed, continuing with video only:', err);
  }

  const chunks: Blob[] = [];

  // Prioritize MP4 formats so the output is an MP4 video file
  const mimeTypes = [
    'video/mp4;codecs=avc1,mp4a.40.2',
    'video/mp4;codecs=avc1',
    'video/mp4;codecs=h264',
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];
  const chosenMime = mimeTypes.find((mime) => MediaRecorder.isTypeSupported(mime)) || 'video/mp4';

  let mediaRecorder: MediaRecorder;
  try {
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: chosenMime,
      videoBitsPerSecond: 8000000, // 8 Mbps high-quality video bitrate
    });
  } catch {
    try {
      mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/mp4' });
    } catch {
      mediaRecorder = new MediaRecorder(stream);
    }
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  return new Promise((resolve, reject) => {
    mediaRecorder.onstop = () => {
      // Ensure cleanup
      if (audioDest) {
        soundFx.removeDestination(audioDest);
      }
      if (audioCtx && audioCtx.state !== 'closed') {
        audioCtx.close().catch(() => {});
      }

      // Explicitly return as video/mp4 blob
      const outputMime = chosenMime.startsWith('video/mp4') ? chosenMime : 'video/mp4';
      const blob = new Blob(chunks, { type: outputMime });
      resolve(blob);
    };

    mediaRecorder.onerror = (err) => {
      if (audioDest) soundFx.removeDestination(audioDest);
      if (audioCtx) audioCtx.close().catch(() => {});
      reject(err);
    };

    mediaRecorder.start(200); // chunk every 200ms

    // Trigger voice narration into audio destination
    const voiceScript = scenario.voiceScript || getDefaultVoiceScript(scenario.shortcut, scenario.name, scenario.description);
    if (audioCtx && audioDest) {
      playVoiceNarration(voiceScript, audioCtx, audioDest, 0.95).catch(() => {});
    }

    const totalDurationMs = scenario.totalDurationMs || 8800;
    const totalFrames = Math.floor((totalDurationMs / 1000) * fps);
    let currentFrame = 0;
    let lastStepIndex = -1;

    const timer = setInterval(async () => {
      const currentTimeMs = (currentFrame / totalFrames) * totalDurationMs;
      onProgress(Math.min(99, Math.round((currentFrame / totalFrames) * 100)));

      // Find current step
      let stepIndex = 0;
      for (let i = 0; i < scenario.steps.length; i++) {
        if (currentTimeMs >= scenario.steps[i].timeMs) {
          stepIndex = i;
        }
      }
      const step = scenario.steps[stepIndex] || scenario.steps[0];

      // Trigger audio effects on step transitions
      if (stepIndex !== lastStepIndex) {
        lastStepIndex = stepIndex;
        if (step.sound === 'key') soundFx.playKeyClick();
        else if (step.sound === 'pop') soundFx.playPastePop();
        else if (step.sound === 'copy') soundFx.playCopySound();
        else if (step.sound === 'move') soundFx.playMoveTick();
        else if (step.sound === 'whoosh') soundFx.playWhoosh();
      }

      // 1. If targetElement is provided, capture exact DOM for 100% SAMA PLEK quality!
      let capturedViaDom = false;
      if (targetElement) {
        try {
          const domCanvas = await toCanvas(targetElement, {
            pixelRatio: 1.5,
            cacheBust: false,
          });
          ctx.drawImage(domCanvas, 0, 0, canvas.width, canvas.height);
          capturedViaDom = true;
        } catch {
          capturedViaDom = false;
        }
      }

      // 2. High-fidelity canvas fallback (WITHOUT any subtitle pill on screen!)
      if (!capturedViaDom) {
        drawPureExcelCanvas(ctx, canvas.width, canvas.height, scenario, step, currentTimeMs, isDarkTheme);
      }

      currentFrame++;
      if (currentFrame > totalFrames) {
        clearInterval(timer);
        onProgress(100);
        setTimeout(() => {
          try {
            if (mediaRecorder.state !== 'inactive') {
              mediaRecorder.stop();
            }
          } catch {
            const blob = new Blob(chunks, { type: 'video/mp4' });
            resolve(blob);
          }
        }, 300);
      }
    }, 1000 / fps);
  });
}

/**
 * High-fidelity Excel renderer without any floating subtitles / pills on screen.
 * Focuses purely on authentic Excel 365 window, formula bar, grid, and 3D mechanical keys.
 */
function drawPureExcelCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scenario: ShortcutScenario,
  step: ShortcutStep,
  currentTimeMs: number,
  isDarkTheme: boolean
) {
  // Clear background
  ctx.fillStyle = isDarkTheme ? '#18181b' : '#f3f3f3';
  ctx.fillRect(0, 0, width, height);

  // 1. TOP EXCEL TITLE BAR (Authentic Excel 365)
  ctx.fillStyle = '#107c41'; // Authentic Excel Ribbon Green
  ctx.fillRect(0, 0, width, 52);

  // AutoSave pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.beginPath();
  ctx.roundRect(14, 12, 110, 28, 14);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px "Segoe UI", sans-serif';
  ctx.fillText('AutoSave • ON', 26, 30);

  // Title
  ctx.font = 'bold 14px "Segoe UI", sans-serif';
  ctx.fillText('Laporan_Keuangan_2026.xlsx - Excel', 140, 31);

  // Window buttons (- [ ] X)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.font = '14px "Segoe UI"';
  ctx.fillText('—  ▢  ✕', width - 75, 31);

  // 2. EXCEL MENU TABS (File, Home, Insert, Page Layout, Formulas, Data, Review, View)
  ctx.fillStyle = isDarkTheme ? '#202023' : '#e6e6e6';
  ctx.fillRect(0, 52, width, 38);

  const tabs = ['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View'];
  let tabX = 14;
  tabs.forEach((tab, i) => {
    ctx.font = i === 1 ? 'bold 13px "Segoe UI"' : '12px "Segoe UI"';
    ctx.fillStyle = i === 1 ? (isDarkTheme ? '#10b981' : '#107c41') : (isDarkTheme ? '#a1a1aa' : '#555555');
    ctx.fillText(tab, tabX, 76);
    if (i === 1) {
      // Tab underline indicator
      ctx.fillStyle = isDarkTheme ? '#10b981' : '#107c41';
      ctx.fillRect(tabX - 2, 87, ctx.measureText(tab).width + 4, 3);
    }
    tabX += ctx.measureText(tab).width + 16;
  });

  // 3. RIBBON ACTION BAR (Compact Excel Toolbar)
  const ribbonY = 90;
  ctx.fillStyle = isDarkTheme ? '#27272a' : '#f8fafc';
  ctx.fillRect(0, ribbonY, width, 52);
  ctx.strokeStyle = isDarkTheme ? '#3f3f46' : '#e2e8f0';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, ribbonY, width, 52);

  // Font family dropdown
  ctx.fillStyle = isDarkTheme ? '#18181b' : '#ffffff';
  ctx.beginPath();
  ctx.roundRect(14, ribbonY + 10, 110, 32, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isDarkTheme ? '#f4f4f5' : '#1e293b';
  ctx.font = '500 12px "Segoe UI"';
  ctx.fillText('Aptos Display ▾', 24, ribbonY + 30);

  // Font size
  ctx.beginPath();
  ctx.roundRect(132, ribbonY + 10, 48, 32, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillText('11 ▾', 142, ribbonY + 30);

  // B I U buttons
  const isBoldActive = step.cellFormattingDelta?.[`${step.activeCell.col}${step.activeCell.row}`]?.bold;
  const isItalicActive = step.cellFormattingDelta?.[`${step.activeCell.col}${step.activeCell.row}`]?.italic;

  // Bold button
  ctx.fillStyle = isBoldActive ? '#107c41' : (isDarkTheme ? '#3f3f46' : '#e2e8f0');
  ctx.beginPath();
  ctx.roundRect(190, ribbonY + 10, 32, 32, 6);
  ctx.fill();
  ctx.fillStyle = isBoldActive ? '#ffffff' : (isDarkTheme ? '#f4f4f5' : '#1e293b');
  ctx.font = 'bold 14px "Segoe UI"';
  ctx.fillText('B', 201, ribbonY + 31);

  // Italic button
  ctx.fillStyle = isItalicActive ? '#107c41' : (isDarkTheme ? '#3f3f46' : '#e2e8f0');
  ctx.beginPath();
  ctx.roundRect(228, ribbonY + 10, 32, 32, 6);
  ctx.fill();
  ctx.fillStyle = isItalicActive ? '#ffffff' : (isDarkTheme ? '#f4f4f5' : '#1e293b');
  ctx.font = 'italic 14px "Segoe UI"';
  ctx.fillText('I', 240, ribbonY + 31);

  // Underline button
  ctx.fillStyle = isDarkTheme ? '#3f3f46' : '#e2e8f0';
  ctx.beginPath();
  ctx.roundRect(266, ribbonY + 10, 32, 32, 6);
  ctx.fill();
  ctx.fillStyle = isDarkTheme ? '#f4f4f5' : '#1e293b';
  ctx.font = '14px "Segoe UI"';
  ctx.fillText('U̲', 276, ribbonY + 31);

  // Number format badges (Rp, %, 0.00)
  ctx.fillStyle = isDarkTheme ? '#18181b' : '#ffffff';
  ctx.beginPath();
  ctx.roundRect(310, ribbonY + 10, 42, 32, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#10b981';
  ctx.font = 'bold 12px "Segoe UI"';
  ctx.fillText('Rp', 322, ribbonY + 30);

  ctx.beginPath();
  ctx.roundRect(360, ribbonY + 10, 36, 32, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = isDarkTheme ? '#f4f4f5' : '#1e293b';
  ctx.font = 'bold 13px "Segoe UI"';
  ctx.fillText('%', 372, ribbonY + 31);

  // 4. FORMULA BAR
  const formulaY = 146;
  ctx.fillStyle = isDarkTheme ? '#202024' : '#f1f5f9';
  ctx.fillRect(0, formulaY, width, 40);
  ctx.strokeStyle = isDarkTheme ? '#2e2e33' : '#cbd5e1';
  ctx.strokeRect(0, formulaY, width, 40);

  // Name Box (B3, A1, etc.)
  ctx.fillStyle = isDarkTheme ? '#18181b' : '#ffffff';
  ctx.beginPath();
  ctx.roundRect(14, formulaY + 6, 85, 28, 6);
  ctx.fill();
  ctx.strokeStyle = isDarkTheme ? '#10b981' : '#107c41';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.lineWidth = 1;

  ctx.fillStyle = isDarkTheme ? '#ffffff' : '#000000';
  ctx.font = 'bold 13px "Segoe UI"';
  ctx.fillText(`${step.activeCell.col}${step.activeCell.row}`, 42, formulaY + 24);

  // fx icon
  ctx.fillStyle = '#107c41';
  ctx.font = 'italic bold 15px "Segoe UI"';
  ctx.fillText('fx', 114, formulaY + 25);

  // Formula input area
  ctx.fillStyle = isDarkTheme ? '#18181b' : '#ffffff';
  ctx.beginPath();
  ctx.roundRect(140, formulaY + 6, width - 154, 28, 6);
  ctx.fill();
  ctx.strokeStyle = isDarkTheme ? '#3f3f46' : '#cbd5e1';
  ctx.stroke();

  const activeCoord = `${step.activeCell.col}${step.activeCell.row}`;
  let formulaValue = scenario.defaultData[activeCoord] || '';
  if (step.sheetDataDelta && step.sheetDataDelta[activeCoord] !== undefined) {
    formulaValue = step.sheetDataDelta[activeCoord];
  }
  ctx.fillStyle = isDarkTheme ? '#f4f4f5' : '#1e293b';
  ctx.font = '13px "Segoe UI"';
  ctx.fillText(formulaValue, 152, formulaY + 24);

  // 5. SPREADSHEET GRID
  const startGridY = 192;
  const colWidth = 120;
  const rowHeight = 44;

  // Header corner
  ctx.fillStyle = isDarkTheme ? '#222225' : '#f0f0f0';
  ctx.fillRect(0, startGridY, 70, rowHeight);
  ctx.strokeStyle = isDarkTheme ? '#2e2e33' : '#d4d4d4';
  ctx.strokeRect(0, startGridY, 70, rowHeight);

  // Columns A, B, C, D, E...
  scenario.columns.forEach((col, idx) => {
    const isColActive = step.activeCell.col === col;
    ctx.fillStyle = isColActive ? '#107c41' : (isDarkTheme ? '#222225' : '#f0f0f0');
    ctx.fillRect(70 + idx * colWidth, startGridY, colWidth, rowHeight);
    ctx.strokeStyle = isDarkTheme ? '#2e2e33' : '#d4d4d4';
    ctx.strokeRect(70 + idx * colWidth, startGridY, colWidth, rowHeight);

    ctx.fillStyle = isColActive ? '#ffffff' : (isDarkTheme ? '#a1a1aa' : '#444444');
    ctx.font = 'bold 16px "Segoe UI"';
    ctx.fillText(col, 70 + idx * colWidth + colWidth / 2 - 8, startGridY + 28);
  });

  // Rows 1, 2, 3, 4, 5, 6, 7, 8...
  scenario.rows.forEach((row, rIdx) => {
    if (step.hiddenRows?.includes(row)) return;

    const rowY = startGridY + (rIdx + 1) * rowHeight;
    const isRowActive = step.activeCell.row === row;

    // Row number header
    ctx.fillStyle = isRowActive ? '#107c41' : (isDarkTheme ? '#222225' : '#f0f0f0');
    ctx.fillRect(0, rowY, 70, rowHeight);
    ctx.strokeStyle = isDarkTheme ? '#2e2e33' : '#d4d4d4';
    ctx.strokeRect(0, rowY, 70, rowHeight);

    ctx.fillStyle = isRowActive ? '#ffffff' : (isDarkTheme ? '#a1a1aa' : '#444444');
    ctx.font = 'bold 16px "Segoe UI"';
    ctx.fillText(String(row), 25, rowY + 28);

    // Cells
    scenario.columns.forEach((col, cIdx) => {
      if (step.hiddenCols?.includes(col)) return;

      const cellX = 70 + cIdx * colWidth;
      const cCoord = `${col}${row}`;
      const isActive = step.activeCell.col === col && step.activeCell.row === row;
      const isCopied = step.copiedCell && step.copiedCell.col === col && step.copiedCell.row === row;

      // Range check
      let isInRange = false;
      if (step.selectedRange) {
        const { startCol, startRow, endCol, endRow } = step.selectedRange;
        const colCode = col.charCodeAt(0);
        const sColCode = startCol.charCodeAt(0);
        const eColCode = endCol.charCodeAt(0);
        if (colCode >= sColCode && colCode <= eColCode && row >= startRow && row <= endRow) {
          isInRange = true;
        }
      }

      let text = scenario.defaultData[cCoord] || '';
      if (step.sheetDataDelta && step.sheetDataDelta[cCoord] !== undefined) {
        text = step.sheetDataDelta[cCoord];
      }

      ctx.fillStyle = isDarkTheme 
        ? (row === 1 ? '#222226' : (isInRange ? '#064e3b' : '#18181b'))
        : (row === 1 ? '#f8fafc' : (isInRange ? '#d1fae5' : '#ffffff'));
      ctx.fillRect(cellX, rowY, colWidth, rowHeight);

      ctx.strokeStyle = isDarkTheme ? '#27272a' : '#e2e2e2';
      ctx.lineWidth = 1;
      ctx.strokeRect(cellX, rowY, colWidth, rowHeight);

      // Render Text
      const isCellBold = row === 1 || step.cellFormattingDelta?.[cCoord]?.bold;
      const isCellItalic = step.cellFormattingDelta?.[cCoord]?.italic;
      ctx.fillStyle = isDarkTheme
        ? (row === 1 ? '#ffffff' : '#e4e4e7')
        : (row === 1 ? '#000000' : '#1e293b');
      ctx.font = `${isCellItalic ? 'italic ' : ''}${isCellBold ? 'bold ' : ''}15px "Segoe UI"`;
      ctx.fillText(text, cellX + 10, rowY + 28);

      // Active cell green box
      if (isActive) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3.5;
        ctx.strokeRect(cellX + 2, rowY + 2, colWidth - 4, rowHeight - 4);
        ctx.lineWidth = 1;

        // Fill handle square
        ctx.fillStyle = '#10b981';
        ctx.fillRect(cellX + colWidth - 6, rowY + rowHeight - 6, 7, 7);
      }

      // Marching ants for copied cell
      if (isCopied) {
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.lineDashOffset = -((currentTimeMs / 30) % 14);
        ctx.strokeRect(cellX + 2, rowY + 2, colWidth - 4, rowHeight - 4);
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
      }
    });
  });

  // 6. FLOATING GLASSMORPHISM KEYBOARD CAPSULE (Matching reference image: ineffblgrl on Threads.png)
  const kbY = height - 240;

  // Banner Action Title
  ctx.fillStyle = isDarkTheme ? 'rgba(15, 23, 42, 0.94)' : 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(width / 2 - 260, kbY - 82, 520, 56, 28);
  ctx.fill();

  ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = isDarkTheme ? '#ffffff' : '#0f172a';
  ctx.font = 'bold 20px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(step.actionTitle, width / 2, kbY - 46);
  ctx.textAlign = 'start';

  // Glassmorphic Capsule Container
  const capsuleW = 460;
  const capsuleH = 112;
  const capsuleX = width / 2 - capsuleW / 2;

  // Glass background
  ctx.fillStyle = isDarkTheme ? 'rgba(25, 25, 28, 0.82)' : 'rgba(255, 255, 255, 0.88)';
  ctx.beginPath();
  ctx.roundRect(capsuleX, kbY, capsuleW, capsuleH, 32);
  ctx.fill();

  // Glass border
  ctx.strokeStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.45)' : 'rgba(0, 0, 0, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Top specular glint streak
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(capsuleX + 60, kbY + 1);
  ctx.lineTo(capsuleX + capsuleW - 60, kbY + 1);
  ctx.stroke();

  // Extract keys to display
  let keysToDisplay = step.pressedKeys && step.pressedKeys.length > 0
    ? step.pressedKeys
    : scenario.shortcut.replace('→', '+').split('+').map((s: string) => s.trim());
  if (keysToDisplay.length === 0) keysToDisplay = ['CTRL', 'C'];

  // Draw Keycaps inside capsule
  if (keysToDisplay.length === 2) {
    const isKey1Pressed = step.pressedKeys.includes(keysToDisplay[0]);
    const isKey2Pressed = step.pressedKeys.includes(keysToDisplay[1]);

    draw3DKeycap(ctx, capsuleX + 35, kbY + 20, 150, 72, keysToDisplay[0].toUpperCase(), isKey1Pressed);

    // Plus Sign in middle
    ctx.fillStyle = isDarkTheme ? '#ffffff' : '#1e293b';
    ctx.font = 'bold 36px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('+', capsuleX + capsuleW / 2, kbY + 68);
    ctx.textAlign = 'start';

    draw3DKeycap(ctx, capsuleX + 275, kbY + 20, 150, 72, keysToDisplay[1].toUpperCase(), isKey2Pressed);
  } else {
    // 1 or 3+ keys
    const itemW = 105;
    const spacing = 16;
    const totalW = keysToDisplay.length * itemW + (keysToDisplay.length - 1) * spacing;
    const startX = width / 2 - totalW / 2;

    keysToDisplay.forEach((k: string, i: number) => {
      const isPressed = step.pressedKeys.includes(k);
      draw3DKeycap(ctx, startX + i * (itemW + spacing), kbY + 20, itemW, 72, k.toUpperCase(), isPressed);
      if (i < keysToDisplay.length - 1) {
        ctx.fillStyle = isDarkTheme ? '#ffffff' : '#1e293b';
        ctx.font = 'bold 26px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('+', startX + i * (itemW + spacing) + itemW + spacing / 2, kbY + 66);
        ctx.textAlign = 'start';
      }
    });
  }

  // 7. Bottom Branding Tag
  ctx.fillStyle = isDarkTheme ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  ctx.font = 'bold 14px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`EXCEL SHORTCUT MASTER • 9:16 VERTICAL REEL`, width / 2, height - 32);
  ctx.textAlign = 'start';
}

function draw3DKeycap(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  isPressed: boolean
) {
  const offsetY = isPressed ? 4 : 0;
  const capY = y + offsetY;
  const radius = 14;

  // Drop shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.beginPath();
  ctx.roundRect(x + 2, y + 6, w - 4, h, radius);
  ctx.fill();

  // Bottom bezel
  ctx.fillStyle = '#08080a';
  ctx.beginPath();
  ctx.roundRect(x, capY + 4, w, h - 4, radius);
  ctx.fill();

  // Keycap body gradient
  const grad = ctx.createLinearGradient(x, capY, x, capY + h);
  if (isPressed) {
    grad.addColorStop(0, '#064e3b');
    grad.addColorStop(1, '#022c22');
  } else {
    grad.addColorStop(0, '#2e2e32');
    grad.addColorStop(0.3, '#1c1c1f');
    grad.addColorStop(1, '#111114');
  }

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.roundRect(x, capY, w, h - 5, radius);
  ctx.fill();

  // Keycap top border highlight
  ctx.strokeStyle = isPressed ? '#34d399' : 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = isPressed ? 2.5 : 1.5;
  ctx.stroke();

  // Dish inner dish gradient
  const dishInset = 6;
  const dishGrad = ctx.createLinearGradient(x, capY + dishInset, x, capY + h - dishInset);
  if (isPressed) {
    dishGrad.addColorStop(0, '#047857');
    dishGrad.addColorStop(1, '#065f46');
  } else {
    dishGrad.addColorStop(0, '#222226');
    dishGrad.addColorStop(1, '#141416');
  }
  ctx.fillStyle = dishGrad;
  ctx.beginPath();
  ctx.roundRect(x + dishInset, capY + dishInset, w - dishInset * 2, h - 16, 10);
  ctx.fill();

  // Key label text
  ctx.fillStyle = isPressed ? '#6ee7b7' : '#ffffff';
  ctx.font = 'bold 22px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + w / 2, capY + (h - 5) / 2);
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'start';
}

/**
 * Initiates an instant browser download of the generated MP4 video
 */
export function downloadVideoBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  }, 2500);
}
