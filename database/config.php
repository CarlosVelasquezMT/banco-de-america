<?php
/**
 * CONFIGURACIÓN DE BASE DE DATOS - BANK OF AMERICA
 * Archivo de configuración para conexión a MySQL/MariaDB
 */

class DatabaseConfig {
    // Configuración de la base de datos
    private static $host = 'localhost';
    private static $dbname = 'bank_of_america';
    private static $username = 'bank_user';
    private static $password = 'tu_password_seguro';
    private static $port = 3306;
    private static $charset = 'utf8mb4';
    
    // Configuración de seguridad
    private static $encryption_key = 'tu_clave_de_encriptacion_32_caracteres';
    private static $jwt_secret = 'tu_jwt_secret_muy_seguro_y_largo';
    
    // Instancia de conexión
    private static $pdo = null;
    
    /**
     * Obtener conexión PDO a la base de datos
     */
    public static function getConnection() {
        if (self::$pdo === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$dbname . ";charset=" . self::$charset;
                
                $options = [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES " . self::$charset . " COLLATE utf8mb4_unicode_ci"
                ];
                
                self::$pdo = new PDO($dsn, self::$username, self::$password, $options);
                
                // Configurar zona horaria
                self::$pdo->exec("SET time_zone = '-05:00'"); // Hora de Colombia
                
            } catch (PDOException $e) {
                error_log("Error de conexión a la base de datos: " . $e->getMessage());
                throw new Exception("Error de conexión a la base de datos");
            }
        }
        
        return self::$pdo;
    }
    
    /**
     * Obtener clave de encriptación
     */
    public static function getEncryptionKey() {
        return self::$encryption_key;
    }
    
    /**
     * Obtener secreto JWT
     */
    public static function getJwtSecret() {
        return self::$jwt_secret;
    }
    
    /**
     * Cerrar conexión
     */
    public static function closeConnection() {
        self::$pdo = null;
    }
    
    /**
     * Verificar conexión a la base de datos
     */
    public static function testConnection() {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query("SELECT 1");
            return $stmt !== false;
        } catch (Exception $e) {
            return false;
        }
    }
    
    /**
     * Obtener información de la base de datos
     */
    public static function getDatabaseInfo() {
        try {
            $pdo = self::getConnection();
            
            // Información del servidor
            $serverInfo = $pdo->getAttribute(PDO::ATTR_SERVER_INFO);
            $serverVersion = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
            
            // Información de la conexión
            $connectionStatus = $pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS);
            
            return [
                'server_info' => $serverInfo,
                'server_version' => $serverVersion,
                'connection_status' => $connectionStatus,
                'database_name' => self::$dbname,
                'host' => self::$host,
                'port' => self::$port,
                'charset' => self::$charset
            ];
            
        } catch (Exception $e) {
            return ['error' => $e->getMessage()];
        }
    }
    
    /**
     * Ejecutar backup de la base de datos
     */
    public static function createBackup($backupPath = null) {
        if ($backupPath === null) {
            $backupPath = __DIR__ . '/backups/backup_' . date('Y-m-d_H-i-s') . '.sql';
        }
        
        // Crear directorio de backups si no existe
        $backupDir = dirname($backupPath);
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }
        
        $command = sprintf(
            'mysqldump -h%s -P%d -u%s -p%s %s > %s',
            self::$host,
            self::$port,
            self::$username,
            self::$password,
            self::$dbname,
            $backupPath
        );
        
        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);
        
        return $returnVar === 0 ? $backupPath : false;
    }
    
    /**
     * Restaurar backup de la base de datos
     */
    public static function restoreBackup($backupPath) {
        if (!file_exists($backupPath)) {
            throw new Exception("Archivo de backup no encontrado: " . $backupPath);
        }
        
        $command = sprintf(
            'mysql -h%s -P%d -u%s -p%s %s < %s',
            self::$host,
            self::$port,
            self::$username,
            self::$password,
            self::$dbname,
            $backupPath
        );
        
        $output = [];
        $returnVar = 0;
        exec($command, $output, $returnVar);
        
        return $returnVar === 0;
    }
    
    /**
     * Obtener estadísticas de la base de datos
     */
    public static function getDatabaseStats() {
        try {
            $pdo = self::getConnection();
            
            $stats = [];
            
            // Total de cuentas
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM bank_accounts WHERE is_active = 1");
            $stats['active_accounts'] = $stmt->fetch()['total'];
            
            // Balance total
            $stmt = $pdo->query("SELECT SUM(balance) as total FROM bank_accounts WHERE is_active = 1");
            $stats['total_balance'] = $stmt->fetch()['total'] ?? 0;
            
            // Créditos activos
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM credits WHERE status = 'active'");
            $stats['active_credits'] = $stmt->fetch()['total'];
            
            // Préstamos activos
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM loans WHERE status = 'active'");
            $stats['active_loans'] = $stmt->fetch()['total'];
            
            // Movimientos del día
            $stmt = $pdo->query("SELECT COUNT(*) as total FROM movements WHERE DATE(transaction_date) = CURDATE()");
            $stats['today_movements'] = $stmt->fetch()['total'];
            
            // Último movimiento
            $stmt = $pdo->query("SELECT MAX(transaction_date) as last_movement FROM movements");
            $stats['last_movement'] = $stmt->fetch()['last_movement'];
            
            return $stats;
            
        } catch (Exception $e) {
            error_log("Error obteniendo estadísticas: " . $e->getMessage());
            return [];
        }
    }
}

/**
 * Clase para manejo de errores de base de datos
 */
class DatabaseException extends Exception {
    private $sqlState;
    private $errorCode;
    
    public function __construct($message, $sqlState = null, $errorCode = null, $previous = null) {
        parent::__construct($message, 0, $previous);
        $this->sqlState = $sqlState;
        $this->errorCode = $errorCode;
    }
    
    public function getSqlState() {
        return $this->sqlState;
    }
    
    public function getErrorCode() {
        return $this->errorCode;
    }
}

/**
 * Función helper para logging de errores
 */
function logDatabaseError($message, $context = []) {
    $logMessage = date('Y-m-d H:i:s') . " - " . $message;
    if (!empty($context)) {
        $logMessage .= " - Context: " . json_encode($context);
    }
    error_log($logMessage, 3, __DIR__ . '/logs/database_errors.log');
}

/**
 * Función helper para logging de actividad
 */
function logDatabaseActivity($action, $details = []) {
    $logMessage = date('Y-m-d H:i:s') . " - Action: " . $action;
    if (!empty($details)) {
        $logMessage .= " - Details: " . json_encode($details);
    }
    error_log($logMessage, 3, __DIR__ . '/logs/database_activity.log');
}

// Crear directorios de logs si no existen
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

$backupDir = __DIR__ . '/backups';
if (!is_dir($backupDir)) {
    mkdir($backupDir, 0755, true);
}

?>
