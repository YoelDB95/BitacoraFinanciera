/*
        Define los endpoints y los conecta con sus controladores.
*/

import { Router } from 'express';

const router = Router()

router.post('/', (req, res) => { {
  res.status(200).json({ message: 'Login successful' });
} });

export default router