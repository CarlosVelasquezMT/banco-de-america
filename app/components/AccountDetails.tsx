"use client"

// Definir las propiedades del componente AccountDetails
interface AccountDetailsProps {
  account: {
    fullName: string
    accountNumber: string
    accountType: string
    balance: number
    openDate: string
    status: string
    transactions: {
      date: string
      description: string
      amount: number
      type: "deposit" | "withdrawal"
    }[]
  }
  onClose: () => void
}

import { X } from "lucide-react"

// Función para formatear la moneda
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
  }).format(amount)
}

// Actualizar el componente AccountDetails para una mejor organización de la información
const AccountDetails = ({ account, onClose }: AccountDetailsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalles de la Cuenta</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Nombre Completo</p>
            <p className="font-medium text-gray-800">{account.fullName}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Número de Cuenta</p>
            <p className="font-medium text-gray-800 font-mono">{account.accountNumber}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Tipo de Cuenta</p>
            <p className="font-medium text-gray-800">{account.accountType}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Saldo Disponible</p>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(account.balance)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Fecha de Apertura</p>
            <p className="font-medium text-gray-800">{account.openDate}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Estado</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                account.status === "Activa" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {account.status}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Movimientos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Fecha</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Descripción</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Monto</th>
                <th className="py-3 px-4 text-sm font-medium text-gray-500">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {account.transactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm">{transaction.date}</td>
                  <td className="py-3 px-4 text-sm">{transaction.description}</td>
                  <td className="py-3 px-4 text-sm font-medium">
                    <span className={transaction.type === "deposit" ? "text-green-600" : "text-red-600"}>
                      {transaction.type === "deposit" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        transaction.type === "deposit" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {transaction.type === "deposit" ? "Depósito" : "Retiro"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AccountDetails
