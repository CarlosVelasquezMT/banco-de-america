"use client"

import type React from "react"
import { useState } from "react"
import { DollarSign, PiggyBank, CreditCard, TrendingUp, Home } from "react-feather"
import { Button } from "@/components/ui/button"

interface UserData {
  fullName: string
}

interface Transaction {
  id: number
  date: string
  description: string
  amount: number
  type: "deposit" | "withdrawal"
}

interface AccountData {
  balance: number
  accountNumber: string
  accountType: string
  transactions: Transaction[]
}

interface Loan {
  id: number
  type: string
  amount: number
  remainingAmount: number
  monthlyPayment: number
  nextPaymentDate: string
}

interface Credit {
  id: number
  type: string
  limit: number
  available: number
  dueDate: string
  minimumPayment: number
}

interface Service {
  name: string
  icon: React.ReactNode
}

const services: Service[] = [
  { name: "Pagar Servicios", icon: <DollarSign size={20} /> },
  { name: "Transferencias", icon: <DollarSign size={20} /> },
  { name: "Recargas", icon: <DollarSign size={20} /> },
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

const UserDashboard = ({ userData }: { userData: UserData }) => {
  const [accountData, setAccountData] = useState({
    balance: 12500.75,
    accountNumber: "1000-2000-3000-4001",
    accountType: "Cuenta Corriente",
    transactions: [
      {
        id: 1,
        date: "2023-05-01",
        description: "Depósito ATM",
        amount: 500.0,
        type: "deposit",
      },
      {
        id: 2,
        date: "2023-05-03",
        description: "Pago Factura Electricidad",
        amount: 120.5,
        type: "withdrawal",
      },
      {
        id: 3,
        date: "2023-05-05",
        description: "Transferencia recibida",
        amount: 1000.0,
        type: "deposit",
      },
      {
        id: 4,
        date: "2023-05-10",
        description: "Retiro ATM",
        amount: 200.0,
        type: "withdrawal",
      },
    ],
  })

  const [loans, setLoans] = useState([
    {
      id: 1,
      type: "Préstamo Personal",
      amount: 15000,
      remainingAmount: 12500,
      monthlyPayment: 450.23,
      nextPaymentDate: "2023-06-15",
    },
  ])

  const [credits, setCredits] = useState([
    {
      id: 1,
      type: "Tarjeta de Crédito",
      limit: 5000,
      available: 3200,
      dueDate: "2023-06-20",
      minimumPayment: 150,
    },
  ])

  const handleServiceClick = (serviceName: string) => {
    alert(`Clicked on service: ${serviceName}`)
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Bienvenido, {userData.fullName}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Saldo Disponible</h3>
            <div className="bg-blue-100 p-2 rounded-full">
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{formatCurrency(accountData.balance)}</p>
          <p className="text-sm text-gray-500 mt-2">Cuenta {accountData.accountType}</p>
          <p className="text-sm font-mono text-gray-500">{accountData.accountNumber}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Préstamos</h3>
            <div className="bg-green-100 p-2 rounded-full">
              <PiggyBank className="h-5 w-5 text-green-600" />
            </div>
          </div>
          {loans.length > 0 ? (
            <>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(loans[0].remainingAmount)}</p>
              <p className="text-sm text-gray-500 mt-2">Saldo pendiente</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Próximo pago:</span>
                <span className="text-sm font-medium">{formatCurrency(loans[0].monthlyPayment)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No tienes préstamos activos</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Créditos</h3>
            <div className="bg-purple-100 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          {credits.length > 0 ? (
            <>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(credits[0].available)}</p>
              <p className="text-sm text-gray-500 mt-2">Disponible de {formatCurrency(credits[0].limit)}</p>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Pago mínimo:</span>
                <span className="text-sm font-medium">{formatCurrency(credits[0].minimumPayment)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No tienes créditos activos</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Movimientos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="py-3 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accountData.transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4 whitespace-nowrap text-sm">{transaction.date}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm">{transaction.description}</td>
                  <td
                    className={`py-3 px-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "deposit" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {transaction.type === "deposit" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Servicios Destacados</h3>
          <div className="grid grid-cols-3 gap-4">
            {services.map((service) => (
              <button
                key={service.name}
                onClick={() => handleServiceClick(service.name)}
                className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-blue-100 p-3 rounded-full mb-2">{service.icon}</div>
                <span className="text-sm text-center text-gray-700">{service.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Recomendados</h3>
          <div className="space-y-4">
            <div className="p-4 border border-blue-100 rounded-lg bg-blue-50">
              <div className="flex items-start">
                <div className="bg-blue-100 p-2 rounded-full mr-4">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Inversión a Plazo Fijo</h4>
                  <p className="text-sm text-gray-600 mt-1">Obtenga hasta un 4.5% de interés anual en su inversión.</p>
                  <Button variant="link" className="text-blue-600 p-0 h-auto mt-2">
                    Más información
                  </Button>
                </div>
              </div>
            </div>

            <div className="p-4 border border-green-100 rounded-lg bg-green-50">
              <div className="flex items-start">
                <div className="bg-green-100 p-2 rounded-full mr-4">
                  <Home className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Préstamo Hipotecario</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Tasas preferenciales desde 3.9% para la compra de su vivienda.
                  </p>
                  <Button variant="link" className="text-green-600 p-0 h-auto mt-2">
                    Más información
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
