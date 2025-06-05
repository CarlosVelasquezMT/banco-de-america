// app/api/data/route.ts
import type { NextApiRequest, NextApiResponse } from 'next'; // Aunque App Router usa Request/Response, estos tipos son útiles si los usas internamente.
import { redis } from '../../../lib/redis'; // !AJUSTA ESTA RUTA si tu carpeta 'lib' está en un lugar diferente
import { BankAccount } from '@/types'; // !ASEGÚRATE de que esta ruta sea correcta para tu interfaz BankAccount

// Handler para peticiones GET
export async function GET(req: Request) { // Usamos Request del Web API para el App Router
  console.log(`[${new Date().toISOString()}] API /api/data (GET) recibida.`);

  try {
    const accountsDataString = await redis.get('bankAccountsData'); // <--- CLAVE CORREGIDA AQUÍ
    let accounts: BankAccount[] = [];

    if (accountsDataString) {
      try {
        accounts = JSON.parse(accountsDataString as string);
        console.log(`[${new Date().toISOString()}] /api/data (GET): Datos de 'bankAccountsData' encontrados y parseados.`);
      } catch (parseError: any) {
        console.error(`[${new Date().toISOString()}] /api/data (GET): ERROR al parsear JSON de 'bankAccountsData' de Redis:`, parseError.message);
        console.log(`[${new Date().toISOString()}] /api/data (GET): STRING MALFORMADO:`, accountsDataString);
        accounts = [];
      }
    } else {
      console.warn(`[${new Date().toISOString()}] /api/data (GET): La clave 'bankAccountsData' no fue encontrada o está vacía en Redis. Retornando array vacío.`);
      accounts = [];
    }
    
    // Devolver el objeto esperado por el frontend
    return new Response(JSON.stringify({ record: { accounts: accounts } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error en API /api/data (GET):`, error.message || error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor al cargar datos.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Handler para peticiones PUT
export async function PUT(req: Request) { // Usamos Request del Web API para el App Router
  console.log(`[${new Date().toISOString()}] API /api/data (PUT) recibida.`);

  try {
    const accountsToSave: BankAccount[] = await req.json(); // Leer el cuerpo JSON de la Request

    // Validar si el cuerpo de la petición es un array (opcional pero recomendado)
    if (!Array.isArray(accountsToSave)) {
      console.error(`[${new Date().toISOString()}] /api/data (PUT): El cuerpo de la petición no es un array de cuentas.`);
      return new Response(JSON.stringify({ message: 'Formato de datos inválido. Se esperaba un array de cuentas.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Guardar los datos en Redis bajo la clave 'bankAccountsData'
    await redis.set('bankAccountsData', JSON.stringify(accountsToSave)); // <--- CLAVE CORREGIDA AQUÍ

    console.log(`[${new Date().toISOString()}] /api/data (PUT): Datos guardados exitosamente en 'bankAccountsData' en Redis.`);
    return new Response(JSON.stringify({ message: 'Datos guardados exitosamente.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error en API /api/data (PUT):`, error.message || error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor al guardar datos.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Next.js App Router automáticamente devuelve 405 para métodos no exportados (como POST si solo tienes GET)
// Puedes añadir handlers explícitos para otros métodos si lo deseas, como este para POST
// (ya está en este ejemplo el PUT, así que se aceptaría)