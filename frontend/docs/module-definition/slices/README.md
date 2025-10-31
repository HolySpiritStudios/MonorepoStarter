# Slices Definition

This directory contains the slices that are used in the project.

## Structure

Each slice should have a directory with the following structure:

```
slices/
  example-slice/
    example.slice.ts
    example.slice.types.ts
    thunks/
      do-example.thunk.ts
      do-another-thing.thunk.ts

  another-slice/
    another.slice.ts
    another.slice.types.ts
    thunks/
      do-something.thunk.ts
      do-another-thing.thunk.ts
```

Explanation:

- `example.slice.ts` is the slice file.
- `example.slice.types.ts` is the types file for the slice.
  - Define the slice-name with SCREAMING_SNAKE_CASE, example: `EXAMPLE_SLICE_NAME`.
  - Define the state-type with `State` suffix, example: `ExampleSliceState`.
- `thunks/` is the directory that contains the thunks for the slice.
  - `do-example.thunk.ts` is the thunk file.
  - `do-another-thing.thunk.ts` is the thunk file.

## Rules

- 1 slice should have 1 slice file and 1 types file.
- Thunks should be placed in the `thunks` directory, should be implemented within the 1 specific slice.
- Make sure to follow the naming conventions for the slice and the types.
  - Slice name should be in `SCRERAMING_SNAKE_CASE`.
  - Slice types should be in `PascalCase`.
  - Thunks should be implemented as a function, written in `camelCase` with `Thunk` suffix.
  - Thunk function name should represent the file name.
- 1 module can have multiple slices.
