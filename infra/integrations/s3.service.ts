import type { Logger } from '@aws-lambda-powertools/logger';
import { DeleteObjectCommand, PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';

import { lookup } from 'mime-types';
import S3SyncClient from 's3-sync-client';

import { getInfraLogger } from '../utils/logger.util';

export class S3Service {
  constructor(
    private readonly s3Client: S3Client = new S3Client(),
    private readonly logger: Logger = getInfraLogger(S3Service.name),
  ) {}

  async uploadFile(bucketName: string, key: string, body: string | Buffer, contentType: string): Promise<void> {
    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    this.logger.info(`File uploaded successfully to ${bucketName}/${key}`);
  }

  async deleteFile(bucketName: string, key: string): Promise<void> {
    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
    this.logger.info(`File deleted successfully from ${bucketName}/${key}`);
  }

  async syncDirectory(bucketName: string, localPath: string, s3Prefix: string): Promise<void> {
    const client = new S3SyncClient({ client: this.s3Client });
    await client.sync(localPath, `s3://${bucketName}/${s3Prefix}`, {
      del: true,
      commandInput: (input: Partial<PutObjectCommandInput>): Partial<PutObjectCommandInput> => ({
        ContentType: lookup(input.Key ?? '.html') || 'text/html',
      }),
    });
  }
}
