import mongoose from 'mongoose';
import { WorkspaceModel, WorkspaceDocument } from '../models/workspace.model';
import { Workspace } from '../types';

export async function getAllWorkspaces(): Promise<Workspace[]> {
  const docs = await WorkspaceModel.find().lean().exec();
  return docs.map(doc => ({ ...doc, id: (doc as any)._id.toString() })) as Workspace[];
}

export async function getWorkspaceById(id: string): Promise<Workspace | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await WorkspaceModel.findById(id).lean().exec();
  if (!doc) return null;
  return { ...doc, id: (doc as any)._id.toString() } as Workspace;
}

export async function createWorkspace(data: Pick<Workspace, "name" | "imageUrl">): Promise<Workspace> {
  const doc = await WorkspaceModel.create(data);
  const workspace = doc.toObject();
  return { ...workspace, id: (doc as any)._id.toString() } as Workspace;
}

export async function updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await WorkspaceModel.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean().exec();
  if (!doc) return null;
  return { ...doc, id: (doc as any)._id.toString() } as Workspace;
}

export async function deleteWorkspace(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await WorkspaceModel.findByIdAndDelete(id).exec();
  return !!result;
}
