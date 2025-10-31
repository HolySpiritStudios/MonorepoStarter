export class ExampleUtil {
  private static _instance: ExampleUtil;

  static get instance(): ExampleUtil {
    if (!ExampleUtil._instance) {
      ExampleUtil._instance = new ExampleUtil();
    }
    return ExampleUtil._instance;
  }
}

export const getExampleUtil = (): ExampleUtil => ExampleUtil.instance;
