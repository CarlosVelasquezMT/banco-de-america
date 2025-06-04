// lib/redis.ts
import { Redis } from '@upstash/redis'; 

// === INICIO DE CÓDIGO DE DEPURACIÓN ===
// Estos logs aparecerán en los logs de tu despliegue en Vercel
console.log("--------------------------------------");
console.log("Verificando Variables de Entorno de Upstash:");
console.log("UPSTASH_REDIS_REST_URL:", process.env.UPSTASH_REDIS_REST_URL);

// Por seguridad, NO imprimas el token completo en los logs de producción
// Solo verifica si existe y si su longitud es razonable.
const tokenValue = process.env.UPSTASH_REDIS_REST_TOKEN;
if (tokenValue) {
  console.log("UPSTASH_REDIS_REST_TOKEN: (EXISTE), Longitud:", tokenValue.length);
  // Opcional: imprimir solo los primeros y últimos caracteres para depuración extrema, pero con cautela
  // console.log("UPSTASH_REDIS_REST_TOKEN (parcial):", tokenValue.substring(0, 5) + '...' + tokenValue.substring(tokenValue.length - 5));
} else {
  console.log("UPSTASH_REDIS_REST_TOKEN: (NO ESTÁ DEFINIDO)");
}
console.log("--------------------------------------");
// === FIN DE CÓDIGO DE DEPURACIÓN ===

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL as string, 
  token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
});

// Nota: Para el SDK de Upstash Redis (que usa la API REST), 
// no son necesarios los eventos 'connect' y 'error' de ioredis. 
// Los errores se manejan en las llamadas fetch/api que lo utilizan.