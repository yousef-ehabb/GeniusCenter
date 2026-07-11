import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({ url: 'file:dev.db' });
const prisma = new PrismaClient({
  adapter: adapter as any
});

async function main() {
  try {
    const users = await prisma.user.findMany();
    const staff = await prisma.staff.findMany();
    console.log('Users in DB:', users);
    console.log('Staff in DB:', staff);
  } catch (error) {
    console.error('Error querying DB:', error);
  }
}

main();
