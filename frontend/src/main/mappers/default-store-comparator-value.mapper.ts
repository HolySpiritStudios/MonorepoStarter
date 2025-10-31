export const mapDefaultStoreComparatorValue = <T>(a: T, b: T) => {
  if (!a || !b) {
    return a === b;
  }

  if (typeof a === 'string' || typeof b === 'string') {
    return a === b;
  }

  if (typeof a === 'number' || typeof b === 'number') {
    return a === b;
  }

  if (typeof a === 'boolean' || typeof b === 'boolean') {
    return a === b;
  }

  if (Array.isArray(a) || Array.isArray(b)) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return JSON.stringify(a) === JSON.stringify(b);
};
