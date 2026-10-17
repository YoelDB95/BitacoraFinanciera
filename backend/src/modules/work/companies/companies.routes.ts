/*
        Define los endpoints y los conecta con sus controladores.
*/

import { Router } from 'express';
import { type Request, type Response } from 'express';
import companieController from './companies.controller';

const router = Router()

router.get('/', companieController.getCompanies)

router.post('/', companieController.createCompany)

router.get('/rate/:routingType', companieController.getCompanyRates)

export default router