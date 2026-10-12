import express from 'express';
import "temporal-polyfill/full/global";
import companiesRouter from './src/modules/work/companies/companies.routes';

const app = express();

app.use(express.json());

app.use('/api/companies', companiesRouter);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});