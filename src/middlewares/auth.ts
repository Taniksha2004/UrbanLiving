import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// ❗ DELETED the local 'JwtPayload' and 'AuthRequest' interfaces from this file.
//    We now rely exclusively on the global types in 'src/types/express/index.d.ts'.

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const SECRET_KEY = process.env.JWT_SECRET;

  console.log("--- Secret Key Used by Middleware ---");
  console.log(`'${SECRET_KEY}'`); // Added quotes to see spaces/undefined
  console.log("-----------------------------------");

  if (!SECRET_KEY) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    return res.status(500).json({ message: 'Internal Server Error: JWT secret not configured.' });
  }

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];

    try {
        // We cast the decoded object to our global Express.User type for consistency.
        const decoded = jwt.verify(token, SECRET_KEY) as Express.User;
        req.user = decoded;
        next();
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return res.status(401).json({ message: 'Unauthorized: Token has expired.' });
        }
        return res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
  } else {
    return res.status(401).json({ message: 'Unauthorized: No token provided or malformed header.' });
  }
};