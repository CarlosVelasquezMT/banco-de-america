import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { accountId: string; loanId: string } }) {
  try {
    const updates = await request.json()
    const success = await DatabaseService.updateLoan(params.accountId, params.loanId, updates)

    if (!success) {
      return NextResponse.json({ success: false, error: "Préstamo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Préstamo actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating loan:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar préstamo" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { accountId: string; loanId: string } }) {
  try {
    const success = await DatabaseService.deleteLoan(params.accountId, params.loanId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Préstamo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Préstamo eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting loan:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar préstamo" }, { status: 500 })
  }
}
