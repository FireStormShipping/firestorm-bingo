import { Sensitivity } from './enums.js';

class PoolReservation {
  static getReservations(entry) {
    const reservations = [];

    if (entry.enabled === false) {
      return [];
    }

    for (let i = 0; i < entry.weight; i++) {
      reservations.push(new PoolReservation(entry));
    }

    return reservations;
  }

  constructor (entry) {
    this.entry = entry;
  }
}

class Pool {
  constructor(sensitivity_limit, banned_flags, entries) {
    this.spaces = new Array(24);
    this.spaces.fill(undefined);
    Object.seal(this.spaces);

    // sensitivity filtering
    sensitivity_limit = typeof(sensitivity_limit) != 'symbol' ? Sensitivity.convert(sensitivity_limit) : sensitivity_limit;
    entries = entries.filter((entry) => Sensitivity.limit(entry.sensitivity, sensitivity_limit));

    // banned flags filtering
    if (banned_flags !== false) {
      if (!Array.isArray(banned_flags)) {
        throw new Error('Banned flags should be an array or false');
      }

      entries = entries.filter((entry) => {
        return !entry.flags.some((flag) => banned_flags.includes(flag));
      })
    }

    // contents contains the entries with the weights applied.
    // eg. (A, weight 3), (B, weight 1) => contents = [A, A, A, B]
    this.contents = entries.map((entry) => PoolReservation.getReservations(entry)).flat();
  }

  genSeed() {
    const seeds = new Uint32Array(24);
    self.crypto.getRandomValues(seeds);
    return seeds.map((seed) => seed % this.contents.length);
  }

  getNextValidReservation(offset) {
    for (let i = 0; i < this.contents.length; i++) {
      if (this.contents[(offset + i) % (this.contents.length - 1)].entry.used === false) {
        return i;
      }
    }

    throw new Error('All reservations exhausted');
  }

  // Generate new random card prompts for each slot given filtered contents.
  generateNew() {
    this.seed = this.genSeed();

    for(let slot = 0, i = 0; slot < 24; slot++) {
      const initial_offset = (this.seed[slot] + i) % this.contents.length;
      const offset = (initial_offset + this.getNextValidReservation(initial_offset)) % (this.contents.length - 1);
      this.spaces[slot] = this.contents[offset].entry;
      this.spaces[slot].used = true;
    }
  }

  // Re-generate pool spaces from loaded card data
  regenerateFromCardData(cardSpaces) {
    // Reset all entries to unused
    this.contents.forEach(reservation => {
      reservation.entry.used = false;
    });

    // For each card space (excluding FREE), find matching entry in contents and mark as used
    for (let cardIndex = 0, poolIndex = 0; cardIndex < 25; cardIndex++) {
      if (cardIndex === 12) continue; // Skip FREE space

      const cardEntry = cardSpaces[cardIndex];

      // Find matching entry in contents by text
      const matchingReservation = this.contents.find(reservation =>
        reservation.entry.text === cardEntry.text
      );

      if (matchingReservation) {
        this.spaces[poolIndex] = matchingReservation.entry;
        matchingReservation.entry.used = true;
      } else {
        console.warn(`Could not find matching entry for: ${cardEntry.text} - entry may have been removed from dataset`);
        // Continue without this entry, it will be undefined in this.spaces[poolIndex]
      }
      poolIndex++;
    }
  }

  // Reroll a specific pool space given a slot number and update the pool's spaces array
  rerollPoolSpace(slot) {
    if (slot < 0 || slot >= 24) {
      throw new Error('Invalid pool index');
    }

    const currentEntry = this.spaces[slot];

    // Generate a random starting position
    const randomSeed = new Uint32Array(1);
    self.crypto.getRandomValues(randomSeed);
    const initial_offset = randomSeed[0] % this.contents.length;

    const offset = (initial_offset + this.getNextValidReservation(initial_offset)) % (this.contents.length - 1);
    const newEntry = this.contents[offset].entry;

    // Update pool's spaces array
    this.spaces[slot] = newEntry;
    this.spaces[slot].used = true;

    // Handle case where current entry might be undefined (from missing dataset entries)
    if (currentEntry) {
      // Set previous entry to unused only after generating a new entry.
      // This is to prevent regenerating the same entry.
      currentEntry.used = false;
    } else {
      console.warn('Encountered undefined entry; entry may have been removed from dataset');
    }
    return newEntry;
  }
}

export { Pool };
