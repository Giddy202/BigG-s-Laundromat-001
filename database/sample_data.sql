-- BigG's Laundromat Sample Data
-- This file contains sample data for testing and demonstration

USE biggs_laundromat;

-- Insert sample customers
INSERT INTO customers (name, email, phone, address, loyalty_points, total_orders, total_spent) VALUES
('John Mwangi', 'john.mwangi@email.com', '+254712345678', 'Kileleshwa, Nairobi', 250, 5, 2500.00),
('Sarah Wanjiku', 'sarah.wanjiku@email.com', '+254723456789', 'Karen, Nairobi', 180, 3, 1800.00),
('David Ochieng', 'david.ochieng@email.com', '+254734567890', 'Westlands, Nairobi', 320, 7, 3200.00),
('Grace Akinyi', 'grace.akinyi@email.com', '+254745678901', 'Runda, Nairobi', 95, 2, 950.00),
('Peter Kimani', 'peter.kimani@email.com', '+254756789012', 'Kilimani, Nairobi', 450, 8, 4500.00);

-- Insert sample staff members
INSERT INTO staff (name, email, phone, role, password_hash, is_active) VALUES
('Manager James', 'james@biggslaundromat.com', '+254700000001', 'manager', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('Driver Mike', 'mike@biggslaundromat.com', '+254700000002', 'driver', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE),
('Staff Lucy', 'lucy@biggslaundromat.com', '+254700000003', 'staff', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE);

-- Insert sample orders
INSERT INTO orders (tracking_number, customer_id, status, order_type, subtotal, total_amount, payment_status, payment_method, special_instructions) VALUES
('BG001', 1, 'completed', 'pickup_delivery', 320.00, 320.00, 'paid', 'mpesa', 'Please be careful with the silk items'),
('BG002', 2, 'in_progress', 'pickup_delivery', 450.00, 450.00, 'paid', 'cash', 'Urgent - needed by Friday'),
('BG003', 3, 'confirmed', 'pickup_delivery', 180.00, 180.00, 'pending', 'mpesa', 'Regular service'),
('BG004', 4, 'pending', 'drop_off', 95.00, 95.00, 'pending', 'cash', NULL),
('BG005', 5, 'ready_for_delivery', 'pickup_delivery', 650.00, 650.00, 'paid', 'mpesa', 'Bulk order for hotel');

-- Insert sample order items
INSERT INTO order_items (order_id, service_id, quantity, unit_price, total_price, special_instructions, status) VALUES
-- Order BG001
(1, 1, 4.0, 80.00, 320.00, 'Handle with care', 'completed'),
-- Order BG002
(2, 3, 1.0, 300.00, 300.00, 'Urgent processing', 'completed'),
(2, 4, 1.0, 500.00, 500.00, NULL, 'in_progress'),
-- Order BG003
(3, 1, 2.25, 80.00, 180.00, 'Regular wash', 'pending'),
-- Order BG004
(4, 6, 1.0, 100.00, 100.00, NULL, 'pending'),
-- Order BG005
(5, 1, 5.0, 80.00, 400.00, 'Bulk order', 'completed'),
(5, 15, 2.0, 80.00, 160.00, 'Hotel towels', 'completed'),
(5, 18, 1.0, 100.00, 100.00, 'Door mats', 'completed');

-- Insert sample order assignments
INSERT INTO order_assignments (order_id, staff_id, assignment_type, notes) VALUES
(1, 3, 'processing', 'Completed on time'),
(1, 2, 'delivery', 'Delivered successfully'),
(2, 3, 'processing', 'Working on duvet cleaning'),
(3, 3, 'processing', 'Waiting for pickup'),
(5, 3, 'processing', 'Bulk order completed'),
(5, 2, 'delivery', 'Scheduled for delivery');

-- Insert sample order status history
INSERT INTO order_status_history (order_id, old_status, new_status, changed_by, notes) VALUES
(1, 'pending', 'confirmed', 1, 'Order confirmed by admin'),
(1, 'confirmed', 'in_progress', 3, 'Processing started'),
(1, 'in_progress', 'ready_for_delivery', 3, 'Items ready for delivery'),
(1, 'ready_for_delivery', 'completed', 2, 'Delivered successfully'),
(2, 'pending', 'confirmed', 1, 'Urgent order confirmed'),
(2, 'confirmed', 'in_progress', 3, 'Processing started'),
(3, 'pending', 'confirmed', 1, 'Regular order confirmed'),
(5, 'pending', 'confirmed', 1, 'Bulk order confirmed'),
(5, 'confirmed', 'in_progress', 3, 'Bulk processing started'),
(5, 'in_progress', 'ready_for_delivery', 3, 'Bulk order ready');

-- Insert sample WhatsApp messages
INSERT INTO whatsapp_messages (order_id, customer_phone, message_type, message_content, status, sent_at) VALUES
(1, '+254712345678', 'order_confirmation', 'Hi John! Your order #BG001 has been confirmed. Estimated completion: 24 hours. Track: https://biggslaundromat.com/track/BG001', 'delivered', NOW() - INTERVAL 2 DAY),
(1, '+254712345678', 'completion_alert', 'Great news! Your order #BG001 is ready for delivery. Total: KES 320. Reply with your preferred delivery time.', 'delivered', NOW() - INTERVAL 1 DAY),
(2, '+254723456789', 'order_confirmation', 'Hi Sarah! Your urgent order #BG002 has been confirmed. Estimated completion: 12 hours. Track: https://biggslaundromat.com/track/BG002', 'delivered', NOW() - INTERVAL 1 DAY),
(3, '+254734567890', 'order_confirmation', 'Hi David! Your order #BG003 has been confirmed. Estimated completion: 24 hours. Track: https://biggslaundromat.com/track/BG003', 'sent', NOW() - INTERVAL 2 HOUR),
(5, '+254756789012', 'order_confirmation', 'Hi Peter! Your bulk order #BG005 has been confirmed. Estimated completion: 48 hours. Track: https://biggslaundromat.com/track/BG005', 'delivered', NOW() - INTERVAL 1 DAY);

-- Insert sample loyalty program data
INSERT INTO loyalty_program (customer_id, points_earned, points_redeemed, current_balance, tier) VALUES
(1, 320, 70, 250, 'silver'),
(2, 180, 0, 180, 'bronze'),
(3, 400, 80, 320, 'gold'),
(4, 95, 0, 95, 'bronze'),
(5, 600, 150, 450, 'platinum');

-- Insert sample discount codes
INSERT INTO discounts (code, name, description, discount_type, discount_value, min_order_amount, valid_from, valid_until, is_active) VALUES
('WELCOME20', 'Welcome Discount', '20% off for new customers', 'percentage', 20.00, 200.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE),
('BULK10', 'Bulk Order Discount', '10% off orders above KES 1000', 'percentage', 10.00, 1000.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE),
('LOYAL50', 'Loyalty Reward', 'KES 50 off for loyal customers', 'fixed_amount', 50.00, 300.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE),
('FIRST100', 'First Order', 'KES 100 off first order', 'fixed_amount', 100.00, 500.00, '2024-01-01 00:00:00', '2024-12-31 23:59:59', TRUE);

-- Insert additional system settings
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES
('delivery_fee', '100', 'Standard delivery fee in KES', 'pricing'),
('pickup_fee', '50', 'Standard pickup fee in KES', 'pricing'),
('express_service_fee', '200', 'Express service additional fee', 'pricing'),
('minimum_order_amount', '200', 'Minimum order amount in KES', 'pricing'),
('free_delivery_threshold', '1000', 'Free delivery for orders above this amount', 'pricing'),
('working_days', 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', 'Working days of the week', 'business'),
('holiday_dates', '2024-12-25,2024-12-26,2024-01-01', 'Holiday dates (comma separated)', 'business'),
('sms_notifications', 'true', 'Enable SMS notifications', 'notifications'),
('email_notifications', 'true', 'Enable email notifications', 'notifications'),
('whatsapp_notifications', 'true', 'Enable WhatsApp notifications', 'notifications'),
('order_auto_confirm', 'false', 'Automatically confirm orders', 'automation'),
('loyalty_auto_enroll', 'true', 'Automatically enroll customers in loyalty program', 'automation');

-- Update customer loyalty points based on their spending
UPDATE customers SET 
    loyalty_points = (
        SELECT current_balance 
        FROM loyalty_program 
        WHERE loyalty_program.customer_id = customers.id
    );

-- Create a view for order summary
CREATE VIEW order_summary AS
SELECT 
    o.id,
    o.tracking_number,
    c.name as customer_name,
    c.phone as customer_phone,
    o.status,
    o.order_type,
    o.total_amount,
    o.payment_status,
    o.created_at,
    COUNT(oi.id) as item_count,
    GROUP_CONCAT(s.name SEPARATOR ', ') as services
FROM orders o
JOIN customers c ON o.customer_id = c.id
LEFT JOIN order_items oi ON o.id = oi.order_id
LEFT JOIN services s ON oi.service_id = s.id
GROUP BY o.id;

-- Create a view for service popularity
CREATE VIEW service_popularity AS
SELECT 
    s.id,
    s.name,
    s.category,
    s.base_price,
    COUNT(oi.id) as order_count,
    SUM(oi.quantity) as total_quantity,
    SUM(oi.total_price) as total_revenue
FROM services s
LEFT JOIN order_items oi ON s.id = oi.service_id
GROUP BY s.id
ORDER BY order_count DESC;

-- Create a view for customer loyalty summary
CREATE VIEW customer_loyalty_summary AS
SELECT 
    c.id,
    c.name,
    c.phone,
    c.email,
    c.total_orders,
    c.total_spent,
    lp.current_balance as loyalty_points,
    lp.tier,
    CASE 
        WHEN lp.tier = 'platinum' THEN 'Platinum Member'
        WHEN lp.tier = 'gold' THEN 'Gold Member'
        WHEN lp.tier = 'silver' THEN 'Silver Member'
        ELSE 'Bronze Member'
    END as membership_level
FROM customers c
LEFT JOIN loyalty_program lp ON c.id = lp.customer_id
WHERE c.is_active = TRUE
ORDER BY lp.current_balance DESC;


