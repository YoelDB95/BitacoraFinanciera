/*
        Contiene las reglas de negocio y coordina operaciones entre entidades.
*/

import routesRepository from "./routes.repository"

const getRoutes = () => {
        return routesRepository.getRoutes()
}

const createRoute = (route) => {
        console.log(route);       
}

export default {
        getRoutes,
        createRoute
}