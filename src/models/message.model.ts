import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
  sender: mongoose.Schema.Types.ObjectId;
  receiver: mongoose.Schema.Types.ObjectId;
  content: string;
  timestamp: Date;
}

const MessageSchema: Schema = new Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
