// app/components/CreateAccountForm.tsx
"use client"

import { useState, useEffect } from "react"
import {
  Input,
  Label,
  Button,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Checkbox,
} from "@/components/ui"
import { useToast } from "@/components/ui/use-toast"

interface CreateAccountFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  initialData?: any
}

const CreateAccountForm = ({ onSubmit, onCancel, initialData }: CreateAccountFormProps) => {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    accountType: "Cuenta Corriente",
    accountNumber: "",
    initialBalance: "",
    password: "",
    status: "Activa",
  })

  useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData.fullName || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        address: initialData.address || "",
        accountType: initialData.accountType || "Cuenta Corriente",
        accountNumber: initialData.accountNumber || "",
        initialBalance: initialData.initialBalance ? initialData.initialBalance.toString() : "",
        password: "", // Do not pre-fill password for security
        status: initialData.status || "Activa",
      })
    }
  }, [initialData])

  const handleChange = (e: any) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.address ||
      !formData.accountType ||
      !formData.accountNumber ||
      !formData.initialBalance
    ) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, complete todos los campos requeridos.",
      })
      return
    }

    if (!initialData && !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor, ingrese una contraseña.",
      })
      return
    }

    const dataToSend = {
      ...formData,
      initialBalance: Number.parseFloat(formData.initialBalance),
      status: formData.status,
    }

    if (initialData && !formData.password) {
      delete dataToSend.password
    }

    onSubmit(dataToSend)
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
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1" />
          </div>

          <div>
            <Label htmlFor="address">Dirección</Label>
            <Textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="accountType">Tipo de Cuenta</Label>
            <Select
              name="accountType"
              value={formData.accountType}
              onValueChange={(value) => setFormData({ ...formData, accountType: value })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Seleccionar tipo de cuenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Cuenta Corriente">Cuenta Corriente</SelectItem>
                <SelectItem value="Cuenta de Ahorros">Cuenta de Ahorros</SelectItem>
                <SelectItem value="Cuenta de Inversión">Cuenta de Inversión</SelectItem>
              </SelectContent>
            </Select>
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
            <Label htmlFor="initialBalance">Saldo Inicial (USD)</Label>
            <Input
              id="initialBalance"
              name="initialBalance"
              type="number"
              min="0"
              step="0.01"
              value={formData.initialBalance}
              onChange={handleChange}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData}
              className="mt-1"
            />
            {initialData && (
              <p className="text-xs text-gray-500 mt-1">Deje en blanco para mantener la contraseña actual</p>
            )}
          </div>

          <div className="flex items-center space-x-2 mt-2">
            <Checkbox
              id="status"
              checked={formData.status === "Activa"}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "Activa" : "Inactiva" })}
            />
            <Label htmlFor="status" className="text-sm font-normal">
              Cuenta Activa
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? "Actualizar Cuenta" : "Crear Cuenta"}</Button>
      </div>
    </form>
  )
}

export default CreateAccountForm
