// DifferenceTracker — owns the hunt state for one level: which differences
// have been found, what a click hits, and which difference a hint reveals.
// Coordinates are in panel space (0..PANEL_W, 0..PANEL_H) and are shared by
// both panels, so a difference can be clicked on either picture.
export class DifferenceTracker {
  constructor(differences) {
    this.differences = differences;
    this.foundIds = new Set();
    this.hintId = null;
    this.hintExpiresAt = 0;
  }

  get total() {
    return this.differences.length;
  }

  get foundCount() {
    return this.foundIds.size;
  }

  get remainingCount() {
    return this.differences.length - this.foundIds.size;
  }

  get isComplete() {
    return this.foundIds.size === this.differences.length;
  }

  isFound(difference) {
    return this.foundIds.has(difference.id);
  }

  // Returns the unfound difference whose circle contains (x, y), or null.
  // The hit circle is a little generous (the stored radius plus a few pixels)
  // so a click on the edge of a small detail still counts.
  hitTest(x, y) {
    for (const difference of this.differences) {
      if (this.foundIds.has(difference.id)) continue;
      const dx = x - difference.x;
      const dy = y - difference.y;
      const reach = difference.r + 6;
      if (dx * dx + dy * dy <= reach * reach) return difference;
    }
    return null;
  }

  markFound(difference) {
    this.foundIds.add(difference.id);
    if (this.hintId === difference.id) this.hintId = null;
  }

  // Picks an unfound difference to highlight. Prefers one that has never
  // been hinted, so repeated hints keep pointing somewhere new.
  nextHint(now) {
    const unfound = this.differences.filter((d) => !this.foundIds.has(d.id));
    if (unfound.length === 0) return null;
    const unhinted = unfound.filter((d) => d.id !== this.hintId);
    const pick = unhinted.length > 0 ? unhinted[0] : unfound[0];
    this.hintId = pick.id;
    this.hintExpiresAt = now + 2200;
    return pick;
  }

  hintIsActive(now) {
    return this.hintId !== null && now < this.hintExpiresAt;
  }

  hintedDifference() {
    if (!this.hintId) return null;
    return this.differences.find((d) => d.id === this.hintId) ?? null;
  }

  clearHint() {
    this.hintId = null;
  }

  reset() {
    this.foundIds.clear();
    this.clearHint();
  }
}
