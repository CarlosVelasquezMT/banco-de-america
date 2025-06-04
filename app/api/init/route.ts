import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST() {
  try {
    await DatabaseService.initializeDefaultData()
    return NextResponse.json({
      success: true,
      message: "Datos inicializados correctamente",
    })
  } catch (error) {
    console.error("Error initializing data:", error)
    return NextResponse.json({ success: false, error: "Error al inicializar datos" }, { status: 500 })
  }
}
