import { GovBrUser } from '../../../domain/gov-br-user';

/**
 * Interface para serviços de autenticação Gov.br.
 * Define os métodos necessários para implementar diferentes estratégias de autenticação.
 */
export interface IGovBrAuthService {
  /**
   * Gera a URL de login para redirecionar o usuário para o provedor Gov.br.
   *
   * @param session Sessão HTTP do usuário para armazenar state e nonce.
   * @returns URL completa para o endpoint de autorização do Gov.br.
   * @throws Exceção se ocorrer erro na geração da URL ou PKCE.
   */
  getLoginUrl(session: any): Promise<string>;

  /**
   * Processa o callback do provedor após a autenticação.
   * Troca o código de autorização por tokens e obtém informações do usuário.
   *
   * @param request Requisição HTTP contendo parâmetros do callback.
   * @param session Sessão HTTP do usuário.
   * @returns ResponseEntity com erro ou string com URL de redirecionamento.
   * @throws Exceção se ocorrer erro no processamento.
   */
  handleCallback(request: any, session: any): Promise<any>;

  /**
   * Faz logout do usuário, invalidando a sessão.
   *
   * @param session Sessão HTTP do usuário a ser invalidada.
   */
  logout(session: any): Promise<string>;

  /**
   * Recupera as informações do usuário logado da sessão.
   *
   * @param session Sessão HTTP do usuário.
   * @returns GovBrUser com dados do usuário ou null se não estiver logado.
   */
  getUser(session: any): GovBrUser | null;
}
