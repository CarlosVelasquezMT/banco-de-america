// app/api/data/route.ts
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis'; 
import { BankAccount, AppData } from '@/types'; 


const REDIS_KEY = 'bankAccountsData';

const DEFAULT_INITIAL_ACCOUNTS: BankAccount[] = [
    // ... (tus datos iniciales) ...
];

export async function GET() {
  console.log('API GET: Recibiendo solicitud...');
  try {
    let data: AppData | null = null;
    
    // Intenta obtener datos de Redis
    try {
        data = await redis.get(REDIS_KEY);
        console.log('API GET: Intento de obtener datos de Redis.');
    } catch (redisGetError: any) {
        console.error('API GET ERROR: Falló redis.get(). Esto podría indicar un problema de conexión:', redisGetError.message || redisGetError);
        // Si redis.get falla aquí, aún podemos intentar inicializar.
    }

    if (!data) {
      console.log('API GET: Datos no encontrados en Redis o falla de conexión. Intentando inicializar con datos por defecto.');
      const initialDataForRedis: AppData = { accounts: DEFAULT_INITIAL_ACCOUNTS, lastUpdated: new Date().toISOString() };
      
      try {
        await redis.set(REDIS_KEY, initialDataForRedis); // Guarda los datos por defecto
        console.log('API GET: Datos por defecto guardados en Redis con éxito.');
        data = initialDataForRedis; // Usa los datos iniciales para la respuesta
      } catch (redisSetError: any) {
        console.error('API GET ERROR: Falló redis.set() al inicializar. ¡PROBLEMA CRÍTICO DE REDIS!', redisSetError.message || redisSetError);
        // Si no podemos guardar los datos por defecto, Redis NO está funcionando.
        return NextResponse.json({ message: 'Error inicializando datos en Redis', error: redisSetError.message || String(redisSetError) }, { status: 500 });
      }
    } else {
        console.log('API GET: Datos encontrados en Redis.');
    }

    return NextResponse.json({ record: data });
  } catch (error: any) { 
    console.error('API GET ERROR: Error general en la función GET:', error.message || error);
    return NextResponse.json({ message: 'Error fetching data', error: error.message || String(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  console.log('API PUT: Recibiendo solicitud...');
  try {
    const accountsData: BankAccount[] = await request.json(); 
    console.log('API PUT: Datos recibidos del cliente. Intentando guardar en Redis.');

    const dataToSave: AppData = { accounts: accountsData, lastUpdated: new Date().toISOString() };

    try {
        await redis.set(REDIS_KEY, dataToSave);
        console.log('API PUT: Datos guardados en Redis con éxito.');
    } catch (redisSetError: any) {
        console.error('API PUT ERROR: Falló redis.set(). ¡PROBLEMA CRÍTICO DE REDIS!', redisSetError.message || redisSetError);
        // Si redis.set falla, devuelve un error 500
        return NextResponse.json({ message: 'Error saving data to Redis', error: redisSetError.message || String(redisSetError) }, { status: 500 });
    }

    return NextResponse.json({ message: 'Data saved successfully to Redis' });
  } catch (error: any) { 
    console.error('API PUT ERROR: Error general en la función PUT:', error.message || error);
    return NextResponse.json({ message: 'Error saving data', error: error.message || String(error) }, { status: 500 });
  }
}