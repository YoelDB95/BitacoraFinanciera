/*
        Define los endpoints y los conecta con sus controladores.
*/

import { Router } from 'express';
import loginController from './login.controller.js';

const router = Router()

router.post('/login', loginController.login);
router.post('/register', loginController.register);

export default router