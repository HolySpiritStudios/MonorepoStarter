# Component Definition

This directory contains the docs on how to define a component in the project.

## Structure

Each component should have a directory with the following structure:

```
components/
  example-component-a.tsx
  example-component-b.tsx
  example-component-a/ (may have directory, if the component is complex)
    example-component-a-section-1.tsx
    example-component-a-section-2.tsx
```

## Rules

- Use `PascalCase` for the component name.
- Use `kebab-case` for the file names.
- Exported component or type should reflect the component name.
- Define 1 component per file.
- We have options to define:
  - [Simple component](./example-component.tsx)
  - [Memoized component](./example-memoized-component.tsx)
  - [Forwarded ref component](./example-forwarded-ref-component.tsx)
- Use `Tailwind CSS` for styling the component.
