/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.75;
  private extraDestinations: Set<AudioNode> = new Set();

  public getRawAudioContext(): AudioContext | null {
    return this.getAudioContext();
  }

  public addDestination(dest: AudioNode) {
    this.extraDestinations.add(dest);
  }

  public removeDestination(dest: AudioNode) {
    this.extraDestinations.delete(dest);
  }

  private connectOutput(node: AudioNode, ctx: AudioContext) {
    node.connect(ctx.destination);
    for (const extra of this.extraDestinations) {
      try {
        node.connect(extra);
      } catch {}
    }
  }

  private getAudioContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Realistic mechanical keyboard click (Cherry MX Blue / Thock sound)
  public playKeyClick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High transient click
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(1400, now);
      osc1.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain1.gain.setValueAtTime(0.3 * this.volume, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc1.connect(gain1);
      this.connectOutput(gain1, ctx);
      osc1.start(now);
      osc1.stop(now + 0.05);

      // Low mechanical thock body
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(280, now);
      osc2.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      gain2.gain.setValueAtTime(0.4 * this.volume, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc2.connect(gain2);
      this.connectOutput(gain2, ctx);
      osc2.start(now);
      osc2.stop(now + 0.08);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Satisfying Excel Copy chord / shimmering chime
  public playCopySound() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5, E5, G5
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.03);

        gain.gain.setValueAtTime(0.18 * this.volume, now + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.03 + 0.22);

        osc.connect(gain);
        this.connectOutput(gain, ctx);
        osc.start(now + idx * 0.03);
        osc.stop(now + idx * 0.03 + 0.24);
      });
    } catch {
      // Ignore
    }
  }

  // Satisfying Paste Pop (cheerful bubble pop sound)
  public playPastePop() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.35 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      this.connectOutput(gain, ctx);
      osc.start(now);
      osc.stop(now + 0.15);

      // Add soft harmonic bell
      const bell = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bell.type = 'triangle';
      bell.frequency.setValueAtTime(1046.5, now + 0.04); // C6
      bellGain.gain.setValueAtTime(0.15 * this.volume, now + 0.04);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      bell.connect(bellGain);
      this.connectOutput(bellGain, ctx);
      bell.start(now + 0.04);
      bell.stop(now + 0.26);
    } catch {
      // Ignore
    }
  }

  // Cell cursor movement tick
  public playMoveTick() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);

      gain.gain.setValueAtTime(0.15 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      this.connectOutput(gain, ctx);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {
      // Ignore
    }
  }

  // Smooth whoosh / transition sweep
  public playWhoosh() {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.12);

      gain.gain.setValueAtTime(0.2 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      osc.connect(gain);
      this.connectOutput(gain, ctx);
      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }
}

export const soundFx = new SoundSynthesizer();
