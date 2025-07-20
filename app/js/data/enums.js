class Sensitivity {
  static vals = {
    SAFE: Symbol('S'),
    QUESTIONABLE: Symbol('Q'),
    EXPLICIT: Symbol('E'),
    // EXTREME: Symbol('X'),
  }

  static convert(str) {
    if(typeof str === 'string') {
      str = str.toUpperCase();
    } else if (typeof str === 'symbol') {
      return str;
    }

    const [_, result] = Object.entries(Sensitivity.vals).find(([k, v]) => {
      if (k === str) return true;
      return v.description === str;
    });

    if (!result) {
      throw new Error('Invalid sensitivity specified');
    }

    return result;
  }

  static limit(value, max_threshold) {
    let permitted_values = [];
    switch(max_threshold) {
      // case Sensitivity.vals.EXTREME:
      //   permitted_values.push(Sensitivity.vals.EXTREME);
      case Sensitivity.vals.EXPLICIT:
        permitted_values.push(Sensitivity.vals.EXPLICIT);
      case Sensitivity.vals.QUESTIONABLE:
        permitted_values.push(Sensitivity.vals.QUESTIONABLE);
      case Sensitivity.vals.SAFE:
        permitted_values.push(Sensitivity.vals.SAFE);
    }

    return permitted_values.includes(value);
  }
}

export { Sensitivity };
