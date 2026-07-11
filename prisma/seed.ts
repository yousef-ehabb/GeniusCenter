import { createClient } from '@libsql/client';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '..', 'dev.db');
const client = createClient({ url: `file:${dbPath}` });

async function main() {
  // Check for existing tenant
  const tenantRows = await client.execute('SELECT id, name FROM Tenant LIMIT 1');
  let tenantId: string;

  if (tenantRows.rows.length > 0) {
    tenantId = tenantRows.rows[0].id as string;
    console.log('Tenant already exists:', tenantRows.rows[0].name);
  } else {
    tenantId = randomUUID();
    await client.execute({
      sql: 'INSERT INTO Tenant (id, name, createdAt, updatedAt) VALUES (?, ?, datetime(), datetime())',
      args: [tenantId, 'مركز التعليم'],
    });
    console.log('Tenant created');
  }

  // Create or verify Admin User in User table
  const userRows = await client.execute({
    sql: 'SELECT id FROM User WHERE username = ?',
    args: ['admin'],
  });

  if (userRows.rows.length > 0) {
    console.log('Admin User already exists in User table');
  } else {
    await client.execute({
      sql: 'INSERT INTO User (id, tenantId, username, passwordHash, name, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, datetime(), datetime())',
      args: [randomUUID(), tenantId, 'admin', 'admin123', 'مدير النظام', 'admin'],
    });
    console.log('Admin User created in User table');
  }

  // Create or verify Admin in Staff table
  const staffRows = await client.execute({
    sql: 'SELECT id FROM Staff WHERE username = ?',
    args: ['admin'],
  });

  if (staffRows.rows.length > 0) {
    console.log('Admin Staff already exists in Staff table');
  } else {
    await client.execute({
      sql: 'INSERT INTO Staff (id, tenantId, name, role, phone, email, username, passwordHash, baseSalary, hireDate, status, permissions, isActive, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime(), datetime())',
      args: [
        randomUUID(),
        tenantId,
        'مدير النظام',
        'admin',
        '0123456789',
        'admin@example.com',
        'admin',
        'admin123',
        0, // Base salary in cents/minor units
        '2026-01-01',
        'نشط',
        '{}', // permissions JSON
        1, // isActive
      ],
    });
    console.log('Admin Staff created in Staff table');
  }

  console.log('');
  console.log('Login credentials:');
  console.log('  Username: admin');
  console.log('  Password: admin123');

  client.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
