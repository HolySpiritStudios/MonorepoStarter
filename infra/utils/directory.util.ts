import { join } from 'path';

export function getRoot(): string {
  return join(__dirname, '..', '..');
}

export function getLambdaRoot(): string {
  return join(getRoot(), 'backend', 'entrypoints');
}

export function getLambdaPath(lambdaName: string): string {
  return join(getLambdaRoot(), lambdaName);
}
