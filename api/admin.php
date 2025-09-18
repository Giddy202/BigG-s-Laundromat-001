<?php
/**
 * BigG's Laundromat - Admin API Endpoints
 * Handles admin dashboard data and management operations
 */

require_once '../config/config.php';
require_once '../classes/Database.php';
require_once '../helpers/functions.php';

// Set JSON header
header('Content-Type: application/json');

// Enable CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize database
$db = new Database();

// Get request method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'dashboard':
            handleDashboard($db);
            break;
        case 'orders':
            handleOrders($db, $method);
            break;
        case 'customers':
            handleCustomers($db, $method);
            break;
        case 'services':
            handleServices($db, $method);
            break;
        case 'staff':
            handleStaff($db, $method);
            break;
        case 'reports':
            handleReports($db, $method);
            break;
        case 'settings':
            handleSettings($db, $method);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

/**
 * Handle dashboard data
 */
function handleDashboard($db) {
    $stats = getDashboardStats($db);
    $recentOrders = getRecentOrders($db, 5);
    $topServices = getTopServices($db, 5);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'topServices' => $topServices
        ]
    ]);
}

/**
 * Handle orders management
 */
function handleOrders($db, $method) {
    switch ($method) {
        case 'GET':
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 10;
            $status = $_GET['status'] ?? '';
            $search = $_GET['search'] ?? '';
            $dateFrom = $_GET['date_from'] ?? '';
            $dateTo = $_GET['date_to'] ?? '';
            
            $orders = getOrders($db, $page, $limit, $status, $search, $dateFrom, $dateTo);
            $total = getOrdersCount($db, $status, $search, $dateFrom, $dateTo);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'orders' => $orders,
                    'pagination' => [
                        'current_page' => $page,
                        'per_page' => $limit,
                        'total' => $total,
                        'total_pages' => ceil($total / $limit)
                    ]
                ]
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $orderId = createOrder($db, $data);
            
            echo json_encode([
                'success' => true,
                'data' => ['order_id' => $orderId]
            ]);
            break;
            
        case 'PUT':
            $orderId = $_GET['id'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            updateOrder($db, $orderId, $data);
            
            echo json_encode([
                'success' => true,
                'message' => 'Order updated successfully'
            ]);
            break;
            
        case 'DELETE':
            $orderId = $_GET['id'] ?? 0;
            deleteOrder($db, $orderId);
            
            echo json_encode([
                'success' => true,
                'message' => 'Order deleted successfully'
            ]);
            break;
    }
}

/**
 * Handle customers management
 */
function handleCustomers($db, $method) {
    switch ($method) {
        case 'GET':
            $page = $_GET['page'] ?? 1;
            $limit = $_GET['limit'] ?? 10;
            $tier = $_GET['tier'] ?? '';
            $search = $_GET['search'] ?? '';
            
            $customers = getCustomers($db, $page, $limit, $tier, $search);
            $stats = getCustomerStats($db);
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'customers' => $customers,
                    'stats' => $stats
                ]
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $customerId = createCustomer($db, $data);
            
            echo json_encode([
                'success' => true,
                'data' => ['customer_id' => $customerId]
            ]);
            break;
            
        case 'PUT':
            $customerId = $_GET['id'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            updateCustomer($db, $customerId, $data);
            
            echo json_encode([
                'success' => true,
                'message' => 'Customer updated successfully'
            ]);
            break;
            
        case 'DELETE':
            $customerId = $_GET['id'] ?? 0;
            deleteCustomer($db, $customerId);
            
            echo json_encode([
                'success' => true,
                'message' => 'Customer deleted successfully'
            ]);
            break;
    }
}

/**
 * Handle services management
 */
function handleServices($db, $method) {
    switch ($method) {
        case 'GET':
            $category = $_GET['category'] ?? '';
            $search = $_GET['search'] ?? '';
            
            $services = getServices($db, $category, $search);
            
            echo json_encode([
                'success' => true,
                'data' => ['services' => $services]
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $serviceId = createService($db, $data);
            
            echo json_encode([
                'success' => true,
                'data' => ['service_id' => $serviceId]
            ]);
            break;
            
        case 'PUT':
            $serviceId = $_GET['id'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            updateService($db, $serviceId, $data);
            
            echo json_encode([
                'success' => true,
                'message' => 'Service updated successfully'
            ]);
            break;
            
        case 'DELETE':
            $serviceId = $_GET['id'] ?? 0;
            deleteService($db, $serviceId);
            
            echo json_encode([
                'success' => true,
                'message' => 'Service deleted successfully'
            ]);
            break;
    }
}

/**
 * Handle staff management
 */
function handleStaff($db, $method) {
    switch ($method) {
        case 'GET':
            $staff = getStaff($db);
            
            echo json_encode([
                'success' => true,
                'data' => ['staff' => $staff]
            ]);
            break;
            
        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $staffId = createStaff($db, $data);
            
            echo json_encode([
                'success' => true,
                'data' => ['staff_id' => $staffId]
            ]);
            break;
            
        case 'PUT':
            $staffId = $_GET['id'] ?? 0;
            $data = json_decode(file_get_contents('php://input'), true);
            updateStaff($db, $staffId, $data);
            
            echo json_encode([
                'success' => true,
                'message' => 'Staff member updated successfully'
            ]);
            break;
            
        case 'DELETE':
            $staffId = $_GET['id'] ?? 0;
            deleteStaff($db, $staffId);
            
            echo json_encode([
                'success' => true,
                'message' => 'Staff member deleted successfully'
            ]);
            break;
    }
}

/**
 * Handle reports
 */
function handleReports($db, $method) {
    $reportType = $_GET['type'] ?? 'sales';
    $dateFrom = $_GET['date_from'] ?? '';
    $dateTo = $_GET['date_to'] ?? '';
    
    $report = generateReport($db, $reportType, $dateFrom, $dateTo);
    
    echo json_encode([
        'success' => true,
        'data' => ['report' => $report]
    ]);
}

/**
 * Handle settings
 */
function handleSettings($db, $method) {
    $settingType = $_GET['type'] ?? 'general';
    
    if ($method === 'GET') {
        $settings = getSettings($db, $settingType);
        
        echo json_encode([
            'success' => true,
            'data' => ['settings' => $settings]
        ]);
    } else if ($method === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        updateSettings($db, $settingType, $data);
        
        echo json_encode([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
    }
}

// Database functions

function getDashboardStats($db) {
    $stats = [];
    
    // Total orders
    $result = $db->query("SELECT COUNT(*) as total FROM orders");
    $stats['totalOrders'] = $result['total'];
    
    // Total revenue
    $result = $db->query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'completed'");
    $stats['totalRevenue'] = $result['total'] ?? 0;
    
    // Total customers
    $result = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'customer'");
    $stats['totalCustomers'] = $result['total'];
    
    // Pending orders
    $result = $db->query("SELECT COUNT(*) as total FROM orders WHERE status = 'pending'");
    $stats['pendingOrders'] = $result['total'];
    
    return $stats;
}

function getRecentOrders($db, $limit = 5) {
    $sql = "SELECT o.*, u.name as customer_name, u.phone as customer_phone 
            FROM orders o 
            LEFT JOIN users u ON o.customer_id = u.id 
            ORDER BY o.created_at DESC 
            LIMIT ?";
    
    return $db->fetchAll($sql, [$limit]);
}

function getTopServices($db, $limit = 5) {
    $sql = "SELECT s.*, COUNT(oi.id) as order_count 
            FROM services s 
            LEFT JOIN order_items oi ON s.id = oi.service_id 
            GROUP BY s.id 
            ORDER BY order_count DESC 
            LIMIT ?";
    
    return $db->fetchAll($sql, [$limit]);
}

function getOrders($db, $page = 1, $limit = 10, $status = '', $search = '', $dateFrom = '', $dateTo = '') {
    $offset = ($page - 1) * $limit;
    $where = [];
    $params = [];
    
    if ($status) {
        $where[] = "o.status = ?";
        $params[] = $status;
    }
    
    if ($search) {
        $where[] = "(o.tracking_number LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    if ($dateFrom) {
        $where[] = "DATE(o.created_at) >= ?";
        $params[] = $dateFrom;
    }
    
    if ($dateTo) {
        $where[] = "DATE(o.created_at) <= ?";
        $params[] = $dateTo;
    }
    
    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    
    $sql = "SELECT o.*, u.name as customer_name, u.phone as customer_phone 
            FROM orders o 
            LEFT JOIN users u ON o.customer_id = u.id 
            $whereClause
            ORDER BY o.created_at DESC 
            LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    
    return $db->fetchAll($sql, $params);
}

function getOrdersCount($db, $status = '', $search = '', $dateFrom = '', $dateTo = '') {
    $where = [];
    $params = [];
    
    if ($status) {
        $where[] = "o.status = ?";
        $params[] = $status;
    }
    
    if ($search) {
        $where[] = "(o.tracking_number LIKE ? OR u.name LIKE ? OR u.phone LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    if ($dateFrom) {
        $where[] = "DATE(o.created_at) >= ?";
        $params[] = $dateFrom;
    }
    
    if ($dateTo) {
        $where[] = "DATE(o.created_at) <= ?";
        $params[] = $dateTo;
    }
    
    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    
    $sql = "SELECT COUNT(*) as total 
            FROM orders o 
            LEFT JOIN users u ON o.customer_id = u.id 
            $whereClause";
    
    $result = $db->query($sql, $params);
    return $result['total'];
}

function getCustomers($db, $page = 1, $limit = 10, $tier = '', $search = '') {
    $offset = ($page - 1) * $limit;
    $where = ["u.role = 'customer'"];
    $params = [];
    
    if ($tier) {
        $where[] = "lp.tier = ?";
        $params[] = $tier;
    }
    
    if ($search) {
        $where[] = "(u.name LIKE ? OR u.phone LIKE ? OR u.email LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $whereClause = 'WHERE ' . implode(' AND ', $where);
    
    $sql = "SELECT u.*, lp.tier as loyalty_tier, lp.points,
                   COUNT(o.id) as total_orders,
                   SUM(o.total_amount) as total_spent,
                   MAX(o.created_at) as last_order
            FROM users u 
            LEFT JOIN loyalty_points lp ON u.id = lp.user_id
            LEFT JOIN orders o ON u.id = o.customer_id
            $whereClause
            GROUP BY u.id
            ORDER BY u.created_at DESC 
            LIMIT ? OFFSET ?";
    
    $params[] = $limit;
    $params[] = $offset;
    
    return $db->fetchAll($sql, $params);
}

function getCustomerStats($db) {
    $stats = [];
    
    // Total customers
    $result = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'customer'");
    $stats['totalCustomers'] = $result['total'];
    
    // New customers this month
    $result = $db->query("SELECT COUNT(*) as total FROM users WHERE role = 'customer' AND MONTH(created_at) = MONTH(CURRENT_DATE())");
    $stats['newCustomers'] = $result['total'];
    
    // Loyalty members
    $result = $db->query("SELECT COUNT(*) as total FROM loyalty_points WHERE points > 0");
    $stats['loyaltyMembers'] = $result['total'];
    
    // Average order value
    $result = $db->query("SELECT AVG(total_amount) as avg FROM orders WHERE status = 'completed'");
    $stats['avgOrderValue'] = $result['avg'] ?? 0;
    
    return $stats;
}

function getServices($db, $category = '', $search = '') {
    $where = [];
    $params = [];
    
    if ($category) {
        $where[] = "category = ?";
        $params[] = $category;
    }
    
    if ($search) {
        $where[] = "(name LIKE ? OR description LIKE ?)";
        $searchTerm = "%$search%";
        $params[] = $searchTerm;
        $params[] = $searchTerm;
    }
    
    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    
    $sql = "SELECT * FROM services $whereClause ORDER BY name ASC";
    
    return $db->fetchAll($sql, $params);
}

function getStaff($db) {
    $sql = "SELECT * FROM staff ORDER BY name ASC";
    return $db->fetchAll($sql);
}

function generateReport($db, $type, $dateFrom, $dateTo) {
    $report = [];
    
    switch ($type) {
        case 'sales':
            $report = generateSalesReport($db, $dateFrom, $dateTo);
            break;
        case 'customers':
            $report = generateCustomerReport($db, $dateFrom, $dateTo);
            break;
        case 'services':
            $report = generateServiceReport($db, $dateFrom, $dateTo);
            break;
        case 'staff':
            $report = generateStaffReport($db, $dateFrom, $dateTo);
            break;
    }
    
    return $report;
}

function generateSalesReport($db, $dateFrom, $dateTo) {
    $where = [];
    $params = [];
    
    if ($dateFrom) {
        $where[] = "DATE(created_at) >= ?";
        $params[] = $dateFrom;
    }
    
    if ($dateTo) {
        $where[] = "DATE(created_at) <= ?";
        $params[] = $dateTo;
    }
    
    $whereClause = $where ? 'WHERE ' . implode(' AND ', $where) : '';
    
    $sql = "SELECT 
                DATE(created_at) as date,
                COUNT(*) as order_count,
                SUM(total_amount) as total_revenue
            FROM orders 
            $whereClause
            GROUP BY DATE(created_at)
            ORDER BY date ASC";
    
    return $db->fetchAll($sql, $params);
}

function generateCustomerReport($db, $dateFrom, $dateTo) {
    // Implementation for customer report
    return [];
}

function generateServiceReport($db, $dateFrom, $dateTo) {
    // Implementation for service report
    return [];
}

function generateStaffReport($db, $dateFrom, $dateTo) {
    // Implementation for staff report
    return [];
}

function getSettings($db, $type) {
    $sql = "SELECT * FROM admin_settings WHERE setting_type = ?";
    $result = $db->fetchAll($sql, [$type]);
    
    $settings = [];
    foreach ($result as $row) {
        $settings[$row['setting_key']] = $row['setting_value'];
    }
    
    return $settings;
}

function updateSettings($db, $type, $data) {
    foreach ($data as $key => $value) {
        $sql = "INSERT INTO admin_settings (setting_type, setting_key, setting_value) 
                VALUES (?, ?, ?) 
                ON DUPLICATE KEY UPDATE setting_value = ?";
        $db->query($sql, [$type, $key, $value, $value]);
    }
}

// CRUD functions for orders
function createOrder($db, $data) {
    // Implementation for creating order
    return 1;
}

function updateOrder($db, $id, $data) {
    // Implementation for updating order
}

function deleteOrder($db, $id) {
    $sql = "DELETE FROM orders WHERE id = ?";
    $db->query($sql, [$id]);
}

// CRUD functions for customers
function createCustomer($db, $data) {
    // Implementation for creating customer
    return 1;
}

function updateCustomer($db, $id, $data) {
    // Implementation for updating customer
}

function deleteCustomer($db, $id) {
    $sql = "DELETE FROM users WHERE id = ? AND role = 'customer'";
    $db->query($sql, [$id]);
}

// CRUD functions for services
function createService($db, $data) {
    // Implementation for creating service
    return 1;
}

function updateService($db, $id, $data) {
    // Implementation for updating service
}

function deleteService($db, $id) {
    $sql = "DELETE FROM services WHERE id = ?";
    $db->query($sql, [$id]);
}

// CRUD functions for staff
function createStaff($db, $data) {
    // Implementation for creating staff
    return 1;
}

function updateStaff($db, $id, $data) {
    // Implementation for updating staff
}

function deleteStaff($db, $id) {
    $sql = "DELETE FROM staff WHERE id = ?";
    $db->query($sql, [$id]);
}
?>


