import { Request, Response } from "express";
import loginService from "./login.service.js";

const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const response = await loginService.login(req.body);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ code: 'INVALID_CREDENTIALS', message: error});
  }
}

const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const userCreated = await loginService.register(req.body);
    if (!userCreated) {
      return res.status(400).json({ message: 'User already exists' });
    }
    return res.status(200).json(userCreated);
  }
  catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ code: 'INVALID_DATA', message: error });
  }
}

export default { login, register }