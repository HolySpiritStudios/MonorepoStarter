# Selectors Definition

This directory contains the docs on how to define a selector in the project.

## Structure

Each selector should have a directory with the following structure:

```
selectors/
  example.selector.ts
  another-example.selector.ts
```

## Rules

- Selectors should be used to get the data from the store.
- Should be implemented as a function.
- The first argument should be the root-state, which is the global state of the application.
- Can accept any number of arguments based on the needs.
- Use `kebab-case` for the file names.
- Use `camelCase` for the function names.
- Suffix the file name with `.selector.ts`.
- Prefix the selector function name with `select`.
- Exported function should reflect the selector name.
- Define 1 selector per file.
