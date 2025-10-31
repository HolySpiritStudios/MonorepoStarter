import { SSM } from '@aws-sdk/client-ssm';

export class SSMService {
  constructor(private readonly ssm: SSM = new SSM()) {}

  async getParameter(name: string): Promise<string | null> {
    try {
      const response = await this.ssm.getParameter({ Name: name });
      return response.Parameter?.Value || null;
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ParameterNotFound') {
        return null;
      }
      throw error;
    }
  }

  async setParameter(name: string, value: string, description?: string): Promise<void> {
    await this.ssm.putParameter({
      Name: name,
      Value: value,
      Type: 'String',
      Description: description,
      Overwrite: true,
    });
  }

  async deleteParameter(name: string): Promise<void> {
    try {
      await this.ssm.deleteParameter({ Name: name });
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'name' in error && error.name === 'ParameterNotFound') {
        return;
      }
      throw error;
    }
  }
}
