import type { APIGatewayProxyEvent } from 'aws-lambda';
import { LambdaEvent } from 'hono/aws-lambda';

import { AuthContext } from '../models/auth-context.model';

export function extractAuthContext(event: APIGatewayProxyEvent | LambdaEvent): AuthContext {
  const claims =
    'authorizer' in event.requestContext &&
    event.requestContext.authorizer &&
    'claims' in event.requestContext.authorizer
      ? event.requestContext.authorizer.claims
      : undefined;

  if (!claims) {
    throw new Error('No authorization claims found');
  }

  const email = claims.email;
  const userId = claims.userId;
  const platformId = claims.platformId;

  if (!email || !userId) {
    throw new Error('Missing required auth claims');
  }

  return { email, userId, platformId };
}
