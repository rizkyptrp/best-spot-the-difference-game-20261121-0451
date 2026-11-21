// main.js — the game controller for "Odd Twin — Spot the Difference".
//
// Owns the state machine (title -> playing -> level clear -> victory, with a
// time-up branch), the countdown timer, the score and streak, the HUD, the
// keyboard and mouse input, and the deterministic screenshot states the
// maker drives with ?shot=start|play|end.
import { LEVELS, PANEL_W, PANEL_H } from './scenes.js';
import { DifferenceTracker } from './differences.js';
import { PanelRenderer } from './render.js';
import { SoundBank } from './audio.js';

const WRONG_CLICK_TIME_PENALTY = 3; // seconds lost on a wrong click
const HINTS_PER_LEVEL = 3;
const HINT_POINT_COST = 25;
const FIND_POINTS = 100;
const TIME_BONUS_PER_SECOND = 5;

const $ = (id) => document.getElementById(id);

class OddTwinGame {
  constructor() {
    this.sound = new SoundBank();
    this.renderer = new PanelRenderer($('panels'));
    this.levelIndex = 0;
    this.tracker = null;
    this.state = 'title'; // title | playing | level-clear | victory | time-up
    this.score = 0;
    this.timeLeft = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.streak = 0;
    this.lastFindAt = 0;
    this.lastTickSecond = -1;
    this.frozen = false; // screenshot modes freeze the timer and animations
    this.lastFrameAt = performance.now();
    this.shot = new URLSearchParams(location.search).get('shot');

    this.bindControls();
    this.applyShotMode();
    requestAnimationFrame((now) => this.frame(now));
  }

  get level() {
    return LEVELS[this.levelIndex];
  }

  // ---- level lifecycle ----------------------------------------------------

  startLevel(index) {
    this.levelIndex = index;
    this.tracker = new DifferenceTracker(this.level.differences);
    this.timeLeft = this.level.timeLimit;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.streak = 0;
    this.lastTickSecond = -1;
    this.state = 'playing';
    this.hideOverlays();
    this.updateHud();
  }

  restartLevel() {
    this.sound.click();
    this.startLevel(this.levelIndex);
  }

  nextLevel() {
    this.sound.click();
    if (this.levelIndex + 1 < LEVELS.length) {
      this.startLevel(this.levelIndex + 1);
    } else {
      this.showVictory();
    }
  }

  showTitle() {
    this.state = 'title';
    this.tracker = new DifferenceTracker(LEVELS[0].differences);
    this.timeLeft = LEVELS[0].timeLimit;
    this.hideOverlays();
    $('title-overlay').classList.remove('hidden');
    this.updateHud();
  }

  showVictory() {
    this.state = 'victory';
    $('victory-score').textContent = this.score;
    $('victory-overlay').classList.remove('hidden');
    this.sound.victoryMelody();
  }

  showLevelClear() {
    this.state = 'level-clear';
    const timeBonus = Math.ceil(this.timeLeft) * TIME_BONUS_PER_SECOND;
    this.score += timeBonus;
    $('clear-level-name').textContent = this.level.name;
    $('clear-found').textContent = `${this.tracker.foundCount} / ${this.tracker.total}`;
    $('clear-time-bonus').textContent = `+${timeBonus}`;
    $('clear-score').textContent = this.score;
    $('next-level-button').textContent =
      this.levelIndex + 1 < LEVELS.length ? 'Next level' : 'See the final result';
    $('level-clear-overlay').classList.remove('hidden');
    this.sound.levelFanfare();
    this.updateHud();
  }

  showTimeUp() {
    this.state = 'time-up';
    $('timeup-level-name').textContent = this.level.name;
    $('timeup-found').textContent = `${this.tracker.foundCount} / ${this.tracker.total}`;
    $('time-up-overlay').classList.remove('hidden');
    this.sound.timeUpSigh();
  }

  hideOverlays() {
    for (const id of ['title-overlay', 'level-clear-overlay', 'victory-overlay', 'time-up-overlay']) {
      $(id).classList.add('hidden');
    }
  }

  // ---- input ---------------------------------------------------------------

  bindControls() {
    const canvas = $('panels');
    canvas.addEventListener('click', (event) => this.onCanvasClick(event));
    $('hint-button').addEventListener('click', () => this.useHint());
    $('restart-button').addEventListener('click', () => this.restartLevel());
    $('mute-button').addEventListener('click', () => this.toggleMute());
    $('start-button').addEventListener('click', () => {
      this.sound.resume();
      this.startLevel(0);
    });
    $('next-level-button').addEventListener('click', () => this.nextLevel());
    $('retry-button').addEventListener('click', () => this.restartLevel());
    $('play-again-button').addEventListener('click', () => {
      this.score = 0;
      this.startLevel(0);
    });
    $('title-button').addEventListener('click', () => this.showTitle());
    document.querySelectorAll('[data-level]').forEach((button) => {
      button.addEventListener('click', () => {
        this.sound.click();
        this.startLevel(Number(button.dataset.level));
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'h' || event.key === 'H') this.useHint();
      else if (event.key === 'r' || event.key === 'R') this.restartLevel();
      else if (event.key === 'm' || event.key === 'M') this.toggleMute();
      else if (event.key === '1' || event.key === '2' || event.key === '3') {
        this.sound.click();
        this.startLevel(Number(event.key) - 1);
      } else if (event.key === 'Enter' && this.state === 'title') {
        this.sound.resume();
        this.startLevel(0);
      }
    });
  }

  onCanvasClick(event) {
    if (this.state !== 'playing') return;
    this.sound.resume();
    const rect = this.renderer.canvas.getBoundingClientRect();
    const scaleX = this.renderer.canvas.width / rect.width;
    const scaleY = this.renderer.canvas.height / rect.height;
    const canvasX = (event.clientX - rect.left) * scaleX;
    const canvasY = (event.clientY - rect.top) * scaleY;
    const pick = this.renderer.pickPanel(canvasX, canvasY);
    if (!pick) return;
    const now = performance.now();
    const hit = this.tracker.hitTest(pick.x, pick.y);
    if (hit) {
      this.tracker.markFound(hit);
      this.renderer.onFound(hit, now);
      this.sound.foundChime();
      // A quick find after the previous one builds a streak bonus.
      const bonus = now - this.lastFindAt < 5000 && this.streak > 0 ? 10 * this.streak : 0;
      this.streak += 1;
      this.lastFindAt = now;
      this.score += FIND_POINTS + bonus;
      if (bonus > 0) this.renderer.onStreakBonus(hit, bonus, now);
      if (this.tracker.isComplete) {
        this.showLevelClear();
      }
    } else {
      this.renderer.onWrongClick(pick.panel, pick.x, pick.y, now);
      this.sound.wrongBuzz();
      this.streak = 0;
      this.timeLeft = Math.max(0, this.timeLeft - WRONG_CLICK_TIME_PENALTY);
      $('timer').classList.add('penalty-flash');
      setTimeout(() => $('timer').classList.remove('penalty-flash'), 300);
    }
    this.updateHud();
  }

  useHint() {
    if (this.state !== 'playing') return;
    if (this.hintsLeft <= 0) return;
    this.sound.resume();
    const hinted = this.tracker.nextHint(performance.now());
    if (!hinted) return;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - HINT_POINT_COST);
    this.sound.hintSparkle();
    this.updateHud();
  }

  toggleMute() {
    this.sound.resume();
    this.sound.setMuted(!this.sound.muted);
    $('mute-button').textContent = this.sound.muted ? 'Sound: off (M)' : 'Sound: on (M)';
  }

  // ---- HUD -----------------------------------------------------------------

  updateHud() {
    const level = this.level;
    $('level-name').textContent = `Level ${this.levelIndex + 1} of ${LEVELS.length} — ${level.name}`;
    $('level-subtitle').textContent = level.subtitle;
    $('found-count').textContent = `${this.tracker.foundCount} / ${this.tracker.total} found`;
    $('remaining-count').textContent = `${this.tracker.remainingCount} remaining`;
    const dots = this.tracker.differences
      .map((d) => `<span class="dot ${this.tracker.isFound(d) ? 'found' : ''}" title="${d.label}"></span>`)
      .join('');
    $('found-dots').innerHTML = dots;
    $('score').textContent = this.score;
    $('hints-left').textContent = this.hintsLeft;
    $('hint-button').disabled = this.hintsLeft <= 0 || this.state !== 'playing';
    const seconds = Math.max(0, Math.ceil(this.timeLeft));
    $('timer').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    $('timer').classList.toggle('low', seconds <= 10 && this.state === 'playing');
    const fraction = Math.max(0, this.timeLeft / level.timeLimit);
    $('timer-bar').style.width = `${fraction * 100}%`;
    $('timer-bar').classList.toggle('low', seconds <= 10);
    document.querySelectorAll('[data-level]').forEach((button) => {
      button.classList.toggle('active', Number(button.dataset.level) === this.levelIndex);
    });
  }

  // ---- deterministic screenshot states -------------------------------------

  applyShotMode() {
    if (this.shot === 'start') {
      this.frozen = true;
      this.showTitle();
      return;
    }
    if (this.shot === 'play') {
      this.frozen = true;
      this.startLevel(0);
      // Mid-hunt: three differences already found, four still to find, so
      // the cover shows markers on found spots and a readable counter.
      const now = performance.now();
      for (const id of ['sun-glasses', 'clock-hands', 'teapot-knob']) {
        const difference = this.level.differences.find((d) => d.id === id);
        this.tracker.markFound(difference);
        this.renderer.onFound(difference, now - 1000);
      }
      this.timeLeft = 87;
      this.score = 310;
      this.updateHud();
      return;
    }
    if (this.shot === 'end') {
      this.frozen = true;
      this.startLevel(LEVELS.length - 1);
      const now = performance.now();
      for (const difference of this.level.differences) {
        this.tracker.markFound(difference);
        this.renderer.onFound(difference, now - 1000);
      }
      this.timeLeft = 132;
      this.score = 1420;
      this.updateHud();
      this.showVictory();
      return;
    }
    // No shot parameter: the normal title screen.
    this.showTitle();
  }

  // ---- main loop -------------------------------------------------------------

  frame(now) {
    const dt = Math.min(0.1, (now - this.lastFrameAt) / 1000);
    this.lastFrameAt = now;
    if (this.state === 'playing' && !this.frozen) {
      this.timeLeft -= dt;
      const seconds = Math.ceil(this.timeLeft);
      if (seconds <= 10 && seconds !== this.lastTickSecond && seconds > 0) {
        this.lastTickSecond = seconds;
        this.sound.timerTick();
      }
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.updateHud();
        this.showTimeUp();
      } else {
        this.updateHud();
      }
    }
    if (this.tracker) {
      this.renderer.draw(this.level, this.tracker, now, this.frozen);
    }
    requestAnimationFrame((next) => this.frame(next));
  }
}

new OddTwinGame();

// A small handle for automated play-testing in the browser console.
window.__oddTwin = { LEVELS, PANEL_W, PANEL_H };
