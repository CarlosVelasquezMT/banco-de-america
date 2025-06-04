-- =====================================================
-- BANCO DE AMÉRICA - ESQUEMA DE BASE DE DATOS
-- Sistema Bancario Completo con MySQL/MariaDB
-- =====================================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS bank_of_america 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE bank_of_america;

-- =====================================================
-- TABLA: administrators
-- Gestión de administradores del sistema
-- =====================================================
CREATE TABLE administrators (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_active (is_active)
);

-- =====================================================
-- TABLA: bank_accounts
-- Cuentas bancarias de los clientes
-- =====================================================
CREATE TABLE bank_accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    account_type ENUM('Ahorros', 'Corriente', 'Empresarial') DEFAULT 'Ahorros',
    balance DECIMAL(15,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    is_blocked BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_account_number (account_number),
    INDEX idx_email (email),
    INDEX idx_active (is_active),
    INDEX idx_account_type (account_type),
    INDEX idx_balance (balance)
);

-- =====================================================
-- TABLA: movements
-- Movimientos y transacciones de las cuentas
-- =====================================================
CREATE TABLE movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    movement_type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    description TEXT NOT NULL,
    reference_number VARCHAR(50),
    from_account_id INT NULL,
    to_account_id INT NULL,
    performed_by_admin_id INT NULL,
    balance_after DECIMAL(15,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (from_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account_id) REFERENCES bank_accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (performed_by_admin_id) REFERENCES administrators(id) ON DELETE SET NULL,
    
    INDEX idx_account_id (account_id),
    INDEX idx_movement_type (movement_type),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_amount (amount),
    INDEX idx_reference_number (reference_number)
);

-- =====================================================
-- TABLA: credits
-- Líneas de crédito de los clientes
-- =====================================================
CREATE TABLE credits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    credit_limit DECIMAL(15,2) NOT NULL,
    used_amount DECIMAL(15,2) DEFAULT 0.00,
    available_amount DECIMAL(15,2) GENERATED ALWAYS AS (credit_limit - used_amount) STORED,
    interest_rate DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'active', 'suspended', 'closed') DEFAULT 'pending',
    approved_by_admin_id INT NULL,
    approval_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by_admin_id) REFERENCES administrators(id) ON DELETE SET NULL,
    
    INDEX idx_account_id (account_id),
    INDEX idx_status (status),
    INDEX idx_credit_limit (credit_limit),
    INDEX idx_available_amount (available_amount)
);

-- =====================================================
-- TABLA: loans
-- Préstamos de los clientes
-- =====================================================
CREATE TABLE loans (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    loan_amount DECIMAL(15,2) NOT NULL,
    monthly_payment DECIMAL(15,2) NOT NULL,
    total_payments INT NOT NULL,
    remaining_payments INT NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    status ENUM('pending', 'active', 'paid', 'defaulted') DEFAULT 'pending',
    approved_by_admin_id INT NULL,
    approval_date TIMESTAMP NULL,
    next_payment_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by_admin_id) REFERENCES administrators(id) ON DELETE SET NULL,
    
    INDEX idx_account_id (account_id),
    INDEX idx_status (status),
    INDEX idx_loan_amount (loan_amount),
    INDEX idx_next_payment_date (next_payment_date)
);

-- =====================================================
-- TABLA: loan_payments
-- Pagos de préstamos
-- =====================================================
CREATE TABLE loan_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    loan_id INT NOT NULL,
    payment_amount DECIMAL(15,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method ENUM('automatic', 'manual', 'admin') DEFAULT 'manual',
    processed_by_admin_id INT NULL,
    
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE,
    FOREIGN KEY (processed_by_admin_id) REFERENCES administrators(id) ON DELETE SET NULL,
    
    INDEX idx_loan_id (loan_id),
    INDEX idx_payment_date (payment_date)
);

-- =====================================================
-- TABLA: user_configurations
-- Configuraciones personalizadas de usuarios
-- =====================================================
CREATE TABLE user_configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    security_alerts BOOLEAN DEFAULT TRUE,
    payment_reminders BOOLEAN DEFAULT FALSE,
    show_balance_on_home BOOLEAN DEFAULT TRUE,
    two_factor_auth BOOLEAN DEFAULT FALSE,
    auto_logout BOOLEAN DEFAULT TRUE,
    daily_transfer_limit DECIMAL(15,2) DEFAULT 2000000.00,
    per_transaction_limit DECIMAL(15,2) DEFAULT 1000000.00,
    language ENUM('es', 'en') DEFAULT 'es',
    date_format ENUM('dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd') DEFAULT 'dd/mm/yyyy',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_account_config (account_id)
);

-- =====================================================
-- TABLA: system_configurations
-- Configuraciones globales del sistema
-- =====================================================
CREATE TABLE system_configurations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    config_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    description TEXT,
    updated_by_admin_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by_admin_id) REFERENCES administrators(id) ON DELETE SET NULL,
    
    INDEX idx_config_key (config_key)
);

-- =====================================================
-- TABLA: audit_logs
-- Registro de auditoría del sistema
-- =====================================================
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_type ENUM('admin', 'customer') NOT NULL,
    user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INT,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_type_id (user_type, user_id),
    INDEX idx_action (action),
    INDEX idx_table_name (table_name),
    INDEX idx_created_at (created_at)
);

-- =====================================================
-- TABLA: sessions
-- Gestión de sesiones de usuarios
-- =====================================================
CREATE TABLE sessions (
    id VARCHAR(128) PRIMARY KEY,
    user_type ENUM('admin', 'customer') NOT NULL,
    user_id INT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    INDEX idx_user_type_id (user_type, user_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_last_activity (last_activity)
);

-- =====================================================
-- TABLA: transfer_limits
-- Límites de transferencia por cuenta
-- =====================================================
CREATE TABLE transfer_limits (
    id INT PRIMARY KEY AUTO_INCREMENT,
    account_id INT NOT NULL,
    daily_limit DECIMAL(15,2) DEFAULT 5000000.00,
    monthly_limit DECIMAL(15,2) DEFAULT 50000000.00,
    per_transaction_limit DECIMAL(15,2) DEFAULT 2000000.00,
    daily_used DECIMAL(15,2) DEFAULT 0.00,
    monthly_used DECIMAL(15,2) DEFAULT 0.00,
    last_reset_date DATE DEFAULT (CURRENT_DATE),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_id) REFERENCES bank_accounts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_account_limits (account_id)
);

-- =====================================================
-- TRIGGERS PARA AUDITORÍA AUTOMÁTICA
-- =====================================================

-- Trigger para auditar cambios en bank_accounts
DELIMITER $$
CREATE TRIGGER audit_bank_accounts_update
    AFTER UPDATE ON bank_accounts
    FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_type, user_id, action, table_name, record_id, old_values, new_values)
    VALUES ('admin', 1, 'UPDATE', 'bank_accounts', NEW.id, 
            JSON_OBJECT('balance', OLD.balance, 'full_name', OLD.full_name, 'email', OLD.email),
            JSON_OBJECT('balance', NEW.balance, 'full_name', NEW.full_name, 'email', NEW.email));
END$$

-- Trigger para auditar movimientos
CREATE TRIGGER audit_movements_insert
    AFTER INSERT ON movements
    FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_type, user_id, action, table_name, record_id, new_values)
    VALUES ('customer', NEW.account_id, 'INSERT', 'movements', NEW.id,
            JSON_OBJECT('amount', NEW.amount, 'type', NEW.movement_type, 'description', NEW.description));
END$$

DELIMITER ;

-- =====================================================
-- VISTAS ÚTILES PARA REPORTES
-- =====================================================

-- Vista para resumen de cuentas
CREATE VIEW account_summary AS
SELECT 
    ba.id,
    ba.account_number,
    ba.full_name,
    ba.email,
    ba.account_type,
    ba.balance,
    ba.is_active,
    COUNT(DISTINCT c.id) as total_credits,
    COUNT(DISTINCT l.id) as total_loans,
    COUNT(DISTINCT m.id) as total_movements,
    ba.created_at
FROM bank_accounts ba
LEFT JOIN credits c ON ba.id = c.account_id AND c.status = 'active'
LEFT JOIN loans l ON ba.id = l.account_id AND l.status = 'active'
LEFT JOIN movements m ON ba.id = m.account_id
GROUP BY ba.id;

-- Vista para movimientos recientes
CREATE VIEW recent_movements AS
SELECT 
    m.id,
    m.account_id,
    ba.account_number,
    ba.full_name,
    m.movement_type,
    m.amount,
    m.description,
    m.balance_after,
    m.transaction_date
FROM movements m
JOIN bank_accounts ba ON m.account_id = ba.id
ORDER BY m.transaction_date DESC;

-- Vista para estadísticas del sistema
CREATE VIEW system_stats AS
SELECT 
    (SELECT COUNT(*) FROM bank_accounts WHERE is_active = TRUE) as active_accounts,
    (SELECT COUNT(*) FROM bank_accounts WHERE is_active = FALSE) as inactive_accounts,
    (SELECT SUM(balance) FROM bank_accounts WHERE is_active = TRUE) as total_balance,
    (SELECT COUNT(*) FROM credits WHERE status = 'active') as active_credits,
    (SELECT COUNT(*) FROM loans WHERE status = 'active') as active_loans,
    (SELECT COUNT(*) FROM movements WHERE DATE(transaction_date) = CURDATE()) as today_movements;

-- =====================================================
-- PROCEDIMIENTOS ALMACENADOS
-- =====================================================

-- Procedimiento para crear una nueva cuenta
DELIMITER $$
CREATE PROCEDURE CreateBankAccount(
    IN p_account_number VARCHAR(20),
    IN p_full_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password_hash VARCHAR(255),
    IN p_phone VARCHAR(20),
    IN p_address TEXT,
    IN p_account_type VARCHAR(20),
    IN p_initial_balance DECIMAL(15,2)
)
BEGIN
    DECLARE account_id INT;
    
    START TRANSACTION;
    
    -- Insertar la cuenta
    INSERT INTO bank_accounts (account_number, full_name, email, password_hash, phone, address, account_type, balance)
    VALUES (p_account_number, p_full_name, p_email, p_password_hash, p_phone, p_address, p_account_type, p_initial_balance);
    
    SET account_id = LAST_INSERT_ID();
    
    -- Crear configuración por defecto
    INSERT INTO user_configurations (account_id) VALUES (account_id);
    
    -- Crear límites de transferencia por defecto
    INSERT INTO transfer_limits (account_id) VALUES (account_id);
    
    -- Si hay saldo inicial, crear movimiento
    IF p_initial_balance > 0 THEN
        INSERT INTO movements (account_id, movement_type, amount, description, balance_after)
        VALUES (account_id, 'deposit', p_initial_balance, 'Depósito inicial', p_initial_balance);
    END IF;
    
    COMMIT;
    
    SELECT account_id as new_account_id;
END$$

-- Procedimiento para realizar transferencia
CREATE PROCEDURE ProcessTransfer(
    IN p_from_account_id INT,
    IN p_to_account_number VARCHAR(20),
    IN p_amount DECIMAL(15,2),
    IN p_description TEXT
)
BEGIN
    DECLARE v_to_account_id INT;
    DECLARE v_from_balance DECIMAL(15,2);
    DECLARE v_to_balance DECIMAL(15,2);
    DECLARE v_reference_number VARCHAR(50);
    
    START TRANSACTION;
    
    -- Obtener ID de cuenta destino
    SELECT id INTO v_to_account_id FROM bank_accounts WHERE account_number = p_to_account_number AND is_active = TRUE;
    
    IF v_to_account_id IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Cuenta destino no encontrada';
    END IF;
    
    -- Verificar saldo suficiente
    SELECT balance INTO v_from_balance FROM bank_accounts WHERE id = p_from_account_id FOR UPDATE;
    
    IF v_from_balance < p_amount THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Saldo insuficiente';
    END IF;
    
    -- Generar número de referencia
    SET v_reference_number = CONCAT('TRF', DATE_FORMAT(NOW(), '%Y%m%d'), LPAD(p_from_account_id, 6, '0'), LPAD(v_to_account_id, 6, '0'));
    
    -- Actualizar saldo cuenta origen
    UPDATE bank_accounts SET balance = balance - p_amount WHERE id = p_from_account_id;
    SET v_from_balance = v_from_balance - p_amount;
    
    -- Actualizar saldo cuenta destino
    UPDATE bank_accounts SET balance = balance + p_amount WHERE id = v_to_account_id;
    SELECT balance INTO v_to_balance FROM bank_accounts WHERE id = v_to_account_id;
    
    -- Registrar movimiento de salida
    INSERT INTO movements (account_id, movement_type, amount, description, reference_number, to_account_id, balance_after)
    VALUES (p_from_account_id, 'transfer', p_amount, CONCAT('Transferencia a ', p_to_account_number, ': ', p_description), v_reference_number, v_to_account_id, v_from_balance);
    
    -- Registrar movimiento de entrada
    INSERT INTO movements (account_id, movement_type, amount, description, reference_number, from_account_id, balance_after)
    VALUES (v_to_account_id, 'transfer', p_amount, CONCAT('Transferencia de cuenta ', (SELECT account_number FROM bank_accounts WHERE id = p_from_account_id), ': ', p_description), v_reference_number, p_from_account_id, v_to_balance);
    
    COMMIT;
    
    SELECT v_reference_number as reference_number, 'SUCCESS' as status;
END$$

DELIMITER ;
