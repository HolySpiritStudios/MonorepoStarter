import { getAppLogger } from './logger.util';

const logger = getAppLogger('retry.util');

const DEFAULT_BACKOFF_MULTIPLIER = 500;
const DEFAULT_MAX_ATTEMPTS = 5;

const getBackoffTime = (attempt: number, backoffMultiplier = DEFAULT_BACKOFF_MULTIPLIER): number => {
  if (attempt <= 0) {
    return 0;
  }

  return backoffMultiplier * Math.pow(2, attempt);
};

const backoff = async (delayInMilliseconds: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(() => resolve(true), delayInMilliseconds));
};

export const RetryUtils = {
  /**
   * Attempts to run the given function.
   * If failed, retries it after some delay.
   * Tries until max attempts are met.
   * Throws an error if all attempts are failed.
   * @param {() => T} retryFunction The function to execute and retry if it fails
   * @param {number} attempts Maximum number of attempts. Defaults to 5
   * @param backoffMultiplier Multiplier for the time between the retries. Defaults to 500 ms
   * @param maxBackoffTime Optional maximum backoff time in milliseconds
   * @returns {Promise<T>}
   */
  async retryWithBackoff<T>(
    retryFunction: () => Promise<T>,
    attempts: number = DEFAULT_MAX_ATTEMPTS,
    backoffMultiplier = DEFAULT_BACKOFF_MULTIPLIER,
    maxBackoffTime?: number,
  ): Promise<T> {
    let attempt = 0;
    while (attempt < attempts) {
      let backoffTime = getBackoffTime(attempt, backoffMultiplier);
      if (maxBackoffTime && backoffTime > maxBackoffTime) {
        backoffTime = maxBackoffTime;
      }
      await backoff(backoffTime);
      try {
        return await retryFunction();
      } catch (error) {
        logger.error(`Retry failed for attempt ${attempt}:`, { error });
        attempt++;

        if (attempt >= attempts) {
          throw error;
        }
      }
    }

    throw new Error('All retry attempts failed!');
  },
};

export function retry(
  attempts: number = DEFAULT_MAX_ATTEMPTS,
  backoffMultiplier: number = DEFAULT_BACKOFF_MULTIPLIER,
  maxBackoffTime?: number,
) {
  return function (_: unknown, __: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      return RetryUtils.retryWithBackoff(
        () => originalMethod.apply(this, args),
        attempts,
        backoffMultiplier,
        maxBackoffTime,
      );
    };

    return descriptor;
  };
}
