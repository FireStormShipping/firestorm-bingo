import { Entry } from './entry.js';
import { Flag } from './flags.js';
import { Pool } from './pool.js';
import { Sensitivity } from './enums.js';

class Card {
  constructor() {
    this.loaded_dataset = '';
    this.dataset_name = '';

    this.dataset = [];

    this.sensitivity_limit = null;
    this.banned_flags = [];
    this.pool = null;

    this.spaces = null;
  }

  dataset_url() {
    return `./datasets/${this.dataset_name}.json`;
  }

  set_dataset_name(dataset_name) {
    this.dataset_name = dataset_name.replace(/[^a-z0-9_\-]/ig, '');
  }

  set_sensitivity_limit(sensitivity_limit) {
    this.sensitivity_limit = Sensitivity.convert(sensitivity_limit);
  }

  set_banned_flags(banned_flags) {
    if(!banned_flags) {
      this.banned_flags = [];
      return;
    }

    this.banned_flags = banned_flags.map((flag) => {
      if (flag instanceof Flag) {
        return flag;
      }

      return Flag.get(flag);
    });
  }

  dataset_needs_loaded() {
    return this.dataset_name !== this.loaded_dataset;
  }

  async load_dataset() {
    const resp = await fetch(this.dataset_url(this.dataset_name));

    if (!resp.ok) {
      throw new Error('Failed to load dataset');
    }

    const dataset = await resp.json();

    this.loaded_dataset = this.dataset_name;
    this.dataset = dataset['entries'].map((entry) => {
      return new Entry(
        entry['text'],
        entry['flags'] || [],
        entry['weight'] || 1,
        entry['sensitivity'] || 'S',
        entry.hasOwnProperty('enabled') ? entry['enabled'] : true
      );
    });
  }

  build() {
    // todo: maybe just autoload the correct dataset?
    if (!this.dataset.length) {
      throw new Error('Dataset not loaded');
    }

    this.spaces = new Array(25);
    this.spaces.fill(undefined);
    Object.seal(this.spaces);

    this.pool = new Pool(this.sensitivity_limit, this.banned_flags, this.dataset);
    this.pool.generateNew();
    const start = this.pool.spaces.slice(0, 12);
    const freespace = new Entry('FREE', [], 1, 'S', true);
    const end = this.pool.spaces.slice(11);

    for(let i = 0; i < 25; i++) {
      if(i < 12) {
        this.spaces[i] = start[i];
      } else if(i === 12) {
        this.spaces[i] = freespace;
      } else if(i > 12) {
        this.spaces[i] = end[i - 12];
      }
      this.spaces[i].index = i;
    }
  }

  serialize() {
    if (!this.spaces) {
      throw new Exception('Cannot serialize a card that has not yet been built.')
    }

    const payload = JSON.stringify({
      'd': this.dataset_name,
      'sl': this.sensitivity_limit.description,
      'bf': this.banned_flags.map((flag) => flag.name),
      's': this.spaces.map((space) => space.serialize())
    });

    return btoa(payload);
  }

  async deserialize(payload) {
    payload = atob(payload);

    const saved_card = JSON.parse(payload);
    this.set_dataset_name(saved_card['d']);
    this.set_sensitivity_limit(saved_card['sl']);
    this.set_banned_flags(saved_card['bf']);

    this.spaces = new Array(25);
    this.spaces.fill(undefined);
    Object.seal(this.spaces);

    saved_card['s'].forEach((space, i) => {
      this.spaces[i] = Entry.deserialize(space);
      this.spaces[i].index = i;
    });

    // Rebuild the pool for reroll functionality
    await this.load_dataset();
    this.rebuildPool();
  }

  // Rebuild pool from given card state
  rebuildPool() {
    this.pool = new Pool(this.sensitivity_limit, this.banned_flags, this.dataset);
    this.pool.regenerateFromCardData(this.spaces);
  }

  // Reroll a single square at the given card index
  rerollSquare(cardIndex) {
    if (!this.pool) {
      throw new Error('Card not built yet');
    }

    if (cardIndex < 0 || cardIndex >= 25) {
      throw new Error('Invalid card index');
    }

    if (cardIndex === 12) {
      throw new Error('Cannot reroll FREE space');
    }

    // Map card index to pool index
    let poolIndex;
    if (cardIndex < 12) {
      poolIndex = cardIndex; // Card 0-11 -> Pool 0-11
    } else if (cardIndex > 12) {
      poolIndex = cardIndex - 1; // Card 13-24 -> Pool 12-23
    }

    try {
      const newEntry = this.pool.rerollPoolSpace(poolIndex);
      this.spaces[cardIndex] = newEntry;
      this.spaces[cardIndex].index = cardIndex;

      return newEntry;
    } catch (error) {
      throw new Error('No alternative entries available for reroll');
    }
  }
}

export { Card };
