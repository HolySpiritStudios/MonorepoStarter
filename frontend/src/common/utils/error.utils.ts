import { AxiosError } from 'axios';

export function extractMessageFromApiError(error: unknown): string | undefined {
  const maybeMessage = (error as AxiosError<{ message: string }>)?.response?.data?.message;
  return typeof maybeMessage === 'string' && maybeMessage.trim().length > 0 ? maybeMessage : undefined;
}
