import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    // Verificar si es administrador
    const isAdmin = await DatabaseService.verifyAdminCredentials(identifier, password)
    if (isAdmin) {
      await DatabaseService.updateAdminInfo({ lastLogin: new Date().toISOString() })
      return NextResponse.json({
        success: true,
        user: { type: "admin", identifier },
        message: "Login exitoso como administrador",
      })
    }

    // Verificar usuario regular
    const user = await DatabaseService.verifyUserCredentials(identifier, password)
    if (user) {
      return NextResponse.json({
        success: true,
        user: { type: "user", ...user },
        message: "Login exitoso",
      })
    }

    return NextResponse.json({ success: false, error: "Credenciales incorrectas" }, { status: 401 })
  } catch (error) {
    console.error("Error during authentication:", error)
    return NextResponse.json({ success: false, error: "Error en autenticación" }, { status: 500 })
  }
}
