// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { redis } from '../../../lib/redis'; // !AJUSTA ESTA RUTA si tu carpeta 'lib' está en un lugar diferente (ej. '../../lib/redis')
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { BankAccount } from '@/types'; // !ASEGÚRATE de que esta ruta sea correcta para tu interfaz BankAccount

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Asegurarse de que solo se acepten solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido. Solo POST.' });
  }

  const { identifier, password } = req.body;

  // --- INICIO DE LOGS DE DEPURACIÓN EN BACKEND (API Login) ---
  console.log(`[${new Date().toISOString()}] --- API LOGIN INICIADO ---`);
  console.log(`[${new Date().toISOString()}] Intento de login para identificador: ${identifier}`);
  // --- FIN DE LOGS DE DEPURACIÓN ---

  // 2. Validar que se hayan proporcionado identificador y contraseña
  if (!identifier || !password) {
    console.log(`[${new Date().toISOString()}] Identificador o contraseña no proporcionados (código 400).`);
    return res.status(400).json({ message: 'Identificador y contraseña son requeridos.' });
  }

  try {
    let allAccounts: BankAccount[] = []; // Declarar e inicializar `allAccounts` como un array vacío

    // 3. Recuperar todas las cuentas de Redis. Asumimos que están guardadas bajo la clave 'bankAccounts'.
    const allAccountsString = await redis.get('bankAccounts'); 

    // --- BLOQUE DE MANEJO DE `JSON.parse` ROBUSTO Y CORREGIDO ---
    // Este bloque verifica si hay datos y si son JSON válidos antes de parsear.
    if (allAccountsString) { // Solo si allAccountsString NO es null/undefined/cadena vacía
      try {
        // Corrección: Usar 'as string' para asegurar a TypeScript que es un string.
        allAccounts = JSON.parse(allAccountsString as string); 
        console.log(`[${new Date().toISOString()}] JSON.parse de 'bankAccounts' exitoso. Número de cuentas cargadas: ${allAccounts.length}`);
      } catch (parseError: any) {
        // Si el JSON es inválido o malformado, lo logueamos y asumimos que es un array vacío para que la app pueda continuar.
        console.error(`[${new Date().toISOString()}] ERROR: Falló al parsear JSON de 'bankAccounts' de Redis:`, parseError.message);
        console.log(`[${new Date().toISOString()}] STRING MALFORMADO (bankAccounts):`, allAccountsString); // IMPRIME EL STRING PROBLEMÁTICO EN LOS LOGS
        allAccounts = []; // Reinicia a un array vacío
      }
    } else {
      // Si allAccountsString es null o undefined, o una cadena vacía, inicializa como array vacío.
      allAccounts = [];
      console.warn(`[${new Date().toISOString()}] La clave 'bankAccounts' no fue encontrada o está vacía en Redis. Inicializando cuentas como array vacío.`);
    }
    // --- FIN DE BLOQUE DE MANEJO DE `JSON.parse` ROBUSTO Y CORREGIDO ---

    // 4. Buscar al usuario por email o número de cuenta en el array de cuentas cargado de Redis
    // `allAccounts` siempre será un array aquí, incluso si está vacío.
    const foundUser = allAccounts.find(
      (acc: BankAccount) => acc.email === identifier || acc.accountNumber === identifier
    );

    // --- INICIO DE LOGS DE DEPURACIÓN EN BACKEND (API Login) ---
    console.log(`[${new Date().toISOString()}] Usuario encontrado en Redis (tras búsqueda): ${foundUser ? foundUser.email || foundUser.accountNumber : "Ninguno"}`);
    // --- FIN DE LOGS DE DEPURACIÓN ---

    // 5. **PRIMERA COMPROBACIÓN:** Si no se encuentra el usuario en absoluto (`foundUser` es undefined).
    // Esta verificación estrecha el tipo de `foundUser` de `BankAccount | undefined` a `BankAccount`.
    if (!foundUser) {
      console.warn(`[${new Date().toISOString()}] Intento de login fallido: Usuario '${identifier}' no encontrado (código 401).`);
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 6. **SEGUNDA COMPROBACIÓN:** Si el usuario se encontró, pero su propiedad 'password' es undefined o null.
    // Esto resuelve el error de TypeScript específico para `foundUser.password` si es opcional en tu interfaz `BankAccount`.
    if (!foundUser.password) {
        console.warn(`[${new Date().toISOString()}] Usuario encontrado '${identifier}' no tiene contraseña establecida en la base de datos (código 401).`);
        return res.status(401).json({ message: 'Credenciales inválidas (contraseña no establecida).' });
    }

    // A partir de este punto, TypeScript sabe que `foundUser` es de tipo `BankAccount`
    // y que `foundUser.password` es definitivamente de tipo `string`.

    // 7. Compara la contraseña hasheada.
    // IMPORTANTE: `foundUser.password` DEBE ser el HASH de la contraseña, no el texto plano.
    // Esto se logra al crear la cuenta con `bcrypt.hash()` en el frontend (`app/page.tsx`).
    const isPasswordValid = await bcrypt.compare(password, foundUser.password);

    // --- INICIO DE LOGS DE DEPURACIÓN EN BACKEND (API Login) ---
    console.log(`[${new Date().toISOString()}] Contraseña ingresada (API): [OCULTA POR SEGURIDAD]`);
    console.log(`[${new Date().toISOString()}] Contraseña hasheada en DB (API): ${foundUser.password ? foundUser.password.substring(0, 10) + '...' : 'N/A'}`); // Mostrar solo una parte del hash por seguridad
    console.log(`[${new Date().toISOString()}] Resultado de bcrypt.compare (API): ${isPasswordValid}`);
    // --- FIN DE LOGS DE DEPURACIÓN ---

    // 8. Si la contraseña no es válida
    if (!isPasswordValid) {
      console.warn(`[${new Date().toISOString()}] Intento de login fallido: Contraseña inválida para '${identifier}' (código 401).`);
      return res.status(401).json({ message: 'Credenciales inválidas.' });
    }

    // 9. Generar JSON Web Token (JWT)
    // Se requiere la variable de entorno JWT_SECRET.
    if (!process.env.JWT_SECRET) {
      console.error(`[${new Date().toISOString()}] JWT_SECRET no está configurado en las variables de entorno (código 500).`);
      return res.status(500).json({ message: 'Error de configuración del servidor (JWT_SECRET no definido).' });
    }

    const token = jwt.sign(
      { userId: foundUser.id, email: foundUser.email, isAdmin: false }, // Payload del token: datos que identifican al usuario
      process.env.JWT_SECRET as string, // Secreto para firmar el token
      { expiresIn: '1h' } // El token expira en 1 hora. Ajusta según tus necesidades.
    );

    // 10. Establecer el token como una cookie HttpOnly para mayor seguridad
    // - HttpOnly: La cookie no es accesible a través de JavaScript en el navegador.
    // - Path=/: Disponible en toda la aplicación.
    // - Max-Age: Duración de la cookie en segundos (aquí 24 horas).
    // - SameSite=Lax: Protección contra ataques CSRF (Cross-Site Request Forgery).
    // - Secure: La cookie solo se enviará por HTTPS. Crucial para producción con Vercel.
    res.setHeader('Set-Cookie', `auth_token=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24}; SameSite=Lax; Secure=${process.env.NODE_ENV === 'production'}`);
    
    // 11. Devolver un mensaje de éxito y un objeto de usuario simplificado (sin la contraseña)
    console.log(`[${new Date().toISOString()}] Inicio de sesión exitoso para usuario: ${foundUser.email || foundUser.accountNumber}`);
    return res.status(200).json({
      message: 'Inicio de sesión exitoso',
      user: {
        id: foundUser.id,
        fullName: foundUser.fullName,
        email: foundUser.email,
        accountNumber: foundUser.accountNumber,
        accountType: foundUser.accountType,
        balance: foundUser.balance,
        // Evita incluir `password`, `movements`, `credits`, `loans` u otros datos sensibles/grandes aquí por seguridad y para mantener el payload pequeño.
      }
    });

  } catch (error: any) {
    console.error(`[${new Date().toISOString()}] Error en API de login (catch general):`, error.message || error);
    // Para no exponer detalles del error al cliente, se devuelve un mensaje genérico.
    return res.status(500).json({ message: 'Error interno del servidor al intentar iniciar sesión.' });
  }
}