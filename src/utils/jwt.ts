import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'finance_dashboard_secret_key_123';

export const generateToken = (userId: string, role: string) => {
  return jwt.sign({ id: userId, role }, SECRET_KEY, { expiresIn: '1d' });
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, SECRET_KEY) as { id: string; role: string };
};
