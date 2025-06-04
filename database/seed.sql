-- =====================================================
-- DATOS INICIALES PARA BANK OF AMERICA
-- =====================================================

USE bank_of_america;

-- =====================================================
-- INSERTAR ADMINISTRADORES
-- =====================================================
INSERT INTO administrators (username, email, password_hash, full_name, phone) VALUES
('admin', 'admin@bankofamerica.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', '3001234567'),
('supervisor', 'supervisor@bankofamerica.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Supervisor General', '3007654321');

-- =====================================================
-- INSERTAR CUENTAS BANCARIAS DE PRUEBA
-- =====================================================
INSERT INTO bank_accounts (account_number, full_name, email, password_hash, phone, address, account_type, balance) VALUES
('4001-2345-6789', 'Valentina García', 'valentina@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3101234567', 'Calle 123 # 45-67, Bogotá', 'Ahorros', 10000000.00),
('4001-9876-5432', 'Carlos Pérez', 'carlos@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3209876543', 'Carrera 789 # 10-11, Medellín', 'Corriente', 5000000.00),
('4001-1111-2222', 'María Rodríguez', 'maria@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3151234567', 'Avenida 456 # 78-90, Cali', 'Ahorros', 7500000.00),
('4001-3333-4444', 'Juan López', 'juan@email.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '3187654321', 'Calle 321 # 54-76, Barranquilla', 'Empresarial', 15000000.00);

-- =====================================================
-- INSERTAR MOVIMIENTOS INICIALES
-- =====================================================
INSERT INTO movements (account_id, movement_type, amount, description, balance_after, transaction_date) VALUES
-- Movimientos para Valentina García (ID: 1)
(1, 'deposit', 10000000.00, 'Depósito inicial', 10000000.00, '2024-01-15 10:00:00'),
(1, 'withdrawal', 100000.00, 'Retiro cajero automático', 9900000.00, '2024-01-20 14:30:00'),
(1, 'deposit', 200000.00, 'Transferencia recibida', 10100000.00, '2024-01-25 09:15:00'),
(1, 'withdrawal', 50000.00, 'Pago de servicios', 10050000.00, '2024-01-28 16:45:00'),

-- Movimientos para Carlos Pérez (ID: 2)
(2, 'deposit', 5000000.00, 'Depósito inicial', 5000000.00, '2023-11-01 11:00:00'),
(2, 'withdrawal', 50000.00, 'Pago de servicios públicos', 4950000.00, '2023-11-05 15:20:00'),
(2, 'deposit', 300000.00, 'Consignación nómina', 5250000.00, '2023-11-30 08:00:00'),
(2, 'withdrawal', 250000.00, 'Retiro para gastos', 5000000.00, '2023-12-15 12:30:00'),

-- Movimientos para María Rodríguez (ID: 3)
(3, 'deposit', 7500000.00, 'Depósito inicial', 7500000.00, '2024-02-01 09:30:00'),
(3, 'withdrawal', 75000.00, 'Compra en línea', 7425000.00, '2024-02-05 18:45:00'),
(3, 'deposit', 150000.00, 'Transferencia familiar', 7575000.00, '2024-02-10 14:20:00'),

-- Movimientos para Juan López (ID: 4)
(4, 'deposit', 15000000.00, 'Depósito inicial empresarial', 15000000.00, '2024-01-10 10:15:00'),
(4, 'withdrawal', 500000.00, 'Pago a proveedores', 14500000.00, '2024-01-15 11:30:00'),
(4, 'deposit', 800000.00, 'Pago de cliente', 15300000.00, '2024-01-20 16:00:00'),
(4, 'withdrawal', 300000.00, 'Gastos operativos', 15000000.00, '2024-01-25 13:45:00');

-- =====================================================
-- INSERTAR CRÉDITOS
-- =====================================================
INSERT INTO credits (account_id, credit_limit, used_amount, interest_rate, status, approved_by_admin_id, approval_date) VALUES
(1, 1000000.00, 200000.00, 2.5, 'active', 1, '2024-01-16 10:00:00'),
(2, 500000.00, 0.00, 2.8, 'active', 1, '2023-11-02 11:00:00'),
(3, 750000.00, 100000.00, 2.3, 'active', 2, '2024-02-02 09:30:00'),
(4, 2000000.00, 500000.00, 2.0, 'active', 1, '2024-01-11 10:15:00');

-- =====================================================
-- INSERTAR PRÉSTAMOS
-- =====================================================
INSERT INTO loans (account_id, loan_amount, monthly_payment, total_payments, remaining_payments, interest_rate, status, approved_by_admin_id, approval_date, next_payment_date) VALUES
(1, 5000000.00, 250000.00, 24, 18, 1.8, 'active', 1, '2024-01-16 10:30:00', '2024-03-01'),
(3, 3000000.00, 180000.00, 20, 15, 2.0, 'active', 2, '2024-02-02 10:00:00', '2024-03-02'),
(4, 8000000.00, 400000.00, 24, 20, 1.5, 'active', 1, '2024-01-11 11:00:00', '2024-03-01');

-- =====================================================
-- INSERTAR CONFIGURACIONES DE USUARIO
-- =====================================================
INSERT INTO user_configurations (account_id, email_notifications, security_alerts, payment_reminders, show_balance_on_home, two_factor_auth, auto_logout, daily_transfer_limit, per_transaction_limit, language, date_format) VALUES
(1, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE, 2000000.00, 1000000.00, 'es', 'dd/mm/yyyy'),
(2, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, 1500000.00, 800000.00, 'es', 'dd/mm/yyyy'),
(3, FALSE, TRUE, FALSE, TRUE, TRUE, TRUE, 1000000.00, 500000.00, 'es', 'dd/mm/yyyy'),
(4, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, 5000000.00, 2000000.00, 'es', 'dd/mm/yyyy');

-- =====================================================
-- INSERTAR LÍMITES DE TRANSFERENCIA
-- =====================================================
INSERT INTO transfer_limits (account_id, daily_limit, monthly_limit, per_transaction_limit, daily_used, monthly_used) VALUES
(1, 5000000.00, 50000000.00, 2000000.00, 0.00, 0.00),
(2, 3000000.00, 30000000.00, 1500000.00, 0.00, 0.00),
(3, 2000000.00, 20000000.00, 1000000.00, 0.00, 0.00),
(4, 10000000.00, 100000000.00, 5000000.00, 0.00, 0.00);

-- =====================================================
-- INSERTAR CONFIGURACIONES DEL SISTEMA
-- =====================================================
INSERT INTO system_configurations (config_key, config_value, config_type, description, updated_by_admin_id) VALUES
('base_interest_rate', '2.5', 'number', 'Tasa de interés base del sistema', 1),
('daily_transfer_limit', '5000000', 'number', 'Límite diario de transferencias por defecto', 1),
('transfer_commission', '3000', 'number', 'Comisión por transferencia', 1),
('minimum_balance', '50000', 'number', 'Saldo mínimo requerido', 1),
('require_2fa', 'false', 'boolean', 'Requerir autenticación de dos factores', 1),
('block_after_failed_attempts', 'true', 'boolean', 'Bloquear cuenta después de intentos fallidos', 1),
('email_notifications', 'true', 'boolean', 'Notificaciones por email habilitadas', 1),
('new_account_notifications', 'true', 'boolean', 'Notificaciones de nuevas cuentas', 1),
('large_transaction_alerts', 'true', 'boolean', 'Alertas de transacciones grandes', 1),
('daily_reports', 'false', 'boolean', 'Reportes diarios automáticos', 1),
('max_failed_login_attempts', '3', 'number', 'Máximo número de intentos de login fallidos', 1),
('session_timeout', '1800', 'number', 'Tiempo de expiración de sesión en segundos', 1),
('bank_name', 'Bank of America Colombia', 'string', 'Nombre del banco', 1),
('bank_code', 'BOA001', 'string', 'Código del banco', 1),
('support_email', 'soporte@bankofamerica.com', 'string', 'Email de soporte', 1),
('support_phone', '018000123456', 'string', 'Teléfono de soporte', 1);

-- =====================================================
-- INSERTAR ALGUNOS LOGS DE AUDITORÍA DE EJEMPLO
-- =====================================================
INSERT INTO audit_logs (user_type, user_id, action, table_name, record_id, new_values, ip_address) VALUES
('admin', 1, 'CREATE', 'bank_accounts', 1, '{"account_number": "4001-2345-6789", "full_name": "Valentina García"}', '192.168.1.100'),
('admin', 1, 'CREATE', 'bank_accounts', 2, '{"account_number": "4001-9876-5432", "full_name": "Carlos Pérez"}', '192.168.1.100'),
('customer', 1, 'LOGIN', 'sessions', NULL, '{"login_time": "2024-01-20 14:30:00"}', '192.168.1.50'),
('customer', 2, 'LOGIN', 'sessions', NULL, '{"login_time": "2024-01-21 09:15:00"}', '192.168.1.51'),
('admin', 1, 'APPROVE', 'credits', 1, '{"status": "active", "approved_amount": 1000000}', '192.168.1.100');

-- =====================================================
-- ACTUALIZAR SECUENCIAS AUTO_INCREMENT
-- =====================================================
ALTER TABLE administrators AUTO_INCREMENT = 3;
ALTER TABLE bank_accounts AUTO_INCREMENT = 5;
ALTER TABLE movements AUTO_INCREMENT = 15;
ALTER TABLE credits AUTO_INCREMENT = 5;
ALTER TABLE loans AUTO_INCREMENT = 4;
ALTER TABLE user_configurations AUTO_INCREMENT = 5;
ALTER TABLE transfer_limits AUTO_INCREMENT = 5;
ALTER TABLE system_configurations AUTO_INCREMENT = 17;
ALTER TABLE audit_logs AUTO_INCREMENT = 6;

-- =====================================================
-- VERIFICAR DATOS INSERTADOS
-- =====================================================
SELECT 'Administradores creados:' as info, COUNT(*) as total FROM administrators;
SELECT 'Cuentas bancarias creadas:' as info, COUNT(*) as total FROM bank_accounts;
SELECT 'Movimientos registrados:' as info, COUNT(*) as total FROM movements;
SELECT 'Créditos activos:' as info, COUNT(*) as total FROM credits WHERE status = 'active';
SELECT 'Préstamos activos:' as info, COUNT(*) as total FROM loans WHERE status = 'active';
SELECT 'Configuraciones del sistema:' as info, COUNT(*) as total FROM system_configurations;

-- =====================================================
-- MOSTRAR RESUMEN DE CUENTAS
-- =====================================================
SELECT 
    account_number as 'Número de Cuenta',
    full_name as 'Nombre Completo',
    account_type as 'Tipo',
    FORMAT(balance, 2) as 'Saldo',
    email as 'Email'
FROM bank_accounts 
ORDER BY created_at;
