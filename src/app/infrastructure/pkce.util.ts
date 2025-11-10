import { randomBytes, createHash } from 'crypto';

export class PkceUtil {
  static generateCodeVerifier(): string {
    const codeVerifier = randomBytes(32);
    return codeVerifier.toString('base64url');
  }

  static generateCodeChallenge(codeVerifier: string): string {
    const hash = createHash('sha256');
    hash.update(codeVerifier, 'ascii');
    return hash.digest('base64url');
  }
}
