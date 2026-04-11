import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as projectService from '../services/project.service';
import { UserModel } from '../models/user.model';

export async function listProjects(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const projects = await projectService.getProjectsForUser(userId);
    res.json(projects);
  } catch (error) { next(error); }
}

export async function getProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Only members can view the project
    const isMember = await projectService.isProjectMember(req.params.id, req.user!.userId);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    res.json(project);
  } catch (error) { next(error); }
}

export async function createProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { name, workspaceId, imageUrl = '' } = req.body;
    if (!name || !workspaceId) {
      return res.status(400).json({ message: 'name and workspaceId are required' });
    }
    const project = await projectService.createProject(
      { name, workspaceId, imageUrl },
      req.user!.userId
    );
    res.status(201).json(project);
  } catch (error) { next(error); }
}

export async function updateProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isAdmin = await projectService.isProjectAdmin(req.params.id, req.user!.userId);
    if (!isAdmin) return res.status(403).json({ message: 'Only project admins can update' });

    const updated = await projectService.updateProject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Project not found' });
    res.json(updated);
  } catch (error) { next(error); }
}

export async function deleteProject(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isAdmin = await projectService.isProjectAdmin(req.params.id, req.user!.userId);
    if (!isAdmin) return res.status(403).json({ message: 'Only project admins can delete' });

    const deleted = await projectService.deleteProject(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Project not found' });
    res.status(204).end();
  } catch (error) { next(error); }
}

// ── Project Member endpoints ──────────────────────────────────────────────────

export async function listProjectMembers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isMember = await projectService.isProjectMember(req.params.id, req.user!.userId);
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const members = await projectService.getProjectMembers(req.params.id);
    res.json(members);
  } catch (error) { next(error); }
}

export async function addProjectMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isAdmin = await projectService.isProjectAdmin(req.params.id, req.user!.userId);
    if (!isAdmin) return res.status(403).json({ message: 'Only project admins can add members' });

    const { email, role = 'member' } = req.body;
    if (!email) return res.status(400).json({ message: 'email is required' });

    const user = await UserModel.findOne({ email: email.toLowerCase() }).lean();
    if (!user) return res.status(404).json({ message: 'No user found with that email' });

    const added = await projectService.addProjectMember(
      req.params.id,
      user._id.toString(),
      role
    );

    if (!added) return res.status(409).json({ message: 'User is already a member' });
    res.status(201).json({ message: 'Member added' });
  } catch (error) { next(error); }
}

export async function removeProjectMember(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isAdmin = await projectService.isProjectAdmin(req.params.id, req.user!.userId);
    if (!isAdmin) return res.status(403).json({ message: 'Only project admins can remove members' });

    // Prevent removing yourself if you're the only admin
    if (req.params.userId === req.user!.userId) {
      const members = await projectService.getProjectMembers(req.params.id);
      const admins = members.filter((m) => m.projectRole === 'admin');
      if (admins.length <= 1) {
        return res.status(400).json({ message: 'Cannot remove the only project admin' });
      }
    }

    const removed = await projectService.removeProjectMember(req.params.id, req.params.userId);
    if (!removed) return res.status(404).json({ message: 'Member not found in project' });
    res.status(204).end();
  } catch (error) { next(error); }
}
