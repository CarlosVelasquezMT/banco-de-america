import { type NextRequest, NextResponse } from "next/server"
import { DatabaseService } from "@/lib/database"

export async function GET() {
  try {
    const accounts = await DatabaseService.getAllAccounts()
    return NextResponse.json({ success: true, accounts })
  } catch (error) {
    console.error("Error getting accounts:", error)
    return NextResponse.json({ success: false, error: "Error al obtener cuentas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Generar número de cuenta único
    const accountNumber = await DatabaseService.generateAccountNumber()

    const accountData = {
      ...data,
      accountNumber,
      movements:
        data.initialBalance > 0
          ? [
              {
                id: "initial",
                type: "deposit" as const,
                amount: data.initialBalance,
                description: "Depósito inicial",
                date: new Date().toISOString().split("T")[0],
                balanceAfter: data.initialBalance,
              },
            ]
          : [],
      credits: [],
      loans: [],
    }

    const account = await DatabaseService.createAccount(accountData)

    return NextResponse.json({
      success: true,
      account,
      message: "Cuenta creada exitosamente",
    })
  } catch (error) {
    console.error("Error creating account:", error)
    return NextResponse.json({ success: false, error: "Error al crear cuenta" }, { status: 500 })
  }
}
