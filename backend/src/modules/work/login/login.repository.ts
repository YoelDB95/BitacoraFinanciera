import { db } from "../../../prisma/db.js";

const findByEmail = async (email: string) => {
  // Implement the logic to find a user by email in your database
  // For example, using an ORM or direct database query
  // Return the user object if found, otherwise return null or throw an error
  const user = await db.orm.public.Users.where(user => user.email.eq(email)).first();
  return user;
}

const create = async ({ email, passwordHash, name }: { email: string; passwordHash: string; name: string }) => {
  // Implement the logic to create a new user in your database
  // For example, using an ORM or direct database query
  // Return the created user object
  
  const newUser = await db.orm.public.Users.create({
    email,
    passwordHash,
    name,
  });

  return newUser;
}

export default { findByEmail, create }