/*
Recibe la petición HTTP, extrae los datos y devuelve la respuesta.
*/

import { type Request, type Response } from 'express';
import routesService from "./routes.service.js";



const getRoutes = async (req: Request, res: Response): Promise<Response> => {
    try {
       const routes = await routesService.getRoutes()
        return res.status(200).json(routes)

    } catch (e) {
        console.error(e)
        return res.status(500).json({error: 'error'})
    }
}

const createRoute = async (req: Request, res: Response): Promise<Response> => {
    try {
        console.log('llegue');
        
        const route = req.body
        const response = routesService.createRoute(route)
        return res.status(201).json(response)
    } catch(e) {
        console.error(e)
        return res.status(500).json({error: 'error'})
    }
}

export default {
    getRoutes,
    createRoute
}