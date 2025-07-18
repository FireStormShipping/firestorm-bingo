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

    this.contents = entries.map((entry) => PoolReservation.getReservations(entry)).flat();
    this.seed = this.genSeed();

    this.generate();
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

  generate() {
    let i = 0;
    for(let slot = 0; slot < 24; slot++) {
      const initial_offset = (this.seed[slot] + i) % this.contents.length;
      const offset = (initial_offset + this.getNextValidReservation(initial_offset)) % (this.contents.length - 1);
      this.spaces[slot] = this.contents[offset].entry;
      this.spaces[slot].used = true;
    }
  }
}

export { Pool };
