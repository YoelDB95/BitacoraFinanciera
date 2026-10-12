import { Router } from 'express'; 
import { db } from "../../../prisma/db.js";

/*
        Recibe la petición HTTP, extrae los datos y devuelve la respuesta.
*/
const router = Router()

router.get('/', (req, res) => {
    const routes = db.orm.public.Routes
        .include('routeCompanies', (routeCompanies) =>
            routeCompanies.select('id', 'companyId', 'routeId', 'billingAmount', 'rateAmount', 'kilometers', 'packagesReceived', 'packagesUndelivered')
        )
        .all()
    res.json(routes)
})

router.post('/', async (req, res) => {

})