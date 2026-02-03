import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password?: string;
  googleId?: string;
  userType?: string;
  avatarUrl?: string;
  agreeToTerms?: boolean;
  likedProfiles?: string[]; // ✅ Array of profile IDs that the user has liked
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String },
  googleId: { type: String, unique: true, sparse: true },
  userType: { type: String, enum: ['student', 'professional', 'property-owner', 'vendor'] },
  avatarUrl: { type: String, default: '' },
  agreeToTerms: { type: Boolean },
  likedProfiles: { type: [String], default: [] }, // ✅ Add likedProfiles field
});

const User = mongoose.model<IUser>('User', UserSchema);

export default User;
