import { EnvironmentVariable } from '../constants/environment-variable.constant';

import { EnvironmentService } from './environment.service';
import { MixpanelEventService } from './mixpanel-event.service';
import { MixpanelTrackerService } from './mixpanel-tracker.service';
import { ReduxStoreService } from './redux-store.service';
import { SentryEventService } from './sentry-event.service';
import { SentryTrackerService } from './sentry-tracker.service';

/**
 * Service factory functions that wire up all dependencies
 */

// Initialize core services (no dependencies)
const environmentService = new EnvironmentService();
const reduxStoreService = new ReduxStoreService();

// Initialize analytics services (depend on core services)
const mixpanelTrackerService = new MixpanelTrackerService(EnvironmentVariable.MIXPANEL_TOKEN, environmentService);
const sentryTrackerService = new SentryTrackerService(EnvironmentVariable.SENTRY_DSN, environmentService);

// Initialize composite services (depend on other services)
const mixpanelEventService = new MixpanelEventService(mixpanelTrackerService, reduxStoreService);
const sentryEventService = new SentryEventService(sentryTrackerService, reduxStoreService);

// Service getters - just return the wired instances
export const getMixpanelEventService = (): MixpanelEventService => mixpanelEventService;
export const getSentryEventService = (): SentryEventService => sentryEventService;
export const getEnvironmentService = (): EnvironmentService => environmentService;
export const getReduxStoreService = (): ReduxStoreService => reduxStoreService;
export const getMixpanelTrackerService = (): MixpanelTrackerService => mixpanelTrackerService;
export const getSentryTrackerService = (): SentryTrackerService => sentryTrackerService;
