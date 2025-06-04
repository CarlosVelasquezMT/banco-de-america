// app/components/CreateLoanForm.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

interface CreateLoanFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

const CreateLoanForm = ({ onSubmit, onCancel }: CreateLoanFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    accountNumber: "",
    amount: "",
    purpose: "",
    term: "",
    interestRate: "",
    startDate: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const calculateMonthlyPayment = () => {
    const principal = Number.parseFloat(formData.amount)
    const interestRate = Number.parseFloat(formData.interestRate) / 100 / 12
    const numberOfPayments = Number.parseInt(formData.term)

    if (isNaN(principal) || isNaN(interestRate) || isNaN(numberOfPayments) || interestRate === 0) {
      return formatCurrency(0)
    }

    const monthlyPayment = (principal * interestRate) / (1 - Math.pow(1 + interestRate, -numberOfPayments))
    return formatCurrency(monthlyPayment)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nombre Completo</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="accountNumber">Número de Cuenta</Label>
            <Input
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              required
              className="mt-1"
              placeholder="Formato: XXXX-XXXX-XXXX-XXXX"
            />
          </div>

          <div>
            <Label htmlFor="amount">Monto del Préstamo (USD)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="1000"
              step="100"
              value={formData.amount}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="purpose">Propósito del Préstamo</Label>
            <Select
              name="purpose"
              value={formData.purpose}
              onValueChange={(value) => setFormData({ ...formData, purpose: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar propósito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Compra de vehículo">Compra de vehículo</SelectItem>
                <SelectItem value="Compra de vivienda">Compra de vivienda</SelectItem>
                <SelectItem value="Remodelación">Remodelación</SelectItem>
                <SelectItem value="Educación">Educación</SelectItem>
                <SelectItem value="Consolidación de deudas">Consolidación de deudas</SelectItem>
                <SelectItem value="Negocio">Negocio</SelectItem>
                <SelectItem value="Otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="term">Plazo (meses)</Label>
            <Input
              id="term"
              name="term"
              type="number"
              min="6"
              max="360"
              value={formData.term}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="interestRate">Tasa de Interés (%)</Label>
            <Input
              id="interestRate"
              name="interestRate"
              type="number"
              min="0.1"
              step="0.01"
              max="30"
              value={formData.interestRate}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="startDate">Fecha de Inicio</Label>
            <Input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div className="pt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Resumen del Préstamo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto del Préstamo:</span>
                  <span className="font-medium">{formatCurrency(Number(formData.amount))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plazo:</span>
                  <span className="font-medium">{formData.term} meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de Interés:</span>
                  <span className="font-medium">{formData.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pago Mensual Estimado:</span>
                  <span className="font-medium">{calculateMonthlyPayment()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Préstamo</Button>
      </div>
    </form>
  )
}

export default CreateLoanForm
