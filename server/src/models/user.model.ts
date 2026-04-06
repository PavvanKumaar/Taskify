import mongoose, { Schema, Document, Model } from 'mongoose';
import { User, JwtPayload } from '../types';

// Extend for Mongoose
export interface UserDocument extends User, Document {}

// Schema
const UserSchema: Schema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatarUrl: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  workspaceId: { type: mongoose.Schema.Types.ObjectId as any, ref: 'Workspace', required: true },
}, { timestamps: true });

// Virtual id
UserSchema.virtual('id').get(function(this: UserDocument) {
  return this._id.toString();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.index({ email: 1 });
UserSchema.index({ workspaceId: 1 });

export const UserModel: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);

