import { AppUser } from '../../user-management/models/user.model';
import { selectCurrentUser } from '../../user-management/selectors/user-authentication-status.selector';

import { ReduxStoreService } from './redux-store.service';
import { SentryTrackerService } from './sentry-tracker.service';

export class SentryEventService {
  constructor(
    private readonly sentryTracker: SentryTrackerService,
    private readonly reduxStoreService: ReduxStoreService,
  ) {}

  private getCurrentUser(): AppUser | null {
    const state = this.reduxStoreService.getRootState();
    return selectCurrentUser(state);
  }

  trackError(error: Error, tags: Record<string, string | number | undefined>, extra?: Record<string, unknown>): void {
    const currentUser = this.getCurrentUser();
    this.sentryTracker.trackError(error, tags, extra, currentUser);
  }

  identifyUser(user: AppUser): void {
    this.sentryTracker.setUser(user);
  }

  resetUser(): void {
    this.sentryTracker.resetUser();
  }

  debugTest(): void {
    this.sentryTracker.debugTest();
  }
}
