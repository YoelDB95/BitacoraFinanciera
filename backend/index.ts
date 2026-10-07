import express from 'express';
import "temporal-polyfill/full/global";
import { db } from "./src/prisma/db";

const users = await db.orm.public.Accounts.all();

console.log(users);

await db.close();

const app = express();

app.get('/', (req, res) => {
  res.send('Hello, World!');
}); 

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
    