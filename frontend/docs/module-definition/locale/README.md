# Locale Definition

This directory contains the rules on how to define the locale for each module.

## Rules

- Implement locale as a TS file, with the following structure:
  ```typescript
  export const enSomethingLocale = {
    key: 'value',
  };
  ```
- Always use the `_EN_LOCALE` suffix for the locale, example: `USER_UPDATE_EN_LOCALE`, `USER_MANAGEMENT_EN_LOCALE`, as
  of now we only support English locale.
- Always suffix the file name with `.en.locale.ts`, example: `user-update.en.locale.ts`, `user-management.en.locale.ts`.
- Group the implementation of locale based on each relevant module if needed, for example:
- - `user-update.en.locale.ts` for user-update-related locale
- - `user-management.en.locale.ts` for user-management-related locale
- Always implement the locale as an object with key-value pairs, example:
  ```typescript
  export const USER_UPDATE_EN_LOCALE = {
    title: 'User Update',
    description: 'This is the user update page',
  };
  ```
- Always use snake_case for the key, example: `key_name`, `key_name_another`.
- For locale definition, please utilize i18next library as much as we can, refer to [i18next](https://www.i18next.com/)
  and [i18next-react](https://react.i18next.com/) for more information.
- - Use replacement for the locale, example:

```typescript
export const USER_UPDATE_EN_LOCALE = {
  title: 'User Update',
  description: 'This is the user update page',
  welcome_with_name: 'Welcome, {{name}}!',
};
```

- - Use components for the locale for custom elements, example:

```typescript
export const USER_UPDATE_EN_LOCALE = {
  title: 'User Update',
  description: 'This is the user update page',
  welcome_with_name: 'Welcome, {{name}}!',
  welcome_with_name_and_component: 'Welcome, <ComponentToReplace>{{name}}</ComponentToReplace>!',
};
```

- Import the locale into app-level locale, refer to [Setup.ts](../../../src/main/locale/setup.ts) for more information.
