/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShortcutStep } from '../types/shortcuts';

interface KeyboardOverlayProps {
  currentStep: ShortcutStep;
  shortcutTitle: string;
  isDarkTheme?: boolean;
}

interface RealisticKeycapProps {
  label: string;
  isPressed: boolean;
  widthClass?: string;
  subLabel?: string;
}

/**
 * High-fidelity 3D Mechanical Keycap styled exactly like the reference image:
 * Deep matte charcoal/black OEM keycap with beveled edges, recessed top dish,
 * tactile downward travel, and specular lighting.
 */
const RealisticKeycap: React.FC<RealisticKeycapProps> = ({
  label,
  isPressed,
  widthClass = 'min-w-[76px] px-3.5',
  subLabel,
}) => {
  return (
    <div
      className={`relative h-[56px] sm:h-[62px] ${widthClass} rounded-[10px] select-none transition-all duration-150 flex items-center justify-center ${
        isPressed
          ? 'translate-y-[4px] shadow-[0_2px_0_0_#0a0a0a,0_4px_12px_rgba(0,0,0,0.6)]'
          : 'translate-y-0 shadow-[0_6px_0_0_#0a0a0a,0_10px_20px_rgba(0,0,0,0.7)]'
      }`}
      style={{
        background: 'linear-gradient(180deg, #2b2b2b 0%, #1c1c1c 40%, #141414 100%)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        borderTop: '1px solid rgba(255, 255, 255, 0.28)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.8)',
      }}
    >
      {/* Recessed Top Keycap Surface Dish */}
      <div
        className={`w-[90%] h-[82%] rounded-[7px] flex flex-col items-center justify-center transition-all duration-150 ${
          isPressed
            ? 'bg-gradient-to-b from-[#181818] via-[#151515] to-[#101010] scale-[0.98]'
            : 'bg-gradient-to-b from-[#262626] via-[#1f1f1f] to-[#171717]'
        }`}
        style={{
          boxShadow: isPressed
            ? 'inset 0 2px 4px rgba(0,0,0,0.9), inset 0 0 12px rgba(16, 185, 129, 0.35)'
            : 'inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -2px 4px rgba(0,0,0,0.7)',
          border: isPressed
            ? '1px solid rgba(16, 185, 129, 0.6)'
            : '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Subtle sublabel if any */}
        {subLabel && (
          <span className="text-[9px] font-mono text-neutral-400 font-semibold leading-none mb-0.5">
            {subLabel}
          </span>
        )}

        {/* Main Keycap Character */}
        <span
          className={`font-sans font-extrabold tracking-wider transition-colors duration-150 ${
            label.length > 2 ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
          } ${
            isPressed
              ? 'text-emerald-300 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]'
              : 'text-[#e6e6e6] drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]'
          }`}
          style={{
            fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif",
          }}
        >
          {label}
        </span>
      </div>

      {/* Glow dot indicator on active key */}
      {isPressed && (
        <motion.div
          layoutId="activeKeyGlow"
          className="absolute -bottom-1 w-2.5 h-1 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]"
        />
      )}
    </div>
  );
};

export const KeyboardOverlay: React.FC<KeyboardOverlayProps> = ({
  currentStep,
  shortcutTitle,
  isDarkTheme = true,
}) => {
  const pressedKeys = currentStep.pressedKeys || [];
  const hasActivePress = pressedKeys.length > 0;

  // Derive the keys to display:
  // If no keys pressed in current step (e.g. navigation/idle), show the target shortcut keys
  // or show the pressed keys.
  const displayKeys: string[] = React.useMemo(() => {
    if (pressedKeys.length > 0) {
      return pressedKeys;
    }
    // Parse shortcutTitle like "Ctrl + C" or "Alt + =" or "Ctrl + Shift + $"
    const parts = shortcutTitle
      .replace('→', '+')
      .split('+')
      .map((k) => k.trim())
      .filter(Boolean);
    return parts.length > 0 ? parts : ['Ctrl', 'C'];
  }, [pressedKeys, shortcutTitle]);

  return (
    <div className="pointer-events-none w-full flex flex-col items-center z-40 px-3 py-2">
      {/* 1. TIKTOK/REELS SHORTCUT HUD BANNER */}
      <motion.div
        key={currentStep.actionTitle}
        initial={{ opacity: 0, y: -6, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.18 }}
        className="mb-2 rounded-full px-4 py-1.5 backdrop-blur-md shadow-2xl flex items-center gap-2 border"
        style={{
          backgroundColor: isDarkTheme ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.92)',
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
        }}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            hasActivePress ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'
          }`}
        />
        <span
          className={`text-xs sm:text-[13px] font-bold tracking-wide ${
            isDarkTheme ? 'text-white' : 'text-neutral-900'
          }`}
        >
          {currentStep.actionTitle}
        </span>
        {currentStep.actionDetail && (
          <span
            className={`text-[10px] hidden sm:inline ${
              isDarkTheme ? 'text-neutral-400' : 'text-neutral-500'
            }`}
          >
            · {currentStep.actionDetail}
          </span>
        )}
      </motion.div>

      {/* 2. TRANSLUCENT GLASS CAPSULE WITH SPECULAR GLINT (Matching image: ineffblgrl on Threads.png) */}
      <motion.div
        layout
        className="relative rounded-[24px] sm:rounded-[28px] p-2.5 sm:p-3 flex items-center justify-center gap-2 sm:gap-3 select-none"
        style={{
          // Authentic Glassmorphism
          background: isDarkTheme
            ? 'linear-gradient(180deg, rgba(35, 35, 35, 0.65) 0%, rgba(18, 18, 18, 0.75) 100%)'
            : 'linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 240, 240, 0.85) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1.5px solid rgba(255, 255, 255, 0.35)',
          boxShadow: isDarkTheme
            ? '0 20px 45px rgba(0, 0, 0, 0.8), inset 0 1px 2px rgba(255, 255, 255, 0.5), inset 0 -1px 2px rgba(0, 0, 0, 0.5)'
            : '0 16px 36px rgba(0, 0, 0, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.9), inset 0 -1px 2px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Specular White Rim Highlight across top border (as seen in screenshot) */}
        <div
          className="absolute top-0 inset-x-6 h-[1.5px] rounded-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.85) 50%, transparent 100%)',
          }}
        />

        {/* Dynamic Keycaps with '+' separators */}
        {displayKeys.map((keyName, idx) => {
          const isPressed = pressedKeys.includes(keyName) || (hasActivePress && pressedKeys.length > 0 && pressedKeys[pressedKeys.length - 1] === keyName);
          const widthClass =
            keyName.length > 3
              ? 'min-w-[82px] sm:min-w-[94px] px-3'
              : keyName.length > 1
              ? 'min-w-[68px] sm:min-w-[76px] px-2.5'
              : 'min-w-[54px] sm:min-w-[62px] px-2';

          return (
            <React.Fragment key={`${keyName}-${idx}`}>
              {idx > 0 && (
                <span
                  className="font-sans font-bold text-lg sm:text-2xl select-none px-0.5"
                  style={{
                    color: isDarkTheme ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.85)',
                    textShadow: isDarkTheme ? '0 2px 4px rgba(0,0,0,0.8)' : 'none',
                  }}
                >
                  +
                </span>
              )}
              <RealisticKeycap
                label={keyName.toUpperCase()}
                isPressed={isPressed}
                widthClass={widthClass}
              />
            </React.Fragment>
          );
        })}
      </motion.div>
    </div>
  );
};
