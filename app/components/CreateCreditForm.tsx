"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface CreateCreditFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
}

const CreateCreditForm = ({ onSubmit, onCancel }: CreateCreditFormProps) => {
  const [formData, setFormData] = useState({
    fullName: "",
    accountNumber: "",
    type: "",
    creditLimit: "",
    interestRate: "",
    paymentDueDate: "",
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

  const calculateMinimumPayment = () => {
    const limit = Number(formData.creditLimit)
    const rate = Number(formData.interestRate) / 100
    const minimumPayment = limit * (rate / 12) + 0.01 * limit

    if (isNaN(minimumPayment)) {
      return formatCurrency(0)
    }

    return formatCurrency(minimumPayment)
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
            <Label htmlFor="type">Tipo de Crédito</Label>
            <Select
              name="type"
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar tipo de crédito" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                <SelectItem value="Línea de Crédito">Línea de Crédito</SelectItem>
                <SelectItem value="Crédito Rotativo">Crédito Rotativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="creditLimit">Límite de Crédito (USD)</Label>
            <Input
              id="creditLimit"
              name="creditLimit"
              type="number"
              min="500"
              step="100"
              value={formData.creditLimit}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-4">
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
            <Label htmlFor="paymentDueDate">Fecha de Pago</Label>
            <Select
              name="paymentDueDate"
              value={formData.paymentDueDate}
              onValueChange={(value) => setFormData({ ...formData, paymentDueDate: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar fecha de pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5 de cada mes">5 de cada mes</SelectItem>
                <SelectItem value="10 de cada mes">10 de cada mes</SelectItem>
                <SelectItem value="15 de cada mes">15 de cada mes</SelectItem>
                <SelectItem value="20 de cada mes">20 de cada mes</SelectItem>
                <SelectItem value="25 de cada mes">25 de cada mes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Resumen del Crédito</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de Crédito:</span>
                  <span className="font-medium">{formData.type || "No seleccionado"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Límite de Crédito:</span>
                  <span className="font-medium">{formatCurrency(Number(formData.creditLimit))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de Interés:</span>
                  <span className="font-medium">{formData.interestRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pago Mínimo Estimado:</span>
                  <span className="font-medium">{calculateMinimumPayment()}</span>
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
        <Button type="submit">Crear Crédito</Button>
      </div>
    </form>
  )
}

export default CreateCreditForm
