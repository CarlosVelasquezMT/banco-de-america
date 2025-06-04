"use client"

import type React from "react"
import { useState } from "react"
import { BanknotesIcon, BuildingOfficeIcon, ChartBarIcon, CreditCardIcon } from "@heroicons/react/24/outline"

interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  onClick?: () => void
}

// Actualizar el componente StatCard para hacerlo más dinámico y organizado
const StatCard = ({ title, value, icon, onClick }: StatCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-md transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px] cursor-pointer border border-gray-100"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
        <div className="text-blue-600 bg-blue-100 p-2 rounded-full">{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-800">${value.toLocaleString()}</p>
    </div>
  )
}

// Actualizar los valores de ejemplo para que sean en dólares
const Dashboard = ({ userType }: { userType: "admin" | "user" }) => {
  const [accountsCount, setAccountsCount] = useState(userType === "admin" ? 1458 : 1)
  const [totalBalance, setTotalBalance] = useState(userType === "admin" ? 2450000 : 12500)
  const [loansCount, setLoansCount] = useState(userType === "admin" ? 267 : 2)
  const [creditsCount, setCreditsCount] = useState(userType === "admin" ? 389 : 1)

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Accounts"
          value={accountsCount}
          icon={<BuildingOfficeIcon className="h-5 w-5" />}
          onClick={() => alert("Accounts clicked")}
        />
        <StatCard
          title="Total Balance"
          value={totalBalance}
          icon={<BanknotesIcon className="h-5 w-5" />}
          onClick={() => alert("Total Balance clicked")}
        />
        <StatCard
          title="Loans"
          value={loansCount}
          icon={<ChartBarIcon className="h-5 w-5" />}
          onClick={() => alert("Loans clicked")}
        />
        <StatCard
          title="Credits"
          value={creditsCount}
          icon={<CreditCardIcon className="h-5 w-5" />}
          onClick={() => alert("Credits clicked")}
        />
      </div>
    </div>
  )
}

export default Dashboard
