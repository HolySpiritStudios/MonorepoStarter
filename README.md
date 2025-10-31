# WS.Eng Monorepo Starter

## Setup

1. Clone the repository
2. Find replace the following strings:
   - `wseng-monorepo-starter` with a short unique name for your project (all lowercase, dash-separated, max 12 characters)
   - `WS.Eng Monorepo Starter` with the name of your project
3. Run `pnpm i` in the root directory to install the dependencies
4. Adjust the AWS account IDs in the README.md file to your own AWS account IDs
5. Adjust the infra/app.ts file with:
   - The AWS accounts for production and development.
   - Domain name and subdomain name for the project. You can use '' as the subdomain name if you want the app to be accessible at the root domain.
   - Certificate ARNs for the project. These certificates  must be in us-east-1 and have a wildcard that spans the entire domain name plus the root domain (if you use '' as the subdomain name).
6. Create secrets in Secrets Manager, with the names from the infra/app.ts file (see Secret Structure section below).
7. Create new Sentry and Mixpanel projects. Plug in the DSN and tokens into the secrets.
8. Create a new Postman workspace, update the link at the bottom of the README.md file and plug the workspace ID in the secrets.

### Secret Structure

The secrets in AWS Secrets Manager should follow this structure:

```json
{
  "MIXPANEL_TOKEN": "your-mixpanel-project-token",
  "SENTRY_DSN": "https://your-sentry-dsn@sentry.io/project-id",
  "POSTMAN_API_KEY": "PMAK-your-postman-api-key",
  "POSTMAN_WORKSPACE_ID": "your-postman-workspace-id",
  "TIMEBACK_CLIENT_ID": "your-timeback-client-id",
  "TIMEBACK_CLIENT_SECRET": "your-timeback-client-secret",
  "GOOGLE_SERVICE_ACCOUNT": {
    "client_email": "service-account@project.iam.gserviceaccount.com",
    "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
  }
}
```

**Secret Fields:**
- **MIXPANEL_TOKEN**: Project token from your Mixpanel project settings (for analytics)
- **SENTRY_DSN**: Data Source Name from your Sentry project settings (for error tracking)
- **POSTMAN_API_KEY**: API key for Postman API access (used for automated API documentation)
- **POSTMAN_WORKSPACE_ID**: Workspace ID where the API collection should be synced
- **TIMEBACK_CLIENT_ID**: OAuth client ID for TimeBack API integration (remove if not using TimeBack)
- **TIMEBACK_CLIENT_SECRET**: OAuth client secret for TimeBack API integration (remove if not using TimeBack)
- **GOOGLE_SERVICE_ACCOUNT**: Service account credentials for Google API access (remove if not using Google Sign-In)
  - `client_email`: Service account email address
  - `private_key`: Service account private key (must include `\n` for line breaks)

## Extra Features

If you do not need sign in with Google:
- Remove the `signInWithGoogle` method from the aws-auth.util.ts file.
- Remove the `handleGoogleSignIn` method from the sign-in.hook.ts file.
- Remove the `googleProvider` from the backend.construct.ts file.

If you do not need TimeBack integration (calling the TimeBack API):
- Remove the `backend/app/common/integrations/timeback/` directory.
- Remove the `timeBackBaseUrl` property from the `infra/app.ts` file (all 3 environment configurations).
- Remove the `timeBackBaseUrl` property from the `BackendConstructProps` interface in the `backend.construct.ts` file.
- Remove the `TIMEBACK_BASE_URL` environment variable assignment in the `backend.construct.ts` file.
- Remove the `TIMEBACK_BASE_URL` entry from the `EnvironmentVariable` enum in the `environment.util.ts` file.
- Remove the `TimeBackEnvironmentSchema` from the `environment.util.ts` file and remove it from the merged `EnvironmentSchema`.

If you do not need LTI support (Magic Links):
- Remove the following files:
  - `backend/app/authentication/models/lti-launch.model.ts`
  - `backend/app/authentication/models/lti-launch.schema.ts`
  - `backend/app/authentication/models/magic-token.entity.ts`
  - `backend/app/authentication/repositories/magic-token.repository.ts`
- Remove the `ltiLaunch` method from `backend/app/authentication/controllers/authentication.controller.ts`.
- Remove the `ltiLaunch` method from `backend/app/authentication/interfaces/authentication-controller.interface.ts`.
- Remove the `setupLtiLaunch` method from `backend/app/authentication/routers/authentication.router.ts`.
- Remove the following methods from `backend/app/authentication/services/authentication.service.ts`: `handleLtiLaunch`, `verifyLtiIdToken`, `generateMagicToken`, `buildFrontendRedirectUrl`, `verifyMagicLinkChallenge`, `extractUserIdentity`, `ensureUserInDatabase`, `resolveFinalUser`.
- Remove the `signInWithMagicToken` method from `frontend/src/main/utils/aws/aws-auth.util.ts`.
- Remove the magic token handling block from `frontend/src/config/slices/environment-slice/thunks/rehydrate-config.thunk.ts`.
- Remove the Cognito custom auth challenge handlers from `backend/entrypoints/cognito-trigger.lambda.ts`: `handleDefineAuthChallenge`, `handleCreateAuthChallenge`, `handleVerifyAuthChallengeResponse`.
- Remove the following entries from the `EnvironmentVariable` enum in `backend/app/common/utils/environment.util.ts`: `LTI_ISSUER`, `LTI_JWKS_URL`, `LTI_AUDIENCE`, `FRONTEND_BASE_URL`.
- Remove the `ltiIssuer`, `ltiAudience`, and `timeBackBaseUrl` properties from the `BackendConstructProps` interface in `infra/constructs/backend.construct.ts`.
- Remove the LTI-related environment variable assignments (`LTI_ISSUER`, `LTI_JWKS_URL`, `LTI_AUDIENCE`, `FRONTEND_BASE_URL`) from the `getEnvironmentVariables()` method in `infra/constructs/backend.construct.ts`.
- Remove the `ltiIssuer`, `ltiAudience`, and `timeBackBaseUrl` properties from all stack configurations in `infra/app.ts`.

Note that by default, Google login is disabled on ephemeral environments (because you would need to add the redirect URIs to the Google Cloud Console for each environment), while self sign up is enabled only on ephemeral environments (such that you can login/sign up on ephemeral environments to test the app).

## Project Structure
```
wseng-monorepo-starter/
├── backend/          # TypeScript/Node.js API server
│   ├── app/          # Core application modules
│   │   ├── authentication/    # User auth & session management
│   ├── entrypoints/  # AWS Lambda handlers
│   └── scripts/      # Database migrations & maintenance scripts
├── frontend/         # React/TypeScript web application
│   ├── src/          # Application source code
│   │   ├── common/           # Shared components & utilities
│   │   ├── main/             # Core app features & screens
│   │   ├── config/           # App configuration & settings
│   │   └── user-management/  # User account & profile management
│   └── public/       # Static assets & resources
├── infra/           # AWS CDK infrastructure as code
│   ├── constructs/  # Reusable infrastructure components
│   ├── stacks/      # CloudFormation stack definitions
│   └── scripts/     # Deployment & maintenance scripts
└── docs/            # Documentation & development guides
```

## Prerequisites

### Development Environment

- **Node.js**: Version 22+ (as specified in GitHub Actions)
- **pnpm**: Package manager for Node.js dependencies

### AWS Access

The platform requires access to one of two AWS accounts:

| Environment | Account ID   | Account Name                           |
| ----------- | ------------ | -------------------------------------- |
| Production  | 856284715153 | RAM-AWS-Dev-WSEngineering-WSEng-Admin  |
| Development | 856284715153 | RAM-AWS-Dev-WSEngineering-WSEng-Admin  |

During development, you should have the Development account selected in your AWS profile (you may configure it in the .env file with the `AWS_PROFILE` variable).

## Local Development

### Environment Setup

The project uses a single `.env` file in the root directory that's shared across all components (backend, frontend, game, and infrastructure).

- **Ephemeral Environments**: Each pull request automatically creates a dedicated ephemeral environment for testing.
- **Environment Sync**: After starting a new pull request, after the environment is created, run `pnpm script update-env --pr <pr-number>` to sync the environment variables from the AWS stack outputs to your local .env file.

### Development Scripts

#### Root

```bash
pnpm run check   # Runs linting, formatting, and type checking
pnpm run fix     # Fixing linting and formatting issues
```

Additional scripts (automatically picked up if placed in a `scripts/` directory). Run scripts with `pnpm script <script-name> [options]`:

```bash
pnpm script update-env [--env <env>] [--pr <pr-number>]     # Syncs environment variables from AWS stack outputs to .env

# Deployment
pnpm script upload-frontend --path <dist-path>             # Uploads frontend build to S3 & invalidates CloudFront
```

#### Backend

```bash
cd backend/
pnpm run dev     # Start development server
pnpm run test    # Run test suite
```

#### Frontend

```bash
cd frontend/
pnpm run dev     # Start development server with hot reload
```

### API Documentation & Testing

- **API Documentation**: Available at `/docs/viewer` on the backend, or check `/docs/llms.txt` and `/docs/openapi.json`
- **Postman Collection**: [API Collection](https://ws-eng.postman.co/workspace/TimeBack---L%2526E-Home-App~d3ecf06e-3181-4e79-af6d-a5a65107c690/overview)
