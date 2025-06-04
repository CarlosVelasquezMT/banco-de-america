"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Eye } from "lucide-react"

interface Credit {
  id: number
  accountNumber: string
  fullName: string
  creditLimit: number
  availableCredit: number
  interestRate: number
  paymentDueDate: string
  minimumPayment: number
  status: string
  type: string
  lastPaymentDate: string
  lastPaymentAmount: number
}

const CreditsManagement = () => {
  const [credits, setCredits] = useState<Credit[]>([
    {
      id: 1,
      accountNumber: "1000-2000-3000-4001",
      fullName: "Juan Pérez",
      creditLimit: 5000,
      availableCredit: 3200,
      interestRate: 18.5,
      paymentDueDate: "15 de cada mes",
      minimumPayment: 150,
      status: "Activo",
      type: "Tarjeta de Crédito",
      lastPaymentDate: "15/04/2023",
      lastPaymentAmount: 200,
    },
    {
      id: 2,
      accountNumber: "1000-2000-3000-4002",
      fullName: "María Rodríguez",
      creditLimit: 8000,
      availableCredit: 6500,
      interestRate: 16.9,
      paymentDueDate: "20 de cada mes",
      minimumPayment: 240,
      status: "Activo",
      type: "Línea de Crédito",
      lastPaymentDate: "20/04/2023",
      lastPaymentAmount: 300,
    },
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)

  const filteredCredits = credits.filter(
    (credit) =>
      credit.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || credit.accountNumber.includes(searchTerm),
  )

  const handleViewDetails = (credit: Credit) => {
    alert(`Viewing details for credit ID: ${credit.id}`)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Gestión de Créditos</h2>
        <Button onClick={() => setShowCreateForm(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus size={16} className="mr-2" /> Nuevo Crédito
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
                  Tipo
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Límite
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Disponible
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
              {filteredCredits.map((credit) => (
                <tr key={credit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{credit.fullName}</div>
                    <div className="text-sm text-gray-500 font-mono">{credit.accountNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{credit.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{formatCurrency(credit.creditLimit)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{formatCurrency(credit.availableCredit)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-gray-900">{credit.interestRate}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        credit.status === "Activo" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {credit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(credit)}
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

        {filteredCredits.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No se encontraron créditos</p>
          </div>
        )}
      </div>

      {/* Mantener los diálogos existentes */}
    </div>
  )
}

export default CreditsManagement
