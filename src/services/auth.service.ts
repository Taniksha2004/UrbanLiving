import User, { IUser } from '../models/user.model';

/**
 * Finds a user by googleId or email, or creates a new one if none exists.
 * @param profile The Google profile object.
 * @returns The found or newly created user document.
 */
export const findOrCreateUser = async (profile: any): Promise<IUser> => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    if (user) {
      user.firstName = profile.name.givenName;
      user.lastName = profile.name.familyName;
      user.avatarUrl = profile.photos?.[0]?.value;
      await user.save();
      return user;
    }

    user = await User.findOne({ email: profile.emails?.[0]?.value });

    if (user) {
      user.googleId = profile.id;
      user.firstName = profile.name.givenName;
      user.lastName = profile.name.familyName;
      user.avatarUrl = profile.photos?.[0]?.value;
      await user.save();
      return user;
    }

    const newUser = new User({
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails?.[0]?.value,
      avatarUrl: profile.photos?.[0]?.value,
      userType: 'student', // Default value provided
      agreeToTerms: true,  // Default value provided
      password: 'google-auth-user',
    });
    await newUser.save();
    return newUser;
  } catch (error) {
    console.error("Error in find OrCreateUser:", error);
    throw new Error('Error finding or creating user: ' + error);
  }
};
export default { findOrCreateUser };