import type { Logger } from '@aws-lambda-powertools/logger';

import axios from 'axios';
import { ConvertResult, convert } from 'openapi-to-postmanv2';

import { getInfraLogger } from '../utils/logger.util';

const POSTMAN_API_URL = 'https://api.getpostman.com';

interface EnvironmentVariable {
  key: string;
  value: string | undefined;
  type: string;
  enabled: boolean;
}

interface PostmanEnvironment {
  id?: string;
  uid?: string;
  name: string;
  values: EnvironmentVariable[];
  workspace?: string;
}

interface PostmanCollection {
  id?: string;
  uid?: string;
  name: string;
}

interface PostmanCollectionsResponse {
  collections: PostmanCollection[];
}

export class PostmanService {
  private readonly postmanApiKey: string;
  private readonly postmanWorkspaceId: string;

  constructor(private readonly logger: Logger = getInfraLogger(PostmanService.name)) {
    this.postmanApiKey = process.env.POSTMAN_API_KEY || '';
    this.postmanWorkspaceId = process.env.POSTMAN_WORKSPACE_ID || '';

    if (!this.postmanApiKey || !this.postmanWorkspaceId) {
      this.logger.warn('POSTMAN_API_KEY or POSTMAN_WORKSPACE_ID is not set');
    }
  }

  private getCollectionName(env: string): string {
    return `Auto-Generated: ${env}`;
  }

  private get headers() {
    return {
      'X-Api-Key': this.postmanApiKey,
      'Content-Type': 'application/json',
    };
  }

  private validateCredentials(): void {
    if (!this.postmanApiKey || !this.postmanWorkspaceId) {
      throw new Error('POSTMAN_API_KEY or POSTMAN_WORKSPACE_ID is not set');
    }
  }

  async fetchEnvironment(name: string): Promise<PostmanEnvironment | undefined> {
    this.validateCredentials();

    try {
      const response = await axios.get(`${POSTMAN_API_URL}/environments?workspace=${this.postmanWorkspaceId}`, {
        headers: { 'X-Api-Key': this.postmanApiKey },
      });
      const { environments } = response.data as { environments: PostmanEnvironment[] };
      return environments.find((env) => env.name === name);
    } catch (error) {
      this.logger.error(`Error fetching Postman environment '${name}':`, { error });
      throw error;
    }
  }

  async createOrUpdateEnvironment(environment: PostmanEnvironment): Promise<void> {
    this.validateCredentials();

    try {
      const existingEnvironment = await this.fetchEnvironment(environment.name);
      const method = existingEnvironment ? 'put' : 'post';
      const url = existingEnvironment
        ? `${POSTMAN_API_URL}/environments/${existingEnvironment.uid}`
        : `${POSTMAN_API_URL}/environments`;

      const updatedEnvironment = { ...environment, workspace: this.postmanWorkspaceId };
      await axios[method](url, { environment: updatedEnvironment }, { headers: this.headers });

      this.logger.info(
        `Postman environment '${environment.name}' ${existingEnvironment ? 'updated' : 'created'} successfully`,
      );
    } catch (error) {
      this.logger.error(`Error creating/updating Postman environment '${environment.name}':`, { error });
      throw error;
    }
  }

  async removeEnvironment(name: string): Promise<void> {
    this.validateCredentials();

    try {
      const environment = await this.fetchEnvironment(name);
      if (!environment) {
        this.logger.info(`No Postman environment found for: '${name}'`);
        return;
      }

      await axios.delete(`${POSTMAN_API_URL}/environments/${environment.uid}`, {
        headers: { 'X-Api-Key': this.postmanApiKey },
        params: { workspace: this.postmanWorkspaceId },
      });

      this.logger.info(`Postman environment '${name}' deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting Postman environment '${name}':`, { error });
      throw error;
    }
  }

  async fetchCollection(name: string): Promise<PostmanCollection | undefined> {
    this.validateCredentials();

    try {
      const response = await axios.get(`${POSTMAN_API_URL}/collections?workspace=${this.postmanWorkspaceId}`, {
        headers: { 'X-Api-Key': this.postmanApiKey },
      });
      const { collections } = response.data as PostmanCollectionsResponse;
      return collections.find((collection) => collection.name === name);
    } catch (error) {
      this.logger.error(`Error fetching Postman collection '${name}':`, { error });
      throw error;
    }
  }

  async createOrUpdateCollectionFromOpenAPI(env: string, openApiUrl: string): Promise<void> {
    const collectionName = this.getCollectionName(env);
    this.validateCredentials();

    try {
      // Fetch OpenAPI spec
      this.logger.info(`Fetching OpenAPI spec from: ${openApiUrl}`);
      const openApiResponse = await axios.get(openApiUrl);
      const openApiSpec = openApiResponse.data;

      // Convert OpenAPI to Postman collection
      const conversionResult = await new Promise<ConvertResult>((resolve, reject) => {
        convert(
          { type: 'json', data: openApiSpec },
          {
            folderStrategy: 'Tags',
            requestParametersResolution: 'Schema',
            exampleParametersResolution: 'Example',
            optimizeConversion: true,
            allowUrlPathVarMatching: true,
            enableOptionalParameters: true,
            stackLimit: 50,
          },
          (error, result) => {
            if (error) {
              reject(error as Error);
            } else {
              resolve(result);
            }
          },
        );
      });

      if (!conversionResult.result) {
        throw new Error(`Failed to convert OpenAPI spec: ${conversionResult.reason}`);
      }

      const postmanCollection = conversionResult.output[0].data;
      postmanCollection.info!.name = collectionName;

      const existingCollection = await this.fetchCollection(collectionName);
      const method = existingCollection ? 'put' : 'post';
      const url = existingCollection
        ? `${POSTMAN_API_URL}/collections/${existingCollection.uid}`
        : `${POSTMAN_API_URL}/collections`;

      await axios[method](
        url,
        { collection: postmanCollection },
        {
          headers: this.headers,
          params: { workspace: this.postmanWorkspaceId },
        },
      );

      this.logger.info(
        `Postman collection '${collectionName}' ${existingCollection ? 'updated' : 'created'} successfully from OpenAPI spec`,
      );
    } catch (error) {
      this.logger.error(`Error creating/updating Postman collection '${collectionName}' from OpenAPI:`, { error });
      throw error;
    }
  }

  async removeCollection(env: string): Promise<void> {
    const name = this.getCollectionName(env);
    this.validateCredentials();

    try {
      const collection = await this.fetchCollection(name);
      if (!collection) {
        this.logger.info(`No Postman collection found for: '${name}'`);
        return;
      }

      await axios.delete(`${POSTMAN_API_URL}/collections/${collection.uid}`, {
        headers: { 'X-Api-Key': this.postmanApiKey },
      });

      this.logger.info(`Postman collection '${name}' deleted successfully`);
    } catch (error) {
      this.logger.error(`Error deleting Postman collection '${name}':`, { error });
      throw error;
    }
  }
}
