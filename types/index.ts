// types/index.ts
// ESTE ES EL UNICO ARCHIVO QUE DEBE CONTENER ESTAS DEFINICIONES DE INTERFACE.

export interface BankAccount {
    id: string;
    accountNumber: string;
    fullName: string;
    email: string;
    password?: string;
    balance: number;
    accountType: string;
    createdAt: string;
    movements: Movement[];
    credits: Credit[];
    loans: Loan[];
    phone: string;
    address: string;
}

export interface Movement {
    id: string;
    type: "deposit" | "withdrawal" | "transfer";
    amount: number;
    description: string;
    date: string;
}

export interface Credit {
    id: string;
    amount: number;
    limit: number;
    interestRate: number;
    status: "active" | "pending" | "closed";
    monthlyPayment?: number;
    nextPaymentDate?: string;
    creditScore?: number;
    approvalDate?: string;
}

export interface Loan {
    id: string;
    amount: number;
    monthlyPayment: number;
    remainingPayments: number;
    interestRate: number;
    status: "active" | "pending" | "paid";
}

export interface AppData {
    accounts: BankAccount[];
    lastUpdated: string;
}