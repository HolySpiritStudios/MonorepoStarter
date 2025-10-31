# Types Definition

This directory contains the types that are used in the project.

## Rules

- If types are (will going to) frequently implemented in multiple modules, they should be placed in the `common` module.
- If types are (most-likely will only) implemented in a single module on multiple files, they should be placed in the
  module directory within
  this `types` directory.
- If types are used in a single file OR specifically belong to that file, they can be placed in the same file. Usually
  this is the case for `props` and `return` types of specific functions.
- Implement context-grouping for the types. Setup another file for the types that are related to each other.
