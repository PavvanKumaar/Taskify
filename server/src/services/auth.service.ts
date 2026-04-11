import bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { WorkspaceModel } from '../models/workspace.model';
import { JwtPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function registerUser(
  name: string,
  email: string,
  password: string,
  role: 'admin' | 'member'
) {
  const existing = await UserModel.findOne({ email });
  if (existing) throw new Error('Email already used');

  const passwordHash = await bcrypt.hash(password, 10);

  // Every user gets their own personal workspace
  const workspace = await WorkspaceModel.create({
    name: `${name}'s Workspace`,
    imageUrl: '',
  });

  const userDoc = await UserModel.create({
    name,
    email,
    avatarUrl: '',
    passwordHash,
    role: 'admin', // every user is admin of their own workspace
    workspaceId: workspace._id,
  });

  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    role: userDoc.role,
  };
}

export async function loginUser(email: string, password: string) {
  const userDoc = await UserModel.findOne({ email });
  if (!userDoc) throw new Error('Invalid credentials');

  const valid = await bcrypt.compare(password, userDoc.passwordHash);
  if (!valid) throw new Error('Invalid credentials');

  const token = jwt.sign(
    { userId: userDoc._id.toString(), role: userDoc.role } as JwtPayload,
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  );

  return {
    token,
    user: {
      id: userDoc._id.toString(),
      name: userDoc.name,
      email: userDoc.email,
      role: userDoc.role,
      avatarUrl: userDoc.avatarUrl,
    },
  };
}

export function verifyToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}
