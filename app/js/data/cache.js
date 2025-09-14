class Cache {
  static keys = {
    THEME: 'bingo-theme',
    CURRENT_CARD: 'bingo-current-card'
  };

  static get(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      console.error('Cache read failed:', err);
      return null;
    }
  }

  static set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      console.error('Cache write failed:', err);
    }
  }

  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      console.error('Cache remove failed:', err);
    }
  }

  static getTheme() {
    return this.get(this.keys.THEME);
  }

  static setTheme(theme) {
    this.set(this.keys.THEME, theme);
  }

  static getCurrentCard() {
    return this.get(this.keys.CURRENT_CARD);
  }

  static setCurrentCard(cardToken) {
    this.set(this.keys.CURRENT_CARD, cardToken);
  }

  static clearCurrentCard() {
    this.remove(this.keys.CURRENT_CARD);
  }
}

export { Cache };