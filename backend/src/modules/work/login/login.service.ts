import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import userRepository from './login.repository.js';

const login = async ({ email, password }: { email: string; password: string }) => {
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ id: user.id, username: user.email }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });

  return { token, tokenType: 'Bearer', expiresIn: 3600, user: { id: user.id, username: user.email, name: user.name } };
};

const register = async ({ email, password, name }: { email: string; password: string; name: string }) => {
  if (!email || !password || !name) {
    throw new Error('Email, password, and name are required');
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    return false; // User already exists
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await userRepository.create({ email, passwordHash, name });

  const token = jwt.sign({ id: newUser.id, username: newUser.email }, process.env.JWT_SECRET as string, {
    expiresIn: '1h',
  });

  return { token, tokenType: 'Bearer', expiresIn: 3600, user: { id: newUser.id, username: newUser.email, name: newUser.name } };
}

export default { login, register }