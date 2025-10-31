import { NotFoundError } from '../../common/utils/errors';
import { IHelloWorldController } from '../interfaces/hello-world-controller.interface';
import { HelloWorldResponse } from '../models/hello-world.model';

export class MockHelloWorldController implements IHelloWorldController {
  getHelloWorld(): Promise<HelloWorldResponse> {
    throw new NotFoundError('Mock implementation');
  }
}
