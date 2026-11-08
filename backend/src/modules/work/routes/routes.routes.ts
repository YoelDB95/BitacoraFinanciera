/*
        Define los endpoints y los conecta con sus controladores.
*/

import { Router } from 'express';
import routesController from './routes.controller'

const router = Router()

router.get('/', routesController.getRoutes)
router.post('/', routesController.createRoute)

export default router