import { AppUser } from '../../user-management/models/user.model';
import { selectCurrentUser } from '../../user-management/selectors/user-authentication-status.selector';
import { MixpanelTrackEvent } from '../types/mixpanel-tracker.type';

import { MixpanelTrackerService } from './mixpanel-tracker.service';
import { ReduxStoreService } from './redux-store.service';

export class MixpanelEventService {
  constructor(
    private readonly mixpanelTracker: MixpanelTrackerService,
    private readonly reduxStoreService: ReduxStoreService,
  ) {}

  private getCurrentUser(): AppUser | null {
    const state = this.reduxStoreService.getRootState();
    return selectCurrentUser(state);
  }

  /**
   * Track an event with automatic user identification
   */
  trackEvent(eventData: MixpanelTrackEvent): void {
    const currentUser = this.getCurrentUser();

    this.mixpanelTracker.track(eventData, currentUser);
  }

  /**
   * Track multiple events in batch
   */
  trackEvents(events: MixpanelTrackEvent[]): void {
    const currentUser = this.getCurrentUser();

    events.forEach((eventData) => {
      this.mixpanelTracker.track(eventData, currentUser);
    });
  }

  /**
   * Manually identify a user (typically called after authentication)
   */
  identifyUser(user: AppUser): void {
    this.mixpanelTracker.identify(user.id);
    this.mixpanelTracker.setUserProperties({
      email: user.email,
      name: user.name,
      user_id: user.id,
    });
  }

  /**
   * Reset user identity (typically called on logout)
   */
  resetUser(): void {
    this.mixpanelTracker.reset();
  }
}
