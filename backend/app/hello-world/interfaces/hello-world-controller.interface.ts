import { HelloWorldResponse } from '../models/hello-world.model';

export interface IHelloWorldController {
  getHelloWorld(): Promise<HelloWorldResponse>;
}
