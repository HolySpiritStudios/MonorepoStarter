# Routers Definition

This directory contains the rules on how to define the routers for each module.

## Rules

- Implement router as an array of objects with RouteObject type.
- Group the implementation of routers based on the for each relevant module if needed, for example:
  - `user-update.router.ts` for user-related routers
  - `user-management.router.ts` for user management-related routers
- Always suffix the file name with `.router.ts`, example: `user-update.router.ts`, `user-management.router.ts`.
- Always implement the router as an array of objects with RouteObject type, example:
  ```typescript
  export const UserUpdateRouter: RouteObject[] = [
    {
      path: '/user/update',
      element: <UserUpdate />,
    },
  ];
  ```
- Always implement the router with the following properties:
- - `path`: the path of the router.
- - `element`: the component that will be rendered when the path is accessed.
- Always do lazy-import with common-suspense component, example:
  ```typescript
  const UserUpdate = React.lazy(() => import('modules/user-update/user-update'));
  ```
- Always use the `common-suspense` component to wrap the router, example:
  ```typescript
  export const UserUpdateRouter: RouteObject[] = [
    {
      path: '/user/update',
      element: (
        <CommonSuspense>
          <UserUpdate />
        </CommonSuspense>
      ),
    },
  ];
  ```
- Always use the screen protector to protect the router, example:
  ```typescript
  export const UserUpdateRouter: RouteObject[] = [
    {
      path: '/user/update',
      element: (
        <CommonSuspense>
         <ScreenProtector>
            <UserUpdate />
          </ScreenProtector>
        </CommonSuspense>
      ),
    },
  ];
  ```
