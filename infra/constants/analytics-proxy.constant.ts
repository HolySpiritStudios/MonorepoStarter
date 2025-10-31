export const AnalyticsProxyPath = {
  MIXPANEL: '/events/mp',
  SENTRY: '/events/st',
} as const;

export const AnalyticsProxyPattern = {
  MIXPANEL: '/events/mp*',
  SENTRY: '/events/st*',
} as const;
