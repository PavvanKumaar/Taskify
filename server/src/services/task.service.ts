import { TaskModel, TaskDocument } from '../models/task.model';
import { Task } from '../types';
import mongoose from 'mongoose';

export async function getAllTasks(): Promise<Task[]> {
  const docs = await TaskModel.find().lean().exec();
  return docs.map(doc => ({ ...doc, id: (doc as any)._id.toString() } as unknown as Task));
}

export async function getTasksByProject(projectId: string): Promise<Task[]> {
  if (!mongoose.Types.ObjectId.isValid(projectId)) return [];
  const docs = await TaskModel.find({ projectId }).lean().exec();
  return docs.map(doc => ({ ...doc, id: (doc as any)._id.toString() } as unknown as Task));
}

export async function getTaskById(id: string): Promise<Task | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await TaskModel.findById(id).lean().exec();
  if (!doc) return null;
  return { ...doc, id: (doc as any)._id.toString() } as unknown as Task;
}

export async function createTask(data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { position?: number }): Promise<Task> {
  const taskData: any = { ...data };
  if (data.position === undefined) taskData.position = 0;
  const doc = await TaskModel.create(taskData);
  const task = doc.toObject() as TaskDocument;
  return { ...task, id: task._id.toString() } as unknown as Task;
}

export async function updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await TaskModel.findByIdAndUpdate(
    id, data, { returnDocument: 'after', runValidators: true }
  ).lean().exec();
  if (!doc) return null;
  return { ...doc, id: (doc as any)._id.toString() } as unknown as Task;
}

export async function deleteTask(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await TaskModel.findByIdAndDelete(id).exec();
  return !!result;
}
