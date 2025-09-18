-- BigG's Laundromat Database Schema
-- Created for comprehensive laundry management system

CREATE DATABASE IF NOT EXISTS biggs_laundromat;
USE biggs_laundromat;

-- Services table - stores all available services
CREATE TABLE services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('laundry_dry_cleaning', 'home_upholstery', 'hotels_office', 'auto_detailing') NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    price_unit VARCHAR(50) NOT NULL, -- 'per_kg', 'per_item', 'per_bed', 'per_seat', etc.
    min_price DECIMAL(10,2) DEFAULT 0,
    max_price DECIMAL(10,2) DEFAULT NULL,
    estimated_time INT DEFAULT 24, -- hours
    is_active BOOLEAN DEFAULT TRUE,
    icon VARCHAR(100), -- Font Awesome icon class
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table - stores customer information
CREATE TABLE customers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    loyalty_points INT DEFAULT 0,
    total_orders INT DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    preferred_pickup_time TIME,
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Orders table - stores main order information
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tracking_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'in_progress', 'ready_for_delivery', 'completed', 'cancelled') DEFAULT 'pending',
    order_type ENUM('pickup_delivery', 'drop_off', 'bulk') DEFAULT 'pickup_delivery',
    pickup_address TEXT,
    delivery_address TEXT,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    delivery_latitude DECIMAL(10, 8),
    delivery_longitude DECIMAL(11, 8),
    scheduled_pickup DATETIME,
    scheduled_delivery DATETIME,
    actual_pickup DATETIME,
    actual_delivery DATETIME,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    loyalty_discount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    payment_method ENUM('cash', 'mpesa', 'card', 'bank_transfer') DEFAULT 'cash',
    special_instructions TEXT,
    admin_notes TEXT,
    staff_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
);

-- Order items table - stores individual services within orders
CREATE TABLE order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity DECIMAL(8,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    special_instructions TEXT,
    status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT
);

-- Staff table - stores staff member information
CREATE TABLE staff (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    role ENUM('admin', 'manager', 'staff', 'driver') NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Order assignments table - tracks which staff member is handling which order
CREATE TABLE order_assignments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    staff_id INT NOT NULL,
    assignment_type ENUM('pickup', 'processing', 'delivery') NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE RESTRICT
);

-- Order status history table - tracks order status changes
CREATE TABLE order_status_history (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INT, -- staff_id
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES staff(id) ON DELETE SET NULL
);

-- WhatsApp messages table - stores sent WhatsApp messages
CREATE TABLE whatsapp_messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    message_type ENUM('order_confirmation', 'pickup_notification', 'completion_alert', 'loyalty_offer', 'custom') NOT NULL,
    message_content TEXT NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed') DEFAULT 'pending',
    whatsapp_message_id VARCHAR(255),
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Loyalty program table - stores loyalty rewards and offers
CREATE TABLE loyalty_program (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    points_earned INT NOT NULL DEFAULT 0,
    points_redeemed INT NOT NULL DEFAULT 0,
    current_balance INT NOT NULL DEFAULT 0,
    tier ENUM('bronze', 'silver', 'gold', 'platinum') DEFAULT 'bronze',
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Discounts table - stores discount codes and promotions
CREATE TABLE discounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    discount_type ENUM('percentage', 'fixed_amount') NOT NULL,
    discount_value DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT 0,
    max_discount_amount DECIMAL(10,2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_until DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- System settings table - stores application configuration
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    category VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default services
INSERT INTO services (name, description, category, base_price, price_unit, icon) VALUES
-- Laundry & Dry Cleaning Services
('Wash, Iron & Fold', 'Professional washing, ironing and folding service', 'laundry_dry_cleaning', 80.00, 'per_kg', 'fas fa-tshirt'),
('Curtain Cleaning', 'Deep cleaning for curtains and drapes', 'laundry_dry_cleaning', 200.00, 'per_kg', 'fas fa-window-maximize'),
('Suits Wash & Dry Cleaning', 'Professional dry cleaning for suits and formal wear', 'laundry_dry_cleaning', 300.00, 'per_item', 'fas fa-user-tie'),
('Duvet Wash & Dry Cleaning', 'Large item cleaning for duvets and comforters', 'laundry_dry_cleaning', 500.00, 'per_item', 'fas fa-bed'),
('Gowns Wash & Dry Cleaning', 'Specialized cleaning for gowns and dresses', 'laundry_dry_cleaning', 300.00, 'per_item', 'fas fa-female'),
('Sneakers & Shoes', 'Professional shoe cleaning and restoration', 'laundry_dry_cleaning', 100.00, 'per_shoe', 'fas fa-shoe-prints'),
('Teddy Bear Cleaning', 'Gentle cleaning for stuffed animals and toys', 'laundry_dry_cleaning', 150.00, 'per_item', 'fas fa-heart'),

-- Home & Upholstery Services
('Carpet Cleaning', 'Deep carpet cleaning and stain removal', 'home_upholstery', 800.00, 'per_room', 'fas fa-couch'),
('Sofa Deep Cleaning', 'Comprehensive sofa and upholstery cleaning', 'home_upholstery', 500.00, 'per_item', 'fas fa-chair'),
('Chester Beds Cleaning', 'Specialized cleaning for Chester beds', 'home_upholstery', 500.00, 'per_item', 'fas fa-bed'),
('Deep House Cleaning', 'Complete house deep cleaning service', 'home_upholstery', 2500.00, 'per_house', 'fas fa-home'),

-- Hotels & Office Upholstery Services
('Mattress Cleaning (Bulk)', 'Bulk mattress cleaning for hotels', 'hotels_office', 800.00, 'per_mattress', 'fas fa-bed'),
('Bed Cleaning (Bulk)', 'Bulk bed cleaning for hotels', 'hotels_office', 400.00, 'per_bed', 'fas fa-bed'),
('Sofa & Seats Cleaning (Bulk)', 'Bulk upholstery cleaning for offices', 'hotels_office', 300.00, 'per_seat', 'fas fa-chair'),
('Towels (Bulk)', 'Bulk towel laundry service', 'hotels_office', 80.00, 'per_kg', 'fas fa-hand-paper'),
('Blankets/Duvets (Bulk)', 'Bulk blanket and duvet cleaning', 'hotels_office', 500.00, 'per_item', 'fas fa-blanket'),
('Door Mats (Bulk)', 'Bulk door mat cleaning service', 'hotels_office', 100.00, 'per_kg', 'fas fa-door-open'),
('Bedding Sheets (Bulk)', 'Bulk bedding sheet laundry', 'hotels_office', 80.00, 'per_kg', 'fas fa-bed'),
('Office Cleaning', 'Complete office cleaning service', 'hotels_office', 2000.00, 'per_office', 'fas fa-building'),

-- Auto Detailing Services
('Interior Detailing', 'Complete car interior cleaning and detailing', 'auto_detailing', 1500.00, 'per_car', 'fas fa-car'),
('Exterior Detailing', 'Professional car exterior cleaning and polishing', 'auto_detailing', 1000.00, 'per_car', 'fas fa-car'),
('Full Detailing Package', 'Complete interior and exterior car detailing', 'auto_detailing', 2000.00, 'per_car', 'fas fa-car');

-- Insert default admin user
INSERT INTO staff (name, email, phone, role, password_hash) VALUES
('Admin User', 'admin@biggslaundromat.com', '+254700000000', 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- password: password

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, description, category) VALUES
('company_name', 'BigG\'s Laundromat', 'Company name for branding', 'general'),
('company_phone', '+254700000000', 'Main company phone number', 'contact'),
('company_email', 'info@biggslaundromat.com', 'Main company email', 'contact'),
('whatsapp_business_number', '+254700000000', 'WhatsApp Business API number', 'whatsapp'),
('whatsapp_api_token', '', 'WhatsApp Business API token', 'whatsapp'),
('loyalty_points_per_shilling', '1', 'Loyalty points earned per KES spent', 'loyalty'),
('loyalty_points_redemption_rate', '100', 'Points required for KES 1 discount', 'loyalty'),
('default_currency', 'KES', 'Default currency for pricing', 'general'),
('order_tracking_base_url', 'https://biggslaundromat.com/track/', 'Base URL for order tracking', 'general'),
('max_delivery_radius_km', '50', 'Maximum delivery radius in kilometers', 'delivery'),
('business_hours_start', '08:00', 'Business opening time', 'business'),
('business_hours_end', '18:00', 'Business closing time', 'business');

-- Create indexes for better performance
CREATE INDEX idx_orders_tracking_number ON orders(tracking_number);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_service_id ON order_items(service_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_whatsapp_messages_order_id ON whatsapp_messages(order_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_loyalty_program_customer_id ON loyalty_program(customer_id);
CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_is_active ON services(is_active);


