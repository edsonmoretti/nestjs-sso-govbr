import { Controller, Get, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Response, Request } from 'express';
import { GovBrPureService } from '../../application/services/gov-br-pure.service';

/**
 * Controller responsible for managing OAuth 2.0 authentication routes with Gov.br.
 * Uses an injected authentication service to process login, callback, logout, and user retrieval.
 */
@Controller()
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly authService: GovBrPureService) {}

  /**
   * Redirects to the user information page.
   *
   * @returns Redirect to /user.
   */
  @Get('/')
  index(@Res() res: Response) {
    res.redirect('/user');
  }

  /**
   * Returns the logged-in user's information or an error message if not logged in.
   *
   * @param req Request with session.
   * @param res Response.
   */
  @Get('/user')
  user(@Req() req: Request, @Res() res: Response) {
    const user = this.authService.getUser(req.session);
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({
        error: 'Usuário não logado',
        code: 401,
      });
    }
    res.json(user);
  }

  /**
   * Initiates the login process, redirecting to the Gov.br authorization URL.
   *
   * @param req Request with session.
   * @param res Response.
   */
  @Get('/login')
  async login(@Req() req: Request, @Res() res: Response) {
    try {
      const loginUrl = await this.authService.getLoginUrl(req.session);
      res.redirect(loginUrl);
    } catch (error) {
      this.logger.error('Error generating login URL', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erro ao gerar URL de login',
      });
    }
  }

  /**
   * Processes the Gov.br callback after authentication.
   * Can return an error or redirect to the home page.
   *
   * @param req Request with callback parameters.
   * @param res Response.
   */
  @Get('/openid')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authService.handleCallback(req, req.session);
      if (typeof result === 'object' && result.status) {
        // Error response
        res.status(result.status).json(result.body);
      } else if (typeof result === 'string') {
        // Redirect URL
        res.redirect(result);
      } else {
        res.redirect('/');
      }
    } catch (error) {
      this.logger.error('Error processing callback', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erro no processamento do callback',
      });
    }
  }

  /**
   * Logs out the user's session and redirects to the Gov.br logout URL.
   *
   * @param req Request with session.
   * @param res Response.
   */
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const logoutUrl = await this.authService.logout(req.session);
    res.redirect(logoutUrl);
  }

  /**
   * Logs out the user and redirects to the home page.
   *
   * @param res Response.
   */
  @Get('/logout/govbr')
  logoutGovBrCallback(@Res() res: Response) {
    res.redirect('/');
  }
}
