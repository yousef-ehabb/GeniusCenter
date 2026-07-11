import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiRouter, prisma } from './api';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

app.use('*', cors());
app.route('/api', apiRouter);

app.get('/', (c) => {
  return c.text('Genius Center API is running!');
});

// Health check endpoint
app.get('/health', async (c) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return c.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return c.json({ status: 'error', database: 'disconnected' }, 500);
  }
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
