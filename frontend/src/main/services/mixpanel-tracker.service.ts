import mixpanel from 'mixpanel-browser';

import { AppUser } from '../../user-management/models/user.model';
import { AnalyticsProxyPath } from '../constants/analytics-proxy.constant';
import { MixpanelTrackEvent } from '../types/mixpanel-tracker.type';

import { EnvironmentService } from './environment.service';

export class MixpanelTrackerService {
  private isInitialized = false;

  constructor(
    private readonly token: string,
    private readonly environmentService: EnvironmentService,
  ) {
    this.initClient();
  }

  private initClient(): void {
    if (!this.token) {
      return;
    }

    mixpanel.init(this.token, {
      track_pageview: 'url-with-path-and-query-string',
      api_host: AnalyticsProxyPath.MIXPANEL,
    });
    this.isInitialized = true;
  }

  track(event: MixpanelTrackEvent, user?: AppUser | null): void {
    if (!this.isInitialized) {
      return;
    }

    if (user) {
      this.identifyUser(user);
    }

    const environmentContext = this.environmentService.getEnvironmentContext();

    const trackingData = {
      distinct_id: user?.id,
      user_id: user?.id,
      timestamp: new Date().toUTCString(),
      event_name: event.event,
      ...environmentContext,
      ...event.data,
    };

    mixpanel.track(event.event, trackingData);
  }

  reset(): void {
    if (!this.isInitialized) {
      return;
    }

    mixpanel.reset();
  }

  identify(userId: string): void {
    if (!this.isInitialized) {
      return;
    }

    mixpanel.identify(userId);
  }

  private identifyUser(user: AppUser): void {
    if (!this.isInitialized) {
      return;
    }

    mixpanel.identify(user.id);
    mixpanel.people.set({
      $email: user.email,
      $name: user.name,
      user_id: user.id,
    });
  }

  setUserProperties(properties: Record<string, unknown>): void {
    if (!this.isInitialized) {
      return;
    }

    mixpanel.people.set(properties);
  }
}
