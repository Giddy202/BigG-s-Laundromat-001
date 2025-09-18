<?php
/**
 * Common Helper Functions for BigG's Laundromat
 */

/**
 * Send JSON response
 */
function sendResponse($data, $statusCode = 200, $message = '') {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    
    $response = [
        'success' => $statusCode >= 200 && $statusCode < 300,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send error response
 */
function sendError($message, $statusCode = 400, $errors = []) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    
    $response = [
        'success' => false,
        'message' => $message,
        'errors' => $errors,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Validate required fields
 */
function validateRequired($data, $requiredFields) {
    $errors = [];
    
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    return $errors;
}

/**
 * Sanitize input data
 */
function sanitizeData($data) {
    if (is_array($data)) {
        return array_map('sanitizeData', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

/**
 * Validate email address
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validate Kenyan phone number
 */
function isValidKenyanPhone($phone) {
    $phone = preg_replace('/[^0-9+]/', '', $phone);
    return preg_match('/^(\+254|254|0)[17]\d{8}$/', $phone);
}

/**
 * Format phone number to international format
 */
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

/**
 * Generate random string
 */
function generateRandomString($length = 10) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $charactersLength = strlen($characters);
    $randomString = '';
    
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    
    return $randomString;
}

/**
 * Generate tracking number
 */
function generateTrackingNumber() {
    return 'BG' . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
}

/**
 * Generate order number
 */
function generateOrderNumber() {
    return date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
}

/**
 * Format currency
 */
function formatCurrency($amount, $currency = 'KES') {
    return $currency . ' ' . number_format($amount, 2);
}

/**
 * Calculate distance between two coordinates
 */
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    $earthRadius = 6371; // Earth's radius in kilometers
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat/2) * sin($dLat/2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon/2) * sin($dLon/2);
    
    $c = 2 * atan2(sqrt($a), sqrt(1-$a));
    
    return $earthRadius * $c;
}

/**
 * Check if location is within delivery radius
 */
function isWithinDeliveryRadius($lat, $lon, $radiusKm = 50) {
    // Default business location (Nairobi CBD)
    $businessLat = -1.286389;
    $businessLon = 36.817223;
    
    $distance = calculateDistance($businessLat, $businessLon, $lat, $lon);
    return $distance <= $radiusKm;
}

/**
 * Calculate delivery fee based on distance
 */
function calculateDeliveryFee($lat, $lon) {
    $distance = calculateDistance(-1.286389, 36.817223, $lat, $lon);
    
    if ($distance <= 5) {
        return 0; // Free delivery within 5km
    } elseif ($distance <= 15) {
        return 100; // Standard delivery fee
    } elseif ($distance <= 30) {
        return 200; // Extended delivery fee
    } else {
        return 300; // Long distance delivery fee
    }
}

/**
 * Generate JWT token
 */
function generateJWT($payload, $secret = null) {
    $secret = $secret ?: JWT_SECRET;
    
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    $payload = json_encode($payload);
    
    $base64Header = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64Payload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $base64Signature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64Header . "." . $base64Payload . "." . $base64Signature;
}

/**
 * Verify JWT token
 */
function verifyJWT($token, $secret = null) {
    $secret = $secret ?: JWT_SECRET;
    
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }
    
    list($base64Header, $base64Payload, $base64Signature) = $parts;
    
    $signature = hash_hmac('sha256', $base64Header . "." . $base64Payload, $secret, true);
    $expectedSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if ($base64Signature !== $expectedSignature) {
        return false;
    }
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64Payload)), true);
    
    // Check expiration
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return false;
    }
    
    return $payload;
}

/**
 * Hash password
 */
function hashPassword($password) {
    return password_hash($password, PASSWORD_DEFAULT);
}

/**
 * Verify password
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Generate CSRF token
 */
function generateCSRFToken() {
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

/**
 * Verify CSRF token
 */
function verifyCSRFToken($token) {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

/**
 * Log activity
 */
function logActivity($action, $details = [], $userId = null) {
    $logData = [
        'action' => $action,
        'details' => $details,
        'user_id' => $userId,
        'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    $logFile = LOG_PATH . 'activity-' . date('Y-m-d') . '.log';
    $logMessage = json_encode($logData) . PHP_EOL;
    
    file_put_contents($logFile, $logMessage, FILE_APPEND | LOCK_EX);
}

/**
 * Send WhatsApp message
 */
function sendWhatsAppMessage($phone, $message, $orderId = null) {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        return false;
    }
    
    $phone = formatPhoneNumber($phone);
    $url = WHATSAPP_API_URL . WHATSAPP_PHONE_NUMBER_ID . '/messages';
    
    $data = [
        'messaging_product' => 'whatsapp',
        'to' => $phone,
        'type' => 'text',
        'text' => [
            'body' => $message
        ]
    ];
    
    $headers = [
        'Authorization: Bearer ' . WHATSAPP_ACCESS_TOKEN,
        'Content-Type: application/json'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    // Log WhatsApp message
    if ($orderId) {
        $db = Database::getInstance();
        $db->insert('whatsapp_messages', [
            'order_id' => $orderId,
            'customer_phone' => $phone,
            'message_type' => 'custom',
            'message_content' => $message,
            'status' => $httpCode === 200 ? 'sent' : 'failed',
            'sent_at' => $httpCode === 200 ? date('Y-m-d H:i:s') : null
        ]);
    }
    
    return $httpCode === 200;
}

/**
 * Send email notification
 */
function sendEmail($to, $subject, $message, $isHTML = true) {
    if (!SMTP_USERNAME || !SMTP_PASSWORD) {
        return false;
    }
    
    $headers = [
        'From: ' . SMTP_FROM_NAME . ' <' . SMTP_FROM_EMAIL . '>',
        'Reply-To: ' . SMTP_FROM_EMAIL,
        'X-Mailer: PHP/' . phpversion()
    ];
    
    if ($isHTML) {
        $headers[] = 'MIME-Version: 1.0';
        $headers[] = 'Content-type: text/html; charset=UTF-8';
    }
    
    return mail($to, $subject, $message, implode("\r\n", $headers));
}

/**
 * Upload file
 */
function uploadFile($file, $directory = 'uploads/') {
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        return false;
    }
    
    $allowedExtensions = explode(',', ALLOWED_EXTENSIONS);
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($fileExtension, $allowedExtensions)) {
        return false;
    }
    
    if ($file['size'] > MAX_FILE_SIZE) {
        return false;
    }
    
    $fileName = uniqid() . '.' . $fileExtension;
    $filePath = $directory . $fileName;
    
    if (move_uploaded_file($file['tmp_name'], $filePath)) {
        return $filePath;
    }
    
    return false;
}

/**
 * Get service category display name
 */
function getCategoryDisplayName($category) {
    $categories = [
        'laundry_dry_cleaning' => 'Laundry & Dry Cleaning',
        'home_upholstery' => 'Home & Upholstery',
        'hotels_office' => 'Hotels & Office Upholstery',
        'auto_detailing' => 'Auto Detailing'
    ];
    
    return $categories[$category] ?? $category;
}

/**
 * Get order status display name
 */
function getOrderStatusDisplayName($status) {
    $statuses = [
        'pending' => 'Pending',
        'confirmed' => 'Confirmed',
        'in_progress' => 'In Progress',
        'ready_for_delivery' => 'Ready for Delivery',
        'completed' => 'Completed',
        'cancelled' => 'Cancelled'
    ];
    
    return $statuses[$status] ?? $status;
}

/**
 * Get payment status display name
 */
function getPaymentStatusDisplayName($status) {
    $statuses = [
        'pending' => 'Pending',
        'paid' => 'Paid',
        'failed' => 'Failed',
        'refunded' => 'Refunded'
    ];
    
    return $statuses[$status] ?? $status;
}

/**
 * Calculate loyalty points
 */
function calculateLoyaltyPoints($amount) {
    return floor($amount * LOYALTY_POINTS_PER_SHILLING);
}

/**
 * Get loyalty tier
 */
function getLoyaltyTier($points) {
    if ($points >= LOYALTY_PLATINUM_THRESHOLD) {
        return 'platinum';
    } elseif ($points >= LOYALTY_GOLD_THRESHOLD) {
        return 'gold';
    } elseif ($points >= LOYALTY_SILVER_THRESHOLD) {
        return 'silver';
    }
    return 'bronze';
}

/**
 * Calculate discount from loyalty points
 */
function calculateLoyaltyDiscount($points) {
    return floor($points / LOYALTY_POINTS_REDEMPTION_RATE);
}

/**
 * Format date for display
 */
function formatDate($date, $format = 'Y-m-d H:i:s') {
    if (!$date) return '';
    
    $timestamp = is_string($date) ? strtotime($date) : $date;
    return date($format, $timestamp);
}

/**
 * Get time ago string
 */
function timeAgo($datetime) {
    $time = time() - strtotime($datetime);
    
    if ($time < 60) return 'just now';
    if ($time < 3600) return floor($time/60) . ' minutes ago';
    if ($time < 86400) return floor($time/3600) . ' hours ago';
    if ($time < 2592000) return floor($time/86400) . ' days ago';
    if ($time < 31536000) return floor($time/2592000) . ' months ago';
    
    return floor($time/31536000) . ' years ago';
}

/**
 * Check if business is open
 */
function isBusinessOpen() {
    $currentTime = date('H:i');
    $currentDay = date('l');
    
    $workingDays = explode(',', getConfig('working_days', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'));
    $businessStart = getConfig('business_hours_start', '08:00');
    $businessEnd = getConfig('business_hours_end', '18:00');
    
    return in_array($currentDay, $workingDays) && 
           $currentTime >= $businessStart && 
           $currentTime <= $businessEnd;
}

/**
 * Get next business day
 */
function getNextBusinessDay($date = null) {
    $date = $date ?: date('Y-m-d');
    $workingDays = explode(',', getConfig('working_days', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday'));
    
    do {
        $date = date('Y-m-d', strtotime($date . ' +1 day'));
        $day = date('l', strtotime($date));
    } while (!in_array($day, $workingDays));
    
    return $date;
}

/**
 * Rate limiting check
 */
function checkRateLimit($identifier, $limit = null, $window = null) {
    $limit = $limit ?: RATE_LIMIT_REQUESTS;
    $window = $window ?: RATE_LIMIT_WINDOW;
    
    $cacheFile = CACHE_PATH . 'rate_limit_' . md5($identifier) . '.txt';
    $now = time();
    
    if (file_exists($cacheFile)) {
        $data = json_decode(file_get_contents($cacheFile), true);
        
        // Clean old entries
        $data = array_filter($data, function($timestamp) use ($now, $window) {
            return $timestamp > $now - $window;
        });
        
        if (count($data) >= $limit) {
            return false;
        }
        
        $data[] = $now;
    } else {
        $data = [$now];
    }
    
    file_put_contents($cacheFile, json_encode($data));
    return true;
}


