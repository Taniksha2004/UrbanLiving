import jwt from 'jsonwebtoken';

/**
 * Creates a standard JWT for a successfully authenticated user.
 * @param payload The minimal user data required for the token.
 * @returns The signed JWT string.
 */
export const generateToken = (payload: JwtPayload): string => {
  const SECRET_KEY = process.env.JWT_SECRET;

  if (!SECRET_KEY) {
    throw new Error('JWT_SECRET is not configured.');
  }

  return jwt.sign(
    payload,
    SECRET_KEY,
    { expiresIn: '1d' }
  );
};
