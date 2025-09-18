<?php
/**
 * Validation Helper Functions for BigG's Laundromat
 */

/**
 * Validate customer data
 */
function validateCustomerData($data) {
    $errors = [];
    
    // Required fields
    $requiredFields = ['name', 'phone'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    // Validate email if provided
    if (isset($data['email']) && !empty($data['email'])) {
        if (!isValidEmail($data['email'])) {
            $errors[] = "Invalid email format";
        }
    }
    
    // Validate phone number
    if (isset($data['phone']) && !isValidKenyanPhone($data['phone'])) {
        $errors[] = "Invalid phone number format";
    }
    
    return $errors;
}

/**
 * Validate order data
 */
function validateOrderData($data) {
    $errors = [];
    
    // Required fields
    $requiredFields = ['customer_id', 'pickup_address', 'delivery_address'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    // Validate order items
    if (!isset($data['items']) || !is_array($data['items']) || empty($data['items'])) {
        $errors[] = "At least one service item is required";
    } else {
        foreach ($data['items'] as $index => $item) {
            if (!isset($item['service_id']) || !isset($item['quantity'])) {
                $errors[] = "Item " . ($index + 1) . " is missing required fields";
            }
            
            if (isset($item['quantity']) && (!is_numeric($item['quantity']) || $item['quantity'] <= 0)) {
                $errors[] = "Item " . ($index + 1) . " quantity must be a positive number";
            }
        }
    }
    
    // Validate coordinates if provided
    if (isset($data['pickup_latitude']) && isset($data['pickup_longitude'])) {
        if (!is_numeric($data['pickup_latitude']) || !is_numeric($data['pickup_longitude'])) {
            $errors[] = "Invalid pickup coordinates";
        }
    }
    
    if (isset($data['delivery_latitude']) && isset($data['delivery_longitude'])) {
        if (!is_numeric($data['delivery_latitude']) || !is_numeric($data['delivery_longitude'])) {
            $errors[] = "Invalid delivery coordinates";
        }
    }
    
    return $errors;
}

/**
 * Validate service data
 */
function validateServiceData($data) {
    $errors = [];
    
    // Required fields
    $requiredFields = ['name', 'category', 'base_price', 'price_unit'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    // Validate category
    $validCategories = ['laundry_dry_cleaning', 'home_upholstery', 'hotels_office', 'auto_detailing'];
    if (isset($data['category']) && !in_array($data['category'], $validCategories)) {
        $errors[] = "Invalid service category";
    }
    
    // Validate price
    if (isset($data['base_price']) && (!is_numeric($data['base_price']) || $data['base_price'] < 0)) {
        $errors[] = "Base price must be a positive number";
    }
    
    return $errors;
}

/**
 * Validate staff data
 */
function validateStaffData($data) {
    $errors = [];
    
    // Required fields
    $requiredFields = ['name', 'email', 'phone', 'role', 'password'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    // Validate email
    if (isset($data['email']) && !isValidEmail($data['email'])) {
        $errors[] = "Invalid email format";
    }
    
    // Validate phone
    if (isset($data['phone']) && !isValidKenyanPhone($data['phone'])) {
        $errors[] = "Invalid phone number format";
    }
    
    // Validate role
    $validRoles = ['admin', 'manager', 'staff', 'driver'];
    if (isset($data['role']) && !in_array($data['role'], $validRoles)) {
        $errors[] = "Invalid staff role";
    }
    
    // Validate password strength
    if (isset($data['password']) && strlen($data['password']) < 6) {
        $errors[] = "Password must be at least 6 characters long";
    }
    
    return $errors;
}

/**
 * Validate discount data
 */
function validateDiscountData($data) {
    $errors = [];
    
    // Required fields
    $requiredFields = ['code', 'name', 'discount_type', 'discount_value', 'valid_from', 'valid_until'];
    foreach ($requiredFields as $field) {
        if (!isset($data[$field]) || empty(trim($data[$field]))) {
            $errors[] = "Field '{$field}' is required";
        }
    }
    
    // Validate discount type
    $validTypes = ['percentage', 'fixed_amount'];
    if (isset($data['discount_type']) && !in_array($data['discount_type'], $validTypes)) {
        $errors[] = "Invalid discount type";
    }
    
    // Validate discount value
    if (isset($data['discount_value']) && (!is_numeric($data['discount_value']) || $data['discount_value'] <= 0)) {
        $errors[] = "Discount value must be a positive number";
    }
    
    // Validate percentage discount
    if (isset($data['discount_type']) && $data['discount_type'] === 'percentage' && 
        isset($data['discount_value']) && $data['discount_value'] > 100) {
        $errors[] = "Percentage discount cannot exceed 100%";
    }
    
    // Validate dates
    if (isset($data['valid_from']) && isset($data['valid_until'])) {
        $fromDate = strtotime($data['valid_from']);
        $untilDate = strtotime($data['valid_until']);
        
        if ($fromDate === false || $untilDate === false) {
            $errors[] = "Invalid date format";
        } elseif ($fromDate >= $untilDate) {
            $errors[] = "Valid from date must be before valid until date";
        }
    }
    
    return $errors;
}

/**
 * Validate file upload
 */
function validateFileUpload($file, $allowedTypes = null, $maxSize = null) {
    $errors = [];
    
    if (!isset($file['tmp_name']) || !is_uploaded_file($file['tmp_name'])) {
        $errors[] = "No file uploaded";
        return $errors;
    }
    
    // Check file size
    $maxSize = $maxSize ?: MAX_FILE_SIZE;
    if ($file['size'] > $maxSize) {
        $errors[] = "File size exceeds maximum allowed size";
    }
    
    // Check file type
    $allowedTypes = $allowedTypes ?: ALLOWED_EXTENSIONS;
    $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    
    if (!in_array($fileExtension, $allowedTypes)) {
        $errors[] = "File type not allowed. Allowed types: " . implode(', ', $allowedTypes);
    }
    
    return $errors;
}

/**
 * Sanitize and validate input data
 */
function sanitizeAndValidate($data, $rules = []) {
    $sanitized = [];
    $errors = [];
    
    foreach ($data as $key => $value) {
        // Sanitize the value
        $sanitized[$key] = sanitizeData($value);
        
        // Apply validation rules if provided
        if (isset($rules[$key])) {
            $rule = $rules[$key];
            
            // Required validation
            if (isset($rule['required']) && $rule['required'] && empty($sanitized[$key])) {
                $errors[] = "Field '{$key}' is required";
            }
            
            // Type validation
            if (isset($rule['type']) && !empty($sanitized[$key])) {
                switch ($rule['type']) {
                    case 'email':
                        if (!isValidEmail($sanitized[$key])) {
                            $errors[] = "Field '{$key}' must be a valid email";
                        }
                        break;
                    case 'phone':
                        if (!isValidKenyanPhone($sanitized[$key])) {
                            $errors[] = "Field '{$key}' must be a valid phone number";
                        }
                        break;
                    case 'numeric':
                        if (!is_numeric($sanitized[$key])) {
                            $errors[] = "Field '{$key}' must be numeric";
                        }
                        break;
                    case 'integer':
                        if (!is_int($sanitized[$key]) && !ctype_digit($sanitized[$key])) {
                            $errors[] = "Field '{$key}' must be an integer";
                        }
                        break;
                }
            }
            
            // Length validation
            if (isset($rule['min_length']) && strlen($sanitized[$key]) < $rule['min_length']) {
                $errors[] = "Field '{$key}' must be at least {$rule['min_length']} characters long";
            }
            
            if (isset($rule['max_length']) && strlen($sanitized[$key]) > $rule['max_length']) {
                $errors[] = "Field '{$key}' must not exceed {$rule['max_length']} characters";
            }
            
            // Range validation for numeric values
            if (isset($rule['min']) && is_numeric($sanitized[$key]) && $sanitized[$key] < $rule['min']) {
                $errors[] = "Field '{$key}' must be at least {$rule['min']}";
            }
            
            if (isset($rule['max']) && is_numeric($sanitized[$key]) && $sanitized[$key] > $rule['max']) {
                $errors[] = "Field '{$key}' must not exceed {$rule['max']}";
            }
        }
    }
    
    return ['data' => $sanitized, 'errors' => $errors];
}

/**
 * Validate coordinates
 */
function validateCoordinates($latitude, $longitude) {
    $errors = [];
    
    if (!is_numeric($latitude) || $latitude < -90 || $latitude > 90) {
        $errors[] = "Invalid latitude. Must be between -90 and 90";
    }
    
    if (!is_numeric($longitude) || $longitude < -180 || $longitude > 180) {
        $errors[] = "Invalid longitude. Must be between -180 and 180";
    }
    
    return $errors;
}

/**
 * Validate business hours
 */
function validateBusinessHours($startTime, $endTime) {
    $errors = [];
    
    $start = strtotime($startTime);
    $end = strtotime($endTime);
    
    if ($start === false) {
        $errors[] = "Invalid start time format";
    }
    
    if ($end === false) {
        $errors[] = "Invalid end time format";
    }
    
    if ($start !== false && $end !== false && $start >= $end) {
        $errors[] = "Start time must be before end time";
    }
    
    return $errors;
}

/**
 * Validate date range
 */
function validateDateRange($startDate, $endDate) {
    $errors = [];
    
    $start = strtotime($startDate);
    $end = strtotime($endDate);
    
    if ($start === false) {
        $errors[] = "Invalid start date format";
    }
    
    if ($end === false) {
        $errors[] = "Invalid end date format";
    }
    
    if ($start !== false && $end !== false && $start > $end) {
        $errors[] = "Start date must be before or equal to end date";
    }
    
    return $errors;
}

