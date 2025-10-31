import { localeResources } from '../locale/setup';

// Get all namespace keys (main, common, errors, environment, ...)
type Namespace = keyof typeof localeResources.en;

// Get all possible keys for a single namespace
type LocaleKeysForNamespace<N extends Namespace> = keyof (typeof localeResources.en)[N];

type Concat<S1 extends string, S2 extends string> = `${S1}${S2}`;

// Create the final type that combines namespace with its keys
export type LocaleKey = {
  [N in Namespace]: Concat<Concat<N, ':'>, LocaleKeysForNamespace<N> & string>;
}[Namespace];
