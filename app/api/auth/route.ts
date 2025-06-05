// app/api/auth/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis'; // !AJUSTA ESTA RUTA si es necesario
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BankAccount } from '@/types'; // !ASEGÚRATE de que esta ruta sea correcta

// Para el App Router, exportamos funciones directamente con el nombre del método HTTP
export async function POST(req: Request) { // Usamos 'Request' del Web API para el App Router
  const { identifier, password } = await req.json(); // Leer el cuerpo JSON de la Request

  // --- INICIO DE LOGS DE DEPURACIÓN EN BACKEND (API Login) ---
  console.log(`[${new Date().toISOString()}] --- API LOGIN RECIBIDA (App Router) ---`);
  console.log(`[${new Date().toISOString()}] Intento de login para identificador: ${identifier}`);
  // --- FIN DE LOGS DE DEPURACIÓN ---

  if (!identifier || !password) {
    console.log(`[${new Date().toISOString()}] Identificador o contraseña no proporcionados (código 400).`);
    return new Response(JSON.stringify({ message: 'Identificador y contraseña son requeridos.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    let allAccounts: BankAccount[] = [];
    const allAccountsString = await redis.get('bankAccountsData'); 

    if (allAccountsString) {
      try {
        allAccounts = JSON.parse(allAccountsString as string); 
        console.log(`[${new Date().toISOString()}] JSON.parse de 'bankAccountsData' exitoso. Número de cuentas cargadas: ${allAccounts.length}`);
      } catch (parseError: any) {
        console.error(`[${new Date().toISOString()}] ERROR: Falló al parsear JSON de 'bankAccountsData' de Redis:`, parseError.message);
        console.log(`[${new Date().toISOString()}] STRING MALFORMADO (bankAccountsData):`, allAccountsString); 
        allAccounts = []; 
      }
    } else {
      allAccounts = [];
      console.warn(`[${new Date().toISOString()}] La clave 'bankAccountsData' no fue encontrada o está vacía en Redis. Inicializando cuentas como array vacío.`);
    }

    const foundUser = allAccounts.find(
      (acc: BankAccount) => acc.email === identifier || acc.accountNumber === identifier
    );

    console.log(`[${new Date().toISOString()}] Usuario encontrado en Redis (tras búsqueda): ${foundUser ? foundUser.email || foundUser.accountNumber : "Ninguno"}`);

    if (!foundUser) {
      console.warn(`[<span class="math-inline">\{new Date\(\)\.toISOString\(\)\}\] Intento de login fallido\: Usuario '</span>{identifier}' no encontrado (código 401).`);
      return new Response(JSON.stringify({ message: 'Credenciales inválidas.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (!foundUser.password) {
        console.warn(`[<span class="math-inline">\{new Date\(\)\.toISOString\(\)\}\] Usuario encontrado '</span>{identifier}' no tiene contraseña establecida en la base de datos (código 401).`);
        return new Response(JSON.stringify({ message: 'Credenciales inválidas (contraseña no establecida).' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    console.log(`[${new Date().toISOString()}] Contraseña ingresada (API): [OCULTA POR SEGURIDAD]`);
    console.log(`[${new Date().toISOString()}] Contraseña hasheada en DB (API): ${foundUser.password ? foundUser.password.substring(0, 10) + '...' : 'N/A'}`);
    console.log(`[${new Date().toISOString()}] Resultado de bcrypt.compare (API): ${isPasswordValid}`);

    if (!isPasswordValid) {
      console.warn(`[<span class="math-inline">\{new Date\(\)\.toISOString\(\)\}\] Intento de login fallido\: Contraseña inválida para '</span>{identifier}' (código 401).`);
      return new Response(JSON.stringify({ message: 'Credenciales inválidas.' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (!process.env.JWT_SECRET) {
      console.error(`[${new Date().toISOString()}] JWT_SECRET no está configurado en las variables de entorno (código 500).`);
      return new Response(JSON.stringify({ message: 'Error de configuración del servidor (JWT_SECRET no definido).' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, isAdmin: false }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '1h' } 
    );

    // Para establecer cookies en el App Router, necesitas construir una Response estándar de la Web API
    const responseBody = JSON.stringify({
      message: 'Inicio de sesión exitoso',
      user: {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        accountNumber: foundUser.accountNumber,
        accountType: foundUser.accountType,
        balance: foundUser.balance,
      }
    });

    const response = new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `auth_token=<span class="math-inline">\{token\}; HttpOnly; Path\=/; Max\-Age\=</span>{60 * 60 * 24}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`,
      },
    });

    console.log(`[${new Date().toISOString()}] Inicio de sesión exitoso para usuario: ${foundUser.email || foundUser.accountNumber}`);
    return response;

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error en API de login (catch general):`, error.message || error);
    return new Response(JSON.stringify({ message: 'Error interno del servidor al intentar iniciar sesión.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

// Si se recibe cualquier otro método HTTP, responde con 405 Method Not Allowed
export async function GET(req: Request) { // Necesitas exportar GET si tu API de datos también pasa por aquí o si quieres un 405 explícito
    console.warn(`[${new Date().toISOString()}] Petición recibida con método GET no permitido para /api/auth (código 405).`);
    return new Response(JSON.stringify({ message: 'Método no permitido. Solo se acepta POST para esta API.' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
}
// Puedes añadir export async function GET(req: Request), export async function PUT(req: Request) etc.
// y devolver 405 para métodos no esperados si no quieres que Next.js lo haga por defecto.

// Si solo se espera POST, Next.js por defecto ya manejará otros métodos como 405 si no están exportados.