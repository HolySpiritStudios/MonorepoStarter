import axios from 'axios';

// Define the type of the input parameters required for the request.
interface ExampleRequestProps {
  url: string;
}

// Define the type of the response expected from the request.
interface ExampleResponseType {
  // Define the structure of the expected response
  exampleField: string;
}

// Export a function to setup any other request. If we need to call GRAPHQL request, refer to the ExampleMutationRequest.ts and ExampleQueryRequest.ts files.
export const anotherExampleRequest = async ({ url }: ExampleRequestProps): Promise<ExampleResponseType | null> => {
  try {
    // For example, execute the HTTP GET request using Axios.
    const response = await axios.get<ExampleResponseType>(url, { validateStatus: () => true });

    // Return the response data if the request was successful.
    return response?.data ?? null;
  } catch (_e) {
    // Handle any errors that occur during the request.
    return null;
  }
};
