import mongoose from 'mongoose';
import { UserModel } from '../models/user.model';
import { User } from '../types';

export async function getAllUsers(): Promise<User[]> {
  const docs = await UserModel.find({}, '-passwordHash').lean().exec();
  return docs.map(doc => ({ ...doc, id: (doc as any)._id.toString() })) as User[];
}

export async function getUserById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await UserModel.findById(id, '-passwordHash').lean().exec();
  if (!doc) return null;
  return { ...doc, id: (doc as any)._id.toString() } as User;
}

export async function updateUser(id: string, update: Partial<User>) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  const doc = await UserModel.findByIdAndUpdate(
    id, update, { returnDocument: 'after', runValidators: true }
  ).select('-passwordHash').lean().exec();
  if (!doc) return null;
  return { ...doc, id: (doc as any)._id.toString() } as User;
}

export async function deleteUser(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await UserModel.findByIdAndDelete(id).exec();
  return !!result;
}
