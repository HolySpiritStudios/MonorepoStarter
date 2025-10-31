# Module Definition Docs

This directory contains the docs on how to define a module in the project.

## Common Naming Conventions

- Use `kebab-case` for the module name.
- Use `kebab-case` for the directory names.
- Use `kebab-case` for the file names.
- Use `PascalCase` for the React components.
- Use `camelCase` for the function names, except for the React components.
- Use `SCREAMING_SNAKE_CASE` for the constants.

## Structure

Each module should have a directory with the following structure:

```
module-name/
  assets
  components
  hooks
  locale
  mappers
  requests
  routers
  screens
  selectors
  slices
  types
  utils
```

Description:

- `assets` - Contains all the assets that are used in the module. Example: images, fonts, etc.
- `components` - Contains all the components that are used in the module.
- `hooks` - Contains all the hooks that are used in the module.
- `locale` - Contains all the locale files that are used in the module.
- `mappers` - Contains all the mappers that are used in the module.
- `requests` - Contains all the requests that are used in the module.
- `routers` - Contains all the routers that are used in the module.
- `screens` - Contains all the screens that are used in the module.
- `selectors` - Contains all the selectors that are used in the module.
- `slices` - Contains all the slices that are used in the module.
- `utils` - Contains all the utility classes that are used in the module.
- `types` - Contains all the shared-types that are used in the module.

## Difference Between: Components vs Screens

- `components` - Should never be implemented directly in navigations as entry point.
- `screens` - Can be implemented directly in navigations as entry point.

## Difference Between: Selectors vs Mappers vs Utils

- `selectors`: These should be functions designed to retrieve data from the store. **The first argument must be the root
  state**. Selectors are solely responsible for DATA TRANSFORMATION WITH ROOT STATE.
- `mappers`: These functions are for general data mapping and must not retrieve data from the store. They **must never
  accept the root state**. Mappers are solely for DATA TRANSFORMATION WITHOUT ROOT STATE.
- `utils`: These are custom classes with methods and functions that is unrelated to data transformation. They **should
  be implemented as classes** following our default singleton approach. Methods within these classes should be grouped
  based on the context of the that class. **If we need to transform data, we should use mappers and selectors instead of
  utils.**

### Potential patterns of usage:

Independent functions:

```typescript
// Selectors
export const selectCourseData = (state: RootState): Course => {
  // Implementation
};
export const selectSpecificCourseData = (state: RootState, identifier: string): Course => {
  // Implementation
};

// Mappers
export const mapCourseDataForTracking = (courseData: Course): CourseForTracking => {
  // Implementation
};

// Utils
export class AppStateUtil {
  private static _instance: AppStateUtil;

  static get instance(): AppStateUtil {
    if (!AppStateUtil._instance) {
      AppStateUtil._instance = new AppStateUtil();
    }

    return AppStateUtil._instance;
  }
}

export const getAppStateUtil = (): AppStateUtil => AppStateUtil.instance;
```

Cross implementations:

```typescript
// Mappers
export const mapCourseDataForTracking = (course: Course): CourseForTracking => {
  // Implementation
};

// Selectors
export const selectCourseDataForTracking = (state: RootState, identifier: string): CourseForTracking => {
  // Implementation
  // ... extracting the course from root-state, then ...
  return mapCourseDataForTracking(course);
};

// Utils
export class CourseDeveloperUtil {
  private static _instance: CourseDeveloperUtil;

  static get instance(): CourseDeveloperUtil {
    if (!CourseDeveloperUtil._instance) {
      CourseDeveloperUtil._instance = new CourseDeveloperUtil();
    }

    return CourseDeveloperUtil._instance;
  }

  printTrackedCourseData(course): void {
    // Implementation
    console.log('Example course to track', mapCourseDataForTracking(course));
  }
}

export const getCourseDeveloperUtil = (): CourseDeveloperUtil => CourseDeveloperUtil.instance;
```
