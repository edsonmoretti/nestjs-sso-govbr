import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { GovBrUser } from '../../domain/gov-br-user';
import { PkceUtil } from '../../infrastructure/pkce.util';

/**
 * Implementação pura (sem bibliotecas externas) do serviço de autenticação Gov.br.
 * Usa OAuth 2.0 com OpenID Connect e PKCE para autenticação segura.
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
      throw new Error('Variáveis de ambiente ausentes');
    }
  }

  getLoginUrl(session: any): string {
    // Gera parâmetros de segurança: state, nonce e PKCE
    const state = crypto.randomUUID();
    const nonce = crypto.randomUUID();
    const codeVerifier = PkceUtil.generateCodeVerifier();
    const codeChallenge = PkceUtil.generateCodeChallenge(codeVerifier);

    // Armazena na sessão para validação posterior
    session.oauth_state = state;
    session.oauth_nonce = nonce;
    session.code_verifier = codeVerifier;

    // Monta a URL de autorização com todos os parâmetros necessários
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

    this.logger.log(`Redirecionando para autorização: ${authorizeUrl}`);
    return authorizeUrl;
  }

  async handleCallback(request: any, session: any): Promise<any> {
    const code = request.query.code;
    const state = request.query.state;
    const error = request.query.error;
    const errorDescription = request.query.error_description;

    // Verifica se houve erro no callback
    if (error) {
      const errorResponse = {
        error,
        error_description: errorDescription,
        state,
      };
      this.logger.error(`Erro OAuth: ${JSON.stringify(errorResponse)}`);
      return { status: 400, body: errorResponse };
    }

    // Valida o state para prevenir ataques CSRF
    const sessionState = session.oauth_state;
    if (state !== sessionState) {
      throw new Error('State inválido');
    }

    const codeVerifier = session.code_verifier;

    // Troca o código de autorização por tokens de acesso
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

    this.logger.log(`Trocando código por token: ${body.toString()}`);
    const tokenResponse = await firstValueFrom(
      this.httpService.post(tokenUrl, body.toString(), { headers }),
    );
    this.logger.log(`Resposta do token: ${JSON.stringify(tokenResponse.data)}`);

    // Extrai o access_token da resposta JSON
    const tokenJson = tokenResponse.data;
    const accessToken = tokenJson.access_token;

    // Obtém informações do usuário usando o access_token
    const userInfoUrl = this.urlProvider + '/userinfo';
    const userHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    const userResponse = await firstValueFrom(
      this.httpService.get(userInfoUrl, { headers: userHeaders }),
    );
    this.logger.log(
      `Resposta das informações do usuário: ${JSON.stringify(userResponse.data)}`,
    );

    // Converte a resposta JSON para GovBrUser e armazena na sessão
    const userInfo = userResponse.data as GovBrUser;
    session.user = JSON.stringify(userInfo);

    return '/';
  }

  logout(session: any): Promise<string> {
    // Invalida a sessão do usuário
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
    // Recupera o objeto armazenado na sessão com a chave "user"
    const obj = session.user;
    if (!obj) {
      // Se não há dados na sessão, retorna null
      return null;
    }
    try {
      // Verifica se o objeto é uma String (JSON serializado)
      if (typeof obj === 'string') {
        // Desserializa a string JSON para GovBrUser
        return JSON.parse(obj) as GovBrUser;
      } else if (typeof obj === 'object') {
        // Se é um objeto, retorna como GovBrUser
        return obj as GovBrUser;
      }
    } catch (e) {
      // Registra o erro em caso de falha na desserialização
      this.logger.error('Erro ao desserializar usuário da sessão', e);
    }
    // Retorna null se não conseguir recuperar os dados
    return null;
  }
}
