import { getRestClientUtil } from '../../../src/main/utils/clients/rest-client.util.ts';
// Define the type of the input parameters required for the request.
import { ExampleQueryInput, ExampleQueryOutput } from '../types/example-request.type.ts';

// Export a function to execute the query request.
export const exampleQueryRequest = async (props: ExampleQueryInput): Promise<ExampleQueryOutput | undefined> => {
  // Get an instance of the client. You can configure the client to use authentication if required.
  const client = getRestClientUtil();

  try {
    // Execute the query with the provided input parameters.
    const result = await client.get<ExampleQueryOutput, ExampleQueryInput>('/example-query', props, ['exampleQuery'], {
      useAuth: true,
    });

    // Return the response from the query.
    return result;
  } catch (error) {
    // Handle the error
    throw error;
  }
};
