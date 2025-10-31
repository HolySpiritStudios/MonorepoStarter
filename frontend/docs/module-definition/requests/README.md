# Request Definition

This directory provides guidelines for defining requests for each module.

## Rules

1. **Function Implementation**:

- Implement requests as functions that return a promise.
- Each request function should handle only one request.
- Each file should contain only one request function.

2. **Naming Conventions**:

- Name request files using the format `{context-activity}.request.ts`, for example: `update-user.request.ts`,
  `get-user.request.ts`.
- Implement the request function according to the file name. For example:

  ```typescript
  // file: update-user.request.ts
  export const upadateUserRequest = async (data: UpdateUserRequestType): Promise<UpdateUserResponseType> => {
    // Implementation here
  };
  ```

3. **GraphQL Requests**:

- For specific GraphQL requests, refer to the following examples:
  - [example.query.ts](./example.query.ts) for GraphQL query requests.
  - [example.mutation.ts](./example.mutation.ts) for GraphQL mutation requests.
- Name GraphQL request files using the format `{context-activity}.{query | mutation}.ts`. For example:
  - `get-user-details.query.ts` for a user details query.
  - `update-user-preference.mutation.ts` for updating user preferences.
- Implement GraphQL request functions according to the file name. For example:

  ```typescript
  // file: update-user.mutation.ts
  export const updateUserMutationRequest = async (
    data: UpdateUserMutationRequestType,
  ): Promise<UpdateUserMutationResponseType> => {
    // Implementation here
  };
  ```

4. **Client Utilization**:

- For GraphQL requests that directly interact with the GraphQL client, always
  use [GraphQLClientUtil](../../../src/main/utils/clients/graphql-client.util.ts).
- For other types of requests, use the appropriate clients as needed.
