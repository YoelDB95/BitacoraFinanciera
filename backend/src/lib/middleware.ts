import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const authenticate = (req: Request, res: Response, next: NextFunction) => {
  console.log('Authenticating request:', req.method, req.url);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Token missing' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'JWT secret not configured' });
  }
console.log('Token received:', token);
  try {
    const decoded = jwt.verify(token, secret);
    console.log('Decoded token:', decoded);
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export default { authenticate }