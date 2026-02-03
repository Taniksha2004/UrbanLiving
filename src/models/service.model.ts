import mongoose, { Schema, Document, Model } from 'mongoose';

// 1️⃣ TypeScript Interface for Service fields
export interface IService extends Document {

 vendorId: mongoose.Schema.Types.ObjectId;
  name: string;
  description: string;
  category: string;

  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  serviceArea?: string;

  price?: number;
  priceRange?: string;
  priceType?: string;
  minimumOrder?: string;
  deliveryCharges?: string;

  specialties?: string[];
  timing?: {
    openTime?: string;
    closeTime?: string;
    workingDays?: string[];
  };

  images?: string[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;

  features?: string[];
  policies?: string;

  // Fallback/compatibility
  location?: string;
  contact?: string;
}

// 2️⃣ Mongoose Schema
const TimingSchema = new Schema(
  {
    openTime: String,
    closeTime: String,
    workingDays: [String]
  },
  { _id: false }
);

const ServiceSchema = new Schema<IService>(
  {
     vendorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },

    address: String,
    city: String,
    state: String,
    pincode: String,
    serviceArea: String,

    price: Number,
    priceRange: String,
    priceType: String,
    minimumOrder: String,
    deliveryCharges: String,

    specialties: [String],
    timing: TimingSchema,

    images: [String],

    contactName: String,
    contactPhone: String,
    contactEmail: String,
    whatsapp: String,

    features: [String],
    policies: String,

    location: String,
    contact: String
  },
  {
    timestamps: true // Adds createdAt/updatedAt
  }
);

// 3️⃣ Export Model
export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
