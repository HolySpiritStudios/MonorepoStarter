import {
  TimeBackConfig,
  TimeBackCredentials,
  TimeBackTokenResponse,
  timeBackTokenResponseSchema,
} from '../models/timeback.model';

const SCOPES = [
  'https://purl.imsglobal.org/spec/caliper/v1p2/scope/events.write',
  'https://purl.imsglobal.org/spec/clr/v2p0/scope/credential.upsert',
];

export class TimeBackService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number | null = null;

  constructor(
    private readonly credentials: TimeBackCredentials,
    private readonly config: TimeBackConfig,
  ) {}

  private async getValidAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.accessToken && this.tokenExpiresAt && now < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const tokenResponse = await this.fetchAccessToken();

    this.accessToken = tokenResponse.access_token;
    const expirationBuffer = (tokenResponse.expires_in || 3600) * 0.9;
    this.tokenExpiresAt = now + expirationBuffer * 1000;

    return this.accessToken;
  }

  private async fetchAccessToken(): Promise<TimeBackTokenResponse> {
    const tokenUrl = `${this.config.baseUrl}/auth/1.0/token`;
    const basicAuth = Buffer.from(
      `${this.credentials.timeBackClientId}:${this.credentials.timeBackClientSecret}`,
    ).toString('base64');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        scope: SCOPES.join(' '),
      }),
    });

    if (!response.ok) {
      throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
    }

    const tokenData = await response.json();
    return timeBackTokenResponseSchema.parse(tokenData);
  }
}
