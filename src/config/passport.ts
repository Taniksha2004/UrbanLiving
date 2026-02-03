import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { findOrCreateUser } from '../services/auth.service';
import { IUser } from '../models/user.model'; // Assuming IUser is your user model interface

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/auth/google/callback" // Make sure this matches your Google Cloud console
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const user: IUser = await findOrCreateUser(profile);
      
      // ✅ CRITICAL FIX: Create a payload that perfectly matches our global Express.User type.
      const payload: Express.User = {
        userId: user.id, // Use user.id (the string version) instead of user._id
        email: user.email,
        userType: user.userType || 'student' // Ensure there's a default userType
      };

      // Passport will now attach this clean, correctly typed object to req.user.
      return done(null, payload); 

    } catch (err) {
      return done(err);
    }
  }
));

// This function tells Passport what data to store in the session.
// We're storing our clean payload object.
passport.serializeUser((user, done) => {
  done(null, user);
});

// This function tells Passport how to retrieve the user data from the session.
// We receive the payload object back.
passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export default passport;