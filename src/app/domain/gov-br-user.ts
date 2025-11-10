/**
 * Classe que representa um usuário do Gov.br.
 * Contém informações básicas do usuário obtidas via OAuth.
 */
export class GovBrUser {
  sub: string;
  name: string;
  profile: string;
  picture: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;

  /**
   * Construtor da classe GovBrUser.
   * Inicializa as propriedades com os valores fornecidos.
   *
   * @param sub Identificador único do usuário.
   * @param name Nome completo do usuário.
   * @param profile URL do perfil do usuário.
   * @param picture URL da foto do usuário.
   * @param email Endereço de e-mail do usuário.
   * @param emailVerified Indica se o e-mail foi verificado.
   * @param phoneNumber Número de telefone do usuário.
   * @param phoneNumberVerified Indica se o telefone foi verificado.
   */
  constructor(
    sub: string,
    name: string,
    profile: string,
    picture: string,
    email: string,
    emailVerified: boolean,
    phoneNumber: string,
    phoneNumberVerified: boolean,
  ) {
    this.sub = sub;
    this.name = name;
    this.profile = profile;
    this.picture = picture;
    this.email = email;
    this.emailVerified = emailVerified;
    this.phoneNumber = phoneNumber;
    this.phoneNumberVerified = phoneNumberVerified;
  }
}
