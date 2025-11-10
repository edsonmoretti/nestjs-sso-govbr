import { Controller, Get, Req, Res, HttpStatus, Logger } from '@nestjs/common';
import type { Response, Request } from 'express';
import { GovBrPureService } from '../../application/services/gov-br-pure.service';

/**
 * Controller responsável por gerenciar as rotas de autenticação OAuth 2.0 com Gov.br.
 * Usa um serviço de autenticação injetado para processar login, callback, logout e recuperação de usuário.
 */
@Controller()
export class OAuthController {
  private readonly logger = new Logger(OAuthController.name);

  constructor(private readonly authService: GovBrPureService) {}

  /**
   * Redireciona para a página de informações do usuário.
   *
   * @returns Redirecionamento para /user.
   */
  @Get('/')
  index(@Res() res: Response) {
    res.redirect('/user');
  }

  /**
   * Retorna as informações do usuário logado ou uma mensagem de erro se não estiver logado.
   *
   * @param req Requisição com sessão.
   * @param res Resposta.
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
   * Inicia o processo de login, redirecionando para a URL de autorização do Gov.br.
   *
   * @param req Requisição com sessão.
   * @param res Resposta.
   */
  @Get('/login')
  login(@Req() req: Request, @Res() res: Response) {
    try {
      const loginUrl = this.authService.getLoginUrl(req.session);
      res.redirect(loginUrl);
    } catch (error) {
      this.logger.error('Erro ao gerar URL de login', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erro ao gerar URL de login',
      });
    }
  }

  /**
   * Processa o callback do Gov.br após a autenticação.
   * Pode retornar um erro ou redirecionar para a página inicial.
   *
   * @param req Requisição com parâmetros do callback.
   * @param res Resposta.
   */
  @Get('/openid')
  async callback(@Req() req: Request, @Res() res: Response) {
    try {
      const result = await this.authService.handleCallback(req, req.session);
      if (typeof result === 'object' && result.status) {
        // Resposta de erro
        res.status(result.status).json(result.body);
      } else if (typeof result === 'string') {
        // URL de redirecionamento
        res.redirect(result);
      } else {
        res.redirect('/');
      }
    } catch (error) {
      this.logger.error('Erro no processamento do callback', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: 'Erro no processamento do callback',
      });
    }
  }

  /**
   * Faz logout da sessão do usuário e redireciona para a URL de logout do Gov.br.
   *
   * @param req Requisição com sessão.
   * @param res Resposta.
   */
  @Get('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    const logoutUrl = await this.authService.logout(req.session);
    res.redirect(logoutUrl);
  }

  /**
   * Faz logout do usuário e redireciona para a página inicial.
   *
   * @param res Resposta.
   */
  @Get('/logout/govbr')
  logoutGovBrCallback(@Res() res: Response) {
    res.redirect('/');
  }
}
