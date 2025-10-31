import { useCallback, useEffect, useRef, useState } from 'react';

import { getAwsAuthUtil } from '../../main/utils/aws/aws-auth.util';

export function useAuthToken(): string | null {
  const [token, setToken] = useState<string | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const awsAuthUtil = getAwsAuthUtil();

  const scheduleTokenRefresh = useCallback(async () => {
    try {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      const exp = await awsAuthUtil.getTokenExpirationTime();
      const now = Date.now();

      const refreshTime = Math.max(0, (exp ?? 0) - now - awsAuthUtil.AWS_TOKEN_EXPIRATION_THRESHOLD - 1000);

      refreshTimeoutRef.current = setTimeout(async () => {
        try {
          await awsAuthUtil.forceRefreshToken((token) => setToken(token || null));
          scheduleTokenRefresh();
        } catch (error) {
          console.error('Failed to refresh token:', error);
          setToken(null);
        }
      }, refreshTime);
    } catch (error) {
      console.error('Failed to schedule token refresh:', error);
    }
  }, [awsAuthUtil]);

  const initializeToken = useCallback(async () => {
    try {
      const currentToken = await awsAuthUtil.getIdToken();
      setToken(currentToken || null);
      scheduleTokenRefresh();
    } catch (error) {
      console.error('Failed to initialize token:', error);
      setToken(null);
    }
  }, [awsAuthUtil, scheduleTokenRefresh]);

  useEffect(() => {
    initializeToken();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [initializeToken]);

  return token;
}
