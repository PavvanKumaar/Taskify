import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as projectController from '../controllers/project.controller';

const router = Router();
router.use(requireAuth);

// Project CRUD — no global requireAdmin; controller checks project-level role
router.get('/', projectController.listProjects);
router.get('/:id', projectController.getProject);
router.post('/', projectController.createProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

// Project member management
router.get('/:id/members', projectController.listProjectMembers);
router.post('/:id/members', projectController.addProjectMember);
router.delete('/:id/members/:userId', projectController.removeProjectMember);

export default router;
