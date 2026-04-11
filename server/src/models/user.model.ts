import mongoose, { Schema, Document, Model } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  avatarUrl: string;
  passwordHash: string;
  role: 'admin' | 'member';
  workspaceId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema<UserDocument>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatarUrl: { type: String, default: '' },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
}, { timestamps: true });

UserSchema.virtual('id').get(function(this: UserDocument) {
  return this._id.toString();
});

UserSchema.set('toJSON', { virtuals: true });
UserSchema.set('toObject', { virtuals: true });

UserSchema.index({ workspaceId: 1 });

export const UserModel: Model<UserDocument> = mongoose.models.User || mongoose.model<UserDocument>('User', UserSchema);
