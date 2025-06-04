"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Eye } from "lucide-react"

interface Loan {
  id: number
  accountNumber: string
  fullName: string
  amount: number
  term: number
  interestRate: number
  startDate: string
  endDate: string
  monthlyPayment: number
  status: string
  purpose: string
  remainingAmount: number
}

const LoansManagement = () => {
  const [loans, setLoans] = useState<Loan[]>([
    {
      id: 1,
      accountNumber: "1000-2000-3000-4001",
      fullName: "Juan Pérez",
      amount: 15000,
      term: 36,
      interestRate: 5.25,
      startDate: "15/01/2023",
      endDate: "15/01/2026",
      monthlyPayment: 450.23,
      status: "Activo",
      purpose: "Compra de vehículo",
      remainingAmount: 12500,
    },
    {
      id: 2,
      accountNumber: "1000-2000-3000-4002",
      fullName: "María Rodríguez",
      amount: 8000,
      term: 24,
      interestRate: 4.75,
      startDate: "10/03/2023",
      endDate: "10/03/2025",
      monthlyPayment: 350.45,
      status: "Activo",
      purpose: "Remodelación",
      remainingAmount: 7200,
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredLoans = loans.filter(
    (loan) => loan.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || loan.accountNumber.includes(searchTerm),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleViewDetails = (loan: Loan) => {
    alert(`Detalles del préstamo ${loan.id}`)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Préstamos</h2>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-2" /> Nuevo Préstamo
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 border-b">
          <Input
            placeholder="Buscar por nombre o número de cuenta..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Cliente
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Monto
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Plazo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Tasa
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Pago Mensual
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Estado
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{loan.fullName}</div>
                    <div className="text-sm text-gray-500 font-mono">{loan.accountNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{formatCurrency(loan.amount)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{loan.term} meses</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{loan.interestRate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{formatCurrency(loan.monthlyPayment)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        loan.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(loan)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLoans.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron préstamos</p>
          </div>
        )}
      </div>

      {/* Mantener los diálogos existentes */}
    </div>
  )
}

export default LoansManagement
