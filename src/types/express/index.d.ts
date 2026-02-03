interface JwtPayload {
  userId: string;
  email: string;
  userType: string;
}

// Extend the global Express namespace to add our custom 'user' type.
declare namespace Express {
  // This tells TypeScript that the 'user' property on the Request object
  // can be EITHER our JwtPayload OR the user object defined by Passport.
  export interface Request {
    user?: JwtPayload | User;
  }

  // This extends Passport's own User type to match our JwtPayload.
  // This is the key to resolving the conflict.
  export interface User extends JwtPayload {
    // You can add any other properties that Passport might need here
  }
}