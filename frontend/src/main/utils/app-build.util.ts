import { EnvironmentVariable } from '../constants/environment-variable.constant';
import { EnvironmentEnum } from '../constants/environment.constant';

export class AppBuildUtil {
  private static _instance: AppBuildUtil;

  static get instance(): AppBuildUtil {
    if (!AppBuildUtil._instance) {
      AppBuildUtil._instance = new AppBuildUtil();
    }

    return AppBuildUtil._instance;
  }

  isProductionBuild(): boolean {
    return EnvironmentVariable.ENVIRONMENT === (EnvironmentEnum.PRODUCTION as string);
  }

  isIntegrationBuild(): boolean {
    return EnvironmentVariable.ENVIRONMENT === (EnvironmentEnum.INTEGRATION as string);
  }
}

export const getAppBuildUtil = (): AppBuildUtil => AppBuildUtil.instance;
