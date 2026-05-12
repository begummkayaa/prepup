import jwt from 'jsonwebtoken';

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export function signAccessToken(
  payload: AccessTokenPayload,
  secret: string,
  expiresIn: jwt.SignOptions['expiresIn']
): string {
  return jwt.sign(payload, secret, { expiresIn });
}
