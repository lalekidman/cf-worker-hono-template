import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: (origin) => {
    // Allow localhost and your production domains
    const allowedOrigins = [
      'http://localhost:3000',
    ];
    return allowedOrigins.includes(origin) ? origin : 'http://localhost:3000';
  }, // Your React app URL
  allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cookie'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
  credentials: true,
  maxAge: 600,
})