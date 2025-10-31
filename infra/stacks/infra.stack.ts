import { CfnOutput, RemovalPolicy, Stack, StackProps, Tags } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

import { OWNER_EMAIL, getResourceName } from '../constants/app.constant';
import { isEphemeral } from '../constants/environment.constant';
import { BackendConstruct } from '../constructs/backend.construct';
import { FrontendConstruct } from '../constructs/frontend.construct';

const MIXPANEL_HOST = 'api.mixpanel.com';
const SENTRY_HOST = 'o4504227135291392.ingest.us.sentry.io';
const WEBSITE_INDEX_DOCUMENT = 'index.html';
const WEBSITE_ERROR_DOCUMENT = 'error.html';
const CORS_MAX_AGE = 3000;

export interface InfraStackProps extends StackProps {
  readonly environment: string;
  readonly domainName: string;
  readonly subdomainName: string;
  readonly secretId: string;
  readonly certificateArn: string;
  readonly sentryDsn?: string;
  readonly ltiIssuer?: string;
  readonly ltiAudience?: string;
  readonly timeBackBaseUrl?: string;
}

export class InfraStack extends Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    new BackendConstruct(this, 'Backend', props);
    new FrontendConstruct(this, 'Frontend', {
      ...props,
      mixpanelHost: MIXPANEL_HOST,
      sentryHost: SENTRY_HOST,
    });

    if (!isEphemeral(props.environment)) {
      this.createAssetsBucket(props);
    }

    Tags.of(this).add('Environment', props.environment);
    Tags.of(this).add('Owner', OWNER_EMAIL);
  }

  private createAssetsBucket(props: InfraStackProps) {
    const bucketName = getResourceName(props.environment, 'assets');
    const bucket = new Bucket(this, 'AssetsBucket', {
      bucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS_ONLY,
      removalPolicy: RemovalPolicy.DESTROY,
      publicReadAccess: true,
      autoDeleteObjects: true,
      websiteIndexDocument: WEBSITE_INDEX_DOCUMENT,
      websiteErrorDocument: WEBSITE_ERROR_DOCUMENT,
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST, HttpMethods.DELETE, HttpMethods.HEAD],
          allowedHeaders: ['*'],
          exposedHeaders: ['ETag'],
          maxAge: CORS_MAX_AGE,
        },
      ],
    });

    new CfnOutput(this, 'OutputAssetsBucketName', {
      key: 'AssetsBucketName',
      value: bucket.bucketName,
    });

    return bucket;
  }
}
