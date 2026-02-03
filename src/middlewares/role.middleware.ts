import { Request, Response, NextFunction } from 'express';

export const checkRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    
    // ✅ This check now confirms that req.user exists AND has the 'userType' property.
    // This satisfies TypeScript and makes our code safer.
    if (!req.user || !('userType' in req.user) || typeof req.user.userType !== 'string') {
      return res.status(403).json({ message: 'Access denied: Role information is missing or invalid.' });
    }

    const userRole = req.user.userType;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ message: 'Access denied: Insufficient privileges.' });
    }

    next();
  };
};