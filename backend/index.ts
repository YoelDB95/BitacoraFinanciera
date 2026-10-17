import express from 'express';
import "temporal-polyfill/full/global";
import companiesRouter from './src/modules/work/companies/companies.routes';
import routesRouter from './src/modules/work/routes/routes.routes'

const app = express();

app.use(express.json());

app.use('/api/companies', companiesRouter);
app.use('/api/routes', routesRouter)

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});