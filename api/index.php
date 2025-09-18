<?php
/**
 * BigG's Laundromat API Entry Point
 * RESTful API for the laundry management system
 */

// Include configuration and autoloader
require_once '../config/config.php';

// Set CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Get request method and URI
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = $_SERVER['REQUEST_URI'];

// Remove query string and base path
$path = parse_url($requestUri, PHP_URL_PATH);
$path = str_replace('/api', '', $path);
$path = trim($path, '/');

// Get request data
$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    $input = $_REQUEST;
}

// Log API request
logApiRequest($path, $method, $input);

// Route the request
try {
    $response = routeRequest($method, $path, $input);
    sendResponse($response);
} catch (Exception $e) {
    logError("API Error: " . $e->getMessage(), ['path' => $path, 'method' => $method]);
    sendError($e->getMessage(), 500);
}

/**
 * Route API requests
 */
function routeRequest($method, $path, $data) {
    $pathParts = explode('/', $path);
    $endpoint = $pathParts[0] ?? '';
    $id = $pathParts[1] ?? null;
    $action = $pathParts[2] ?? null;
    
    // Public endpoints (no authentication required)
    $publicEndpoints = [
        'services',
        'track',
        'contact',
        'health'
    ];
    
    // Admin endpoints (require admin authentication)
    $adminEndpoints = [
        'admin/orders',
        'admin/customers',
        'admin/services',
        'admin/staff',
        'admin/dashboard',
        'admin/settings'
    ];
    
    // Staff endpoints (require staff authentication)
    $staffEndpoints = [
        'staff/orders',
        'staff/customers',
        'staff/dashboard'
    ];
    
    // Check authentication for protected endpoints
    if (!in_array($endpoint, $publicEndpoints) && 
        !str_starts_with($endpoint, 'admin/') && 
        !str_starts_with($endpoint, 'staff/')) {
        
        // Customer authentication required
        $customer = authenticateCustomer();
        if (!$customer) {
            throw new Exception('Authentication required', 401);
        }
    }
    
    // Route to appropriate handler
    switch ($endpoint) {
        case 'services':
            return handleServices($method, $id, $action, $data);
            
        case 'orders':
            return handleOrders($method, $id, $action, $data);
            
        case 'customers':
            return handleCustomers($method, $id, $action, $data);
            
        case 'track':
            return handleOrderTracking($method, $id, $action, $data);
            
        case 'contact':
            return handleContact($method, $id, $action, $data);
            
        case 'health':
            return handleHealthCheck($method, $id, $action, $data);
            
        case 'admin/orders':
            return handleAdminOrders($method, $id, $action, $data);
            
        case 'admin/customers':
            return handleAdminCustomers($method, $id, $action, $data);
            
        case 'admin/services':
            return handleAdminServices($method, $id, $action, $data);
            
        case 'admin/dashboard':
            return handleAdminDashboard($method, $id, $action, $data);
            
        case 'staff/orders':
            return handleStaffOrders($method, $id, $action, $data);
            
        case 'staff/dashboard':
            return handleStaffDashboard($method, $id, $action, $data);
            
        default:
            throw new Exception('Endpoint not found', 404);
    }
}

/**
 * Handle services endpoints
 */
function handleServices($method, $id, $action, $data) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single service
                $service = $db->fetch(
                    "SELECT * FROM services WHERE id = ? AND is_active = 1",
                    [$id]
                );
                
                if (!$service) {
                    throw new Exception('Service not found', 404);
                }
                
                return $service;
            } else {
                // Get all services with optional category filter
                $category = $data['category'] ?? '';
                $whereClause = "WHERE is_active = 1";
                $params = [];
                
                if ($category) {
                    $whereClause .= " AND category = ?";
                    $params[] = $category;
                }
                
                $services = $db->fetchAll(
                    "SELECT * FROM services {$whereClause} ORDER BY category, name",
                    $params
                );
                
                // Group services by category
                $groupedServices = [];
                foreach ($services as $service) {
                    $groupedServices[$service['category']][] = $service;
                }
                
                return $groupedServices;
            }
            
        default:
            throw new Exception('Method not allowed', 405);
    }
}

/**
 * Handle orders endpoints
 */
function handleOrders($method, $id, $action, $data) {
    $db = Database::getInstance();
    
    switch ($method) {
        case 'GET':
            if ($id) {
                // Get single order
                $order = $db->fetch(
                    "SELECT o.*, c.name as customer_name, c.phone as customer_phone, c.email as customer_email
                     FROM orders o 
                     JOIN customers c ON o.customer_id = c.id 
                     WHERE o.id = ?",
                    [$id]
                );
                
                if (!$order) {
                    throw new Exception('Order not found', 404);
                }
                
                // Get order items
                $orderItems = $db->fetchAll(
                    "SELECT oi.*, s.name as service_name, s.category as service_category
                     FROM order_items oi 
                     JOIN services s ON oi.service_id = s.id 
                     WHERE oi.order_id = ?",
                    [$id]
                );
                
                $order['items'] = $orderItems;
                
                return $order;
            } else {
                // Get customer's orders
                $customer = authenticateCustomer();
                if (!$customer) {
                    throw new Exception('Authentication required', 401);
                }
                
                $orders = $db->fetchAll(
                    "SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
                    [$customer['id']]
                );
                
                return $orders;
            }
            
        case 'POST':
            // Create new order
            return createOrder($data);
            
        case 'PUT':
            if (!$id) {
                throw new Exception('Order ID required', 400);
            }
            
            // Update order
            return updateOrder($id, $data);
            
        default:
            throw new Exception('Method not allowed', 405);
    }
}

/**
 * Create new order
 */
function createOrder($data) {
    $db = Database::getInstance();
    
    // Validate required fields
    $requiredFields = ['customer_name', 'customer_phone', 'items'];
    $errors = validateRequired($data, $requiredFields);
    
    if (!empty($errors)) {
        throw new Exception('Validation failed: ' . implode(', ', $errors), 400);
    }
    
    // Validate items
    if (!is_array($data['items']) || empty($data['items'])) {
        throw new Exception('Order must contain at least one item', 400);
    }
    
    try {
        $db->beginTransaction();
        
        // Find or create customer
        $customer = $db->fetch(
            "SELECT * FROM customers WHERE phone = ?",
            [formatPhoneNumber($data['customer_phone'])]
        );
        
        if (!$customer) {
            $customerId = $db->insert('customers', [
                'name' => sanitizeData($data['customer_name']),
                'phone' => formatPhoneNumber($data['customer_phone']),
                'email' => $data['customer_email'] ?? null,
                'address' => $data['customer_address'] ?? null,
                'latitude' => $data['pickup_latitude'] ?? null,
                'longitude' => $data['pickup_longitude'] ?? null
            ]);
        } else {
            $customerId = $customer['id'];
            
            // Update customer info if provided
            $updateData = [];
            if (isset($data['customer_name'])) $updateData['name'] = sanitizeData($data['customer_name']);
            if (isset($data['customer_email'])) $updateData['email'] = $data['customer_email'];
            if (isset($data['customer_address'])) $updateData['address'] = $data['customer_address'];
            
            if (!empty($updateData)) {
                $db->update('customers', $updateData, 'id = ?', [$customerId]);
            }
        }
        
        // Calculate totals
        $subtotal = 0;
        $orderItems = [];
        
        foreach ($data['items'] as $item) {
            $service = $db->fetch(
                "SELECT * FROM services WHERE id = ? AND is_active = 1",
                [$item['service_id']]
            );
            
            if (!$service) {
                throw new Exception("Service ID {$item['service_id']} not found", 400);
            }
            
            $quantity = $item['quantity'] ?? 1;
            $unitPrice = $service['base_price'];
            $totalPrice = $unitPrice * $quantity;
            
            $subtotal += $totalPrice;
            
            $orderItems[] = [
                'service_id' => $service['id'],
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'special_instructions' => $item['special_instructions'] ?? null
            ];
        }
        
        // Calculate delivery fee
        $deliveryFee = 0;
        if (isset($data['pickup_latitude']) && isset($data['pickup_longitude'])) {
            $deliveryFee = calculateDeliveryFee($data['pickup_latitude'], $data['pickup_longitude']);
        }
        
        // Apply discounts
        $discountAmount = 0;
        if (isset($data['discount_code'])) {
            $discount = $db->fetch(
                "SELECT * FROM discounts WHERE code = ? AND is_active = 1 AND valid_from <= NOW() AND valid_until >= NOW()",
                [$data['discount_code']]
            );
            
            if ($discount) {
                if ($discount['discount_type'] === 'percentage') {
                    $discountAmount = ($subtotal * $discount['discount_value']) / 100;
                } else {
                    $discountAmount = $discount['discount_value'];
                }
                
                // Check minimum order amount
                if ($subtotal < $discount['min_order_amount']) {
                    throw new Exception('Order amount below minimum for discount', 400);
                }
                
                // Check usage limit
                if ($discount['usage_limit'] && $discount['used_count'] >= $discount['usage_limit']) {
                    throw new Exception('Discount code usage limit exceeded', 400);
                }
            }
        }
        
        // Apply loyalty discount
        $loyaltyDiscount = 0;
        if (isset($data['use_loyalty_points'])) {
            $loyalty = $db->fetch(
                "SELECT * FROM loyalty_program WHERE customer_id = ?",
                [$customerId]
            );
            
            if ($loyalty && $loyalty['current_balance'] > 0) {
                $loyaltyDiscount = calculateLoyaltyDiscount($loyalty['current_balance']);
            }
        }
        
        $totalAmount = $subtotal + $deliveryFee - $discountAmount - $loyaltyDiscount;
        
        // Create order
        $trackingNumber = generateTrackingNumber();
        $orderId = $db->insert('orders', [
            'tracking_number' => $trackingNumber,
            'customer_id' => $customerId,
            'order_type' => $data['order_type'] ?? 'pickup_delivery',
            'pickup_address' => $data['pickup_address'] ?? null,
            'delivery_address' => $data['delivery_address'] ?? null,
            'pickup_latitude' => $data['pickup_latitude'] ?? null,
            'pickup_longitude' => $data['pickup_longitude'] ?? null,
            'delivery_latitude' => $data['delivery_latitude'] ?? null,
            'delivery_longitude' => $data['delivery_longitude'] ?? null,
            'scheduled_pickup' => $data['scheduled_pickup'] ?? null,
            'scheduled_delivery' => $data['scheduled_delivery'] ?? null,
            'subtotal' => $subtotal,
            'discount_amount' => $discountAmount,
            'loyalty_discount' => $loyaltyDiscount,
            'total_amount' => $totalAmount,
            'payment_method' => $data['payment_method'] ?? 'cash',
            'special_instructions' => $data['special_instructions'] ?? null
        ]);
        
        // Create order items
        foreach ($orderItems as $item) {
            $item['order_id'] = $orderId;
            $db->insert('order_items', $item);
        }
        
        // Update customer loyalty points
        $pointsEarned = calculateLoyaltyPoints($totalAmount);
        if ($pointsEarned > 0) {
            $db->query(
                "INSERT INTO loyalty_program (customer_id, points_earned, current_balance) 
                 VALUES (?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 points_earned = points_earned + ?, 
                 current_balance = current_balance + ?",
                [$customerId, $pointsEarned, $pointsEarned, $pointsEarned, $pointsEarned]
            );
        }
        
        // Send WhatsApp confirmation
        $customer = $db->fetch("SELECT * FROM customers WHERE id = ?", [$customerId]);
        $message = "Hi {$customer['name']}! Your order #{$trackingNumber} has been confirmed. Estimated completion: 24 hours. Track your order: " . ORDER_TRACKING_URL . $trackingNumber;
        
        sendWhatsAppMessage($customer['phone'], $message, $orderId);
        
        $db->commit();
        
        return [
            'order_id' => $orderId,
            'tracking_number' => $trackingNumber,
            'total_amount' => $totalAmount,
            'estimated_completion' => date('Y-m-d H:i:s', strtotime('+24 hours'))
        ];
        
    } catch (Exception $e) {
        $db->rollback();
        throw $e;
    }
}

/**
 * Handle order tracking
 */
function handleOrderTracking($method, $id, $action, $data) {
    $db = Database::getInstance();
    
    if ($method !== 'GET' || !$id) {
        throw new Exception('Method not allowed', 405);
    }
    
    $order = $db->fetch(
        "SELECT o.*, c.name as customer_name, c.phone as customer_phone
         FROM orders o 
         JOIN customers c ON o.customer_id = c.id 
         WHERE o.tracking_number = ?",
        [$id]
    );
    
    if (!$order) {
        throw new Exception('Order not found', 404);
    }
    
    // Get order items
    $orderItems = $db->fetchAll(
        "SELECT oi.*, s.name as service_name, s.category as service_category
         FROM order_items oi 
         JOIN services s ON oi.service_id = s.id 
         WHERE oi.order_id = ?",
        [$order['id']]
    );
    
    // Get status history
    $statusHistory = $db->fetchAll(
        "SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at DESC",
        [$order['id']]
    );
    
    $order['items'] = $orderItems;
    $order['status_history'] = $statusHistory;
    
    return $order;
}

/**
 * Handle contact form
 */
function handleContact($method, $id, $action, $data) {
    if ($method !== 'POST') {
        throw new Exception('Method not allowed', 405);
    }
    
    $requiredFields = ['name', 'email', 'message'];
    $errors = validateRequired($data, $requiredFields);
    
    if (!empty($errors)) {
        throw new Exception('Validation failed: ' . implode(', ', $errors), 400);
    }
    
    if (!isValidEmail($data['email'])) {
        throw new Exception('Invalid email address', 400);
    }
    
    // Log contact form submission
    logActivity('contact_form_submission', [
        'name' => $data['name'],
        'email' => $data['email'],
        'subject' => $data['subject'] ?? 'General Inquiry'
    ]);
    
    // Send email notification (if configured)
    if (SMTP_USERNAME && SMTP_PASSWORD) {
        $subject = "Contact Form: " . ($data['subject'] ?? 'General Inquiry');
        $message = "
            <h3>New Contact Form Submission</h3>
            <p><strong>Name:</strong> {$data['name']}</p>
            <p><strong>Email:</strong> {$data['email']}</p>
            <p><strong>Phone:</strong> " . ($data['phone'] ?? 'Not provided') . "</p>
            <p><strong>Subject:</strong> " . ($data['subject'] ?? 'General Inquiry') . "</p>
            <p><strong>Message:</strong></p>
            <p>{$data['message']}</p>
        ";
        
        sendEmail(BUSINESS_EMAIL, $subject, $message);
    }
    
    return ['message' => 'Thank you for your message. We will get back to you soon!'];
}

/**
 * Handle health check
 */
function handleHealthCheck($method, $id, $action, $data) {
    if ($method !== 'GET') {
        throw new Exception('Method not allowed', 405);
    }
    
    $db = Database::getInstance();
    
    try {
        // Test database connection
        $db->query("SELECT 1");
        
        return [
            'status' => 'healthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => APP_VERSION,
            'database' => 'connected'
        ];
    } catch (Exception $e) {
        return [
            'status' => 'unhealthy',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => APP_VERSION,
            'database' => 'disconnected',
            'error' => $e->getMessage()
        ];
    }
}

/**
 * Authenticate customer
 */
function authenticateCustomer() {
    // This is a simplified authentication
    // In a real application, you would implement proper JWT or session-based auth
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (strpos($authHeader, 'Bearer ') === 0) {
        $token = substr($authHeader, 7);
        $payload = verifyJWT($token);
        
        if ($payload && isset($payload['customer_id'])) {
            $db = Database::getInstance();
            return $db->fetch("SELECT * FROM customers WHERE id = ?", [$payload['customer_id']]);
        }
    }
    
    return false;
}

/**
 * Placeholder functions for admin and staff endpoints
 */
function handleAdminOrders($method, $id, $action, $data) {
    throw new Exception('Admin endpoints not implemented yet', 501);
}

function handleAdminCustomers($method, $id, $action, $data) {
    throw new Exception('Admin endpoints not implemented yet', 501);
}

function handleAdminServices($method, $id, $action, $data) {
    throw new Exception('Admin endpoints not implemented yet', 501);
}

function handleAdminDashboard($method, $id, $action, $data) {
    throw new Exception('Admin endpoints not implemented yet', 501);
}

function handleStaffOrders($method, $id, $action, $data) {
    throw new Exception('Staff endpoints not implemented yet', 501);
}

function handleStaffDashboard($method, $id, $action, $data) {
    throw new Exception('Staff endpoints not implemented yet', 501);
}

function handleCustomers($method, $id, $action, $data) {
    throw new Exception('Customer endpoints not implemented yet', 501);
}

function updateOrder($id, $data) {
    throw new Exception('Order update not implemented yet', 501);
}


