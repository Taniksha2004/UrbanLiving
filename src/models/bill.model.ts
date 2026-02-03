import mongoose, { Document, Schema } from 'mongoose';

export interface IBill extends Document {
  title: string;
  description?: string;
  amount: number;
  paidBy: string; // userId
  category: string;
  date: Date;
  status: 'pending' | 'settled';
  splitType: 'equal' | 'custom';
  splitBetween: string[]; // Array of userIds
  customSplits?: Record<string, number>; // userId -> amount mapping
  createdAt: Date;
  updatedAt: Date;
}

const BillSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    amount: { type: Number, required: true },
    paidBy: { type: String, required: true }, // userId
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'settled'], default: 'pending' },
    splitType: { type: String, enum: ['equal', 'custom'], default: 'equal' },
    splitBetween: { type: [String], required: true }, // Array of userIds
    customSplits: { type: Object }, // userId -> amount mapping
  },
  { timestamps: true }
);

const Bill = mongoose.model<IBill>('Bill', BillSchema);

export default Bill;