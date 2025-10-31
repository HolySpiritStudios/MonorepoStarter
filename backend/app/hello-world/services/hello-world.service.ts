import { getAppLogger } from '../../common/utils/logger.util';
import { HelloWorldResponse } from '../models/hello-world.model';

const logger = getAppLogger('hello-world-service');

export class HelloWorldService {
  getHelloWorld(): Promise<HelloWorldResponse> {
    logger.info('Fetching hello world message');

    return Promise.resolve({
      message: 'Hello World!',
      timestamp: new Date().toISOString(),
    });
  }
}
