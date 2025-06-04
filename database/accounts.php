<?php
/**
 * GESTIÓN DE CUENTAS BANCARIAS - BANK OF AMERICA
 * Operaciones CRUD para cuentas bancarias
 */

require_once 'config.php';

class AccountManager {
    private $pdo;
    
    public function __construct() {
        $this->pdo = DatabaseConfig::getConnection();
    }
    
    /**
     * Crear nueva cuenta bancaria
     */
    public function createAccount($data) {
        try {
            $this->pdo->beginTransaction();
            
            // Generar número de cuenta único
            $accountNumber = $this->generateAccountNumber();
            
            // Hash de la contraseña
            $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
            
            // Insertar cuenta
            $stmt = $this->pdo->prepare("
                INSERT INTO bank_accounts (
                    account_number, full_name, email, password_hash, 
                    phone, address, account_type, balance
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $accountNumber,
                $data['full_name'],
                $data['email'],
                $passwordHash,
                $data['phone'],
                $data['address'] ?? '',
                $data['account_type'] ?? 'Ahorros',
                $data['initial_balance'] ?? 0
            ]);
            
            $accountId = $this->pdo->lastInsertId();
            
            // Crear configuración por defecto
            $this->createDefaultUserConfig($accountId);
            
            // Crear límites de transferencia por defecto
            $this->createDefaultTransferLimits($accountId);
            
            // Si hay saldo inicial, crear movimiento
            if (isset($data['initial_balance']) && $data['initial_balance'] > 0) {
                $this->addMovement($accountId, 'deposit', $data['initial_balance'], 'Depósito inicial');
            }
            
            // Log de auditoría
            $this->logAudit('admin', 1, 'CREATE', 'bank_accounts', $accountId, [
                'account_number' => $accountNumber,
                'full_name' => $data['full_name'],
                'email' => $data['email']
            ]);
            
            $this->pdo->commit();
            
            return [
                'success' => true,
                'account_id' => $accountId,
                'account_number' => $accountNumber,
                'message' => 'Cuenta creada exitosamente'
            ];
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            logDatabaseError("Error creando cuenta: " . $e->getMessage(), $data);
            return [
                'success' => false,
                'message' => 'Error al crear la cuenta: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Obtener cuenta por ID
     */
    public function getAccountById($accountId) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT ba.*, 
                       uc.email_notifications, uc.security_alerts, uc.show_balance_on_home,
                       tl.daily_limit, tl.monthly_limit, tl.per_transaction_limit
                FROM bank_accounts ba
                LEFT JOIN user_configurations uc ON ba.id = uc.account_id
                LEFT JOIN transfer_limits tl ON ba.id = tl.account_id
                WHERE ba.id = ? AND ba.is_active = 1
            ");
            
            $stmt->execute([$accountId]);
            $account = $stmt->fetch();
            
            if ($account) {
                // Obtener movimientos recientes
                $account['movements'] = $this->getAccountMovements($accountId, 10);
                
                // Obtener créditos
                $account['credits'] = $this->getAccountCredits($accountId);
                
                // Obtener préstamos
                $account['loans'] = $this->getAccountLoans($accountId);
                
                return $account;
            }
            
            return null;
            
        } catch (Exception $e) {
            logDatabaseError("Error obteniendo cuenta: " . $e->getMessage(), ['account_id' => $accountId]);
            return null;
        }
    }
    
    /**
     * Obtener cuenta por número de cuenta
     */
    public function getAccountByNumber($accountNumber) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM bank_accounts 
                WHERE account_number = ? AND is_active = 1
            ");
            
            $stmt->execute([$accountNumber]);
            return $stmt->fetch();
            
        } catch (Exception $e) {
            logDatabaseError("Error obteniendo cuenta por número: " . $e->getMessage(), ['account_number' => $accountNumber]);
            return null;
        }
    }
    
    /**
     * Obtener cuenta por email
     */
    public function getAccountByEmail($email) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM bank_accounts 
                WHERE email = ? AND is_active = 1
            ");
            
            $stmt->execute([$email]);
            return $stmt->fetch();
            
        } catch (Exception $e) {
            logDatabaseError("Error obteniendo cuenta por email: " . $e->getMessage(), ['email' => $email]);
            return null;
        }
    }
    
    /**
     * Actualizar cuenta
     */
    public function updateAccount($accountId, $data) {
        try {
            $this->pdo->beginTransaction();
            
            // Obtener datos actuales para auditoría
            $oldData = $this->getAccountById($accountId);
            
            $updateFields = [];
            $params = [];
            
            if (isset($data['full_name'])) {
                $updateFields[] = "full_name = ?";
                $params[] = $data['full_name'];
            }
            
            if (isset($data['email'])) {
                $updateFields[] = "email = ?";
                $params[] = $data['email'];
            }
            
            if (isset($data['phone'])) {
                $updateFields[] = "phone = ?";
                $params[] = $data['phone'];
            }
            
            if (isset($data['address'])) {
                $updateFields[] = "address = ?";
                $params[] = $data['address'];
            }
            
            if (isset($data['account_type'])) {
                $updateFields[] = "account_type = ?";
                $params[] = $data['account_type'];
            }
            
            if (isset($data['password'])) {
                $updateFields[] = "password_hash = ?";
                $params[] = password_hash($data['password'], PASSWORD_DEFAULT);
            }
            
            if (isset($data['balance'])) {
                $balanceDiff = $data['balance'] - $oldData['balance'];
                if ($balanceDiff != 0) {
                    $updateFields[] = "balance = ?";
                    $params[] = $data['balance'];
                    
                    // Crear movimiento por ajuste de saldo
                    $movementType = $balanceDiff > 0 ? 'deposit' : 'withdrawal';
                    $this->addMovement(
                        $accountId, 
                        $movementType, 
                        abs($balanceDiff), 
                        'Ajuste de saldo por administrador'
                    );
                }
            }
            
            if (!empty($updateFields)) {
                $params[] = $accountId;
                
                $sql = "UPDATE bank_accounts SET " . implode(", ", $updateFields) . " WHERE id = ?";
                $stmt = $this->pdo->prepare($sql);
                $stmt->execute($params);
                
                // Log de auditoría
                $this->logAudit('admin', 1, 'UPDATE', 'bank_accounts', $accountId, $data, $oldData);
            }
            
            $this->pdo->commit();
            
            return [
                'success' => true,
                'message' => 'Cuenta actualizada exitosamente'
            ];
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            logDatabaseError("Error actualizando cuenta: " . $e->getMessage(), $data);
            return [
                'success' => false,
                'message' => 'Error al actualizar la cuenta: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Obtener todas las cuentas
     */
    public function getAllAccounts($limit = 100, $offset = 0) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT ba.*, 
                       COUNT(DISTINCT c.id) as total_credits,
                       COUNT(DISTINCT l.id) as total_loans,
                       COUNT(DISTINCT m.id) as total_movements
                FROM bank_accounts ba
                LEFT JOIN credits c ON ba.id = c.account_id AND c.status = 'active'
                LEFT JOIN loans l ON ba.id = l.account_id AND l.status = 'active'
                LEFT JOIN movements m ON ba.id = m.account_id
                WHERE ba.is_active = 1
                GROUP BY ba.id
                ORDER BY ba.created_at DESC
                LIMIT ? OFFSET ?
            ");
            
            $stmt->execute([$limit, $offset]);
            return $stmt->fetchAll();
            
        } catch (Exception $e) {
            logDatabaseError("Error obteniendo todas las cuentas: " . $e->getMessage());
            return [];
        }
    }
    
    /**
     * Eliminar cuenta (soft delete)
     */
    public function deleteAccount($accountId) {
        try {
            $this->pdo->beginTransaction();
            
            // Verificar que no tenga saldo
            $account = $this->getAccountById($accountId);
            if ($account['balance'] > 0) {
                throw new Exception("No se puede eliminar una cuenta con saldo positivo");
            }
            
            // Verificar que no tenga préstamos activos
            $activeLoans = $this->getAccountLoans($accountId, 'active');
            if (!empty($activeLoans)) {
                throw new Exception("No se puede eliminar una cuenta con préstamos activos");
            }
            
            // Soft delete
            $stmt = $this->pdo->prepare("UPDATE bank_accounts SET is_active = 0 WHERE id = ?");
            $stmt->execute([$accountId]);
            
            // Log de auditoría
            $this->logAudit('admin', 1, 'DELETE', 'bank_accounts', $accountId, ['is_active' => false]);
            
            $this->pdo->commit();
            
            return [
                'success' => true,
                'message' => 'Cuenta eliminada exitosamente'
            ];
            
        } catch (Exception $e) {
            $this->pdo->rollBack();
            return [
                'success' => false,
                'message' => 'Error al eliminar la cuenta: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Bloquear/desbloquear cuenta
     */
    public function toggleAccountBlock($accountId, $blocked = true) {
        try {
            $stmt = $this->pdo->prepare("UPDATE bank_accounts SET is_blocked = ? WHERE id = ?");
            $stmt->execute([$blocked, $accountId]);
            
            $action = $blocked ? 'BLOCK' : 'UNBLOCK';
            $this->logAudit('admin', 1, $action, 'bank_accounts', $accountId, ['is_blocked' => $blocked]);
            
            return [
                'success' => true,
                'message' => $blocked ? 'Cuenta bloqueada' : 'Cuenta desbloqueada'
            ];
            
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'Error al cambiar estado de la cuenta: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Obtener movimientos de una cuenta
     */
    public function getAccountMovements($accountId, $limit = 50) {
        try {
            $stmt = $this->pdo->prepare("
                SELECT * FROM movements 
                WHERE account_id = ? 
                ORDER BY transaction_date DESC 
                LIMIT ?
            ");
            
            $stmt->execute([$accountId, $limit]);
            return $stmt->fetchAll();
            
        } catch (Exception $e) {
            logDatabaseError("Error obteniendo movimientos: " . $e->getMessage(), ['account_id' => $accountId]);
            return [];
        }
    }
    
    /**
     * Obtener créditos de una cuenta
     */
    public function getAccountCredits($accountId, $status = null) {
        try {
            $sql = "SELECT * FROM credits WHERE account_id = ?";
            $params = [$accountId];
            
            if ($status) {
                $sql .= " AND status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
            
        } catch (Exception $e) {
            logDatabaseError("Error obteniendo créditos: " . $e->getMessage(), ['account_id' => $accountId]);
            return [];
        }
    }
    
    /**
     * Obtener préstamos de una cuenta
     */
    public function getAccountLoans($accountId, $status = null) {
        try {
            $sql = "SELECT * FROM loans WHERE account_id = ?";
            $params = [$accountId];
            
            if ($status) {
                $sql .= " AND status = ?";
                $params[] = $status;
            }
            
            $sql .= " ORDER BY created_at DESC";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
            
        } catch (Exception $e) {
            logDatabaseError("Error obteniendo préstamos: " . $e->getMessage(), ['account_id' => $accountId]);
            return [];
        }
    }
    
    /**
     * Agregar movimiento a una cuenta
     */
    public function addMovement($accountId, $type, $amount, $description, $referenceNumber = null) {
        try {
            // Obtener saldo actual
            $stmt = $this->pdo->prepare("SELECT balance FROM bank_accounts WHERE id = ?");
            $stmt->execute([$accountId]);
            $currentBalance = $stmt->fetchColumn();
            
            // Calcular nuevo saldo
            $newBalance = $type === 'deposit' ? $currentBalance + $amount : $currentBalance - $amount;
            
            // Insertar movimiento
            $stmt = $this->pdo->prepare("
                INSERT INTO movements (account_id, movement_type, amount, description, reference_number, balance_after)
                VALUES (?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([$accountId, $type, $amount, $description, $referenceNumber, $newBalance]);
            
            // Actualizar saldo de la cuenta
            $stmt = $this->pdo->prepare("UPDATE bank_accounts SET balance = ? WHERE id = ?");
            $stmt->execute([$newBalance, $accountId]);
            
            return $this->pdo->lastInsertId();
            
        } catch (Exception $e) {
            logDatabaseError("Error agregando movimiento: " . $e->getMessage(), [
                'account_id' => $accountId,
                'type' => $type,
                'amount' => $amount
            ]);
            throw $e;
        }
    }
    
    /**
     * Generar número de cuenta único
     */
    private function generateAccountNumber() {
        do {
            $number = '4001-' . rand(1000, 9999) . '-' . rand(1000, 9999);
            $stmt = $this->pdo->prepare("SELECT COUNT(*) FROM bank_accounts WHERE account_number = ?");
            $stmt->execute([$number]);
        } while ($stmt->fetchColumn() > 0);
        
        return $number;
    }
    
    /**
     * Crear configuración por defecto para usuario
     */
    private function createDefaultUserConfig($accountId) {
        $stmt = $this->pdo->prepare("INSERT INTO user_configurations (account_id) VALUES (?)");
        $stmt->execute([$accountId]);
    }
    
    /**
     * Crear límites de transferencia por defecto
     */
    private function createDefaultTransferLimits($accountId) {
        $stmt = $this->pdo->prepare("INSERT INTO transfer_limits (account_id) VALUES (?)");
        $stmt->execute([$accountId]);
    }
    
    /**
     * Log de auditoría
     */
    private function logAudit($userType, $userId, $action, $tableName, $recordId, $newValues = null, $oldValues = null) {
        try {
            $stmt = $this->pdo->prepare("
                INSERT INTO audit_logs (user_type, user_id, action, table_name, record_id, old_values, new_values)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ");
            
            $stmt->execute([
                $userType,
                $userId,
                $action,
                $tableName,
                $recordId,
                $oldValues ? json_encode($oldValues) : null,
                $newValues ? json_encode($newValues) : null
            ]);
            
        } catch (Exception $e) {
            logDatabaseError("Error en log de auditoría: " . $e->getMessage());
        }
    }
}
?>
