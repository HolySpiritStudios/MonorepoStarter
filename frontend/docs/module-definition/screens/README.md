# Screen Definition

This directory contains the docs on how to define a screen in the project.

## Structure

Each module should have a directory with the following structure:

```
screens/
  example-a.screen.tsx
  example-b.screen.tsx
```

## Rules

- Use `PascalCase` for the screen name.
- Use `kebab-case` for the file names.
- Exported component or type should reflect the screen name.
- Suffix the screen name with `Screen` for the screen component.
- Suffix the screen name with `ScreenProps` for the screen props.
- Suffix the file name with `.screen.tsx`.
- Define 1 screen per file.
