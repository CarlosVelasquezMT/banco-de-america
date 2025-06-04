import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { accountId, ...creditData } = await request.json()

    const success = await DatabaseService.addCredit(accountId, creditData)

    if (!success) {
      return NextResponse.json({ success: false, error: "Cuenta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Crédito creado exitosamente",
    })
  } catch (error) {
    console.error("Error creating credit:", error)
    return NextResponse.json({ success: false, error: "Error al crear crédito" }, { status: 500 })
  }
}
