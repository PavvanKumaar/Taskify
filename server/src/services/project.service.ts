import mongoose from 'mongoose';
import { ProjectModel, ProjectDocument } from '../models/project.model';
import { ProjectMemberModel } from '../models/project-member.model';
import { UserModel } from '../models/user.model';
import { Project, Member } from '../types';

function docToProject(doc: any): Project {
  return { ...doc, id: (doc._id ?? doc.id).toString() } as Project;
}

/** Projects the given user is a member of */
export async function getProjectsForUser(userId: string): Promise<Project[]> {
  const memberships = await ProjectMemberModel.find({ userId }).lean().exec();
  const projectIds = memberships.map((m) => m.projectId);
  const docs = await ProjectModel.find({ _id: { $in: projectIds } }).lean().exec();
  return docs.map(docToProject);
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await ProjectModel.findById(id).lean().exec();
  if (!doc) return null;
  return docToProject(doc);
}

/** Create a project and auto-add creator as admin member */
export async function createProject(
  data: Pick<Project, 'name' | 'workspaceId' | 'imageUrl'>,
  creatorUserId: string
): Promise<Project> {
  const doc = await ProjectModel.create(data);
  const project = doc.toObject() as ProjectDocument;
  const projectId = project._id!.toString();

  // Creator is always the project admin
  await ProjectMemberModel.create({
    projectId,
    userId: creatorUserId,
    role: 'admin',
  });

  return docToProject(project);
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await ProjectModel.findByIdAndUpdate(
    id, data, { returnDocument: 'after', runValidators: true }
  ).lean().exec();
  if (!doc) return null;
  return docToProject(doc);
}

export async function deleteProject(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await ProjectModel.findByIdAndDelete(id).exec();
  if (result) {
    // Clean up all memberships for this project
    await ProjectMemberModel.deleteMany({ projectId: id });
  }
  return !!result;
}

/** Get all members of a project (with user details) */
export async function getProjectMembers(projectId: string): Promise<(Member & { projectRole: 'admin' | 'member' })[]> {
  const memberships = await ProjectMemberModel.find({ projectId }).lean().exec();
  const userIds = memberships.map((m) => m.userId);
  const users = await UserModel.find({ _id: { $in: userIds } }).select('-passwordHash').lean().exec();

  return memberships.map((m) => {
    const user = users.find((u) => u._id.toString() === m.userId.toString());
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      role: user.role,
      projectRole: m.role,
    };
  }).filter(Boolean) as (Member & { projectRole: 'admin' | 'member' })[];
}

/** Add a user to a project */
export async function addProjectMember(
  projectId: string,
  userId: string,
  role: 'admin' | 'member' = 'member'
): Promise<boolean> {
  try {
    await ProjectMemberModel.create({ projectId, userId, role });
    return true;
  } catch (e: any) {
    if (e.code === 11000) return false; // already a member
    throw e;
  }
}

/** Remove a user from a project */
export async function removeProjectMember(projectId: string, userId: string): Promise<boolean> {
  const result = await ProjectMemberModel.findOneAndDelete({ projectId, userId }).exec();
  return !!result;
}

/** Check if a user is an admin of a project */
export async function isProjectAdmin(projectId: string, userId: string): Promise<boolean> {
  const membership = await ProjectMemberModel.findOne({ projectId, userId, role: 'admin' }).lean().exec();
  return !!membership;
}

/** Check if a user is a member of a project */
export async function isProjectMember(projectId: string, userId: string): Promise<boolean> {
  const membership = await ProjectMemberModel.findOne({ projectId, userId }).lean().exec();
  return !!membership;
}
