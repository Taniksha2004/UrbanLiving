import mongoose, { Schema, Document } from 'mongoose';

// Interface for the nested 'timing' object
export interface ITiming {
  checkIn: string;
  checkOut: string;
  visitingHours: string;
}

// Main interface for the Property document
export interface IProperty extends Document {
  ownerId: mongoose.Schema.Types.ObjectId; // Reference to User model
  title: string;
  description: string;
  propertyType: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  rent: number; // Changed from price to rent
  deposit: number;
  maintenance?: number;
  electricityIncluded: boolean;
  totalRooms: number;
  availableRooms: number;
  roomType: string;
  bathrooms: number;
  amenities: string[];
  images: string[];
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  rules: string[];
  timing: ITiming;
  // Optional fields for display
  rating?: number;
  reviews?: number;
  badges?: string[];
  availability?: string;
}

const TimingSchema: Schema = new Schema({
  checkIn: { type: String, default: '' },
  checkOut: { type: String, default: '' },
  visitingHours: { type: String, default: '' },
}, { _id: false });


const PropertySchema: Schema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // Basic Info
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  propertyType: { type: String, required: true, enum: ['pg', 'hostel', 'co-living', 'apartment'] },
  gender: { type: String, required: true, enum: ['co-ed', 'male', 'female'] },

  // Location
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  landmark: { type: String },

  // Pricing
  rent: { type: Number, required: true }, // ✅ FIXED: Changed 'price' to 'rent'
  deposit: { type: Number, required: true },
  maintenance: { type: Number, default: 0 },
  electricityIncluded: { type: Boolean, default: false },

  // Details
  totalRooms: { type: Number, required: true },
  availableRooms: { type: Number, required: true },
  roomType: { type: String, required: true, enum: ['shared', 'double', 'single', 'mixed'] },
  bathrooms: { type: Number, required: true },

  // Amenities & Images
  amenities: [{ type: String }],
  images: [{ type: String }],

  // Contact
  contactName: { type: String, required: true },
  contactPhone: { type: String, required: true },
  contactEmail: { type: String, required: true },

  // Rules & Timings
  rules: [{ type: String }],
  timing: { type: TimingSchema, default: {} },

  // --- Optional display fields (no longer required) ---
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  badges: [{ type: String }],
  availability: { type: String, default: 'Available Now' },
  
}, {
  timestamps: true,
});

export default mongoose.model<IProperty>('Property', PropertySchema);