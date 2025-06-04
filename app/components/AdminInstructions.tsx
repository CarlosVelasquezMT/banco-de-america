"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Users, CreditCard, Building2, Settings } from "lucide-react"

export default function AdminInstructions() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bank of America - Manual del Administrador</h1>
        <p className="text-gray-600">Guía completa para el uso del sistema administrativo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Gestión de Cuentas</span>
            </CardTitle>
            <CardDescription>Administrar cuentas de clientes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Crear nuevas cuentas</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Editar información de clientes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ver detalles completos</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Eliminar cuentas</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              <span>Gestión de Préstamos</span>
            </CardTitle>
            <CardDescription>Administrar préstamos bancarios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Crear nuevos préstamos</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Editar monto y condiciones</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Ver detalles y pagos</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Eliminar préstamos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              <span>Gestión de Créditos</span>
            </CardTitle>
            <CardDescription>Administrar líneas de crédito</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Crear nuevos créditos</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Editar límites y tasas</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Monitorear utilización</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Eliminar créditos</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5 text-gray-600" />
              <span>Configuración</span>
            </CardTitle>
            <CardDescription>Configuración del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Perfil del administrador</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Estadísticas del sistema</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Reportes financieros</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm">Gestión de sesiones</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Credenciales de Acceso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Administrador Principal</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <strong>Usuario:</strong> admin
              </p>
              <p className="text-sm">
                <strong>Contraseña:</strong> admin123
              </p>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-blue-800 mb-2">Usuario de Prueba</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <strong>Email:</strong> valentina@email.com
              </p>
              <p className="text-sm">
                <strong>Contraseña:</strong> 123456
              </p>
              <p className="text-sm">
                <strong>Número de Cuenta:</strong> 4001-2345-6789
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✅ Funcional
              </Badge>
              <p className="text-sm mt-1">Autenticación</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✅ Funcional
              </Badge>
              <p className="text-sm mt-1">CRUD Cuentas</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✅ Funcional
              </Badge>
              <p className="text-sm mt-1">CRUD Préstamos</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                ✅ Funcional
              </Badge>
              <p className="text-sm mt-1">CRUD Créditos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
