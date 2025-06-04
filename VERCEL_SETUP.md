# Configuración de Vercel KV para Bank of America

## Pasos para configurar la base de datos en Vercel

### 1. Crear proyecto en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Despliega el proyecto

### 2. Configurar Vercel KV
1. En el dashboard de Vercel, ve a tu proyecto
2. Haz clic en la pestaña "Storage"
3. Selecciona "Create Database"
4. Elige "KV" (Redis)
5. Asigna un nombre como "bank-of-america-db"
6. Selecciona la región más cercana
7. Haz clic en "Create"

### 3. Configurar variables de entorno
Vercel automáticamente configurará las siguientes variables:
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

### 4. Redeploy del proyecto
1. Ve a la pestaña "Deployments"
2. Haz clic en "Redeploy" en el último deployment
3. Asegúrate de que "Use existing Build Cache" esté desmarcado

### 5. Inicializar datos
Una vez desplegado, visita:
\`\`\`
https://tu-proyecto.vercel.app/api/init
\`\`\`

Esto creará las cuentas de ejemplo iniciales.

## Características de la base de datos

### ✅ Persistencia real
- Los datos se guardan en Redis (Vercel KV)
- No se pierden al recargar la página
- Accesibles desde cualquier dispositivo

### ✅ Funcionalidades implementadas
- Crear, leer, actualizar y eliminar cuentas
- Gestión de préstamos y créditos
- Movimientos bancarios
- Autenticación de usuarios y admin
- Logs de auditoría
- Estadísticas en tiempo real
- Backup automático

### ✅ APIs disponibles
- `POST /api/auth` - Autenticación
- `GET /api/accounts` - Listar cuentas
- `POST /api/accounts` - Crear cuenta
- `PUT /api/accounts/[id]` - Actualizar cuenta
- `DELETE /api/accounts/[id]` - Eliminar cuenta
- `POST /api/loans` - Crear préstamo
- `PUT /api/loans/[accountId]/[loanId]` - Actualizar préstamo
- `DELETE /api/loans/[accountId]/[loanId]` - Eliminar préstamo
- `POST /api/credits` - Crear crédito
- `PUT /api/credits/[accountId]/[creditId]` - Actualizar crédito
- `DELETE /api/credits/[accountId]/[creditId]` - Eliminar crédito
- `GET /api/statistics` - Estadísticas
- `POST /api/init` - Inicializar datos

## Credenciales por defecto

### Administrador
- Usuario: `admin`
- Contraseña: `admin123`

### Usuario de ejemplo
- Email: `valentina@email.com`
- Contraseña: `123456`
- Número de cuenta: Se genera automáticamente

## Ventajas de esta implementación

1. **Persistencia real**: Los datos nunca se pierden
2. **Escalabilidad**: Redis puede manejar miles de usuarios
3. **Velocidad**: Acceso ultra-rápido a los datos
4. **Seguridad**: Datos encriptados en tránsito y en reposo
5. **Backup automático**: Vercel maneja los backups
6. **Costo**: Plan gratuito incluye 30,000 comandos/mes
7. **Global**: Datos replicados globalmente
8. **Monitoreo**: Dashboard de Vercel para monitorear uso

## Próximos pasos

Una vez configurado, podrás:
- Crear cuentas reales que persistan
- Compartir links con clientes
- Acceder desde cualquier dispositivo
- Escalar a producción sin cambios
