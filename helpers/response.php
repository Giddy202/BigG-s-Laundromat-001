<?php
/**
 * Response Helper Functions for BigG's Laundromat API
 */

/**
 * Send success response
 */
function sendSuccess($data = null, $message = 'Success', $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    
    $response = [
        'success' => true,
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
function sendError($message = 'Error', $statusCode = 400, $errors = null) {
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
 * Send validation error response
 */
function sendValidationError($errors, $message = 'Validation failed') {
    sendError($message, 422, $errors);
}

/**
 * Send not found response
 */
function sendNotFound($message = 'Resource not found') {
    sendError($message, 404);
}

/**
 * Send unauthorized response
 */
function sendUnauthorized($message = 'Unauthorized access') {
    sendError($message, 401);
}

/**
 * Send forbidden response
 */
function sendForbidden($message = 'Access forbidden') {
    sendError($message, 403);
}

/**
 * Send server error response
 */
function sendServerError($message = 'Internal server error') {
    sendError($message, 500);
}

/**
 * Send rate limit exceeded response
 */
function sendRateLimitExceeded($message = 'Rate limit exceeded') {
    sendError($message, 429);
}

/**
 * Send created response
 */
function sendCreated($data = null, $message = 'Resource created successfully') {
    sendSuccess($data, $message, 201);
}

/**
 * Send updated response
 */
function sendUpdated($data = null, $message = 'Resource updated successfully') {
    sendSuccess($data, $message, 200);
}

/**
 * Send deleted response
 */
function sendDeleted($message = 'Resource deleted successfully') {
    sendSuccess(null, $message, 200);
}

/**
 * Send paginated response
 */
function sendPaginated($data, $pagination, $message = 'Success') {
    $response = [
        'success' => true,
        'message' => $message,
        'data' => $data,
        'pagination' => $pagination,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    http_response_code(200);
    header('Content-Type: application/json');
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send file response
 */
function sendFile($filePath, $filename = null, $contentType = 'application/octet-stream') {
    if (!file_exists($filePath)) {
        sendNotFound('File not found');
    }
    
    $filename = $filename ?: basename($filePath);
    
    header('Content-Type: ' . $contentType);
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    
    readfile($filePath);
    exit;
}

/**
 * Send image response
 */
function sendImage($filePath, $contentType = 'image/jpeg') {
    if (!file_exists($filePath)) {
        sendNotFound('Image not found');
    }
    
    header('Content-Type: ' . $contentType);
    header('Content-Length: ' . filesize($filePath));
    header('Cache-Control: public, max-age=3600');
    
    readfile($filePath);
    exit;
}

/**
 * Send CSV response
 */
function sendCSV($data, $filename = 'export.csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: no-cache, must-revalidate');
    header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
    
    $output = fopen('php://output', 'w');
    
    if (!empty($data)) {
        // Write headers
        fputcsv($output, array_keys($data[0]));
        
        // Write data
        foreach ($data as $row) {
            fputcsv($output, $row);
        }
    }
    
    fclose($output);
    exit;
}

/**
 * Send HTML response
 */
function sendHTML($html, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: text/html; charset=UTF-8');
    echo $html;
    exit;
}

/**
 * Send redirect response
 */
function sendRedirect($url, $statusCode = 302) {
    http_response_code($statusCode);
    header('Location: ' . $url);
    exit;
}

/**
 * Send JSON response with custom headers
 */
function sendJSON($data, $statusCode = 200, $headers = []) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    
    foreach ($headers as $header => $value) {
        header($header . ': ' . $value);
    }
    
    echo json_encode($data, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send API response with CORS headers
 */
function sendAPIResponse($data, $statusCode = 200, $message = 'Success') {
    // CORS headers
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
    header('Access-Control-Max-Age: 86400');
    
    // Handle preflight requests
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    
    sendSuccess($data, $message, $statusCode);
}

/**
 * Send error with logging
 */
function sendErrorWithLog($message, $statusCode = 400, $errors = null, $logContext = []) {
    // Log the error
    logError($message, $logContext);
    
    // Send error response
    sendError($message, $statusCode, $errors);
}

/**
 * Send maintenance response
 */
function sendMaintenance($message = 'Service temporarily unavailable for maintenance') {
    http_response_code(503);
    header('Content-Type: application/json');
    header('Retry-After: 3600'); // Retry after 1 hour
    
    $response = [
        'success' => false,
        'message' => $message,
        'maintenance' => true,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send service unavailable response
 */
function sendServiceUnavailable($message = 'Service temporarily unavailable') {
    http_response_code(503);
    header('Content-Type: application/json');
    
    $response = [
        'success' => false,
        'message' => $message,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send too many requests response
 */
function sendTooManyRequests($message = 'Too many requests', $retryAfter = 3600) {
    http_response_code(429);
    header('Content-Type: application/json');
    header('Retry-After: ' . $retryAfter);
    
    $response = [
        'success' => false,
        'message' => $message,
        'retry_after' => $retryAfter,
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit;
}

/**
 * Send conflict response
 */
function sendConflict($message = 'Resource conflict') {
    sendError($message, 409);
}

/**
 * Send gone response
 */
function sendGone($message = 'Resource no longer available') {
    sendError($message, 410);
}

/**
 * Send length required response
 */
function sendLengthRequired($message = 'Content-Length header required') {
    sendError($message, 411);
}

/**
 * Send precondition failed response
 */
function sendPreconditionFailed($message = 'Precondition failed') {
    sendError($message, 412);
}

/**
 * Send payload too large response
 */
function sendPayloadTooLarge($message = 'Payload too large') {
    sendError($message, 413);
}

/**
 * Send unsupported media type response
 */
function sendUnsupportedMediaType($message = 'Unsupported media type') {
    sendError($message, 415);
}

/**
 * Send unprocessable entity response
 */
function sendUnprocessableEntity($message = 'Unprocessable entity', $errors = null) {
    sendError($message, 422, $errors);
}

/**
 * Send locked response
 */
function sendLocked($message = 'Resource is locked') {
    sendError($message, 423);
}

/**
 * Send failed dependency response
 */
function sendFailedDependency($message = 'Failed dependency') {
    sendError($message, 424);
}

/**
 * Send upgrade required response
 */
function sendUpgradeRequired($message = 'Upgrade required') {
    sendError($message, 426);
}

/**
 * Send precondition required response
 */
function sendPreconditionRequired($message = 'Precondition required') {
    sendError($message, 428);
}

/**
 * Send too many headers response
 */
function sendTooManyHeaders($message = 'Too many headers') {
    sendError($message, 431);
}

/**
 * Send unavailable for legal reasons response
 */
function sendUnavailableForLegalReasons($message = 'Unavailable for legal reasons') {
    sendError($message, 451);
}

/**
 * Send internal server error with details (development only)
 */
function sendInternalServerError($message = 'Internal server error', $details = null) {
    if (DEBUG_MODE && $details) {
        $message .= ': ' . $details;
    }
    
    sendError($message, 500);
}

/**
 * Send not implemented response
 */
function sendNotImplemented($message = 'Not implemented') {
    sendError($message, 501);
}

/**
 * Send bad gateway response
 */
function sendBadGateway($message = 'Bad gateway') {
    sendError($message, 502);
}

/**
 * Send gateway timeout response
 */
function sendGatewayTimeout($message = 'Gateway timeout') {
    sendError($message, 504);
}

/**
 * Send HTTP version not supported response
 */
function sendHTTPVersionNotSupported($message = 'HTTP version not supported') {
    sendError($message, 505);
}

/**
 * Send variant also negotiates response
 */
function sendVariantAlsoNegotiates($message = 'Variant also negotiates') {
    sendError($message, 506);
}

/**
 * Send insufficient storage response
 */
function sendInsufficientStorage($message = 'Insufficient storage') {
    sendError($message, 507);
}

/**
 * Send loop detected response
 */
function sendLoopDetected($message = 'Loop detected') {
    sendError($message, 508);
}

/**
 * Send not extended response
 */
function sendNotExtended($message = 'Not extended') {
    sendError($message, 510);
}

/**
 * Send network authentication required response
 */
function sendNetworkAuthenticationRequired($message = 'Network authentication required') {
    sendError($message, 511);
}

