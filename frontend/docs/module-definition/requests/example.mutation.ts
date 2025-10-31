import { getRestClientUtil } from '../../../src/main/utils/clients/rest-client.util.ts';
// Define the type of the input parameters required for the request.
import { ExampleInput, ExampleOutput } from '../types/example-request.type.ts';

export const exampleMutationRequest = async (props: ExampleInput): Promise<ExampleOutput> => {
  // Get an instance of the client. You can configure the client to use authentication if required.
  const client = getRestClientUtil();

  try {
    // Execute the mutation with the provided input parameters.
    const response = await client.post<ExampleOutput, ExampleInput>('/example-mutation', props, { useAuth: true });

    // Return the response from the mutation.
    return response;
  } catch (error) {
    // Handle the error
    throw error;
  }
};
