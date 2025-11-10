import { randomBytes, createHash } from 'crypto';

/**
 * Utilitário para gerar parâmetros PKCE (Proof Key for Code Exchange).
 * Usado para aumentar a segurança no fluxo OAuth 2.0.
 */
export class PkceUtil {
  /**
   * Gera um code verifier aleatório.
   * É uma string base64url de 32 bytes.
   *
   * @returns Code verifier gerado.
   */
  static generateCodeVerifier(): string {
    const codeVerifier = randomBytes(32);
    return codeVerifier.toString('base64url');
  }

  /**
   * Gera o code challenge a partir do code verifier.
   * Usa SHA-256 para criar o hash e codifica em base64url.
   *
   * @param codeVerifier Code verifier usado para gerar o challenge.
   * @returns Code challenge gerado.
   */
  static generateCodeChallenge(codeVerifier: string): string {
    const hash = createHash('sha256');
    hash.update(codeVerifier, 'ascii');
    return hash.digest('base64url');
  }
}
