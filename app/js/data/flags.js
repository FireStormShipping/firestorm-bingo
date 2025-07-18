class Flag {
  static _flags = {};

  static get(name) {
    if (!Object.hasOwn(Flag._flags, name)) {
      Flag._flags[name] = new Flag(name);
    }

    return Flag._flags[name];
  }

  constructor(name) {
    this.name = name || '';
  }
}

export { Flag };
