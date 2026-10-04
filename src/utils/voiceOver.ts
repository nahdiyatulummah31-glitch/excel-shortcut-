/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Voiceover Engine: Provides a calm, smooth, and fluent Indonesian female narrator voice
// Combines high-fidelity AI Studio TTS (Aoede - calm female voice) with browser Web Speech Synthesis fallback.

const audioBufferCache = new Map<string, AudioBuffer>();
let currentSourceNode: AudioBufferSourceNode | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;

// Complete 100 Official Explanations matching user's exact brief
const OFFICIAL_100_VOICE_SCRIPTS: Record<number, string> = {
  1: 'Tekan kombinasi tombol Control dan Home untuk langsung melompat kembali ke sel A1 di awal lembar kerja kamu.',
  2: 'Tekan tombol Control dan End untuk berpindah cepat ke sel paling terakhir yang berisi data.',
  3: 'Gunakan tombol panah pada keyboard untuk memindahkan posisi sel aktif satu langkah ke arah panah.',
  4: 'Gunakan tombol Page Up atau Page Down untuk memindahkan tampilan layar lembar kerja ke atas atau ke bawah.',
  5: 'Tekan Control dan tombol panah untuk langsung melompat cepat ke ujung data pada baris atau kolom.',
  6: 'Tekan Control dan Backspace untuk langsung memusatkan kembali fokus layar ke sel yang sedang aktif.',
  7: 'Tekan tombol Control dan G atau F5 untuk membuka jendela dialog Go To dan melompat ke alamat sel tertentu.',
  8: 'Tekan Control dan titik untuk berpindah ke sudut seleksi berikutnya saat sedang memblok beberapa sel.',
  9: 'Tekan tombol Tab untuk pindah ke sel sebelah kanan, atau Shift Tab untuk pindah ke sel sebelah kiri.',
  10: 'Tekan tombol Enter untuk pindah ke sel di bawahnya, atau Shift Enter untuk pindah ke sel di atasnya.',

  11: 'Tekan tombol Shift dan panah untuk memblok deretan sel secara berurutan per arah yang kamu inginkan.',
  12: 'Tekan Control, Shift, dan panah untuk langsung memblok seluruh data tabel sampai ke ujungnya.',
  13: 'Tekan tombol Shift dan Spasi untuk langsung memilih satu baris penuh dari ujung ke ujung.',
  14: 'Tekan tombol Control dan Spasi untuk langsung memilih satu kolom penuh dari atas sampai bawah.',
  15: 'Tekan tombol Control dan A untuk memilih seluruh area data yang sedang aktif dalam tabel kamu.',
  16: 'Tekan tombol Control dan A dua kali untuk memilih seluruh lembar kerja tanpa terkecuali.',
  17: 'Tekan tombol Control, Shift, dan Spasi untuk langsung memilih seluruh isi sheet lembar kerja kamu.',
  18: 'Tekan Control, Shift, dan End untuk memilih dari sel aktif sampai ke sel data paling terakhir.',
  19: 'Tekan Control, Shift, dan Home untuk memilih dari sel aktif sampai kembali ke sel awal A1.',
  20: 'Tekan Control, Shift, dan bintang untuk memilih seluruh area data di sekitar sel yang aktif.',

  21: 'Tekan tombol Control dan C untuk menyalin isi sel yang dipilih dengan rapi dan instan.',
  22: 'Tekan tombol Control dan X untuk memotong isi sel dan bersiap memindahkannya ke tempat lain.',
  23: 'Tekan tombol Control dan V untuk menempelkan hasil salinan data ke dalam sel tujuan.',
  24: 'Tekan Control, Alt, dan V untuk membuka menu Paste Special dan memilih format tempel khusus.',
  25: 'Tekan tombol Delete pada keyboard untuk menghapus seluruh isi data pada sel yang dipilih.',
  26: 'Tekan tombol Alt dan Enter untuk membuat baris tulisan baru di dalam satu sel yang sama.',
  27: 'Tekan Control dan D untuk menyalin isi sel yang berada tepat di atasnya langsung ke bawah.',
  28: 'Tekan Control dan R untuk menyalin isi sel dari sebelah kiri langsung ke sebelah kanan.',
  29: 'Tekan Control, Shift, dan apostrof untuk menyalin nilai isi sel yang berada di atasnya.',
  30: 'Tekan Control dan apostrof untuk menyalin rumus atau formula dari sel di atasnya.',

  31: 'Tekan Control dan titik koma untuk memasukkan tanggal hari ini secara otomatis ke dalam sel.',
  32: 'Tekan Control, Shift, dan titik koma untuk memasukkan waktu jam dan menit saat ini secara akurat.',
  33: 'Tekan tombol Control dan E untuk menjalankan fitur cerdas Flash Fill yang mengisi pola data otomatis.',
  34: 'Tekan tombol Control dan K untuk menyisipkan tautan link atau hyperlink ke dalam sel pilihan kamu.',
  35: 'Tekan tombol Alt dan sama dengan untuk langsung menyisipkan rumus penjumlahan otomatis AutoSum.',
  36: 'Tekan tombol F2 untuk langsung mengedit isi sel yang sedang aktif tanpa perlu menggunakan mouse.',
  37: 'Tekan tombol Escape untuk membatalkan proses pengetikan atau input data di dalam sel.',
  38: 'Tekan tombol Enter untuk menyimpan hasil input data dan berpindah ke sel di bawahnya.',
  39: 'Tekan tombol Shift dan F2 untuk menambahkan atau mengedit catatan komentar pada sel yang dipilih.',
  40: 'Tekan Control dan Enter untuk mengisi data yang sama ke semua sel terpilih secara bersamaan.',

  41: 'Tekan Control dan 1 untuk membuka kotak dialog Format Cells guna mengatur tampilan sel lengkap.',
  42: 'Tekan Control dan B untuk membuat huruf atau angka pada sel terpilih menjadi tebal atau Bold.',
  43: 'Tekan Control dan I untuk membuat teks pada sel terpilih menjadi miring atau Italic.',
  44: 'Tekan Control dan U untuk memberikan garis bawah atau Underline pada teks sel.',
  45: 'Tekan Control dan 5 untuk memberikan efek coretan garis tengah atau Strikethrough pada teks.',
  46: 'Tekan Control, Shift, dan dollar untuk mengubah angka menjadi format mata uang rupiah secara rapi.',
  47: 'Tekan Control, Shift, dan persen untuk langsung mengubah angka desimal menjadi format persentase.',
  48: 'Tekan Control, Shift, dan tanda pagar untuk mengubah format angka menjadi format penanggalan.',
  49: 'Tekan Control, Shift, dan at untuk mengubah angka menjadi format waktu jam dan menit.',
  50: 'Tekan Control, Shift, dan tanda seru untuk memformat angka dengan pemisah ribuan dan desimal.',

  51: 'Tekan Control, Shift, dan tanda tambah untuk menyisipkan sel, baris, atau kolom baru di lembar kerja.',
  52: 'Tekan Control dan tanda minus untuk langsung menghapus sel, baris, atau kolom yang dipilih.',
  53: 'Tekan Control dan 0 untuk menyembunyikan kolom yang sedang aktif dengan sangat mudah.',
  54: 'Tekan Control, Shift, dan 0 untuk memunculkan kembali kolom yang sebelumnya disembunyikan.',
  55: 'Tekan Control dan 9 untuk menyembunyikan baris data yang sedang aktif seketika.',
  56: 'Tekan Control, Shift, dan 9 untuk menampilkan kembali baris data yang sebelumnya disembunyikan.',
  57: 'Tekan Shift, Alt, dan panah kanan untuk mengelompokkan atau membuat grup outline pada baris atau kolom.',
  58: 'Tekan Shift, Alt, dan panah kiri untuk melepas atau meng-ungroup baris atau kolom yang dikelompokkan.',
  59: 'Tekan kombinasi Alt, H, O, I untuk melakukan AutoFit dan menyesuaikan lebar kolom secara otomatis.',
  60: 'Tekan kombinasi Alt, H, O, A untuk menyesuaikan tinggi baris secara otomatis sesuai dengan isi teks.',

  61: 'Tekan tombol Shift dan F11 untuk langsung membuat lembar sheet baru di sebelah sheet aktif.',
  62: 'Tekan kombinasi Alt, O, H, R untuk langsung mengganti nama tab sheet yang sedang aktif.',
  63: 'Tekan Control dan Page Up untuk berpindah cepat ke tab sheet di sebelah kiri.',
  64: 'Tekan Control dan Page Down untuk berpindah cepat ke tab sheet di sebelah kanan.',
  65: 'Tekan kombinasi Alt, H, O, M untuk memindahkan atau menyalin posisi lembar sheet.',
  66: 'Tekan kombinasi Alt, E, L untuk menghapus tab sheet yang sedang aktif saat ini.',
  67: 'Tekan Control, Shift, dan Page Up untuk memilih sheet aktif bersamaan dengan sheet di sebelah kirinya.',
  68: 'Tekan Control, Shift, dan Page Down untuk memilih sheet aktif bersamaan dengan sheet di sebelah kanannya.',
  69: 'Tekan Control dan F3 untuk membuka jendela Define Name guna memberi nama range data.',
  70: 'Tekan Control, Shift, dan F3 untuk membuat nama range secara otomatis dari teks judul tabel.',

  71: 'Tekan Control dan F untuk membuka jendela Find guna mencari kata atau angka dalam lembar kerja.',
  72: 'Tekan Control dan H untuk membuka jendela Replace guna mencari dan mengganti teks sekaligus.',
  73: 'Tekan Control dan Z untuk membatalkan langkah tindakan terakhir atau Undo saat terjadi kesalahan.',
  74: 'Tekan Control dan Y untuk mengulangi kembali tindakan yang baru saja dibatalkan atau Redo.',
  75: 'Tekan tombol F4 untuk mengulangi aksi atau perintah terakhir yang baru saja kamu jalankan.',
  76: 'Tekan tombol Shift dan F4 untuk mengulangi pencarian kata kunci berikutnya ke arah bawah.',
  77: 'Tekan Control dan Tab untuk berpindah antar jendela file Excel yang sedang kamu buka.',
  78: 'Tekan Control dan Q untuk membuka menu Quick Analysis guna membuat analisis dan grafik instan.',
  79: 'Tekan tombol Alt dan F1 untuk langsung membuat grafik chart di dalam sheet yang sedang aktif.',
  80: 'Tekan tombol F11 untuk membuat grafik chart di halaman lembar sheet baru yang terpisah.',

  81: 'Tekan tombol sama dengan untuk memulai penulisan rumus atau formula perhitungan di Excel.',
  82: 'Tekan Shift dan F9 untuk menghitung dan memperbarui seluruh rumus pada sheet yang sedang aktif.',
  83: 'Tekan tombol F9 untuk menghitung ulang seluruh rumus di semua lembar kerja workbook kamu.',
  84: 'Tekan Control dan tanda petik miring untuk menampilkan seluruh rumus yang tersembunyi di dalam sel.',
  85: 'Tekan Alt, M, F atau Shift F3 untuk membuka menu Insert Function dan menyisipkan fungsi rumus.',
  86: 'Tekan tombol Control dan F3 untuk membuka Name Manager guna mengelola seluruh nama range.',
  87: 'Tekan tombol F3 untuk menempelkan daftar nama range yang sudah dibuat ke dalam penulisan rumus.',
  88: 'Tekan Control, Shift, dan U untuk memperluas atau mempersempit tampilan kotak Formula Bar.',
  89: 'Tekan Control, Shift, dan A untuk menyisipkan argumen rumus fungsi secara lengkap dan otomatis.',
  90: 'Tekan tombol F4 saat mengetik rumus untuk mengunci referensi sel dengan tanda dolar secara absolut.',

  91: 'Tekan Control dan N untuk langsung membuat lembar kerja file Excel baru yang masih kosong.',
  92: 'Tekan Control dan O untuk membuka dokumen file Excel yang tersimpan di perangkat kamu.',
  93: 'Tekan Control dan S untuk menyimpan perubahan pada dokumen lembar kerja Excel kamu.',
  94: 'Tekan tombol F12 untuk membuka dialog Save As dan menyimpan file dengan nama atau format baru.',
  95: 'Tekan Control dan P untuk membuka menu cetak atau Print preview lembar kerja kamu.',
  96: 'Tekan Control dan W untuk menutup lembar kerja file Excel yang sedang kamu gunakan.',
  97: 'Tekan Control dan F4 untuk menutup jendela dokumen aktif tanpa harus menutup aplikasi Excel.',
  98: 'Tekan tombol Alt dan F4 untuk keluar dan menutup seluruh aplikasi Microsoft Excel.',
  99: 'Tekan tombol F1 untuk membuka jendela pusat panduan dan bantuan Help Microsoft Excel.',
  100: 'Tekan tombol Alt untuk mengaktifkan petunjuk huruf pintas pada seluruh menu Ribbon Excel.',
};

/**
 * Returns a calm, fluent, natural Indonesian female narration script
 * tailored to match an 8-10 second video duration.
 */
export function getDefaultVoiceScript(shortcut: string, name: string, description?: string, shortcutNo?: number): string {
  if (shortcutNo && OFFICIAL_100_VOICE_SCRIPTS[shortcutNo]) {
    return OFFICIAL_100_VOICE_SCRIPTS[shortcutNo];
  }

  // Look for match by shortcut string
  const clean = shortcut.trim();
  for (const [no, script] of Object.entries(OFFICIAL_100_VOICE_SCRIPTS)) {
    if (clean.includes('Home') && Number(no) === 1) return script;
    if (clean.includes('End') && Number(no) === 2) return script;
    if (clean === 'Ctrl + C' && Number(no) === 21) return script;
    if (clean === 'Ctrl + V' && Number(no) === 23) return script;
    if (clean === 'Ctrl + B' && Number(no) === 42) return script;
    if (clean === 'Alt + =' && Number(no) === 35) return script;
    if (clean === 'Ctrl + E' && Number(no) === 33) return script;
    if (clean === 'Ctrl + ;' && Number(no) === 31) return script;
    if (clean.includes('$') && Number(no) === 46) return script;
  }

  if (description && description.length > 10) {
    return `Gunakan kombinasi ${clean} untuk ${name.toLowerCase()}. ${description}`;
  }
  return `Gunakan kombinasi ${clean} untuk ${name.toLowerCase()} pada lembar kerja Microsoft Excel kamu dengan cepat dan efisien.`;
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
