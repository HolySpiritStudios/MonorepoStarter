# Hooks Definition

This directory contains the docs on how to define a hook in the project.

## Structure

Each hook should be defined in a separate file with the following structure:

```
hooks/
  use-example-data-handling.ts
  use-example-with-return-value.ts
```

## Rules

- Hooks should be used to encapsulate reusable stateful logic.
- Should be implemented as a function.
- Must follow React hooks naming convention starting with `use`.
- Can accept props as needed through a `Props` interface.
- Should define return type if the hook returns a value using `ReturnType` interface.
- Use `kebab-case` for the file names.
- Use `camelCase` for the function names.
- Prefix the file name with `use-`.
- Exported function should reflect the hook name.
- Define 1 hook per file.
- Follow React hooks rules (only call hooks at the top level, only call hooks from React functions).
