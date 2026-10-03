/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Voiceover Engine: Provides a calm, smooth, and fluent Indonesian female narrator voice
// Combines high-fidelity AI Studio TTS (Aoede - calm female voice) with browser Web Speech Synthesis fallback.

const audioBufferCache = new Map<string, AudioBuffer>();
let currentSourceNode: AudioBufferSourceNode | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Returns a calm, fluent, natural Indonesian female narration script
 * tailored to match an 8-10 second video duration.
 */
export function getDefaultVoiceScript(shortcut: string, name: string, description?: string): string {
  const cleanShortcut = shortcut.trim();
  const lowerName = name.toLowerCase();

  if (cleanShortcut === 'Ctrl + C & Ctrl + V' || cleanShortcut.includes('Ctrl + C')) {
    return 'Tekan tombol Control dan C untuk menyalin cell terpilih dengan cepat, lalu tekan Control dan V untuk menempelkan data secara rapi dan instan.';
  }
  if (cleanShortcut === 'Ctrl + Home') {
    return 'Tekan Control dan Home untuk langsung melompat kembali ke cell A1 di sudut paling awal lembar kerja Excel kamu.';
  }
  if (cleanShortcut === 'Ctrl + End') {
    return 'Tekan Control dan End untuk berpindah cepat ke cell aktif paling terakhir dari seluruh data lembar kerja.';
  }
  if (cleanShortcut === 'Alt + =') {
    return 'Gunakan kombinasi Alt dan sama dengan untuk menjumlahkan deretan angka secara otomatis dengan rumus AutoSum.';
  }
  if (cleanShortcut === 'Ctrl + E') {
    return 'Gunakan kombinasi ajaib Control dan E untuk mengisi data secara otomatis dan cerdas dengan fitur Flash Fill.';
  }
  if (cleanShortcut === 'Ctrl + D') {
    return 'Tekan Control dan D untuk menyalin data atau rumus dari cell tepat di atasnya secara cepat.';
  }
  if (cleanShortcut === 'Ctrl + B') {
    return 'Tekan Control dan B untuk membuat tulisan atau angka pada cell terpilih menjadi tebal seketika.';
  }
  if (cleanShortcut === 'Ctrl + Shift + $') {
    return 'Tekan Control, Shift, dan dollar untuk langsung mengubah format angka menjadi format mata uang rupiah secara rapi.';
  }
  if (cleanShortcut === 'Alt + H + O + I') {
    return 'Tekan kombinasi Alt, H, O, I untuk menyesuaikan lebar kolom Excel secara otomatis agar semua teks terlihat pas.';
  }
  if (cleanShortcut === 'Ctrl + 9') {
    return 'Tekan Control dan 9 untuk menyembunyikan baris data yang sedang dipilih dengan cepat dan praktis.';
  }
  if (cleanShortcut === 'Ctrl + 0') {
    return 'Tekan Control dan 0 untuk menyembunyikan kolom yang sedang aktif tanpa perlu klik kanan mouse.';
  }
  if (cleanShortcut === 'Ctrl + ;') {
    return 'Tekan Control dan titik koma untuk memasukkan tanggal hari ini secara instan ke dalam cell lembar kerja kamu.';
  }
  if (cleanShortcut === 'Ctrl + Shift + ;') {
    return 'Tekan Control, Shift, dan titik koma untuk memasukkan jam saat ini secara real-time dan akurat.';
  }
  if (cleanShortcut === 'Ctrl + A') {
    return 'Tekan Control dan A untuk memilih seluruh area data tabel aktif dalam sekejap tanpa repot drag mouse.';
  }
  if (cleanShortcut === 'Ctrl + Z') {
    return 'Tekan Control dan Z untuk membatalkan langkah terakhir dengan mudah saat terjadi kesalahan input.';
  }
  if (cleanShortcut === 'F4') {
    return 'Tekan tombol F4 untuk mengunci referensi cell menjadi absolut dengan tanda dolar secara instan.';
  }
  if (cleanShortcut === 'Ctrl + Space') {
    return 'Tekan tombol Control dan Spasi untuk langsung menyeleksi seluruh kolom aktif dari atas sampai bawah.';
  }
  if (cleanShortcut === 'Shift + Space') {
    return 'Tekan tombol Shift dan Spasi untuk langsung memilih seluruh baris aktif dalam satu ketukan mudah.';
  }

  // Generic natural Indonesian female script
  if (description && description.length > 10) {
    return `Gunakan tombol ${cleanShortcut} untuk ${lowerName}. ${description}`;
  }
  return `Gunakan tombol ${cleanShortcut} untuk ${lowerName} pada lembar kerja Microsoft Excel kamu dengan cepat dan efisien.`;
}

/**
 * Fetch and decode high quality AI TTS voice audio into an AudioBuffer
 */
export async function fetchTtsAudioBuffer(
  text: string,
  audioCtx: AudioContext,
  voice: string = 'Aoede'
): Promise<AudioBuffer | null> {
  const cacheKey = `${voice}_${text.trim()}`;
  if (audioBufferCache.has(cacheKey)) {
    return audioBufferCache.get(cacheKey)!;
  }

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (!data.audioBase64) return null;

    // Convert base64 to ArrayBuffer
    const binary = atob(data.audioBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
    audioBufferCache.set(cacheKey, audioBuffer);
    return audioBuffer;
  } catch (err) {
    console.warn('AI TTS fetch skipped or failed, using Web Speech fallback:', err);
    return null;
  }
}

/**
 * Stop any ongoing voice narration (both Web Audio and Web Speech)
 */
export function stopVoiceOver(): void {
  if (currentSourceNode) {
    try {
      currentSourceNode.stop();
      currentSourceNode.disconnect();
    } catch {}
    currentSourceNode = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    currentUtterance = null;
  }
}

/**
 * Speaks text using Web Speech API with an Indonesian calm female voice
 */
export function speakWithWebSpeech(
  text: string,
  volume: number = 0.9,
  onEnd?: () => void
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  stopVoiceOver();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'id-ID';
  utterance.pitch = 1.12; // Slightly higher pitch for calm, pleasant, sweet female tone
  utterance.rate = 0.95;  // Calm, relaxed, fluent speed (not rushed)
  utterance.volume = Math.max(0, Math.min(1, volume));

  // Find best available female Indonesian voice
  const voices = window.speechSynthesis.getVoices();
  const indonesianVoices = voices.filter(
    (v) => v.lang.startsWith('id') || v.lang.includes('ID')
  );

  const preferredFemaleVoice = indonesianVoices.find(
    (v) =>
      v.name.toLowerCase().includes('gadis') ||
      v.name.toLowerCase().includes('ayu') ||
      v.name.toLowerCase().includes('sari') ||
      v.name.toLowerCase().includes('female') ||
      v.name.toLowerCase().includes('wanita') ||
      v.name.toLowerCase().includes('damayanti') ||
      v.name.toLowerCase().includes('natural')
  ) || indonesianVoices[0];

  if (preferredFemaleVoice) {
    utterance.voice = preferredFemaleVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    onEnd?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Play voice narration through Web Audio destination (supports live output and MediaStream destination)
 */
export async function playVoiceNarration(
  text: string,
  audioCtx: AudioContext,
  destinationNode?: AudioNode,
  volume: number = 0.9,
  onEnd?: () => void
): Promise<void> {
  stopVoiceOver();

  // 1. Try AI Studio studio-quality calm female voice
  try {
    const buffer = await fetchTtsAudioBuffer(text, audioCtx, 'Aoede');
    if (buffer) {
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const gainNode = audioCtx.createGain();
      gainNode.gain.value = Math.max(0, Math.min(1, volume));

      source.connect(gainNode);
      if (destinationNode) {
        gainNode.connect(destinationNode);
      } else {
        gainNode.connect(audioCtx.destination);
      }

      source.onended = () => {
        if (currentSourceNode === source) {
          currentSourceNode = null;
        }
        onEnd?.();
      };

      currentSourceNode = source;
      source.start(0);
      return;
    }
  } catch (e) {
    console.warn('AI TTS play failed, falling back to Web Speech:', e);
  }

  // 2. Fallback to Web Speech Synthesis
  speakWithWebSpeech(text, volume, onEnd);
}
