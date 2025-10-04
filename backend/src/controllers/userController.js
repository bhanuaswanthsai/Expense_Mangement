import prisma from '../config/database.js';
import bcrypt from 'bcryptjs';
import { asyncHandler } from '../utils/errorHandler.js';

export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, managerId } = req.body;
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, companyId: req.user.companyId, managerId }
  });
  res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

export const getUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({ where: { companyId: req.user.companyId } });
  res.json(users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, managerId: u.managerId })));
});

export const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role, managerId } = req.body;
  const updated = await prisma.user.update({ where: { id: Number(id) }, data: { role, managerId } });
  res.json({ id: updated.id, role: updated.role, managerId: updated.managerId });
});
