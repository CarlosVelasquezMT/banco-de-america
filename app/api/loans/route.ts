import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const { accountId, ...loanData } = await request.json()

    const success = await DatabaseService.addLoan(accountId, loanData)

    if (!success) {
      return NextResponse.json({ success: false, error: "Cuenta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Préstamo creado exitosamente",
    })
  } catch (error) {
    console.error("Error creating loan:", error)
    return NextResponse.json({ success: false, error: "Error al crear préstamo" }, { status: 500 })
  }
}
