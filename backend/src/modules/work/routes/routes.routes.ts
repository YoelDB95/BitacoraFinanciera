/*
        Define los endpoints y los conecta con sus controladores.
*/

import { Router } from 'express';
import routesController from './routes.controller'

const router = Router()

router.get('/', routesController.getRoutes)
router.post('/', routesController.createRoute)
router.put('/:routeId/:routeCompanyId', routesController.modifyRoute)
router.delete('/:id', routesController.deleteRoute)
router.delete('/companyRoute/:id', routesController.deleteCompanyRoute)

export default router