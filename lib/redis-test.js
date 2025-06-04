import redis from '../../lib/redis';

export default async function handler(req, res) {
  try {
    // Guardar un valor en Redis
    await redis.set("saludo", "¡Hola desde Vercel y Redis!");
    
    // Recuperar el valor
    const value = await redis.get("saludo");
    
    // Responder con el valor
    res.status(200).json({ 
      success: true,
      message: value 
    });
  } catch (error) {
    console.error("Error en la API:", error);
    res.status(500).json({ 
      success: false,
      error: "Error conectando con Redis" 
    });
  }
}
