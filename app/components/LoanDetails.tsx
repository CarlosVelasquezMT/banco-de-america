"use client"

// Actualizar el componente LoanDetails para una mejor organización y usar dólares
import { X } from "lucide-react"

interface LoanDetailsProps {
  loan: any // Replace 'any' with a more specific type if possible
  onClose: () => void
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const LoanDetails = ({ loan, onClose }: LoanDetailsProps) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalles del Préstamo</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Cliente</p>
            <p className="font-medium text-gray-800">{loan.fullName}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Número de Cuenta</p>
            <p className="font-medium text-gray-800 font-mono">{loan.accountNumber}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Propósito</p>
            <p className="font-medium text-gray-800">{loan.purpose}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Estado</p>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                loan.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {loan.status}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Monto del Préstamo</p>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(loan.amount)}</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-1">Saldo Pendiente</p>
            <p className="text-2xl font-bold text-blue-800">{formatCurrency(loan.remainingAmount)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Pago Mensual</p>
            <p className="font-medium text-gray-800">{formatCurrency(loan.monthlyPayment)}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">Tasa de Interés</p>
            <p className="font-medium text-gray-800">{loan.interestRate}%</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Plazo</p>
          <p className="font-medium text-gray-800">{loan.term} meses</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Fecha de Inicio</p>
          <p className="font-medium text-gray-800">{loan.startDate}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-500 mb-1">Fecha de Finalización</p>
          <p className="font-medium text-gray-800">{loan.endDate}</p>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Calendario de Pagos</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-center text-gray-500">El calendario de pagos detallado estará disponible próximamente.</p>
        </div>
      </div>
    </div>
  )
}

export default LoanDetails
