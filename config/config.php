<?php
/**
 * BigG's Laundromat Configuration File
 * Copy this file to config.php and update the values
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'biggs_laundromat');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Application Configuration
define('APP_NAME', 'BigG\'s Laundromat');
define('APP_VERSION', '1.0.0');
define('APP_URL', 'http://localhost/BigGs%20Laundromat');
define('APP_TIMEZONE', 'Africa/Nairobi');

// Security Configuration
define('SECRET_KEY', 'your-secret-key-here-change-this-in-production');
define('JWT_SECRET', 'your-jwt-secret-here-change-this-in-production');
define('ENCRYPTION_KEY', 'your-encryption-key-here-32-chars');

// Session Configuration
define('SESSION_LIFETIME', 3600); // 1 hour
define('SESSION_NAME', 'BIGGS_SESSION');

// File Upload Configuration
define('UPLOAD_PATH', 'uploads/');
define('MAX_FILE_SIZE', 5242880); // 5MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'pdf']);

// Email Configuration (Optional - for notifications)
define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USERNAME', '');
define('SMTP_PASSWORD', '');
define('SMTP_FROM_EMAIL', 'noreply@biggslaundromat.com');
define('SMTP_FROM_NAME', 'BigG\'s Laundromat');

// WhatsApp Business API Configuration
define('WHATSAPP_API_URL', 'https://graph.facebook.com/v18.0/');
define('WHATSAPP_PHONE_NUMBER_ID', '');
define('WHATSAPP_ACCESS_TOKEN', '');
define('WHATSAPP_VERIFY_TOKEN', 'your-verify-token-here');

// Google Maps Configuration
define('GOOGLE_MAPS_API_KEY', 'your-google-maps-api-key-here');

// Payment Configuration (M-Pesa, etc.)
define('MPESA_CONSUMER_KEY', '');
define('MPESA_CONSUMER_SECRET', '');
define('MPESA_SHORTCODE', '');
define('MPESA_PASSKEY', '');
define('MPESA_CALLBACK_URL', APP_URL . '/api/payments/mpesa-callback');

// Business Configuration
define('BUSINESS_NAME', 'BigG\'s Laundromat');
define('BUSINESS_PHONE', '+254700000000');
define('BUSINESS_EMAIL', 'info@biggslaundromat.com');
define('BUSINESS_ADDRESS', 'Nairobi, Kenya');

// Pricing Configuration
define('DEFAULT_CURRENCY', 'KES');
define('DELIVERY_FEE', 100);
define('PICKUP_FEE', 50);
define('EXPRESS_SERVICE_FEE', 200);
define('MINIMUM_ORDER_AMOUNT', 200);
define('FREE_DELIVERY_THRESHOLD', 1000);

// Loyalty Program Configuration
define('LOYALTY_POINTS_PER_SHILLING', 1);
define('LOYALTY_POINTS_REDEMPTION_RATE', 100); // Points for KES 1
define('LOYALTY_SILVER_THRESHOLD', 100);
define('LOYALTY_GOLD_THRESHOLD', 300);
define('LOYALTY_PLATINUM_THRESHOLD', 500);

// Order Configuration
define('DEFAULT_ORDER_TIMEOUT', 24); // hours
define('EXPRESS_ORDER_TIMEOUT', 12); // hours
define('BULK_ORDER_TIMEOUT', 48); // hours
define('ORDER_TRACKING_URL', APP_URL . '/track/');

// Notification Configuration
define('ENABLE_SMS_NOTIFICATIONS', false);
define('ENABLE_EMAIL_NOTIFICATIONS', true);
define('ENABLE_WHATSAPP_NOTIFICATIONS', true);

// Development/Production Mode
define('DEBUG_MODE', true);
define('LOG_ERRORS', true);
define('LOG_PATH', 'logs/');

// CORS Configuration
define('ALLOWED_ORIGINS', [
    'http://localhost:3000',
    'http://localhost:8080',
    'https://biggslaundromat.com'
]);

// Rate Limiting Configuration
define('RATE_LIMIT_REQUESTS', 100); // requests per hour
define('RATE_LIMIT_WINDOW', 3600); // seconds

// Cache Configuration
define('CACHE_ENABLED', true);
define('CACHE_PATH', 'cache/');
define('CACHE_LIFETIME', 3600); // seconds

// File and Directory Permissions
define('DIRECTORY_PERMISSIONS', 0755);
define('FILE_PERMISSIONS', 0644);

// Error Reporting (Development only)
if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Set timezone
date_default_timezone_set(APP_TIMEZONE);

// Start session
if (session_status() === PHP_SESSION_NONE) {
    session_name(SESSION_NAME);
    session_set_cookie_params(SESSION_LIFETIME);
    session_start();
}

// Create necessary directories
$directories = [
    UPLOAD_PATH,
    LOG_PATH,
    CACHE_PATH,
    'uploads/orders/',
    'uploads/services/',
    'uploads/customers/'
];

foreach ($directories as $dir) {
    if (!is_dir($dir)) {
        mkdir($dir, DIRECTORY_PERMISSIONS, true);
    }
}

// Helper function to get configuration value
function getConfig($key, $default = null) {
    return defined($key) ? constant($key) : $default;
}

// Helper function to check if running in development mode
function isDevelopment() {
    return DEBUG_MODE;
}

// Helper function to get full URL
function getFullUrl($path = '') {
    return APP_URL . '/' . ltrim($path, '/');
}

// Helper function to format currency
function formatCurrency($amount, $currency = DEFAULT_CURRENCY) {
    return $currency . ' ' . number_format($amount, 2);
}

// Helper function to generate tracking number
function generateTrackingNumber() {
    return 'BG' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
}

// Helper function to generate order number
function generateOrderNumber() {
    return date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
}

// Helper function to validate phone number (Kenyan format)
function validateKenyanPhone($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return preg_match('/^(\+254|254|0)[17]\d{8}$/', $phone);
}

// Helper function to format phone number
function formatPhoneNumber($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    if (strpos($phone, '+254') === 0) {
        return $phone;
    } elseif (strpos($phone, '254') === 0) {
        return '+' . $phone;
    } elseif (strpos($phone, '0') === 0) {
        return '+254' . substr($phone, 1);
    }
    return '+254' . $phone;
}

// Helper function to sanitize input
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
}

// Helper function to validate email
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

// Helper function to generate random string
function generateRandomString($length = 10) {
    return substr(str_shuffle(str_repeat($x='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length/strlen($x)) )),1,$length);
}

// Helper function to log errors
function logError($message, $context = []) {
    if (LOG_ERRORS) {
        $logMessage = date('Y-m-d H:i:s') . ' - ' . $message;
        if (!empty($context)) {
            $logMessage .= ' - Context: ' . json_encode($context);
        }
        $logMessage .= PHP_EOL;
        
        $logFile = LOG_PATH . 'error-' . date('Y-m-d') . '.log';
        file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// Helper function to log API requests
function logApiRequest($endpoint, $method, $data = []) {
    if (DEBUG_MODE) {
        $logMessage = date('Y-m-d H:i:s') . " - API Request: $method $endpoint";
        if (!empty($data)) {
            $logMessage .= ' - Data: ' . json_encode($data);
        }
        $logMessage .= PHP_EOL;
        
        $logFile = LOG_PATH . 'api-' . date('Y-m-d') . '.log';
        file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
    }
}

// Autoloader for classes
spl_autoload_register(function ($class) {
    $directories = [
        'classes/',
        'models/',
        'controllers/',
        'helpers/'
    ];
    
    foreach ($directories as $directory) {
        $file = $directory . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
            return;
        }
    }
});

// Include common files
require_once 'helpers/functions.php';
require_once 'helpers/validation.php';
require_once 'helpers/response.php';
