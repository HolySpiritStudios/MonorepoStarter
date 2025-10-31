import type { Logger } from '@aws-lambda-powertools/logger';
import { CloudFrontClient, CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';

import { getInfraLogger } from '../utils/logger.util';

export class CloudFrontService {
  constructor(
    private readonly cloudFrontClient: CloudFrontClient = new CloudFrontClient(),
    private readonly logger: Logger = getInfraLogger(CloudFrontService.name),
  ) {}

  async createInvalidation(distributionId: string, paths: string[]): Promise<string> {
    const command = new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        Paths: {
          Quantity: paths.length,
          Items: paths,
        },
        CallerReference: `invalidation-${Date.now()}`,
      },
    });

    const response = await this.cloudFrontClient.send(command);
    const invalidationId = response.Invalidation?.Id;

    if (!invalidationId) {
      throw new Error('Failed to create CloudFront invalidation');
    }

    this.logger.info(`CloudFront invalidation created successfully`, {
      distributionId,
      invalidationId,
      paths,
    });

    return invalidationId;
  }
}
