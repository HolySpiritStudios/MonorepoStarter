# Mappers Definition

This directory contains the docs on how to define a mapper in the project.

## Structure

Each mapper should have a directory with the following structure:

```
mappers/
  example.mapper.ts
  another-example.mapper.ts
```

## Rules

- Mappers should be used to map data in general, but should not be used to get the data from the store.
- The first argument should be the data that needs to be mapped.
- Should never accept the root-state from store.
- Use `kebab-case` for the file names.
- Use `camelCase` for the function names.
- Exported function should reflect the mapper name.
- Suffix the mapper file name with `.mapper.ts`.
- Prefix the mapper function name with `map`.
- Define 1 mapper per file.
