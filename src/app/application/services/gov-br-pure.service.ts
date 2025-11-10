import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GovBrUser } from '../../domain/gov-br-user';
import { PkceUtil } from '../../infrastructure/pkce.util';

/**
 * Pure implementation (without external libraries) of the Gov.br authentication service.
 * Uses OAuth 2.0 with OpenID Connect and PKCE for secure authentication.
 */
@Injectable()
export class GovBrPureService {
  private readonly logger = new Logger(GovBrPureService.name);

  private readonly urlProvider: string;
  private readonly urlService: string;
  private readonly redirectUri: string;
  private readonly scopes: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly logoutUri: string;

  constructor(private httpService: HttpService) {
    this.urlProvider = process.env.GOVBR_URL_PROVIDER || '';
    this.urlService = process.env.GOVBR_URL_SERVICE || '';
    this.redirectUri = process.env.GOVBR_REDIRECT_URI || '';
    this.scopes = process.env.GOVBR_SCOPES || '';
    this.clientId = process.env.GOVBR_CLIENT_ID || '';
    this.clientSecret = process.env.GOVBR_CLIENT_SECRET || '';
    this.logoutUri = process.env.GOVBR_LOGOUT_URI || '';

    if (
      !this.urlProvider ||
      !this.urlService ||
      !this.redirectUri ||
      !this.scopes ||
      !this.clientId ||
      !this.clientSecret ||
      !this.logoutUri
    ) {
      throw new Error('Missing environment variables');
    }
  }

  getLoginUrl(session: any): string {
    // Generate security parameters: state, nonce and PKCE
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const codeVerifier = PkceUtil.generateCodeVerifier();
    const codeChallenge = PkceUtil.generateCodeChallenge(codeVerifier);

    // Store in session for later validation
    session.oauth_state = state;
    session.oauth_nonce = nonce;
    session.code_verifier = codeVerifier;

    // Build the authorization URL with all necessary parameters
    const authorizeUrl =
      this.urlProvider +
      '/authorize?' +
      'response_type=code&' +
      'client_id=' +
      encodeURIComponent(this.clientId) +
      '&' +
      'scope=' +
      encodeURIComponent(this.scopes) +
      '&' +
      'redirect_uri=' +
      encodeURIComponent(this.redirectUri) +
      '&' +
      'nonce=' +
      encodeURIComponent(nonce) +
      '&' +
      'state=' +
      encodeURIComponent(state) +
      '&' +
      'code_challenge=' +
      encodeURIComponent(codeChallenge) +
      '&' +
      'code_challenge_method=S256';

    this.logger.log(`Redirecting to authorize: ${authorizeUrl}`);
    return authorizeUrl;
  }

  async handleCallback(request: any, session: any): Promise<any> {
    const code = request.query.code;
    const state = request.query.state;
    const error = request.query.error;
    const errorDescription = request.query.error_description;

    // Check if there was an error in the callback
    if (error) {
      const errorResponse = {
        error,
        error_description: errorDescription,
        state,
      };
      this.logger.error(`OAuth error: ${JSON.stringify(errorResponse)}`);
      return { status: 400, body: errorResponse };
    }

    // Validate the state to prevent CSRF attacks
    const sessionState = session.oauth_state;
    if (state !== sessionState) {
      throw new Error('Invalid state');
    }

    const codeVerifier = session.code_verifier;

    // Exchange the authorization code for access tokens
    const tokenUrl = this.urlProvider + '/token';

    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization:
        'Basic ' +
        Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
    };

    const body = new URLSearchParams();
    body.append('grant_type', 'authorization_code');
    body.append('code', code);
    body.append('redirect_uri', this.redirectUri);
    body.append('code_verifier', codeVerifier);

    this.logger.log(`Exchanging code for token: ${body.toString()}`);
    const tokenResponse = await firstValueFrom(
      this.httpService.post(tokenUrl, body.toString(), { headers }),
    );
    this.logger.log(`Token response: ${JSON.stringify(tokenResponse.data)}`);

    // Extract the access_token from the JSON response
    const tokenJson = tokenResponse.data;
    const accessToken = tokenJson.access_token;

    // Get user information using the access_token
    const userInfoUrl = this.urlProvider + '/userinfo';
    const userHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    const userResponse = await firstValueFrom(
      this.httpService.get(userInfoUrl, { headers: userHeaders }),
    );
    this.logger.log(`User info response: ${JSON.stringify(userResponse.data)}`);

    // Convert the JSON response to GovBrUser and store in session
    const userInfo = userResponse.data as GovBrUser;
    session.user = JSON.stringify(userInfo);

    return '/';
  }

  logout(session: any): Promise<string> {
    // Invalidate the user's session
    return new Promise((resolve) => {
      session.destroy(() => {
        resolve(
          this.urlProvider +
            '/logout?post_logout_redirect_uri=' +
            encodeURIComponent(this.logoutUri),
        );
      });
    });
  }

  getUser(session: any): GovBrUser | null {
    // Retrieve the object stored in the session with the key "user"
    const obj = session.user;
    if (!obj) {
      // If no data in session, return null
      return null;
    }
    try {
      // Check if the object is a String (JSON serialized)
      if (typeof obj === 'string') {
        // Deserialize the JSON string to GovBrUser
        return JSON.parse(obj) as GovBrUser;
      } else if (typeof obj === 'object') {
        // If it's an object, return as GovBrUser
        return obj as GovBrUser;
      }
    } catch (e) {
      // Log the error in case of deserialization failure
      this.logger.error('Error deserializing user from session', e);
    }
    // Return null if unable to retrieve data
    return null;
  }
}
