import type {
  CreateAuthChallengeTriggerEvent,
  DefineAuthChallengeTriggerEvent,
  PreTokenGenerationTriggerEvent,
  VerifyAuthChallengeResponseTriggerEvent,
} from 'aws-lambda';

import { getAppLogger } from '../app/common/utils/logger.util';

import { buildAuthenticationService } from './containers/auth-service.container';

const logger = getAppLogger('cognito-trigger');

type AnyTriggerEvent =
  | PreTokenGenerationTriggerEvent
  | DefineAuthChallengeTriggerEvent
  | CreateAuthChallengeTriggerEvent
  | VerifyAuthChallengeResponseTriggerEvent;

export async function handler(event: AnyTriggerEvent): Promise<AnyTriggerEvent> {
  const triggerSource = (event as { triggerSource: string }).triggerSource;
  logger.info('Cognito trigger received', { triggerSource });

  switch (triggerSource) {
    case 'TokenGeneration_HostedAuth':
    case 'TokenGeneration_Authentication':
    case 'TokenGeneration_RefreshTokens':
    case 'TokenGeneration_NewPasswordChallenge':
    case 'TokenGeneration_AuthenticateDevice':
      return (await handlePreTokenGeneration(event as PreTokenGenerationTriggerEvent)) as AnyTriggerEvent;
    case 'DefineAuthChallenge_Authentication':
      return (await handleDefineAuthChallenge(event as DefineAuthChallengeTriggerEvent)) as AnyTriggerEvent;
    case 'CreateAuthChallenge_Authentication':
      return (await handleCreateAuthChallenge(event as CreateAuthChallengeTriggerEvent)) as AnyTriggerEvent;
    case 'VerifyAuthChallengeResponse_Authentication':
      return (await handleVerifyAuthChallengeResponse(
        event as VerifyAuthChallengeResponseTriggerEvent,
      )) as AnyTriggerEvent;
    default:
      logger.warn('Unsupported trigger source', { triggerSource });
      return event;
  }
}

async function handlePreTokenGeneration(
  event: PreTokenGenerationTriggerEvent,
): Promise<PreTokenGenerationTriggerEvent> {
  const authenticationService = buildAuthenticationService({ USER_POOL_ID: event.userPoolId });
  const email = event.request.userAttributes.email;
  const fullName = event.request.userAttributes.name || event.request.userAttributes.given_name || 'Unknown';

  if (!email) {
    logger.warn('No email found in pre-token generation event');
    throw new Error('No email found in pre-token generation event');
  }

  const authContext = await authenticationService.getAuthContext({ email, fullName });
  event.response.claimsOverrideDetails = {
    claimsToAddOrOverride: { ...authContext },
  };
  return event;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function handleDefineAuthChallenge(
  event: DefineAuthChallengeTriggerEvent,
): Promise<DefineAuthChallengeTriggerEvent> {
  const session = event.request.session || [];
  if (session.length === 0) {
    event.response.challengeName = 'CUSTOM_CHALLENGE';
    event.response.issueTokens = false;
    event.response.failAuthentication = false;
  } else if (
    session.length === 1 &&
    session[0].challengeName === 'CUSTOM_CHALLENGE' &&
    session[0].challengeResult === true
  ) {
    event.response.issueTokens = true;
    event.response.failAuthentication = false;
  } else {
    event.response.issueTokens = false;
    event.response.failAuthentication = true;
  }
  return event;
}

// eslint-disable-next-line @typescript-eslint/require-await
async function handleCreateAuthChallenge(
  event: CreateAuthChallengeTriggerEvent,
): Promise<CreateAuthChallengeTriggerEvent> {
  event.response.publicChallengeParameters = { trigger: 'true' };
  event.response.privateChallengeParameters = { trigger: 'true' };
  event.response.challengeMetadata = 'MAGIC_LINK';
  return event;
}

async function handleVerifyAuthChallengeResponse(
  event: VerifyAuthChallengeResponseTriggerEvent,
): Promise<VerifyAuthChallengeResponseTriggerEvent> {
  const challengeAnswer = event.request.challengeAnswer;
  const email = event.request.userAttributes?.email;

  if (!email) {
    logger.warn('No email found in verify auth challenge response event');
    throw new Error('No email found in verify auth challenge response event');
  }

  const auth = buildAuthenticationService({ USER_POOL_ID: event.userPoolId });
  const isValid = await auth.verifyMagicLinkChallenge(email, challengeAnswer);
  event.response.answerCorrect = isValid;
  return event;
}
