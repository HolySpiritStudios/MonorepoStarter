export function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function getRandomizedInterval(baseInterval: number, randomFactor: number): number {
  return baseInterval + (baseInterval / 4.0) * (randomFactor - 0.5);
}
