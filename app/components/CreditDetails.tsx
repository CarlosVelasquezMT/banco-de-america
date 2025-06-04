"use client"

import { X } from "lucide-react"

interface CreditDetailsProps {
  credit: {
    fullName: string
    accountNumber: string
    type: string
    status: string
    creditLimit: number
    availableCredit: number
    minimumPayment: number
    interestRate: number
    paymentDueDate: string
    lastPaymentDate: string
    lastPaymentAmount: number
  }
  onClose: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

// Actualizar el componente CreditDetails para una mejor organización y usar dólares
const CreditDetails = ({ credit, onClose }: CreditDetailsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalles del Crédito</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Cliente</p>
            <p className="font-medium text-gray-800">{credit.fullName}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Número de Cuenta</p>
            <p className="font-medium text-gray-800 font-mono">{credit.accountNumber}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Tipo de Crédito</p>
            <p className="font-medium text-gray-800">{credit.type}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Estado</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                credit.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {credit.status}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Límite de Crédito</p>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(credit.creditLimit)}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Crédito Disponible</p>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(credit.availableCredit)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Pago Mínimo</p>
            <p className="font-medium text-gray-800">{formatCurrency(credit.minimumPayment)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Tasa de Interés</p>
            <p className="font-medium text-gray-800">{credit.interestRate}%</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Fecha de Pago</p>
          <p className="font-medium text-gray-800">{credit.paymentDueDate}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Último Pago</p>
          <p className="font-medium text-gray-800">{credit.lastPaymentDate}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Monto Último Pago</p>
          <p className="font-medium text-gray-800">{formatCurrency(credit.lastPaymentAmount)}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Utilización</p>
          <p className="font-medium text-gray-800">
            {(((credit.creditLimit - credit.availableCredit) / credit.creditLimit) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado de Cuenta</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-center text-gray-500">El estado de cuenta detallado estará disponible próximamente.</p>
        </div>
      </div>
    </div>
  )
}

export default CreditDetails
