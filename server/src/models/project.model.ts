import mongoose, { Schema, Document, Model } from 'mongoose';
import { Project } from '../types';

export interface ProjectDocument extends Project, Document {}

const ProjectSchema: Schema = new Schema<ProjectDocument>({
  name: { type: String, required: true, trim: true },
  workspaceId: { type: mongoose.Schema.Types.ObjectId as any, ref: 'Workspace', required: true },
  imageUrl: { type: String, default: '' },
}, { timestamps: true });

ProjectSchema.virtual('id').get(function(this: ProjectDocument) {
  return this._id.toString();
});

ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

ProjectSchema.index({ workspaceId: 1 });

export const ProjectModel: Model<ProjectDocument> = mongoose.models.Project || mongoose.model<ProjectDocument>('Project', ProjectSchema);

