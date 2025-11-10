import { GovBrUser } from '../../../domain/gov-br-user';

/**
 * Interface for Gov.br authentication services.
 * Defines the methods needed to implement different authentication strategies.
 */
export interface IGovBrAuthService {
  /**
   * Generates the login URL to redirect the user to the Gov.br provider.
   *
   * @param session User's HTTP session to store state and nonce.
   * @returns Complete URL for the Gov.br authorization endpoint.
   * @throws Exception If error occurs in URL generation or PKCE.
   */
  getLoginUrl(session: any): Promise<string>;

  /**
   * Processes the callback from the provider after authentication.
   * Exchanges the authorization code for tokens and gets user information.
   *
   * @param request HTTP request containing callback parameters.
   * @param session User's HTTP session.
   * @returns ResponseEntity with error or string with redirect URL.
   * @throws Exception If error occurs in processing.
   */
  handleCallback(request: any, session: any): Promise<any>;

  /**
   * Logs out the user, invalidating the session.
   *
   * @param session User's HTTP session to be invalidated.
   */
  logout(session: any): Promise<string>;

  /**
   * Retrieves the logged-in user's information from the session.
   *
   * @param session User's HTTP session.
   * @returns GovBrUser with user data or null if not logged in.
   */
  getUser(session: any): GovBrUser | null;
}
