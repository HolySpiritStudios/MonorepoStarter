import { ErrorTypeEnum } from '../../constants/error-type.constant';
import { getSentryEventService } from '../../services/service-container.service';
import { ErrorTrackerProps } from '../../types/error-tracker.type.ts';
import { getAppBuildUtil } from '../app-build.util';
import { getUrlUtil } from '../url.util';

export class ErrorTrackerUtil {
  private static instance: ErrorTrackerUtil;

  static getInstance(): ErrorTrackerUtil {
    if (!ErrorTrackerUtil.instance) {
      ErrorTrackerUtil.instance = new ErrorTrackerUtil();
    }

    return ErrorTrackerUtil.instance;
  }

  constructor(
    private readonly sentryEventService = getSentryEventService(),
    private readonly urlUtil = getUrlUtil(),
    private readonly appBuildUtil = getAppBuildUtil(),
  ) {}

  private logError(error: Error, errorType: ErrorTypeEnum, props: Record<string, unknown>): void {
    if (this.urlUtil.isProductionUrl() && this.appBuildUtil.isProductionBuild()) {
      return;
    }

    console.error('--- --- ---\n', 'Error on:', { errorType, error, props }, '\n--- --- ---');
  }

  trackThunkError(error: Error, thunkName: string, props: ErrorTrackerProps): void {
    const managedError = error;
    managedError.name = `${ErrorTypeEnum.THUNK}: ${thunkName}`;

    this.logError(managedError, ErrorTypeEnum.THUNK, { input: props.input });

    this.sentryEventService.trackError(
      managedError,
      {
        errorType: ErrorTypeEnum.THUNK,
        thunkName,
      },
      {
        input: JSON.stringify(props.input, null, 2),
        note: props.note,
      },
    );
  }

  trackMapperError(error: Error, mapperName: string, props: ErrorTrackerProps): void {
    const managedError = error;
    managedError.name = `${ErrorTypeEnum.MAPPER}: ${mapperName}`;

    this.logError(managedError, ErrorTypeEnum.MAPPER, { input: props.input });

    this.sentryEventService.trackError(
      managedError,
      {
        errorType: ErrorTypeEnum.MAPPER,
        mapperName,
      },
      {
        input: JSON.stringify(props.input, null, 2),
        note: props.note,
      },
    );
  }

  trackSchemaValidationError(error: Error, schemaName: string, props: ErrorTrackerProps): void {
    const managedError = error;
    managedError.name = `${ErrorTypeEnum.SCHEMA_VALIDATION}: ${schemaName}`;

    this.logError(managedError, ErrorTypeEnum.SCHEMA_VALIDATION, { input: props });

    this.sentryEventService.trackError(
      managedError,
      {
        errorType: ErrorTypeEnum.SCHEMA_VALIDATION,
        schemaName,
      },
      {
        input: JSON.stringify(props.input, null, 2),
        note: props.note,
      },
    );
  }

  trackAuthError(error: Error, pageName: string, props: ErrorTrackerProps): void {
    const managedError = error;
    managedError.name = `${ErrorTypeEnum.AUTH_ERROR}: ${pageName}`;

    this.logError(managedError, ErrorTypeEnum.AUTH_ERROR, { input: props.input });

    this.sentryEventService.trackError(
      managedError,
      {
        errorType: ErrorTypeEnum.AUTH_ERROR,
      },
      {
        input: props.input,
        note: props.note,
      },
    );
  }

  trackAppBoundaryError(error: Error, props: ErrorTrackerProps): void {
    const managedError = error;
    managedError.name = `${ErrorTypeEnum.APP_ERROR_BOUNDARY}: App Level Error`;

    this.logError(managedError, ErrorTypeEnum.APP_ERROR_BOUNDARY, { input: props.input });

    this.sentryEventService.trackError(
      managedError,
      {
        errorType: ErrorTypeEnum.APP_ERROR_BOUNDARY,
      },
      {
        input: JSON.stringify(props.input, null, 2),
        note: props.note,
      },
    );
  }
}

export const getErrorTrackerUtil = (): ErrorTrackerUtil => ErrorTrackerUtil.getInstance();
