import { AnalyticsEventEnum } from '../constants/analytics-event.constant';

export interface MixpanelTrackEvent {
  event: AnalyticsEventEnum | string;
  data?: Record<string, unknown>;
}

export interface MixpanelEventContext {
  userId?: string;
  email?: string;
  name?: string;
  environment?: string;
  timestamp?: string;
}
