import mongoose, { Schema, Document } from 'mongoose';

// Interface for nested objects
export interface ILifestyle {
  cleanliness: number;
  socialness: number;
  nightOwl: number;
  cooking: number;
  smoking: boolean;
  drinking: boolean;
  pets: boolean;
}

export interface IAgeRange {
  min: number;
  max: number;
}

// Main Profile Interface
export interface IProfile extends Document {
  // ✅ ADD THIS LINE: This links the profile to a user
  userId: mongoose.Schema.Types.ObjectId; 

  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  occupation: string;
  bio: string;
  preferredCities: string[];
  preferredAreas: string;
  maxCommute: string;
  budgetMin: number;
  budgetMax: number;
  lifestyle: ILifestyle;
  interests: string[];
  roomType: string;
  genderPreference: string;
  ageRange: IAgeRange;
  profileImages: string[];
  languages: string[];
  workSchedule: string;
  dealBreakers: string[];
}

// Schemas for nested objects
const LifestyleSchema: Schema = new Schema({
  cleanliness: { type: Number, default: 5 },
  socialness: { type: Number, default: 5 },
  nightOwl: { type: Number, default: 5 },
  cooking: { type: Number, default: 5 },
  smoking: { type: Boolean, default: false },
  drinking: { type: Boolean, default: false },
  pets: { type: Boolean, default: false },
}, { _id: false });

const AgeRangeSchema: Schema = new Schema({
  min: { type: Number, default: 18 },
  max: { type: Number, default: 99 },
}, { _id: false });

// Main Profile Schema
const ProfileSchema: Schema = new Schema({
  // ✅ ADD THIS FIELD: This is the most important change
  userId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // This enforces the "one profile per user" rule
  },

  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  occupation: { type: String, required: true },
  bio: { type: String, required: true },
  preferredCities: [{ type: String }],
  preferredAreas: { type: String },
  maxCommute: { type: String },
  budgetMin: { type: Number, required: true },
  budgetMax: { type: Number, required: true },
  lifestyle: { type: LifestyleSchema },
  interests: [{ type: String }],
  roomType: { type: String, default: 'any' },
  genderPreference: { type: String, default: 'any' },
  ageRange: { type: AgeRangeSchema },
  profileImages: [{ type: String }],
  languages: [{ type: String }],
  workSchedule: { type: String },
  dealBreakers: [{ type: String }],
}, {
  timestamps: true,
});

export default mongoose.model<IProfile>('Profile', ProfileSchema);