/**
 * BigG's Laundromat - Admin Dashboard JavaScript
 * Handles admin panel functionality, data management, and analytics
 */

class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.filters = {};
        this.charts = {};
        this.data = {
            orders: [],
            customers: [],
            services: [],
            staff: [],
            stats: {}
        };
        
        this.init();
        this.bindEvents();
        this.loadDashboardData();
    }

    init() {
        // Get DOM elements
        this.navLinks = document.querySelectorAll('.nav-link');
        this.sections = document.querySelectorAll('.admin-section');
        this.navbarToggle = document.getElementById('navbarToggle');
        this.navbarMenu = document.querySelector('.navbar-menu');
        
        // Initialize charts
        this.initializeCharts();
        
        console.log('Admin dashboard initialized');
    }

    bindEvents() {
        // Navigation
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Navbar toggle for mobile
        if (this.navbarToggle) {
            this.navbarToggle.addEventListener('click', () => this.toggleNavbar());
        }

        // Filter buttons
        const applyFilters = document.getElementById('applyFilters');
        if (applyFilters) {
            applyFilters.addEventListener('click', () => this.applyFilters());
        }

        const clearFilters = document.getElementById('clearFilters');
        if (clearFilters) {
            clearFilters.addEventListener('click', () => this.clearFilters());
        }

        // Customer filters
        const applyCustomerFilters = document.getElementById('applyCustomerFilters');
        if (applyCustomerFilters) {
            applyCustomerFilters.addEventListener('click', () => this.applyCustomerFilters());
        }

        const clearCustomerFilters = document.getElementById('clearCustomerFilters');
        if (clearCustomerFilters) {
            clearCustomerFilters.addEventListener('click', () => this.clearCustomerFilters());
        }

        // Pagination
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        if (prevPage) prevPage.addEventListener('click', () => this.previousPage());
        if (nextPage) nextPage.addEventListener('click', () => this.nextPage());

        // Export buttons
        const exportOrders = document.getElementById('exportOrders');
        const exportCustomers = document.getElementById('exportCustomers');
        if (exportOrders) exportOrders.addEventListener('click', () => this.exportOrders());
        if (exportCustomers) exportCustomers.addEventListener('click', () => this.exportCustomers());

        // Add buttons
        const addOrder = document.getElementById('addOrder');
        const addCustomer = document.getElementById('addCustomer');
        const addService = document.getElementById('addService');
        const addStaff = document.getElementById('addStaff');
        
        if (addOrder) addOrder.addEventListener('click', () => this.showAddOrderModal());
        if (addCustomer) addCustomer.addEventListener('click', () => this.showAddCustomerModal());
        if (addService) addService.addEventListener('click', () => this.showAddServiceModal());
        if (addStaff) addStaff.addEventListener('click', () => this.showAddStaffModal());

        // Service category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleServiceCategoryFilter(e));
        });

        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleSettingsTab(e));
        });

        // Report generation
        const generateReport = document.getElementById('generateReport');
        if (generateReport) {
            generateReport.addEventListener('click', () => this.generateReport());
        }

        const exportReport = document.getElementById('exportReport');
        if (exportReport) {
            exportReport.addEventListener('click', () => this.exportReport());
        }

        // Revenue period change
        const revenuePeriod = document.getElementById('revenuePeriod');
        if (revenuePeriod) {
            revenuePeriod.addEventListener('change', () => this.updateRevenueChart());
        }

        // Form submissions
        this.setupFormSubmissions();
    }

    handleNavigation(e) {
        e.preventDefault();
        
        const link = e.currentTarget;
        const section = link.dataset.section;
        
        // Update active nav link
        this.navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show section
        this.showSection(section);
        
        // Load section data
        this.loadSectionData(section);
    }

    showSection(sectionName) {
        // Hide all sections
        this.sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }
    }

    async loadSectionData(section) {
        switch (section) {
            case 'dashboard':
                await this.loadDashboardData();
                break;
            case 'orders':
                await this.loadOrdersData();
                break;
            case 'customers':
                await this.loadCustomersData();
                break;
            case 'services':
                await this.loadServicesData();
                break;
            case 'staff':
                await this.loadStaffData();
                break;
            case 'reports':
                await this.loadReportsData();
                break;
            case 'settings':
                await this.loadSettingsData();
                break;
        }
    }

    async loadDashboardData() {
        try {
            this.showLoading();
            
            // Load dashboard stats
            const statsResponse = await fetch('/api/admin/dashboard');
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                this.updateDashboardStats(stats);
            }
            
            // Load recent orders
            const ordersResponse = await fetch('/api/admin/orders?limit=5');
            if (ordersResponse.ok) {
                const orders = await ordersResponse.json();
                this.updateRecentOrders(orders);
            }
            
            // Load top services
            const servicesResponse = await fetch('/api/admin/services?limit=5');
            if (servicesResponse.ok) {
                const services = await servicesResponse.json();
                this.updateTopServices(services);
            }
            
            // Update charts
            this.updateCharts();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        } finally {
            this.hideLoading();
        }
    }

    updateDashboardStats(stats) {
        document.getElementById('totalOrders').textContent = stats.totalOrders || 0;
        document.getElementById('totalRevenue').textContent = this.formatCurrency(stats.totalRevenue || 0);
        document.getElementById('totalCustomers').textContent = stats.totalCustomers || 0;
        document.getElementById('pendingOrders').textContent = stats.pendingOrders || 0;
    }

    updateRecentOrders(orders) {
        const container = document.getElementById('recentOrders');
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3">No recent orders</div>';
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-shopping-cart"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">Order #${order.tracking_number}</div>
                    <div class="activity-description">${order.customer_name} - ${this.formatCurrency(order.total_amount)}</div>
                    <div class="activity-time">${this.formatDate(order.created_at)}</div>
                </div>
            </div>
        `).join('');
    }

    updateTopServices(services) {
        const container = document.getElementById('topServices');
        if (!container) return;
        
        if (services.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-3">No services available</div>';
            return;
        }
        
        container.innerHTML = services.map(service => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${service.name}</div>
                    <div class="activity-description">${this.formatCurrency(service.base_price)} - ${service.order_count || 0} orders</div>
                </div>
            </div>
        `).join('');
    }

    async loadOrdersData() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/orders');
            if (response.ok) {
                const data = await response.json();
                this.data.orders = data.orders || [];
                this.renderOrdersTable();
                this.updateOrdersPagination(data.pagination);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            this.showNotification('Error loading orders', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderOrdersTable() {
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;
        
        if (this.data.orders.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No orders found</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.data.orders.map(order => `
            <tr>
                <td>#${order.tracking_number}</td>
                <td>
                    <div>
                        <div class="fw-bold">${order.customer_name}</div>
                        <small class="text-muted">${order.customer_phone}</small>
                    </div>
                </td>
                <td>
                    <div class="service-list">
                        ${order.items ? order.items.map(item => `
                            <span class="service-item">${item.service_name} x${item.quantity}</span>
                        `).join('') : 'N/A'}
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${order.status}">${this.formatStatus(order.status)}</span>
                </td>
                <td>${this.formatCurrency(order.total_amount)}</td>
                <td>${this.formatDate(order.created_at)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="adminDashboard.viewOrder(${order.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="adminDashboard.editOrder(${order.id})" title="Edit Order">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="adminDashboard.deleteOrder(${order.id})" title="Delete Order">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async loadCustomersData() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/customers');
            if (response.ok) {
                const data = await response.json();
                this.data.customers = data.customers || [];
                this.renderCustomersTable();
                this.updateCustomerStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading customers:', error);
            this.showNotification('Error loading customers', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderCustomersTable() {
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;
        
        if (this.data.customers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-4">No customers found</td></tr>';
            return;
        }
        
        tbody.innerHTML = this.data.customers.map(customer => `
            <tr>
                <td>
                    <div>
                        <div class="fw-bold">${customer.name}</div>
                        <small class="text-muted">ID: ${customer.id}</small>
                    </div>
                </td>
                <td>
                    <div>
                        <div>${customer.phone}</div>
                        <small class="text-muted">${customer.email || 'No email'}</small>
                    </div>
                </td>
                <td>
                    <span class="status-badge status-${customer.loyalty_tier || 'bronze'}">${this.formatLoyaltyTier(customer.loyalty_tier || 'bronze')}</span>
                </td>
                <td>${customer.total_orders || 0}</td>
                <td>${this.formatCurrency(customer.total_spent || 0)}</td>
                <td>${customer.last_order ? this.formatDate(customer.last_order) : 'Never'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-action btn-view" onclick="adminDashboard.viewCustomer(${customer.id})" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action btn-edit" onclick="adminDashboard.editCustomer(${customer.id})" title="Edit Customer">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action btn-delete" onclick="adminDashboard.deleteCustomer(${customer.id})" title="Delete Customer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateCustomerStats(stats) {
        document.getElementById('totalCustomersCount').textContent = stats.totalCustomers || 0;
        document.getElementById('newCustomersCount').textContent = stats.newCustomers || 0;
        document.getElementById('loyaltyCustomersCount').textContent = stats.loyaltyMembers || 0;
        document.getElementById('avgOrderValue').textContent = this.formatCurrency(stats.avgOrderValue || 0);
    }

    async loadServicesData() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/services');
            if (response.ok) {
                const data = await response.json();
                this.data.services = data.services || [];
                this.renderServicesGrid();
            }
        } catch (error) {
            console.error('Error loading services:', error);
            this.showNotification('Error loading services', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderServicesGrid() {
        const container = document.getElementById('servicesGrid');
        if (!container) return;
        
        if (this.data.services.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-4 col-12">No services found</div>';
            return;
        }
        
        container.innerHTML = this.data.services.map(service => `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${service.name}</div>
                        <div class="service-category">${this.formatCategory(service.category)}</div>
                    </div>
                    <div class="service-price">${this.formatCurrency(service.base_price)}</div>
                </div>
                <div class="service-description">${service.description || 'No description available'}</div>
                <div class="service-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="adminDashboard.editService(${service.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminDashboard.deleteService(${service.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async loadStaffData() {
        try {
            this.showLoading();
            
            const response = await fetch('/api/admin/staff');
            if (response.ok) {
                const data = await response.json();
                this.data.staff = data.staff || [];
                this.renderStaffGrid();
            }
        } catch (error) {
            console.error('Error loading staff:', error);
            this.showNotification('Error loading staff', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderStaffGrid() {
        const container = document.getElementById('staffGrid');
        if (!container) return;
        
        if (this.data.staff.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-4 col-12">No staff members found</div>';
            return;
        }
        
        container.innerHTML = this.data.staff.map(staff => `
            <div class="staff-card">
                <img src="../assets/images/staff-${staff.id}.jpg" alt="${staff.name}" class="staff-avatar" onerror="this.src='../assets/images/default-avatar.jpg'">
                <div class="staff-name">${staff.name}</div>
                <div class="staff-role">${this.formatRole(staff.role)}</div>
                <div class="staff-status status-${staff.is_active ? 'active' : 'inactive'}">
                    ${staff.is_active ? 'Active' : 'Inactive'}
                </div>
                <div class="staff-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="adminDashboard.editStaff(${staff.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminDashboard.deleteStaff(${staff.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    initializeCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Revenue',
                        data: [],
                        borderColor: '#1E3A8A',
                        backgroundColor: 'rgba(30, 58, 138, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'KES ' + value.toLocaleString();
                                }
                            }
                        }
                    }
                }
            });
        }

        // Order Status Chart
        const statusCtx = document.getElementById('orderStatusChart');
        if (statusCtx) {
            this.charts.orderStatus = new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Pending', 'Confirmed', 'In Progress', 'Ready', 'Completed', 'Cancelled'],
                    datasets: [{
                        data: [0, 0, 0, 0, 0, 0],
                        backgroundColor: [
                            '#F59E0B',
                            '#3B82F6',
                            '#1E3A8A',
                            '#10B981',
                            '#16A34A',
                            '#DC2626'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    updateCharts() {
        // Update revenue chart with sample data
        if (this.charts.revenue) {
            const labels = [];
            const data = [];
            const today = new Date();
            
            for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
                data.push(Math.floor(Math.random() * 10000) + 5000);
            }
            
            this.charts.revenue.data.labels = labels;
            this.charts.revenue.data.datasets[0].data = data;
            this.charts.revenue.update();
        }

        // Update order status chart with sample data
        if (this.charts.orderStatus) {
            this.charts.orderStatus.data.datasets[0].data = [5, 12, 8, 3, 25, 2];
            this.charts.orderStatus.update();
        }
    }

    applyFilters() {
        const status = document.getElementById('orderStatusFilter').value;
        const dateFrom = document.getElementById('orderDateFrom').value;
        const dateTo = document.getElementById('orderDateTo').value;
        const search = document.getElementById('orderSearch').value;
        
        this.filters = { status, dateFrom, dateTo, search };
        this.loadOrdersData();
    }

    clearFilters() {
        document.getElementById('orderStatusFilter').value = '';
        document.getElementById('orderDateFrom').value = '';
        document.getElementById('orderDateTo').value = '';
        document.getElementById('orderSearch').value = '';
        
        this.filters = {};
        this.loadOrdersData();
    }

    applyCustomerFilters() {
        const tier = document.getElementById('loyaltyTierFilter').value;
        const search = document.getElementById('customerSearch').value;
        
        this.filters = { tier, search };
        this.loadCustomersData();
    }

    clearCustomerFilters() {
        document.getElementById('loyaltyTierFilter').value = '';
        document.getElementById('customerSearch').value = '';
        
        this.filters = {};
        this.loadCustomersData();
    }

    handleServiceCategoryFilter(e) {
        const tab = e.currentTarget;
        const category = tab.dataset.category;
        
        // Update active tab
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Filter services
        this.filterServicesByCategory(category);
    }

    filterServicesByCategory(category) {
        const services = this.data.services;
        let filteredServices = services;
        
        if (category !== 'all') {
            filteredServices = services.filter(service => service.category === category);
        }
        
        this.renderFilteredServices(filteredServices);
    }

    renderFilteredServices(services) {
        const container = document.getElementById('servicesGrid');
        if (!container) return;
        
        if (services.length === 0) {
            container.innerHTML = '<div class="text-center text-muted py-4 col-12">No services found in this category</div>';
            return;
        }
        
        container.innerHTML = services.map(service => `
            <div class="service-card">
                <div class="service-header">
                    <div>
                        <div class="service-title">${service.name}</div>
                        <div class="service-category">${this.formatCategory(service.category)}</div>
                    </div>
                    <div class="service-price">${this.formatCurrency(service.base_price)}</div>
                </div>
                <div class="service-description">${service.description || 'No description available'}</div>
                <div class="service-actions">
                    <button class="btn btn-outline-primary btn-sm" onclick="adminDashboard.editService(${service.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="adminDashboard.deleteService(${service.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    handleSettingsTab(e) {
        const tab = e.currentTarget;
        const tabName = tab.dataset.tab;
        
        // Update active tab
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding panel
        document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
        document.getElementById(tabName + 'Settings').classList.add('active');
    }

    setupFormSubmissions() {
        // General settings form
        const generalForm = document.getElementById('generalSettingsForm');
        if (generalForm) {
            generalForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e, 'general'));
        }

        // Notification settings form
        const notificationForm = document.getElementById('notificationSettingsForm');
        if (notificationForm) {
            notificationForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e, 'notifications'));
        }

        // Payment settings form
        const paymentForm = document.getElementById('paymentSettingsForm');
        if (paymentForm) {
            paymentForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e, 'payment'));
        }

        // WhatsApp settings form
        const whatsappForm = document.getElementById('whatsappSettingsForm');
        if (whatsappForm) {
            whatsappForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e, 'whatsapp'));
        }

        // Loyalty settings form
        const loyaltyForm = document.getElementById('loyaltySettingsForm');
        if (loyaltyForm) {
            loyaltyForm.addEventListener('submit', (e) => this.handleSettingsSubmit(e, 'loyalty'));
        }
    }

    async handleSettingsSubmit(e, type) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        try {
            this.showLoading();
            
            const response = await fetch(`/api/admin/settings/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                this.showNotification('Settings saved successfully', 'success');
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            this.showNotification('Error saving settings', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Modal functions
    viewOrder(orderId) {
        // Implementation for viewing order details
        console.log('View order:', orderId);
    }

    editOrder(orderId) {
        // Implementation for editing order
        console.log('Edit order:', orderId);
    }

    deleteOrder(orderId) {
        if (confirm('Are you sure you want to delete this order?')) {
            // Implementation for deleting order
            console.log('Delete order:', orderId);
        }
    }

    viewCustomer(customerId) {
        // Implementation for viewing customer details
        console.log('View customer:', customerId);
    }

    editCustomer(customerId) {
        // Implementation for editing customer
        console.log('Edit customer:', customerId);
    }

    deleteCustomer(customerId) {
        if (confirm('Are you sure you want to delete this customer?')) {
            // Implementation for deleting customer
            console.log('Delete customer:', customerId);
        }
    }

    editService(serviceId) {
        // Implementation for editing service
        console.log('Edit service:', serviceId);
    }

    deleteService(serviceId) {
        if (confirm('Are you sure you want to delete this service?')) {
            // Implementation for deleting service
            console.log('Delete service:', serviceId);
        }
    }

    editStaff(staffId) {
        // Implementation for editing staff
        console.log('Edit staff:', staffId);
    }

    deleteStaff(staffId) {
        if (confirm('Are you sure you want to delete this staff member?')) {
            // Implementation for deleting staff
            console.log('Delete staff:', staffId);
        }
    }

    showAddOrderModal() {
        // Implementation for adding new order
        console.log('Add new order');
    }

    showAddCustomerModal() {
        // Implementation for adding new customer
        console.log('Add new customer');
    }

    showAddServiceModal() {
        // Implementation for adding new service
        console.log('Add new service');
    }

    showAddStaffModal() {
        // Implementation for adding new staff
        console.log('Add new staff');
    }

    // Utility functions
    formatCurrency(amount) {
        return `KES ${parseFloat(amount).toLocaleString()}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatStatus(status) {
        const statusMap = {
            'pending': 'Pending',
            'confirmed': 'Confirmed',
            'in_progress': 'In Progress',
            'ready_for_delivery': 'Ready for Delivery',
            'completed': 'Completed',
            'cancelled': 'Cancelled'
        };
        return statusMap[status] || status;
    }

    formatLoyaltyTier(tier) {
        const tierMap = {
            'bronze': 'Bronze',
            'silver': 'Silver',
            'gold': 'Gold',
            'platinum': 'Platinum'
        };
        return tierMap[tier] || tier;
    }

    formatCategory(category) {
        const categoryMap = {
            'laundry_dry_cleaning': 'Laundry & Dry Cleaning',
            'home_upholstery': 'Home & Upholstery',
            'hotels_office': 'Hotels & Office',
            'auto_detailing': 'Auto Detailing'
        };
        return categoryMap[category] || category;
    }

    formatRole(role) {
        const roleMap = {
            'admin': 'Administrator',
            'manager': 'Manager',
            'staff': 'Staff Member',
            'driver': 'Driver'
        };
        return roleMap[role] || role;
    }

    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#16A34A' : type === 'error' ? '#DC2626' : '#1E3A8A'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    toggleNavbar() {
        this.navbarMenu.classList.toggle('active');
    }

    // Export functions
    exportOrders() {
        // Implementation for exporting orders
        console.log('Export orders');
    }

    exportCustomers() {
        // Implementation for exporting customers
        console.log('Export customers');
    }

    generateReport() {
        // Implementation for generating reports
        console.log('Generate report');
    }

    exportReport() {
        // Implementation for exporting reports
        console.log('Export report');
    }

    updateRevenueChart() {
        // Implementation for updating revenue chart
        console.log('Update revenue chart');
    }

    // Pagination functions
    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.loadSectionData(this.currentSection);
        }
    }

    nextPage() {
        this.currentPage++;
        this.loadSectionData(this.currentSection);
    }

    updateOrdersPagination(pagination) {
        // Implementation for updating orders pagination
        console.log('Update orders pagination:', pagination);
    }
}

// Initialize admin dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Make functions globally available
window.adminDashboard = null;


