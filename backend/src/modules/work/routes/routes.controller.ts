/*
Recibe la petición HTTP, extrae los datos y devuelve la respuesta.
*/

import { type Request, type Response } from 'express';
import routesService from "./routes.service.js";



const createRoute = async (req: Request, res: Response): Promise<Response> => {
  try {
    const route = req.body
    const response = await routesService.createRoute(route)
    return res.status(201).json(response)
  } catch(e) {
    console.error(e)
    return res.status(500).json({error: e})
  }
}

const getRoutes = async (req: Request, res: Response): Promise<Response> => {
  try {
    const filters = req.query
		const routes = await routesService.getRoutes(filters)
		return res.status(200).json(routes);
  } catch(e) {
		console.log(e);
		return res.status(500).json({error: e})
	}
}

const modifyRoute = async (req: Request, res: Response): Promise<Response> => {
  try {
    const route = { ...req.params, ...req.body }
    const response = await routesService.modifyRoute(route)
    return res.status(200).json(response)
  } catch(e) {
    console.error(e)
    return res.status(500).json({error: e})
  }
}

const deleteRoute = async (req: Request, res: Response): Promise<Response> => {
  try {
    const routeCompanyId = req.params.id as string
    const response = await routesService.deleteRoute(routeCompanyId)
    return res.status(200).json(response)
  } catch(e) {
    console.error(e)
    return res.status(500).json({error: e})
  }
}

const deleteCompanyRoute = async (req: Request, res: Response): Promise<Response> => {
  try {
    const companyRouteId = req.params.id as string
    const response = await routesService.deleteCompanyRoute(companyRouteId)
    return res.status(200).json(response)
  } catch(e) {
    console.error(e)
    return res.status(500).json({error: e})
  }
}

export default {
    getRoutes,
    createRoute,
    modifyRoute,
    deleteRoute,
    deleteCompanyRoute
}