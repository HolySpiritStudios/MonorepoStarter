import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  AllowedMethods,
  BehaviorOptions,
  CachePolicy,
  Function as CloudFrontFunction,
  Distribution,
  FunctionCode,
  FunctionEventType,
  IOrigin,
  OriginProtocolPolicy,
  OriginRequestHeaderBehavior,
  OriginRequestPolicy,
  OriginRequestQueryStringBehavior,
  PriceClass,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin, S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import * as path from 'path';

import { AnalyticsProxyPattern } from '../constants/analytics-proxy.constant';
import { getResourceName } from '../constants/app.constant';

export interface FrontendConstructProps {
  environment: string;
  subdomainName: string;
  domainName: string;
  certificateArn: string;
  mixpanelHost?: string;
  sentryHost?: string;
}

export class FrontendConstruct extends Construct {
  public readonly distribution: Distribution;
  public readonly bucket: Bucket;
  private readonly envName: string;

  constructor(scope: Construct, id: string, props: FrontendConstructProps) {
    super(scope, id);

    this.envName = props.environment;
    this.bucket = this.createBucket();
    this.distribution = this.createDistribution(props);

    this.addOutputs(props);
  }

  private createBucket(): Bucket {
    const bucketName = getResourceName(this.envName, 'frontend-and-games');

    return new Bucket(this, 'FrontendBucket', {
      bucketName,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [HttpMethods.GET, HttpMethods.HEAD, HttpMethods.PUT, HttpMethods.POST, HttpMethods.DELETE],
          allowedOrigins: ['*'],
          exposedHeaders: ['ETag', 'Content-Length', 'Content-Type', 'Last-Modified'],
          maxAge: 86400,
        },
      ],
    });
  }

  private createFrontendOrigin(): IOrigin {
    return S3BucketOrigin.withOriginAccessControl(this.bucket, {
      originPath: '/frontend',
    });
  }

  private createMixpanelOrigin(mixpanelHost: string): IOrigin {
    return new HttpOrigin(mixpanelHost, {
      protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
    });
  }

  private createSentryOrigin(sentryHost: string): IOrigin {
    return new HttpOrigin(sentryHost, {
      protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
    });
  }

  private createMixpanelOriginRequestPolicy(): OriginRequestPolicy {
    return new OriginRequestPolicy(this, 'MixpanelOriginRequestPolicy', {
      originRequestPolicyName: getResourceName(this.envName, 'mixpanel-origin-request-policy'),
      comment: 'Origin request policy for Mixpanel proxy with IP forwarding',
      headerBehavior: OriginRequestHeaderBehavior.allowList(
        'Accept',
        'Accept-Language',
        'Content-Type',
        'Origin',
        'Referer',
        'User-Agent',
        'CloudFront-Viewer-Address',
        'CloudFront-Viewer-Country',
      ),
      queryStringBehavior: OriginRequestQueryStringBehavior.all(),
    });
  }

  private createSentryOriginRequestPolicy(): OriginRequestPolicy {
    return new OriginRequestPolicy(this, 'SentryOriginRequestPolicy', {
      originRequestPolicyName: getResourceName(this.envName, 'sentry-origin-request-policy'),
      comment: 'Origin request policy for Sentry proxy with essential headers only',
      headerBehavior: OriginRequestHeaderBehavior.allowList('Content-Type', 'User-Agent', 'CloudFront-Viewer-Address'),
      queryStringBehavior: OriginRequestQueryStringBehavior.all(),
    });
  }

  private createDistribution(props: FrontendConstructProps): Distribution {
    const distributionName = getResourceName(this.envName, 'distribution');

    const mixpanelRewriteFunction = this.createMixpanelRewriteFunction();
    const sentryRewriteFunction = this.createSentryRewriteFunction();

    const additionalBehaviors: Record<string, BehaviorOptions> = {};

    if (props.mixpanelHost) {
      const mixpanelOriginRequestPolicy = this.createMixpanelOriginRequestPolicy();

      additionalBehaviors[AnalyticsProxyPattern.MIXPANEL] = {
        origin: this.createMixpanelOrigin(props.mixpanelHost),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: mixpanelOriginRequestPolicy,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        compress: false,
        functionAssociations: [
          {
            function: mixpanelRewriteFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
        responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT,
      };
    }

    if (props.sentryHost) {
      const sentryOriginRequestPolicy = this.createSentryOriginRequestPolicy();

      additionalBehaviors[AnalyticsProxyPattern.SENTRY] = {
        origin: this.createSentryOrigin(props.sentryHost),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        originRequestPolicy: sentryOriginRequestPolicy,
        allowedMethods: AllowedMethods.ALLOW_ALL,
        compress: false,
        functionAssociations: [
          {
            function: sentryRewriteFunction,
            eventType: FunctionEventType.VIEWER_REQUEST,
          },
        ],
        responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT,
      };
    }

    const distribution = new Distribution(this, distributionName, {
      defaultBehavior: {
        origin: this.createFrontendOrigin(),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: CachePolicy.CACHING_DISABLED,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        compress: true,
        responseHeadersPolicy: ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS_WITH_PREFLIGHT,
      },
      additionalBehaviors,
      defaultRootObject: 'index.html',
      errorResponses: this.getErrorResponses(),
      comment: `Frontend distribution for ${this.envName} environment`,
      domainNames: [props.subdomainName ? `${props.subdomainName}.${props.domainName}` : props.domainName],
      certificate: Certificate.fromCertificateArn(this, 'Certificate', props.certificateArn),
      priceClass: PriceClass.PRICE_CLASS_100,
    });

    const zone = HostedZone.fromLookup(this, 'HostedZone', { domainName: props.domainName });

    new ARecord(this, 'AliasRecord', {
      zone: zone,
      ...(props.subdomainName && { recordName: props.subdomainName }),
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
    });

    return distribution;
  }

  private getErrorResponses() {
    return [400, 403, 404].map((httpStatus) => ({
      httpStatus,
      responseHttpStatus: 200,
      responsePagePath: '/index.html',
    }));
  }

  private addOutputs(props: FrontendConstructProps): void {
    new CfnOutput(this, 'OutputFrontendUrl', {
      key: 'FrontendUrl',
      value: `https://${props.subdomainName ? `${props.subdomainName}.${props.domainName}` : props.domainName}`,
      description: 'Frontend URL',
    });

    new CfnOutput(this, 'OutputFrontendBucketName', {
      key: 'FrontendBucketName',
      value: this.bucket.bucketName,
      description: 'Frontend S3 bucket name',
    });

    new CfnOutput(this, 'OutputDistributionDomainName', {
      key: 'DistributionDomainName',
      value: this.distribution.distributionDomainName,
      description: 'CloudFront distribution domain name',
    });

    new CfnOutput(this, 'OutputDistributionId', {
      key: 'DistributionId',
      value: this.distribution.distributionId,
      description: 'CloudFront distribution ID',
    });
  }

  private createMixpanelRewriteFunction(): CloudFrontFunction {
    return new CloudFrontFunction(this, 'MixpanelRewriteFunction', {
      functionName: getResourceName(this.envName, 'mixpanel-rewrite-function'),
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, '../functions/mixpanel-rewrite.js'),
      }),
    });
  }

  private createSentryRewriteFunction(): CloudFrontFunction {
    return new CloudFrontFunction(this, 'SentryRewriteFunction', {
      functionName: getResourceName(this.envName, 'sentry-rewrite-function'),
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, '../functions/sentry-rewrite.js'),
      }),
    });
  }
}
