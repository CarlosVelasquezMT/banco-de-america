import { kv } from "@vercel/kv"

export interface BankAccount {
  id: string
  accountNumber: string
  fullName: string
  email: string
  password?: string
  balance: number
  accountType: string
  createdAt: string
  movements: Movement[]
  credits: Credit[]
  loans: Loan[]
  phone: string
  address: string
  isActive: boolean
}

export interface Movement {
  id: string
  type: "deposit" | "withdrawal" | "transfer"
  amount: number
  description: string
  date: string
  balanceAfter: number
}

export interface Credit {
  id: string
  amount: number
  limit: number
  interestRate: number
  status: "active" | "pending" | "closed"
  monthlyPayment?: number
  nextPaymentDate?: string
  creditScore?: number
  approvalDate?: string
}

export interface Loan {
  id: string
  amount: number
  monthlyPayment: number
  remainingPayments: number
  interestRate: number
  status: "active" | "pending" | "paid"
  purpose?: string
  approvalDate?: string
}

export interface AdminInfo {
  name: string
  email: string
  phone: string
  password: string
  lastLogin?: string
}

// Claves para Redis
const ACCOUNTS_KEY = "bank:accounts"
const ADMIN_KEY = "bank:admin"
const COUNTERS_KEY = "bank:counters"

export class DatabaseService {
  // Obtener todas las cuentas
  static async getAllAccounts(): Promise<BankAccount[]> {
    try {
      const accounts = await kv.hgetall(ACCOUNTS_KEY)
      if (!accounts) return []

      return Object.values(accounts).map((account) =>
        typeof account === "string" ? JSON.parse(account) : account,
      ) as BankAccount[]
    } catch (error) {
      console.error("Error getting accounts:", error)
      return []
    }
  }

  // Obtener cuenta por ID
  static async getAccountById(id: string): Promise<BankAccount | null> {
    try {
      const account = await kv.hget(ACCOUNTS_KEY, id)
      if (!account) return null

      return typeof account === "string" ? JSON.parse(account) : account
    } catch (error) {
      console.error("Error getting account by ID:", error)
      return null
    }
  }

  // Obtener cuenta por email
  static async getAccountByEmail(email: string): Promise<BankAccount | null> {
    try {
      const accounts = await this.getAllAccounts()
      return accounts.find((acc) => acc.email === email && acc.isActive) || null
    } catch (error) {
      console.error("Error getting account by email:", error)
      return null
    }
  }

  // Obtener cuenta por número de cuenta
  static async getAccountByNumber(accountNumber: string): Promise<BankAccount | null> {
    try {
      const accounts = await this.getAllAccounts()
      return accounts.find((acc) => acc.accountNumber === accountNumber && acc.isActive) || null
    } catch (error) {
      console.error("Error getting account by number:", error)
      return null
    }
  }

  // Crear nueva cuenta
  static async createAccount(accountData: Omit<BankAccount, "id" | "createdAt" | "isActive">): Promise<BankAccount> {
    try {
      const id = await this.generateId("account")
      const account: BankAccount = {
        ...accountData,
        id,
        createdAt: new Date().toISOString(),
        isActive: true,
      }

      await kv.hset(ACCOUNTS_KEY, { [id]: JSON.stringify(account) })

      // Log de auditoría
      await this.logActivity("CREATE_ACCOUNT", {
        accountId: id,
        accountNumber: account.accountNumber,
        fullName: account.fullName,
      })

      return account
    } catch (error) {
      console.error("Error creating account:", error)
      throw new Error("Error al crear la cuenta")
    }
  }

  // Actualizar cuenta
  static async updateAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount | null> {
    try {
      const existingAccount = await this.getAccountById(id)
      if (!existingAccount) return null

      const updatedAccount = { ...existingAccount, ...updates }
      await kv.hset(ACCOUNTS_KEY, { [id]: JSON.stringify(updatedAccount) })

      // Log de auditoría
      await this.logActivity("UPDATE_ACCOUNT", {
        accountId: id,
        changes: updates,
      })

      return updatedAccount
    } catch (error) {
      console.error("Error updating account:", error)
      throw new Error("Error al actualizar la cuenta")
    }
  }

  // Eliminar cuenta (soft delete)
  static async deleteAccount(id: string): Promise<boolean> {
    try {
      const account = await this.getAccountById(id)
      if (!account) return false

      const updatedAccount = { ...account, isActive: false }
      await kv.hset(ACCOUNTS_KEY, { [id]: JSON.stringify(updatedAccount) })

      // Log de auditoría
      await this.logActivity("DELETE_ACCOUNT", {
        accountId: id,
        accountNumber: account.accountNumber,
      })

      return true
    } catch (error) {
      console.error("Error deleting account:", error)
      return false
    }
  }

  // Agregar movimiento a una cuenta
  static async addMovement(accountId: string, movement: Omit<Movement, "id">): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId)
      if (!account) return false

      const movementId = await this.generateId("movement")
      const newMovement: Movement = {
        ...movement,
        id: movementId,
      }

      account.movements.push(newMovement)
      await this.updateAccount(accountId, { movements: account.movements })

      return true
    } catch (error) {
      console.error("Error adding movement:", error)
      return false
    }
  }

  // Agregar préstamo
  static async addLoan(accountId: string, loan: Omit<Loan, "id">): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId)
      if (!account) return false

      const loanId = await this.generateId("loan")
      const newLoan: Loan = {
        ...loan,
        id: loanId,
        approvalDate: new Date().toISOString(),
      }

      account.loans.push(newLoan)
      await this.updateAccount(accountId, { loans: account.loans })

      // Log de auditoría
      await this.logActivity("CREATE_LOAN", {
        accountId,
        loanId,
        amount: loan.amount,
      })

      return true
    } catch (error) {
      console.error("Error adding loan:", error)
      return false
    }
  }

  // Actualizar préstamo
  static async updateLoan(accountId: string, loanId: string, updates: Partial<Loan>): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId)
      if (!account) return false

      const loanIndex = account.loans.findIndex((loan) => loan.id === loanId)
      if (loanIndex === -1) return false

      account.loans[loanIndex] = { ...account.loans[loanIndex], ...updates }
      await this.updateAccount(accountId, { loans: account.loans })

      return true
    } catch (error) {
      console.error("Error updating loan:", error)
      return false
    }
  }

  // Eliminar préstamo
  static async deleteLoan(accountId: string, loanId: string): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId)
      if (!account) return false

      account.loans = account.loans.filter((loan) => loan.id !== loanId)
      await this.updateAccount(accountId, { loans: account.loans })

      // Log de auditoría
      await this.logActivity("DELETE_LOAN", {
        accountId,
        loanId,
      })

      return true
    } catch (error) {
      console.error("Error deleting loan:", error)
      return false
    }
  }

  // Agregar crédito
  static async addCredit(accountId: string, credit: Omit<Credit, "id">): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId)
      if (!account) return false

      const creditId = await this.generateId("credit")
      const newCredit: Credit = {
        ...credit,
        id: creditId,
        approvalDate: new Date().toISOString(),
      }

      account.credits.push(newCredit)
      await this.updateAccount(accountId, { credits: account.credits })

      // Log de auditoría
      await this.logActivity("CREATE_CREDIT", {
        accountId,
        creditId,
        limit: credit.limit,
      })

      return true
    } catch (error) {
      console.error("Error adding credit:", error)
      return false
    }
  }

  // Actualizar crédito
  static async updateCredit(accountId: string, creditId: string, updates: Partial<Credit>): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId)
      if (!account) return false

      const creditIndex = account.credits.findIndex((credit) => credit.id === creditId)
      if (creditIndex === -1) return false

      account.credits[creditIndex] = { ...account.credits[creditIndex], ...updates }
      await this.updateAccount(accountId, { credits: account.credits })

      return true
    } catch (error) {
      console.error("Error updating credit:", error)
      return false
    }
  }

  // Eliminar crédito
  static async deleteCredit(accountId: string, creditId: string): Promise<boolean> {
    try {
      const account = await this.getAccountById(accountId)
      if (!account) return false

      account.credits = account.credits.filter((credit) => credit.id !== creditId)
      await this.updateAccount(accountId, { credits: account.credits })

      // Log de auditoría
      await this.logActivity("DELETE_CREDIT", {
        accountId,
        creditId,
      })

      return true
    } catch (error) {
      console.error("Error deleting credit:", error)
      return false
    }
  }

  // Generar número de cuenta único
  static async generateAccountNumber(): Promise<string> {
    try {
      let accountNumber: string
      let exists = true

      while (exists) {
        const random1 = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")
        const random2 = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, "0")
        accountNumber = `4001-${random1}-${random2}`

        const existingAccount = await this.getAccountByNumber(accountNumber)
        exists = !!existingAccount
      }

      return accountNumber!
    } catch (error) {
      console.error("Error generating account number:", error)
      throw new Error("Error al generar número de cuenta")
    }
  }

  // Generar ID único
  static async generateId(type: string): Promise<string> {
    try {
      const counter = await kv.hincrby(COUNTERS_KEY, type, 1)
      return `${type}_${Date.now()}_${counter}`
    } catch (error) {
      console.error("Error generating ID:", error)
      return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // Obtener información del administrador
  static async getAdminInfo(): Promise<AdminInfo> {
    try {
      const admin = await kv.get(ADMIN_KEY)
      if (admin) {
        return typeof admin === "string" ? JSON.parse(admin) : admin
      }

      // Crear admin por defecto si no existe
      const defaultAdmin: AdminInfo = {
        name: "Administrador Principal",
        email: "admin@bankofamerica.com",
        phone: "3001234567",
        password: "admin123",
      }

      await kv.set(ADMIN_KEY, JSON.stringify(defaultAdmin))
      return defaultAdmin
    } catch (error) {
      console.error("Error getting admin info:", error)
      return {
        name: "Administrador Principal",
        email: "admin@bankofamerica.com",
        phone: "3001234567",
        password: "admin123",
      }
    }
  }

  // Actualizar información del administrador
  static async updateAdminInfo(updates: Partial<AdminInfo>): Promise<AdminInfo> {
    try {
      const currentAdmin = await this.getAdminInfo()
      const updatedAdmin = { ...currentAdmin, ...updates }

      await kv.set(ADMIN_KEY, JSON.stringify(updatedAdmin))
      return updatedAdmin
    } catch (error) {
      console.error("Error updating admin info:", error)
      throw new Error("Error al actualizar información del administrador")
    }
  }

  // Verificar credenciales de administrador
  static async verifyAdminCredentials(identifier: string, password: string): Promise<boolean> {
    try {
      const admin = await this.getAdminInfo()
      return identifier === "admin" && password === admin.password
    } catch (error) {
      console.error("Error verifying admin credentials:", error)
      return false
    }
  }

  // Verificar credenciales de usuario
  static async verifyUserCredentials(identifier: string, password: string): Promise<BankAccount | null> {
    try {
      // Buscar por email
      let account = await this.getAccountByEmail(identifier)

      // Si no se encuentra por email, buscar por número de cuenta
      if (!account) {
        account = await this.getAccountByNumber(identifier)
      }

      if (account && account.password === password && account.isActive) {
        return account
      }

      return null
    } catch (error) {
      console.error("Error verifying user credentials:", error)
      return null
    }
  }

  // Log de actividad
  static async logActivity(action: string, data: any): Promise<void> {
    try {
      const logKey = `bank:logs:${new Date().toISOString().split("T")[0]}`
      const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        data,
      }

      await kv.lpush(logKey, JSON.stringify(logEntry))

      // Mantener solo los últimos 100 logs por día
      await kv.ltrim(logKey, 0, 99)
    } catch (error) {
      console.error("Error logging activity:", error)
    }
  }

  // Obtener estadísticas
  static async getStatistics(): Promise<{
    totalAccounts: number
    totalBalance: number
    activeLoans: number
    activeCredits: number
    totalLoanAmount: number
    totalCreditLimit: number
  }> {
    try {
      const accounts = await this.getAllAccounts()
      const activeAccounts = accounts.filter((acc) => acc.isActive)

      const totalBalance = activeAccounts.reduce((sum, acc) => sum + acc.balance, 0)

      const activeLoans = activeAccounts.reduce(
        (sum, acc) => sum + acc.loans.filter((loan) => loan.status === "active").length,
        0,
      )

      const activeCredits = activeAccounts.reduce(
        (sum, acc) => sum + acc.credits.filter((credit) => credit.status === "active").length,
        0,
      )

      const totalLoanAmount = activeAccounts.reduce(
        (sum, acc) =>
          sum +
          acc.loans.filter((loan) => loan.status === "active").reduce((loanSum, loan) => loanSum + loan.amount, 0),
        0,
      )

      const totalCreditLimit = activeAccounts.reduce(
        (sum, acc) =>
          sum +
          acc.credits
            .filter((credit) => credit.status === "active")
            .reduce((creditSum, credit) => creditSum + credit.limit, 0),
        0,
      )

      return {
        totalAccounts: activeAccounts.length,
        totalBalance,
        activeLoans,
        activeCredits,
        totalLoanAmount,
        totalCreditLimit,
      }
    } catch (error) {
      console.error("Error getting statistics:", error)
      return {
        totalAccounts: 0,
        totalBalance: 0,
        activeLoans: 0,
        activeCredits: 0,
        totalLoanAmount: 0,
        totalCreditLimit: 0,
      }
    }
  }

  // Inicializar datos de ejemplo (solo si no existen cuentas)
  static async initializeDefaultData(): Promise<void> {
    try {
      const accounts = await this.getAllAccounts()
      if (accounts.length > 0) return // Ya hay datos

      // Crear cuenta de ejemplo
      const defaultAccount: Omit<BankAccount, "id" | "createdAt" | "isActive"> = {
        accountNumber: await this.generateAccountNumber(),
        fullName: "Valentina García",
        email: "valentina@email.com",
        password: "123456",
        balance: 25000.75,
        accountType: "Ahorros",
        movements: [
          {
            id: "mov_1",
            type: "deposit",
            amount: 1250.0,
            description: "Depósito inicial",
            date: "2024-01-15",
            balanceAfter: 1250.0,
          },
          {
            id: "mov_2",
            type: "withdrawal",
            amount: 250.0,
            description: "Retiro cajero",
            date: "2024-01-20",
            balanceAfter: 1000.0,
          },
        ],
        credits: [
          {
            id: "credit_1",
            amount: 500.0,
            limit: 2500.0,
            interestRate: 2.5,
            status: "active",
            monthlyPayment: 112.5,
            nextPaymentDate: "2024-03-15",
            creditScore: 750,
            approvalDate: "2024-01-10",
          },
        ],
        loans: [
          {
            id: "loan_1",
            amount: 12500.0,
            monthlyPayment: 625.0,
            remainingPayments: 18,
            interestRate: 1.8,
            status: "active",
            purpose: "Vivienda",
            approvalDate: "2024-01-01",
          },
        ],
        phone: "3101234567",
        address: "Calle 123 # 45-67",
      }

      await this.createAccount(defaultAccount)

      // Crear segunda cuenta de ejemplo
      const secondAccount: Omit<BankAccount, "id" | "createdAt" | "isActive"> = {
        accountNumber: await this.generateAccountNumber(),
        fullName: "Carlos Pérez",
        email: "carlos@email.com",
        password: "abcdef",
        balance: 12500.0,
        accountType: "Corriente",
        movements: [
          {
            id: "mov_3",
            type: "deposit",
            amount: 500.0,
            description: "Depósito inicial",
            date: "2023-11-01",
            balanceAfter: 500.0,
          },
        ],
        credits: [],
        loans: [],
        phone: "3209876543",
        address: "Carrera 789 # 10-11",
      }

      await this.createAccount(secondAccount)

      console.log("Datos de ejemplo inicializados")
    } catch (error) {
      console.error("Error initializing default data:", error)
    }
  }

  // Backup de datos
  static async createBackup(): Promise<string> {
    try {
      const accounts = await this.getAllAccounts()
      const admin = await this.getAdminInfo()
      const stats = await this.getStatistics()

      const backup = {
        timestamp: new Date().toISOString(),
        accounts,
        admin,
        stats,
        version: "1.0",
      }

      const backupKey = `bank:backup:${Date.now()}`
      await kv.set(backupKey, JSON.stringify(backup))

      return backupKey
    } catch (error) {
      console.error("Error creating backup:", error)
      throw new Error("Error al crear backup")
    }
  }
}
