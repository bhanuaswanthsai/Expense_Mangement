import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { asyncHandler } from '../utils/errorHandler.js';
import axios from 'axios';

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export const signup = asyncHandler(async (req, res) => {
  const { companyName, country, userName, email, password } = req.body;
  if (!companyName || !country || !userName || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ message: 'Email already in use' });

  const { data: countries } = await axios.get('https://restcountries.com/v3.1/all?fields=name,currencies');
  const match = countries.find(c => c.name.common === country);
  if (!match || !match.currencies) return res.status(400).json({ message: 'Invalid country' });
  const currency = Object.keys(match.currencies)[0];

  const company = await prisma.company.create({ data: { name: companyName, country, currency } });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name: userName, email, password: hashed, role: 'Admin', companyId: company.id }
  });

  // Create a default approval rule for the new company so approvals work out of the box
  await prisma.approvalRule.create({
    data: {
      companyId: company.id,
      type: 'hybrid',
      percentage: 100,
      specificApproverId: user.id,
      isManagerApprover: false,
      approvers: [user.id],
    },
  });

  const token = signToken(user);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  const token = signToken(user);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

export const me = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { company: true },
  });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, company: user.company } });
});
