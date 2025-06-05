// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CreditCard,
  DollarSign,
  QrCode,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Users,
  BarChart3,
  ChevronDown,
  User,
  Lock,
  Home,
  CreditCardIcon,
  Loader2,
} from "lucide-react";
import bcrypt from 'bcryptjs'; // <-- IMPORTACIÓN NECESARIA PARA HASHING
// IMPORTA TODAS TUS INTERFACES DESDE EL ARCHIVO CENTRALIZADO
import { BankAccount, Movement, Credit, Loan, AppData } from '@/types';

export default function BankOfAmericaApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<BankAccount | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ identifier: "", password: "" });
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Inicializamos accounts como un array vacío. Los datos se cargarán desde la API/Redis.
  const [accounts, setAccounts] = useState<BankAccount[]>([]);

  // Función para cargar datos desde la API (ahora llama a nuestra API Route)
  const loadDataFromAPI = async () => {
    try {
      setIsLoading(true);

      // --- INICIO: Manejo de localStorage (robusto) ---
      const localData = localStorage.getItem("bankAccounts");
      if (localData) {
        try {
          const parsedLocalData = JSON.parse(localData);
          setAccounts(parsedLocalData);
        } catch (e) {
          console.error("Error al parsear datos de localStorage:", e);
          localStorage.removeItem("bankAccounts"); // Limpiar datos corruptos
        }
      }
      // --- FIN: Manejo de localStorage (robusto) ---


      // Luego intentar cargar desde nuestra API Route (que interactúa con Redis)
      const response = await fetch('/api/data', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.record && Array.isArray(result.record.accounts)) { // <-- Añadida comprobación de array
          setAccounts(result.record.accounts);
          // Actualizar localStorage también
          localStorage.setItem("bankAccounts", JSON.stringify(result.record.accounts));
        } else {
          console.warn('La API no devolvió cuentas válidas o el formato es incorrecto. Usando datos de localStorage o estado vacío.');
          // Si la API no devuelve datos válidos, y no había datos locales, se usa array vacío
          if (!localData) { // Si localData ya se había seteado, no lo sobrescribimos con vacío
            setAccounts([]);
          }
        }
      } else {
        const errorData = await response.json();
        console.error(`Error ${response.status}: ${errorData.message || JSON.stringify(errorData)}`);
        // Si la API falla, y no había datos locales, se usa array vacío
        if (!localData) {
            setAccounts([]);
        }
      }
    } catch (error: any) {
      console.error("Error al cargar datos desde la API (catch principal):", error.message || error);
      // Fallback robusto si fetch falla o cualquier otra cosa sucede
      const localData = localStorage.getItem("bankAccounts");
      if (localData) {
        try {
          setAccounts(JSON.parse(localData));
        } catch (e) {
          console.error("Error al parsear datos de localStorage en catch:", e);
          setAccounts([]); // Si localStorage también falla, array vacío
        }
      } else {
        setAccounts([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para guardar datos en la API (ahora llama a nuestra API Route)
  const saveDataToAPI = async (accountsData: BankAccount[]) => {
    try {
      setIsSaving(true);

      // Guardar en localStorage inmediatamente para una UX instantánea
      localStorage.setItem("bankAccounts", JSON.stringify(accountsData));

      // Envía SÓLO el array de cuentas a la API Route
      const response = await fetch('/api/data', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountsData), // Envía directamente el array accountsData
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`Error al guardar en la API: ${response.status} - ${errorData.message || JSON.stringify(errorData)}`); // Usamos JSON.stringify como fallback
      } else {
        console.log("Datos guardados exitosamente en Redis a través de la API Route.");
      }
    } catch (error: any) {
      console.error("Error al guardar datos en la API:", error.message || error);
    } finally {
      setIsSaving(false);
    }
  };

  // Cargar datos al inicializar el componente
  useEffect(() => {
    loadDataFromAPI();
  }, []);

  // **********************************************************
  // LÓGICA PARA LA PERSISTENCIA DE SESIÓN
  // **********************************************************

  // useEffect para cargar la sesión desde localStorage al montar el componente
  useEffect(() => {
    // Solo intentamos restaurar la sesión una vez que los datos de las cuentas hayan cargado
    // y si no estamos ya loggeados.
    if (!isLoading && !isLoggedIn) {
      const storedLoggedIn = localStorage.getItem('isLoggedIn');
      const storedCurrentUser = localStorage.getItem('currentUser');
      const storedIsAdmin = localStorage.getItem('isAdmin');

      if (storedLoggedIn === 'true') {
        try {
          const parsedIsAdmin = storedIsAdmin === 'true';

          if (parsedIsAdmin) {
            setIsLoggedIn(true);
            setIsAdmin(true);
            setCurrentUser(null); // Asegurarse de que currentUser sea null para el admin
            setActiveSection("dashboard");
            console.log("Sesión de administrador restaurada desde localStorage.");
          } else if (storedCurrentUser) {
            // --- INICIO: Manejo robusto de parsedCurrentUser ---
            let parsedCurrentUser: BankAccount | null = null;
            try {
              parsedCurrentUser = JSON.parse(storedCurrentUser);
            } catch (e) {
              console.error("Error al parsear storedCurrentUser de localStorage:", e);
              // Si falla al parsear, limpiar y salir
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('currentUser');
              localStorage.removeItem('isAdmin');
              return; // Salir del useEffect
            }
            // --- FIN: Manejo robusto de parsedCurrentUser ---

            if (parsedCurrentUser) { // Asegurarse de que no sea null después del parseo
              // Verificamos si el usuario almacenado existe en los datos cargados de cuentas
              const foundUser = accounts.find(
                (acc) => acc.id === parsedCurrentUser.id && acc.email === parsedCurrentUser.email
              );

              if (foundUser) {
                setIsLoggedIn(true);
                setCurrentUser(foundUser); // Usamos el objeto completo de 'accounts' para consistencia
                setIsAdmin(false);
                setActiveSection("inicio");
                console.log("Sesión de usuario restaurada desde localStorage.");
              } else {
                console.warn("Usuario de sesión en localStorage no encontrado o inválido en los datos cargados. Limpiando sesión.");
                // Si el usuario no existe en los datos recién cargados, limpiamos la sesión.
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('isAdmin');
              }
            } else {
              console.warn("storedCurrentUser estaba vacío o nulo. Limpiando sesión.");
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('currentUser');
              localStorage.removeItem('isAdmin');
            }
          }
        } catch (e: any) { // Captura errores generales del try
          console.error("Error general al restaurar la sesión desde localStorage:", e.message || e);
          // Limpiar datos corruptos
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('currentUser');
          localStorage.removeItem('isAdmin');
        }
      }
    }
  }, [isLoading, isLoggedIn, accounts]); // Dependencias: Solo se ejecuta si cambian estos estados.


  // Guardar datos cada vez que cambien las cuentas (después de la carga inicial)
  useEffect(() => {
    if (!isLoading) { // Guardar solo después de que la carga inicial haya terminado
      saveDataToAPI(accounts);
    }
  }, [accounts, isLoading]);

  // Estados para formularios y diálogos
  const [newAccount, setNewAccount] = useState({
    fullName: "",
    email: "",
    password: "",
    accountType: "Ahorros",
    initialBalance: 0,
    phone: "",
    address: "",
  });
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [adminInfo, setAdminInfo] = useState({
    name: "Administrador Principal",
    email: "admin@bankofamerica.com",
    phone: "3001234567",
    password: "admin123",
  });
  const [showAdminDropdown, setShowAdminDropdown] = useState(false);
  const [showAdminProfile, setShowAdminProfile] = useState(false);

  // Estados para servicios
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showRechargeDialog, setShowRechargeDialog] = useState(false);
  const [showCertificateDialog, setShowCertificateDialog] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showPayDialog, setShowPayDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [showKeysDialog, setShowKeysDialog] = useState(false);
  const [showPeaceAndSafeDialog, setShowPeaceAndSafeDialog] = useState(false);

  // Estados para modales de estadísticas
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showLoansModal, setShowLoansModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  // Estados para préstamos y créditos
  const [showCreateLoanDialog, setShowCreateLoanDialog] = useState(false);
  const [showCreateCreditDialog, setShowCreateCreditDialog] = useState(false);
  const [showLoanDetailsDialog, setShowLoanDetailsDialog] = useState(false);
  const [showCreditDetailsDialog, setShowCreditDetailsDialog] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [selectedCredit, setSelectedCredit] = useState<any>(null);
  const [newLoan, setNewLoan] = useState({
    accountId: "",
    amount: 0,
    term: 12,
    interestRate: 5.0,
    purpose: "",
  });
  const [newCredit, setNewCredit] = useState({
    accountId: "",
    limit: 0,
    interestRate: 18.0,
    type: "Tarjeta de Crédito",
  });

  const [showEditLoanDialog, setShowEditLoanDialog] = useState(false);
  const [showEditCreditDialog, setShowEditCreditDialog] = useState(false);
  const [editingLoan, setEditingLoan] = useState<any>(null);
  const [editingCredit, setEditingCredit] = useState<any>(null);

  // Estados para servicios destacados
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Add these new state variables here:
  const [showFinancesDialog, setShowFinancesDialog] = useState(false);
  const [showUserProfileDialog, setShowUserProfileDialog] = useState(false);
  const [financialData, setFinancialData] = useState({
    monthlyIncome: 3500,
    monthlyExpenses: 2800,
    savingsGoal: 10000,
    currentSavings: 6500,
    budgetCategories: [
      { name: "Alimentación", budgeted: 600, spent: 520, color: "bg-blue-500" },
      { name: "Transporte", budgeted: 300, spent: 280, color: "bg-green-500" },
      { name: "Entretenimiento", budgeted: 200, spent: 150, color: "bg-purple-500" },
      { name: "Servicios", budgeted: 400, spent: 380, color: "bg-orange-500" },
      { name: "Otros", budgeted: 300, spent: 250, color: "bg-pink-500" },
    ],
  });

  // Estados para formularios de servicios
  const [transferForm, setTransferForm] = useState({
    destinationAccount: "",
    amount: 0,
    description: "",
    transferType: "account",
  });

  const [rechargeForm, setRechargeForm] = useState({
    phoneNumber: "",
    operator: "",
    amount: 0,
  });

  const [paymentForm, setPaymentForm] = useState({
    serviceType: "",
    reference: "",
    amount: 0,
  });

  const [withdrawForm, setWithdrawForm] = useState({
    amount: 0,
    location: "",
    code: "",
  });

  const [certificateForm, setCertificateForm] = useState({
    type: "",
    purpose: "",
  });

  // Función para formatear moneda en dólares
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Función para formatear números sin símbolo de moneda
  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Funciones para manejar clicks de las tarjetas
  const handleAccountsClick = () => {
    setShowAccountsModal(true);
  };

  const handleBalanceClick = () => {
    setShowBalanceModal(true);
  };

  const handleLoansClick = () => {
    setShowLoansModal(true);
  };

  const handleCreditsClick = () => {
    setShowCreditsModal(true);
  };

  // **********************************************************
  // generateAccountNumber (CORREGIDA)
  // **********************************************************
  const generateAccountNumber = () => {
    const randomPart1 = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    const randomPart2 = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    // CORRECCIÓN: ELIMINADAS LAS ETIQUETAS SPAN DENTRO DE LA CADENA
    return `4001-${randomPart1}-${randomPart2}`;
  };

  // **********************************************************
  // handleLogin (MODIFICADA para usar API Route)
  // **********************************************************
  const handleLogin = async () => { // <--- HACER ASÍNCRONA
    setIsLoading(true); // Mostrar un loader mientras se intenta login
    try {
      // Lógica para administrador fijo (si quieres mantenerla sin pasar por la API)
      if (loginForm.identifier === "admin" && loginForm.password === "admin123") {
        setIsAdmin(true);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('currentUser', JSON.stringify({ id: 'admin', email: 'admin@bankofamerica.com', fullName: 'Administrador' }));
        setActiveSection("dashboard"); // Redirigir al dashboard del admin
        console.log("Inicio de sesión de administrador exitoso (frontend fijo).");
        return; // Salir de la función aquí
      }

      // Llama a tu nueva API Route de login para usuarios regulares
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm), // Envía identifier y password
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Inicio de sesión de usuario regular exitoso a través de API.");

        // Si la API devuelve el usuario (sin password), actualiza el estado local
        setIsLoggedIn(true);
        setCurrentUser(result.user); // Asumiendo que `result.user` es el objeto de usuario que la API devuelve
        setIsAdmin(false);
        setActiveSection("inicio"); // Redirigir al inicio del usuario

        // Persistir en localStorage (la cookie HttpOnly ya maneja la sesión, esto es por si la UI depende de localStorage para el estado inicial)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        localStorage.setItem('isAdmin', 'false');

      } else {
        const errorData = await response.json();
        console.error("Error en el login de usuario regular (API):", errorData.message || errorData);
        alert(errorData.message || "Credenciales incorrectas."); // Muestra el mensaje de error de la API
      }
    } catch (error: any) {
      console.error("Error de red o desconocido al intentar login:", error.message || error);
      alert("Error de conexión. Por favor, intente de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  // Modificar logout para limpiar la sesión de localStorage
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setIsAdmin(false);
    setActiveSection("dashboard");
    setLoginForm({ identifier: "", password: "" });
    // Limpiar localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    // Si usas cookies, deberías tener una API route para logout que limpie la cookie del lado del servidor
    // fetch('/api/auth/logout', { method: 'POST' }); // <--- Podrías añadir esto si creas una API de logout
  };

  // Funciones para servicios destacados
  const handleTransfer = () => {
    if (!transferForm.destinationAccount || transferForm.amount <= 0) {
      alert("Por favor complete todos los campos");
      return;
    }

    if (transferForm.amount > (currentUser?.balance || 0)) {
      alert("Saldo insuficiente");
      return;
    }

    // Simular transferencia
    alert(`Transferencia de ${formatCurrency(transferForm.amount)} realizada exitosamente`);
    setTransferForm({ destinationAccount: "", amount: 0, description: "", transferType: "account" });
    setShowTransferDialog(false);
  };

  const handleRecharge = () => {
    if (!rechargeForm.phoneNumber || !rechargeForm.operator || rechargeForm.amount <= 0) {
      alert("Por favor complete todos los campos");
      return;
    }

    alert(`Recarga de ${formatCurrency(rechargeForm.amount)} realizada exitosamente al ${rechargeForm.phoneNumber}`);
    setRechargeForm({ phoneNumber: "", operator: "", amount: 0 });
    setShowRechargeDialog(false);
  };

  const handlePayment = () => {
    if (!paymentForm.serviceType || !paymentForm.reference || paymentForm.amount <= 0) {
      alert("Por favor complete todos los campos");
      return;
    }

    alert(`Pago de ${formatCurrency(paymentForm.amount)} realizado exitosamente`);
    setPaymentForm({ serviceType: "", reference: "", amount: 0 });
    setShowPayDialog(false);
  };

  const handleWithdraw = () => {
    if (withdrawForm.amount <= 0 || !withdrawForm.location) {
      alert("Por favor complete todos los campos");
      return;
    }

    if (withdrawForm.amount > (currentUser?.balance || 0)) {
      alert("Saldo insuficiente");
      return;
    }

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    alert(`Código de retiro generado: ${code}. Use este código en el cajero seleccionado.`);
    setWithdrawForm({ amount: 0, location: "", code: "" });
    setShowWithdrawDialog(false);
  };

  const handleCertificate = () => {
    if (!certificateForm.type || !certificateForm.purpose) {
      alert("Por favor complete todos los campos");
      return;
    }

    alert(`Certificado de ${certificateForm.type} generado exitosamente`);
    setCertificateForm({ type: "", purpose: "" });
    setShowCertificateDialog(false);
  };

  // **********************************************************
  // generateQRCode (CORREGIDA)
  // **********************************************************
  const generateQRCode = () => {
    // CORRECCIÓN: ELIMINADAS LAS ETIQUETAS SPAN DENTRO DE LA CADENA
    const qrData = `${currentUser?.accountNumber}-${Date.now()}`;
    alert(`Código QR generado para recibir pagos: ${qrData}`);
    setShowQRDialog(false);
  };

  // **********************************************************
  // handleCreateAccount (MODIFICADA para hashear contraseña)
  // **********************************************************
  const handleCreateAccount = async () => { // <--- HACER ASÍNCRONA
    const accountNumber = generateAccountNumber();
    const movements: Movement[] = [];

    // --- INICIO: Lógica para Hashear Contraseña ---
    // Genera el hash de la contraseña antes de guardarla.
    // Si no se proporciona una contraseña, usa el número de cuenta (hasheado también).
    const rawPassword = newAccount.password || accountNumber.replace(/-/g, "");
    const hashedPassword = await bcrypt.hash(rawPassword, 10); // 10 es el costo del salt.
    // --- FIN: Lógica para Hashear Contraseña ---

    // Agregar depósito inicial si hay saldo
    if (newAccount.initialBalance > 0) {
      movements.push({
        id: "initial",
        type: "deposit",
        amount: newAccount.initialBalance,
        description: "Depósito inicial",
        date: new Date().toISOString().split("T")[0],
      });
    }

    const account: BankAccount = {
      id: Date.now().toString(),
      accountNumber: accountNumber,
      fullName: newAccount.fullName,
      email: newAccount.email,
      password: hashedPassword, // <--- ¡Ahora guarda el HASHED PASSWORD!
      balance: newAccount.initialBalance,
      accountType: newAccount.accountType,
      createdAt: new Date().toISOString().split("T")[0],
      movements: movements,
      credits: [],
      loans: [],
      phone: newAccount.phone,
      address: newAccount.address,
    };

    setAccounts([...accounts, account]); // Esto eventualmente llamará a saveDataToAPI
    setNewAccount({
      fullName: "",
      email: "",
      password: "", // Limpiar la contraseña ingresada del formulario
      accountType: "Ahorros",
      initialBalance: 0,
      phone: "",
      address: "",
    });
    setShowCreateDialog(false);
    alert("Cuenta creada exitosamente");
  };

  const handleEditAccount = () => {
    if (editingAccount) {
      setAccounts(accounts.map((acc) => (acc.id === editingAccount.id ? editingAccount : acc)));
      if (currentUser && currentUser.id === editingAccount.id) {
        setCurrentUser(editingAccount);
      }
      setEditingAccount(null);
      setShowEditDialog(false);
      alert("Cuenta actualizada exitosamente");
    }
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm("¿Está seguro de eliminar esta cuenta?")) {
      setAccounts(accounts.filter((acc) => acc.id !== id));
    }
  };

  const handleCreateLoan = () => {
    const account = accounts.find((acc) => acc.id === newLoan.accountId);
    if (!account) {
      alert("Seleccione una cuenta válida");
      return;
    }

    const monthlyPayment = calculateMonthlyPayment(newLoan.amount, newLoan.interestRate, newLoan.term);

    const loan: Loan = {
      id: Date.now().toString(),
      amount: newLoan.amount,
      monthlyPayment: monthlyPayment,
      remainingPayments: newLoan.term,
      interestRate: newLoan.interestRate,
      status: "active",
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.id === newLoan.accountId ? { ...acc, loans: [...acc.loans, loan] } : acc,
    );

    setAccounts(updatedAccounts);
    setNewLoan({
      accountId: "",
      amount: 0,
      term: 12,
      interestRate: 5.0,
      purpose: "",
    });
    setShowCreateLoanDialog(false);
    alert("Préstamo creado exitosamente");
  };

  const handleCreateCredit = () => {
    const account = accounts.find((acc) => acc.id === newCredit.accountId);
    if (!account) {
      alert("Seleccione una cuenta válida");
      return;
    }

    const credit: Credit = {
      id: Date.now().toString(),
      amount: 0,
      limit: newCredit.limit,
      interestRate: newCredit.interestRate,
      status: "active",
    };

    const updatedAccounts = accounts.map((acc) =>
      acc.id === newCredit.accountId ? { ...acc, credits: [...acc.credits, credit] } : acc,
    );

    setAccounts(updatedAccounts);
    setNewCredit({
      accountId: "",
      limit: 0,
      interestRate: 18.0,
      type: "Tarjeta de Crédito",
    });
    setShowCreateCreditDialog(false);
    alert("Crédito creado exitosamente");
  };

  const handleEditLoan = () => {
    if (editingLoan) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === editingLoan.accountId) {
          const updatedLoans = acc.loans.map((loan) =>
            loan.id === editingLoan.id
              ? {
                ...loan,
                amount: editingLoan.amount,
                monthlyPayment: calculateMonthlyPayment(
                  editingLoan.amount,
                  editingLoan.interestRate,
                  editingLoan.remainingPayments,
                ),
                remainingPayments: editingLoan.remainingPayments,
                interestRate: editingLoan.interestRate,
              }
              : loan,
          );
          return { ...acc, loans: updatedLoans };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      setEditingLoan(null);
      setShowEditLoanDialog(false);
      alert("Préstamo actualizado exitosamente");
    }
  };

  const handleDeleteLoan = (accountId: string, loanId: string) => {
    if (confirm("¿Está seguro de eliminar este préstamo?")) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === accountId) {
          return { ...acc, loans: acc.loans.filter((loan) => loan.id !== loanId) };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      alert("Préstamo eliminado exitosamente");
    }
  };

  const handleEditCredit = () => {
    if (editingCredit) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === editingCredit.accountId) {
          const updatedCredits = acc.credits.map((credit) =>
            credit.id === editingCredit.id
              ? {
                ...credit,
                limit: editingCredit.limit,
                interestRate: editingCredit.interestRate,
              }
              : credit,
          );
          return { ...acc, credits: updatedCredits };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      setEditingCredit(null);
      setShowEditCreditDialog(false);
      alert("Crédito actualizado exitosamente");
    }
  };

  const handleDeleteCredit = (accountId: string, creditId: string) => {
    if (confirm("¿Está seguro de eliminar este crédito?")) {
      const updatedAccounts = accounts.map((acc) => {
        if (acc.id === accountId) {
          return { ...acc, credits: acc.credits.filter((credit) => credit.id !== creditId) };
        }
        return acc;
      });
      setAccounts(updatedAccounts);
      alert("Crédito eliminado exitosamente");
    }
  };

  const calculateMonthlyPayment = (principal: number, annualRate: number, months: number) => {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
  };

  const handleViewLoanDetails = (accountId: string, loan: Loan) => {
    const account = accounts.find((acc) => acc.id === accountId);
    setSelectedLoan({ ...loan, account });
    setShowLoanDetailsDialog(true);
  };

  const handleViewCreditDetails = (accountId: string, credit: Credit) => {
    const account = accounts.find((acc) => acc.id === accountId);
    setSelectedCredit({ ...credit, account });
    setShowCreditDetailsDialog(true);
  };

  // Calcular estadísticas para el admin
  const totalAccounts = accounts.length;
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  const activeLoans = accounts.reduce(
    (sum, acc) => sum + acc.loans.filter((loan) => loan.status === "active").length,
    0,
  );
  const activeCredits = accounts.reduce(
    (sum, acc) => sum + acc.credits.filter((credit) => credit.status === "active").length,
    0,
  );

  // Mostrar pantalla de carga mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Bank of America</h1>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="text-gray-600">Cargando datos bancarios...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo y título */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Bank of America</h1>
            </div>
          </div>

          {/* Formulario de login */}
          <Card className="shadow-lg">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
              <CardDescription className="text-gray-600">Ingrese sus credenciales para acceder.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                  Identificador
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="identifier"
                    placeholder="Usuario (admin) o Número de Cuenta"
                    className="pl-10 h-12 border-gray-300"
                    value={loginForm.identifier}
                    onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="passwordC">
                  Contraseña
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="passwordC"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    className="pl-10 h-12 border-gray-300"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={handleLogin} className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium">
                Iniciar sesión
              </Button>
              <div className="text-xs text-center text-gray-500 mt-4 space-y-1">
                <p>Admin: admin / admin123</p>
                <p>Usuario: valentina@email.com / 123456</p>
                <p>O usar número de cuenta: 4001-2345-6789</p>
              </div>

              {/* Indicador de estado de sincronización */}
              <div className="text-center">
                {isSaving ? (
                  <div className="flex items-center justify-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Sincronizando datos...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-xs">Datos sincronizados</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-blue-600 text-white">
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-8">
              <Building2 className="h-8 w-8" />
              <span className="text-xl font-bold">Bank of America</span>
            </div>
            <nav className="space-y-2">
              <button
                onClick={() => setActiveSection("dashboard")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === "dashboard" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <BarChart3 className="h-5 w-5" />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => setActiveSection("accounts")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === "accounts" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <Users className="h-5 w-5" />
                <span>Cuentas</span>
              </button>
              <button
                onClick={() => setActiveSection("loans")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === "loans" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <Building2 className="h-5 w-5" />
                <span>Préstamos</span>
              </button>
              <button
                onClick={() => setActiveSection("credits")}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === "credits" ? "bg-blue-700" : "hover:bg-blue-700"
                }`}
              >
                <CreditCardIcon className="h-5 w-5" />
                <span>Créditos</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrador</h1>
                <p className="text-gray-600">Resumen general del sistema Bank of America.</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Indicador de sincronización */}
                {isSaving ? (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Guardando...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                    <span className="text-sm">Sincronizado</span>
                  </div>
                )}

                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva cuenta cliente
                </Button>
                <div className="relative">
                  <Button
                    onClick={() => setShowAdminDropdown(!showAdminDropdown)}
                    className="flex items-center space-x-2 bg-white text-gray-900 border border-gray-300 hover:bg-gray-50"
                  >
                    <Avatar className="bg-blue-600">
                      <AvatarFallback className="bg-blue-600 text-white">A</AvatarFallback>
                    </Avatar>
                    <div className="flex items-center space-x-1">
                      <span className="text-sm font-medium text-gray-900">{adminInfo.name}</span>
                      <ChevronDown className="h-4 w-4 text-gray-400" />
                    </div>
                  </Button>
                  {showAdminDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                      <button
                        onClick={() => {
                          setShowAdminProfile(true);
                          setShowAdminDropdown(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mi Perfil
                      </button>
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <div className="p-6">
            {activeSection === "dashboard" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleAccountsClick}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total de cuentas</p>
                          <p className="text-3xl font-bold text-gray-900">{totalAccounts}</p>
                          <p className="text-sm text-gray-500">Cuentas activas</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Users className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleBalanceClick}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Balance total</p>
                          <p className="text-3xl font-bold text-gray-900">{formatNumber(totalBalance)}</p>
                          <p className="text-sm text-gray-500">Suma de todas las cuentas</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleLoansClick}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Préstamos activos</p>
                          <p className="text-3xl font-bold text-gray-900">{activeLoans}</p>
                          <p className="text-sm text-gray-500">Préstamos aprobados</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                          <Building2 className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
                    onClick={handleCreditsClick}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Créditos activos</p>
                          <p className="text-3xl font-bold text-gray-900">{activeCredits}</p>
                          <p className="text-sm text-gray-500">Créditos aprobados</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                          <CreditCardIcon className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Actividad Reciente</CardTitle>
                      <CardDescription>Últimas transacciones del sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                              <Plus className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="font-medium">Nueva cuenta creada</p>
                              <p className="text-sm text-gray-500">Valentina García</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">Hoy</span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">Transferencia procesada</p>
                              <p className="text-sm text-gray-500">{formatCurrency(500.0)}</p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">2h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Estadísticas del Sistema</CardTitle>
                      <CardDescription>Resumen de operaciones</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Transacciones hoy</span>
                          <span className="font-semibold">24</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Nuevas cuentas (mes)</span>
                          <span className="font-semibold">{totalAccounts}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Préstamos pendientes</span>
                          <span className="font-semibold">0</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Créditos pendientes</span>
                          <span className="font-semibold">0</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeSection === "accounts" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Gestión de Cuentas</h2>
                  <Button onClick={() => setShowCreateDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Cuenta
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Número de Cuenta</TableHead>
                            <TableHead>Nombre Completo</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Saldo</TableHead>
                            <TableHead>Fecha Creación</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.map((account) => (
                            <TableRow key={account.id} className="hover:bg-gray-50">
                              <TableCell className="font-mono">{account.accountNumber}</TableCell>
                              <TableCell className="font-medium">{account.fullName}</TableCell>
                              <TableCell>{account.email}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{account.accountType}</Badge>
                              </TableCell>
                              <TableCell className="font-semibold">{formatCurrency(account.balance)}</TableCell>
                              <TableCell>{account.createdAt}</TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedAccount(account);
                                      setShowDetailsDialog(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingAccount(account);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleDeleteAccount(account.id)}>
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "loans" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Gestión de Préstamos</h2>
                  <Button onClick={() => setShowCreateLoanDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Préstamo
                  </Button>
                </div>

                {/* Estadísticas de Préstamos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Préstamos</p>
                          <p className="text-3xl font-bold text-gray-900">{activeLoans}</p>
                          <p className="text-sm text-gray-500">Préstamos aprobados</p>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                          <Building2 className="h-8 w-8 text-orange-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Monto Total</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(
                              accounts.reduce(
                                (sum, acc) =>
                                  sum +
                                  acc.loans
                                    .filter((loan) => loan.status === "active")
                                    .reduce((loanSum, loan) => loanSum + loan.amount, 0),
                                0,
                              ),
                            )}
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Pagos Mensuales</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(
                              accounts.reduce(
                                (sum, acc) =>
                                  sum +
                                  acc.loans
                                    .filter((loan) => loan.status === "active")
                                    .reduce((loanSum, loan) => loanSum + loan.monthlyPayment, 0),
                                0,
                              ),
                            )}
                          </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <CreditCard className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabla de Préstamos */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Número de Cuenta</TableHead>
                            <TableHead>Monto</TableHead>
                            <TableHead>Pago Mensual</TableHead>
                            <TableHead>Cuotas Restantes</TableHead>
                            <TableHead>Tasa</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.map((account) =>
                            account.loans.map((loan) => (
                              <TableRow key={`<span class="math-inline">\{account\.id\}\-</span>{loan.id}`} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{account.fullName}</TableCell>
                                <TableCell className="font-mono">{account.accountNumber}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(loan.amount)}</TableCell>
                                <TableCell>{formatCurrency(loan.monthlyPayment)}</TableCell>
                                <TableCell>{loan.remainingPayments}</TableCell>
                                <TableCell>{loan.interestRate}%</TableCell>
                                <TableCell>
                                  <Badge variant={loan.status === "active" ? "default" : "secondary"}>
                                    {loan.status === "active" ? "Activo" : "Inactivo"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewLoanDetails(account.id, loan)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingLoan({ ...loan, accountId: account.id });
                                        setShowEditLoanDialog(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteLoan(account.id, loan.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {activeLoans === 0 && (
                      <div className="text-center py-10">
                        <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No hay préstamos registrados</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "credits" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Gestión de Créditos</h2>
                  <Button onClick={() => setShowCreateCreditDialog(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Crédito
                  </Button>
                </div>

                {/* Estadísticas de Créditos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Créditos</p>
                          <p className="text-3xl font-bold text-gray-900">{activeCredits}</p>
                          <p className="text-sm text-gray-500">Créditos aprobados</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                          <CreditCardIcon className="h-8 w-8 text-purple-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Límite Total</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(
                              accounts.reduce(
                                (sum, acc) =>
                                  sum +
                                  acc.credits
                                    .filter((credit) => credit.status === "active")
                                    .reduce((creditSum, credit) => creditSum + credit.limit, 0),
                                0,
                              ),
                            )}
                          </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                          <DollarSign className="h-8 w-8 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Disponible Total</p>
                          <p className="text-3xl font-bold text-gray-900">
                            {formatCurrency(
                              accounts.reduce(
                                (sum, acc) =>
                                  sum +
                                  acc.credits
                                    .filter((credit) => credit.status === "active")
                                    .reduce((creditSum, credit) => creditSum + (credit.limit - credit.amount), 0),
                                0,
                              ),
                            )}
                          </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                          <CreditCard className="h-8 w-8 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tabla de Créditos */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Número de Cuenta</TableHead>
                            <TableHead>Límite</TableHead>
                            <TableHead>Usado</TableHead>
                            <TableHead>Disponible</TableHead>
                            <TableHead>Tasa</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {accounts.map((account) =>
                            account.credits.map((credit) => (
                              <TableRow key={`<span class="math-inline">\{account\.id\}\-</span>{credit.id}`} className="hover:bg-gray-50">
                                <TableCell className="font-medium">{account.fullName}</TableCell>
                                <TableCell className="font-mono">{account.accountNumber}</TableCell>
                                <TableCell className="font-semibold">{formatCurrency(credit.limit)}</TableCell>
                                <TableCell>{formatCurrency(credit.amount)}</TableCell>
                                <TableCell className="font-semibold text-green-600">
                                  {formatCurrency(credit.limit - credit.amount)}
                                </TableCell>
                                <TableCell>{credit.interestRate}%</TableCell>
                                <TableCell>
                                  <Badge variant={credit.status === "active" ? "default" : "secondary"}>
                                    {credit.status === "active" ? "Activo" : "Inactivo"}
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <div className="flex space-x-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleViewCreditDetails(account.id, credit)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingCredit({ ...credit, accountId: account.id });
                                        setShowEditCreditDialog(true);
                                      }}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleDeleteCredit(account.id, credit.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                    {activeCredits === 0 && (
                      <div className="text-center py-10">
                        <CreditCardIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-500">No hay créditos registrados</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Diálogos del Administrador */}
        {/* Dialog para crear cuenta */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Cuenta</DialogTitle>
              <DialogDescription>Ingrese los datos del nuevo cliente</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  value={newAccount.fullName}
                  onChange={(e) => setNewAccount({ ...newAccount, fullName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={newAccount.phone}
                  onChange={(e) => setNewAccount({ ...newAccount, phone: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="accountType">Tipo de Cuenta</Label>
                <Select
                  value={newAccount.accountType}
                  onValueChange={(value) => setNewAccount({ ...newAccount, accountType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ahorros">Ahorros</SelectItem>
                    <SelectItem value="Corriente">Corriente</SelectItem>
                    <SelectItem value="Empresarial">Empresarial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="initialBalance">Saldo Inicial (USD)</Label>
                <Input
                  id="initialBalance"
                  type="number"
                  value={newAccount.initialBalance}
                  onChange={(e) => setNewAccount({ ...newAccount, initialBalance: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={newAccount.password}
                  onChange={(e) => setNewAccount({ ...newAccount, password: e.target.value })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Textarea
                  id="address"
                  value={newAccount.address}
                  onChange={(e) => setNewAccount({ ...newAccount, address: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateAccount}>Crear Cuenta</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar cuenta */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Cuenta</DialogTitle>
              <DialogDescription>Información y configuración de la cuenta</DialogDescription>
            </DialogHeader>

            {editingAccount && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="editFullName">Nombre Completo</Label>
                  <Input
                    id="editFullName"
                    value={editingAccount.fullName}
                    onChange={(e) => setEditingAccount({ ...editingAccount, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editEmail">Email</Label>
                  <Input
                    id="editEmail"
                    type="email"
                    value={editingAccount.email}
                    onChange={(e) => setEditingAccount({ ...editingAccount, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editPhone">Teléfono</Label>
                  <Input
                    id="editPhone"
                    value={editingAccount.phone}
                    onChange={(e) => setEditingAccount({ ...editingAccount, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editBalance">Saldo (USD)</Label>
                  <Input
                    id="editBalance"
                    type="number"
                    value={editingAccount.balance}
                    onChange={(e) => setEditingAccount({ ...editingAccount, balance: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="editAddress">Dirección</Label>
                  <Textarea
                    id="editAddress"
                    value={editingAccount.address}
                    onChange={(e) => setEditingAccount({ ...editingAccount, address: e.target.value })}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditAccount}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para ver detalles de cuenta */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Detalles de la Cuenta</DialogTitle>
              <CardDescription>Información completa del cliente</CardDescription>
            </DialogHeader>

            {selectedAccount && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Nombre Completo</p>
                      <p className="font-medium text-gray-800">{selectedAccount.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Email</p>
                      <p className="font-medium text-gray-800">{selectedAccount.email}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Teléfono</p>
                      <p className="font-medium text-gray-800">{selectedAccount.phone}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 mb-1">Saldo Actual</p>
                      <p className="text-2xl font-bold text-blue-800">{formatCurrency(selectedAccount.balance)}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Número de Cuenta</p>
                      <p className="font-medium text-gray-800 font-mono">{selectedAccount.accountNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Tipo de Cuenta</p>
                      <p className="font-medium text-gray-800">{selectedAccount.accountType}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Dirección</p>
                  <p className="font-medium text-gray-800">{selectedAccount.address}</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Movimientos Recientes</h3>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedAccount.movements.map((movement) => (
                          <TableRow key={movement.id}>
                            <TableCell>{movement.date}</TableCell>
                            <TableCell>{movement.description}</TableCell>
                            <TableCell>
                              <Badge variant={movement.type === "deposit" ? "default" : "secondary"}>
                                {movement.type === "deposit"
                                  ? "Depósito"
                                  : movement.type === "withdrawal"
                                    ? "Retiro"
                                    : "Transferencia"}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${
                                movement.type === "deposit" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {movement.type === "deposit" ? "+" : "-"}
                              {formatCurrency(movement.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para crear préstamo */}
        <Dialog open={showCreateLoanDialog} onOpenChange={setShowCreateLoanDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Préstamo</DialogTitle>
              <DialogDescription>Ingrese los datos del préstamo</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="loanAccount">Cuenta del Cliente</Label>
                <Select
                  value={newLoan.accountId}
                  onValueChange={(value) => setNewLoan({ ...newLoan, accountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.fullName} - {account.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="loanAmount">Monto del Préstamo (USD)</Label>
                <Input
                  id="loanAmount"
                  type="number"
                  placeholder="0"
                  value={newLoan.amount}
                  onChange={(e) => setNewLoan({ ...newLoan, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="loanTerm">Plazo (meses)</Label>
                <Input
                  id="loanTerm"
                  type="number"
                  placeholder="12"
                  value={newLoan.term}
                  onChange={(e) => setNewLoan({ ...newLoan, term: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="loanRate">Tasa de Interés (%)</Label>
                <Input
                  id="loanRate"
                  type="number"
                  step="0.1"
                  placeholder="5.0"
                  value={newLoan.interestRate}
                  onChange={(e) => setNewLoan({ ...newLoan, interestRate: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="loanPurpose">Propósito</Label>
                <Select value={newLoan.purpose} onValueChange={(value) => setNewLoan({ ...newLoan, purpose: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar propósito" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vivienda">Vivienda</SelectItem>
                    <SelectItem value="Vehículo">Vehículo</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                    <SelectItem value="Negocio">Negocio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newLoan.amount > 0 && newLoan.term > 0 && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Resumen del Préstamo</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Monto:</span>
                    <span className="font-medium ml-2">{formatCurrency(newLoan.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pago Mensual:</span>
                    <span className="font-medium ml-2">
                      {formatCurrency(calculateMonthlyPayment(newLoan.amount, newLoan.interestRate, newLoan.term))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateLoanDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateLoan}>Crear Préstamo</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para crear crédito */}
        <Dialog open={showCreateCreditDialog} onOpenChange={setShowCreateCreditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Crédito</DialogTitle>
              <DialogDescription>Ingrese los datos del crédito</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="creditAccount">Cuenta del Cliente</Label>
                <Select
                  value={newCredit.accountId}
                  onValueChange={(value) => setNewCredit({ ...newCredit, accountId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar cuenta" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.fullName} - {account.accountNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="creditLimit">Límite de Crédito (USD)</Label>
                <Input
                  id="creditLimit"
                  type="number"
                  placeholder="0"
                  value={newCredit.limit}
                  onChange={(e) => setNewCredit({ ...newCredit, limit: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="creditRate">Tasa de Interés (%)</Label>
                <Input
                  id="creditRate"
                  type="number"
                  step="0.1"
                  placeholder="18.0"
                  value={newCredit.interestRate}
                  onChange={(e) => setNewCredit({ ...newCredit, interestRate: Number(e.target.value) })}
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="creditType">Tipo de Crédito</Label>
                <Select value={newCredit.type} onValueChange={(value) => setNewCredit({ ...newCredit, type: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Tarjeta de Crédito">Tarjeta de Crédito</SelectItem>
                    <SelectItem value="Línea de Crédito">Línea de Crédito</SelectItem>
                    <SelectItem value="Crédito Rotativo">Crédito Rotativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {newCredit.limit > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-800 mb-2">Resumen del Crédito</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Límite:</span>
                    <span className="font-medium ml-2">{formatCurrency(newCredit.limit)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium ml-2">{newCredit.type}</span>
                  </div>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateCreditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateCredit}>Crear Crédito</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para detalles de préstamo */}
        <Dialog open={showLoanDetailsDialog} onOpenChange={setShowLoanDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Préstamo</DialogTitle>
              <DialogDescription>Información completa del préstamo</DialogDescription>
            </DialogHeader>
            {selectedLoan && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Cliente</p>
                      <p className="font-medium text-gray-800">{selectedLoan.account?.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Número de Cuenta</p>
                      <p className="font-medium text-gray-800 font-mono">{selectedLoan.account?.accountNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Estado</p>
                      <Badge variant={selectedLoan.status === "active" ? "default" : "secondary"}>
                        {selectedLoan.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-700 mb-1">Monto del Préstamo</p>
                      <p className="text-2xl font-bold text-blue-800">{formatCurrency(selectedLoan.amount)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-700 mb-1">Pago Mensual</p>
                      <p className="text-2xl font-bold text-green-800">{formatCurrency(selectedLoan.monthlyPayment)}</p>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <p className="text-sm text-orange-700 mb-1">Cuotas Restantes</p>
                      <p className="text-2xl font-bold text-orange-800">{selectedLoan.remainingPayments}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Tasa de Interés</p>
                  <p className="font-medium text-gray-800">{selectedLoan.interestRate}% anual</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para detalles de crédito */}
        <Dialog open={showCreditDetailsDialog} onOpenChange={setShowCreditDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalles del Crédito</DialogTitle>
              <DialogDescription>Información completa del crédito</DialogDescription>
            </DialogHeader>
            {selectedCredit && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Cliente</p>
                      <p className="font-medium text-gray-800">{selectedCredit.account?.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Número de Cuenta</p>
                      <p className="font-medium text-gray-800 font-mono">{selectedCredit.account?.accountNumber}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Estado</p>
                      <Badge variant={selectedCredit.status === "active" ? "default" : "secondary"}>
                        {selectedCredit.status === "active" ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <p className="text-sm text-purple-700 mb-1">Límite de Crédito</p>
                      <p className="text-2xl font-bold text-purple-800">{formatCurrency(selectedCredit.limit)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-700 mb-1">Crédito Disponible</p>
                      <p className="text-2xl font-bold text-green-800">
                        {formatCurrency(selectedCredit.limit - selectedCredit.amount)}
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-sm text-red-700 mb-1">Crédito Utilizado</p>
                      <p className="text-2xl font-bold text-red-800">{formatCurrency(selectedCredit.amount)}</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Tasa de Interés</p>
                    <p className="font-medium text-gray-800">{selectedCredit.interestRate}% anual</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Utilización</p>
                    <p className="font-medium text-gray-800">
                      {((selectedCredit.amount / selectedCredit.limit) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog para perfil del administrador */}
        <Dialog open={showAdminProfile} onOpenChange={setShowAdminProfile}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Perfil del Administrador</DialogTitle>
             <DialogDescription>Información y configuración de la cuenta</DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16 bg-blue-600">
                  <AvatarFallback className="bg-blue-600 text-white text-xl">A</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{adminInfo.name}</h3>
                  <p className="text-sm text-gray-500">Administrador Principal</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="adminName">Nombre Completo</Label>
                  <Input
                    id="adminName"
                    value={adminInfo.name}
                    onChange={(e) => setAdminInfo({ ...adminInfo, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminInfo.email}
                    onChange={(e) => setAdminInfo({ ...adminInfo, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="adminPhone">Teléfono</Label>
                  <Input
                    id="adminPhone"
                    value={adminInfo.phone}
                    onChange={(e) => setAdminInfo({ ...adminInfo, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">Nueva Contraseña</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    placeholder="Dejar en blanco para mantener actual"
                    onChange={(e) => setAdminInfo({ ...adminInfo, password: e.target.value || adminInfo.password })}
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Estadísticas de Sesión</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Último acceso:</span>
                    <span className="font-medium">Hoy, {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sesiones activas:</span>
                    <span className="font-medium">1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Permisos:</span>
                    <span className="font-medium">Administrador Total</span>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAdminProfile(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  setShowAdminProfile(false);
                  alert("Perfil actualizado exitosamente");
                }}
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar préstamo */}
        <Dialog open={showEditLoanDialog} onOpenChange={setShowEditLoanDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Préstamo</DialogTitle>
              <DialogDescription>Modifique los datos del préstamo</DialogDescription>
            </DialogHeader>

            {editingLoan && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    Cliente: {accounts.find((acc) => acc.id === editingLoan.accountId)?.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Cuenta: {accounts.find((acc) => acc.id === editingLoan.accountId)?.accountNumber}
                  </p>
                </div>
                <div>
                  <Label htmlFor="editLoanAmount">Monto del Préstamo (USD)</Label>
                  <Input
                    id="editLoanAmount"
                    type="number"
                    value={editingLoan.amount}
                    onChange={(e) => setEditingLoan({ ...editingLoan, amount: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="editLoanPayments">Cuotas Restantes</Label>
                  <Input
                    id="editLoanPayments"
                    type="number"
                    value={editingLoan.remainingPayments}
                    onChange={(e) => setEditingLoan({ ...editingLoan, remainingPayments: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="editLoanRate">Tasa de Interés (%)</Label>
                  <Input
                    id="editLoanRate"
                    type="number"
                    step="0.1"
                    value={editingLoan.interestRate}
                    onChange={(e) => setEditingLoan({ ...editingLoan, interestRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Pago Mensual Calculado</Label>
                  <Input
                    value={formatCurrency(
                      calculateMonthlyPayment(
                        editingLoan.amount,
                        editingLoan.interestRate,
                        editingLoan.remainingPayments,
                      ),
                    )}
                    readOnly
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditLoanDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditLoan}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dialog para editar crédito */}
        <Dialog open={showEditCreditDialog} onOpenChange={setShowEditCreditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Editar Crédito</DialogTitle>
              <DialogDescription>Modifique los datos del crédito</DialogDescription>
            </DialogHeader>

            {editingCredit && (
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    Cliente: {accounts.find((acc) => acc.id === editingCredit.accountId)?.fullName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Cuenta: {accounts.find((acc) => acc.id === editingCredit.accountId)?.accountNumber}
                  </p>
                </div>
                <div>
                  <Label htmlFor="editCreditLimit">Límite de Crédito (USD)</Label>
                  <Input
                    id="editCreditLimit"
                    type="number"
                    value={editingCredit.limit}
                    onChange={(e) => setEditingCredit({ ...editingCredit, limit: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="editCreditRate">Tasa de Interés (%)</Label>
                  <Input
                    id="editCreditRate"
                    type="number"
                    step="0.1"
                    value={editingCredit.interestRate}
                    onChange={(e) => setEditingCredit({ ...editingCredit, interestRate: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Crédito Utilizado</Label>
                  <Input value={formatCurrency(editingCredit.amount)} readOnly />
                </div>
                <div>
                  <Label>Crédito Disponible</Label>
                  <Input value={formatCurrency(editingCredit.limit - editingCredit.amount)} readOnly />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditCreditDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleEditCredit}>Guardar Cambios</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  // Resto del componente (vista de usuario normal y diálogos de servicios)
  // ... (El código de la vista de usuario normal y diálogos de servicios no estaba en el input,
  // si lo necesitas, por favor, proporciónalo y lo añadiré aquí con las correcciones necesarias).
  // Por ahora, mostraré un mensaje de error si no es admin y no hay un currentUser.
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="max-w-md w-full p-6 text-center">
        <CardTitle>Error de Acceso</CardTitle>
        <CardDescription className="mt-2">
          No se ha encontrado una sesión de usuario válida. Por favor, inicie sesión.
        </CardDescription>
        <Button onClick={logout} className="mt-4 bg-red-600 hover:bg-red-700 text-white">
          Ir al Login
        </Button>
      </Card>
    </div>
  );
}