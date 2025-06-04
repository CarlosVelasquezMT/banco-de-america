import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function PUT(request: NextRequest, { params }: { params: { accountId: string; creditId: string } }) {
  try {
    const updates = await request.json()
    const success = await DatabaseService.updateCredit(params.accountId, params.creditId, updates)

    if (!success) {
      return NextResponse.json({ success: false, error: "Crédito no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Crédito actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating credit:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar crédito" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { accountId: string; creditId: string } }) {
  try {
    const success = await DatabaseService.deleteCredit(params.accountId, params.creditId)

    if (!success) {
      return NextResponse.json({ success: false, error: "Crédito no encontrado" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Crédito eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting credit:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar crédito" }, { status: 500 })
  }
}
