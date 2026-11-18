import express from 'express';
import "temporal-polyfill/full/global";
import companiesRouter from './modules/work/companies/companies.routes.js';
import routesRouter from './modules/work/routes/routes.routes.js'
import cors from 'cors'

const corsOptions = {
  origin: [
    'https://bitacorafinancierafrontend.onrender.com',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}


const app = express();

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))
app.use(express.json());

app.use('/api/companies', companiesRouter);
app.use('/api/routes', routesRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});