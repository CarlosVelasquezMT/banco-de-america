// lib/redis.ts
import { Redis } from '@upstash/redis'; 

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string, 
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

// Nota: Para el SDK de Upstash Redis (que usa la API REST), 
// no son necesarios los eventos 'connect' y 'error' de ioredis. 
// Los errores se manejan en las llamadas fetch/api que lo utilizan.