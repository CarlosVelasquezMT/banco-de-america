import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const account = await DatabaseService.getAccountById(params.id)

    if (!account) {
      return NextResponse.json({ success: false, error: "Cuenta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({ success: true, account })
  } catch (error) {
    console.error("Error getting account:", error)
    return NextResponse.json({ success: false, error: "Error al obtener cuenta" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const account = await DatabaseService.updateAccount(params.id, updates)

    if (!account) {
      return NextResponse.json({ success: false, error: "Cuenta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      account,
      message: "Cuenta actualizada exitosamente",
    })
  } catch (error) {
    console.error("Error updating account:", error)
    return NextResponse.json({ success: false, error: "Error al actualizar cuenta" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = await DatabaseService.deleteAccount(params.id)

    if (!success) {
      return NextResponse.json({ success: false, error: "Cuenta no encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Cuenta eliminada exitosamente",
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    return NextResponse.json({ success: false, error: "Error al eliminar cuenta" }, { status: 500 })
  }
}
