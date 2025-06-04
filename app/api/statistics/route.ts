import { NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const stats = await DatabaseService.getStatistics()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Error getting statistics:", error)
    return NextResponse.json({ success: false, error: "Error al obtener estadísticas" }, { status: 500 })
  }
}
