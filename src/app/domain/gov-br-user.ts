export class GovBrUser {
  sub: string;
  name: string;
  profile: string;
  picture: string;
  email: string;
  emailVerified: boolean;
  phoneNumber: string;
  phoneNumberVerified: boolean;

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
