import express from 'express';
import "temporal-polyfill/full/global";
import cors from 'cors'
import companiesRouter from './modules/work/companies/companies.routes.js';
import routesRouter from './modules/work/routes/routes.routes.js'
import loginRouter from './modules/work/login/login.routes.js'
import middleware from './lib/middleware.js'

const corsOptions = {
  origin: [
    'https://bitacorafinancierafrontend.onrender.com',
    'http://localhost:5173',
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}


const app = express();

app.use(cors(corsOptions))
app.use(express.json()); // Apply the authentication middleware to all routes

app.use('/api/auth', loginRouter)
app.use('/api/companies', middleware.authenticate, companiesRouter);
app.use('/api/routes', middleware.authenticate, routesRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});