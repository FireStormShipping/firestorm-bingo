import { Sensitivity } from './enums.js';
import { Flag } from './flags.js';

class Entry {
  static deserialize(payload) {
    const entry = new Entry(
      payload['t'],
      payload['f'] || [],
      payload['w'] || 1,
      payload['s'] || 'S',
      true
    );

    entry.marked = payload['m'] || false;

    return entry;
  }

  constructor(text, flags = [], weight = 1, sensitivity = 'S', enabled = true) {
    if (!text) {
      throw new Error('No text specified');
    }

    this.text = text;

    flags = Array.isArray(flags) ? flags : [];

    this.flags = flags.map((flag) => {
      if (flag instanceof Flag) {
        return flag;
      }

      return Flag.get(flag);
    })

    this.weight = Math.max(1, Math.round(weight || 1));

    this.sensitivity = typeof(sensitivity) != 'symbol' ? Sensitivity.convert(sensitivity) : sensitivity;

    // can the entry ACTUALLY be allowed to be included? (hard disable)
    this.enabled = enabled;

    this.index = null;
    this.marked = false;
    this.used = false;
  }

  is_marked() {
    if(this.text.toLowerCase() === 'free') {
      return true;
    }

    return this.marked;
  }

  mark() {
    if(this.text.toLowerCase() === 'free') {
      return true;
    }

    this.marked = !this.marked;
    return this.marked;
  }

  serialize() {
    if (this.enabled === false) {
      throw new Error('Attempted to serialize a disabled entry.')
    }

    const payload = { 't': this.text };

    if (this.flags.length > 0) {
      payload['f'] = this.flags.map((flag) => flag.name);
    }

    if (this.weight !== 1) {
      payload['w'] = this.weight;
    }

    if (this.sensitivity !== Sensitivity.vals.SAFE) {
      payload['s'] = this.sensitivity.description;
    }

    if (this.is_marked()) {
      payload['m'] = this.is_marked();
    }

    return payload;
  }
}

export { Entry };
