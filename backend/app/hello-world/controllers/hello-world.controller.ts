import { getAppLogger } from '../../common/utils/logger.util';
import { IHelloWorldController } from '../interfaces/hello-world-controller.interface';
import { HelloWorldResponse } from '../models/hello-world.model';
import { HelloWorldService } from '../services/hello-world.service';

const logger = getAppLogger('hello-world-controller');

export class HelloWorldController implements IHelloWorldController {
  constructor(private readonly helloWorldService: HelloWorldService) {}

  async getHelloWorld(): Promise<HelloWorldResponse> {
    logger.info('Received hello world request');
    return this.helloWorldService.getHelloWorld();
  }
}
