import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ProjectMemberDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'admin' | 'member';
  createdAt: Date;
}

const ProjectMemberSchema: Schema = new Schema<ProjectMemberDocument>({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
}, { timestamps: true });

// A user can only be a member of a project once
ProjectMemberSchema.index({ projectId: 1, userId: 1 }, { unique: true });
ProjectMemberSchema.index({ userId: 1 });

export const ProjectMemberModel: Model<ProjectMemberDocument> =
  mongoose.models.ProjectMember ||
  mongoose.model<ProjectMemberDocument>('ProjectMember', ProjectMemberSchema);
