# Utils Definition

This directory contains the rules to define the utils that are used in the project.

## Rules

- Implement utils as a class
- Group the implementation of utils based on the functionality, for example:
  - `date.util.ts` for date-related utils
  - `string.util.ts` for string-related utils
  - `number.util.ts` for number-related utils
- If you really need to just transform a value, use a mappers instead of utils. Refer to [mappers](../mappers/README.md) for more information.
- Always suffix the class name with `Util`, example: `DateUtil`, `StringUtil`, `NumberUtil`.
- Always suffix the file name with `.util.ts`, example: `date.util.ts`, `string.util.ts`, `number.util.ts`.
- Always implement static instance of the util, example:

  ```typescript
  export class DateUtil {
    private static _instance: DateUtil;

    private constructor() {}

    static get instance(): DateUtil {
      if (!DateUtil._instance) {
        DateUtil._instance = new DateUtil();
      }

      return DateUtil._instance;
    }
  }

  export const getDateUtil = (): DateUtil => DateUtil.instance;
  ```

- Always implement `get<Something>Util` to get the instance of the util, example: `getDateUtil`, `getStringUtil`, `getNumberUtil`.
