// SoundBank — every sound in the game is synthesized live with WebAudio.
// No audio files are loaded, so the game stays fully offline and self-contained.
export class SoundBank {
  constructor() {
    this.audioContext = null;
    this.masterGain = null;
    this.muted = false;
  }

  // Browsers only allow audio after a user gesture, so the context is created
  // lazily on the first sound that follows a click or key press.
  ensureContext() {
    if (this.audioContext) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    this.audioContext = new AudioContextClass();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.gain.value = 0.5;
    this.masterGain.connect(this.audioContext.destination);
  }

  resume() {
    this.ensureContext();
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.masterGain) this.masterGain.gain.value = muted ? 0 : 0.5;
  }

  // One short oscillator note with a quick fade, the building block of every cue.
  playTone(frequency, startAt, duration, type, volume) {
    if (this.muted || !this.audioContext) return;
    const oscillator = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    const now = this.audioContext.currentTime + startAt;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(this.masterGain);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  // A soft UI tick for buttons and level-select presses.
  click() {
    this.resume();
    this.playTone(660, 0, 0.07, 'sine', 0.25);
  }

  // The satisfying two-note chime when a difference is found.
  foundChime() {
    this.resume();
    this.playTone(523.25, 0, 0.18, 'sine', 0.4);
    this.playTone(659.25, 0.08, 0.18, 'sine', 0.4);
    this.playTone(783.99, 0.16, 0.3, 'sine', 0.45);
  }

  // A gentle low buzz for a wrong click — feedback, not punishment.
  wrongBuzz() {
    this.resume();
    this.playTone(160, 0, 0.16, 'square', 0.12);
    this.playTone(120, 0.1, 0.2, 'square', 0.1);
  }

  // A sparkle arpeggio when the hint button reveals a difference.
  hintSparkle() {
    this.resume();
    this.playTone(880, 0, 0.12, 'sine', 0.3);
    this.playTone(1108.7, 0.07, 0.12, 'sine', 0.3);
    this.playTone(1318.5, 0.14, 0.22, 'sine', 0.32);
  }

  // A rising fanfare for clearing a level.
  levelFanfare() {
    this.resume();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((note, index) => {
      this.playTone(note, index * 0.12, 0.28, 'triangle', 0.4);
    });
    this.playTone(1318.5, 0.52, 0.5, 'triangle', 0.4);
  }

  // A longer victory melody for finishing all three levels.
  victoryMelody() {
    this.resume();
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5, 1567.98];
    notes.forEach((note, index) => {
      this.playTone(note, index * 0.14, 0.3, 'triangle', 0.38);
    });
  }

  // A single clock tick when the timer drops under ten seconds.
  timerTick() {
    this.resume();
    this.playTone(980, 0, 0.05, 'sine', 0.22);
  }

  // A sad two-note fall for running out of time.
  timeUpSigh() {
    this.resume();
    this.playTone(392, 0, 0.3, 'sine', 0.3);
    this.playTone(311.13, 0.25, 0.55, 'sine', 0.3);
  }
}
