/**
 * Services Page Controller
 * Handles service filtering and interactions (cart functionality removed)
 */

class ServicesPage {
    constructor() {
        this.currentCategory = 'all';
        this.services = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        this.init();
        this.bindEvents();
        this.loadServices();
        this.initCart();
    }

    init() {
        // Get DOM elements
        this.categoryTabs = document.querySelectorAll('.category-tab');
        this.serviceCategories = document.querySelectorAll('.service-category');
        
        console.log('Services page initialized');
    }

    bindEvents() {
        // Category tab clicks
        this.categoryTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.handleCategoryChange(e));
        });

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());

        // URL hash change
        window.addEventListener('hashchange', () => this.handleHashChange());
        
        // Cart events
        this.bindCartEvents();
    }

    async loadServices() {
        try {
            // For now, use static services data since API is not implemented
            this.services = [
                {
                    id: 1,
                    name: "Laundry & Dry Cleaning",
                    description: "Professional laundry and dry cleaning services",
                    base_price: 500,
                    category: "laundry"
                },
                {
                    id: 2,
                    name: "Home & Upholstery Cleaning",
                    description: "Deep cleaning for your home and furniture",
                    base_price: 800,
                    category: "upholstery"
                },
                {
                    id: 3,
                    name: "Hotels & Office Cleaning",
                    description: "Commercial cleaning services for businesses",
                    base_price: 1200,
                    category: "hotels"
                },
                {
                    id: 4,
                    name: "Auto Detailing",
                    description: "Complete car cleaning and detailing",
                    base_price: 600,
                    category: "auto"
                }
            ];
            console.log('Services loaded:', this.services);
        } catch (error) {
            console.error('Error loading services:', error);
        }
    }

    handleCategoryChange(e) {
        e.preventDefault();
        const category = e.currentTarget.dataset.category;
        
        // Update active tab
        this.categoryTabs.forEach(tab => tab.classList.remove('active'));
        e.currentTarget.classList.add('active');
        
        // Update current category
        this.currentCategory = category;
        
        // Filter services
        this.filterServices(category);
        
        // Update URL
        window.history.pushState({}, '', `#${category}`);
    }

    filterServices(category) {
        this.serviceCategories.forEach(categoryElement => {
            if (category === 'all' || categoryElement.dataset.category === category) {
                categoryElement.style.display = 'block';
                categoryElement.classList.add('show');
            } else {
                categoryElement.style.display = 'none';
                categoryElement.classList.remove('show');
            }
        });
    }

    handleScroll() {
        // Add scroll-based animations or effects here
        const scrolled = window.pageYOffset;
        const parallax = document.querySelectorAll('.parallax');
        
        parallax.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }

    handleResize() {
        // Handle responsive adjustments
        this.adjustLayout();
    }

    handleHashChange() {
        const hash = window.location.hash.substring(1);
        if (hash && hash !== this.currentCategory) {
            const tab = document.querySelector(`[data-category="${hash}"]`);
            if (tab) {
                tab.click();
            }
        } else if (!hash) {
            // Default to 'all' if no hash
            const allTab = document.querySelector('[data-category="all"]');
            if (allTab) {
                allTab.click();
            }
        }
    }

    adjustLayout() {
        // Responsive layout adjustments
        const isMobile = window.innerWidth < 768;
        
        if (isMobile) {
            // Mobile-specific adjustments
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-plus"></i> Add Service';
        }
    }

    setButtonSuccess(button) {
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.classList.add('success');
    }

    setButtonError(button) {
        button.innerHTML = '<i class="fas fa-times"></i> Error';
        button.classList.add('error');
    }

    animateCard(card, type) {
        if (!card) return;
        
        card.classList.add(type);
        setTimeout(() => {
            card.classList.remove(type);
        }, 2000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 4px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Cart Functionality
    initCart() {
        this.createCartToggle();
        this.updateCartDisplay();
    }

    createCartToggle() {
        if (!document.querySelector('.modern-cart-toggle')) {
            const cartToggle = document.createElement('button');
            cartToggle.className = 'modern-cart-toggle';
            cartToggle.innerHTML = `
                <i class="fas fa-shopping-cart cart-icon"></i>
                <span class="cart-count">${this.getCartItemCount()}</span>
            `;
            
            if (this.cart.length === 0) {
                cartToggle.classList.add('empty');
            }
            
            this.makeDraggable(cartToggle);
            cartToggle.addEventListener('click', (e) => {
                if (!cartToggle.classList.contains('dragging')) {
                    this.toggleCartSummary();
                }
            });
            
            document.body.appendChild(cartToggle);
        }
    }

    makeDraggable(element) {
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        // Load saved position
        const savedPosition = localStorage.getItem('modernCartPosition');
        if (savedPosition) {
            const { left, top } = JSON.parse(savedPosition);
            element.style.left = left;
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            element.style.top = top;
        }

        // Mouse events
        element.addEventListener('mousedown', (e) => {
            if (e.target === element || e.target.tagName === 'I') {
                isDragging = true;
                element.classList.add('dragging');
                startX = e.clientX;
                startY = e.clientY;
                startLeft = parseInt(element.style.left) || parseInt(getComputedStyle(element).left) || 0;
                startTop = parseInt(element.style.top) || parseInt(getComputedStyle(element).top) || 0;
                e.preventDefault();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            const maxLeft = window.innerWidth - element.offsetWidth;
            const maxTop = window.innerHeight - element.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                element.classList.remove('dragging');
                const position = { left: element.style.left, top: element.style.top };
                localStorage.setItem('modernCartPosition', JSON.stringify(position));
            }
        });

        // Touch events
        element.addEventListener('touchstart', (e) => {
            if (e.target === element || e.target.tagName === 'I') {
                isDragging = true;
                element.classList.add('dragging');
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                startLeft = parseInt(element.style.left) || parseInt(getComputedStyle(element).left) || 0;
                startTop = parseInt(element.style.top) || parseInt(getComputedStyle(element).top) || 0;
                e.preventDefault();
            }
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const touch = e.touches[0];
            const deltaX = touch.clientX - startX;
            const deltaY = touch.clientY - startY;
            let newLeft = startLeft + deltaX;
            let newTop = startTop + deltaY;
            const maxLeft = window.innerWidth - element.offsetWidth;
            const maxTop = window.innerHeight - element.offsetHeight;
            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));
            element.style.left = newLeft + 'px';
            element.style.top = newTop + 'px';
            element.style.right = 'auto';
            element.style.bottom = 'auto';
            e.preventDefault();
        }, { passive: false });

        document.addEventListener('touchend', () => {
            if (isDragging) {
                isDragging = false;
                element.classList.remove('dragging');
                const position = { left: element.style.left, top: element.style.top };
                localStorage.setItem('modernCartPosition', JSON.stringify(position));
            }
        });
    }

    bindCartEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                this.handleAddToCart(e);
            }
        });

        // Close cart when clicking outside
        document.addEventListener('click', (e) => {
            const cartSummary = document.querySelector('.modern-cart-summary');
            const cartToggle = document.querySelector('.modern-cart-toggle');
            if (cartSummary && !cartSummary.contains(e.target) && !cartToggle.contains(e.target)) {
                this.hideCartSummary();
            }
        });
    }

    handleAddToCart(e) {
        const button = e.target.closest('.add-to-cart');
        if (!button) return;

        const serviceId = parseInt(button.dataset.service);
        const service = this.services.find(s => s.id === serviceId);

        console.log('Add to cart clicked:', {
            serviceId: serviceId,
            service: service,
            allServices: this.services
        });

        if (!service) {
            console.error('Service not found for ID:', serviceId);
            this.showNotification('Service not found', 'error');
            return;
        }

        this.addToCart(service);
        this.showNotification(`${service.name} added to cart!`, 'success');
        this.updateCartDisplay();
    }

    addToCart(service) {
        const existingItem = this.cart.find(item => item.serviceId === service.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                serviceId: service.id,
                service: service,
                quantity: 1
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    removeFromCart(serviceId) {
        this.cart = this.cart.filter(item => item.serviceId !== serviceId);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.renderCartItems(); // Re-render without closing
    }

    updateCartQuantity(serviceId, quantity) {
        const item = this.cart.find(item => item.serviceId === serviceId);
        if (item) {
            if (quantity <= 0) {
                this.removeFromCart(serviceId);
            } else {
                item.quantity = quantity;
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.updateCartDisplay();
                this.renderCartItems(); // Re-render without closing
            }
        }
    }

    getCartItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    updateCartDisplay() {
        const cartToggle = document.querySelector('.modern-cart-toggle');
        const cartCount = cartToggle?.querySelector('.cart-count');
        
        if (cartCount) {
            const totalItems = this.getCartItemCount();
            cartCount.textContent = totalItems;
            
            if (totalItems === 0) {
                cartToggle.classList.add('empty');
            } else {
                cartToggle.classList.remove('empty');
            }
        }
    }

    toggleCartSummary() {
        const cartSummary = document.querySelector('.modern-cart-summary');
        if (cartSummary) {
            if (cartSummary.classList.contains('show')) {
                this.hideCartSummary();
            } else {
                this.showCartSummary();
            }
        }
    }

    showCartSummary() {
        const cartSummary = document.querySelector('.modern-cart-summary');
        if (cartSummary) {
            this.renderCartItems();
            this.updateCartSummaryPosition();
            cartSummary.classList.add('show');
        }
    }

    hideCartSummary() {
        const cartSummary = document.querySelector('.modern-cart-summary');
        if (cartSummary) {
            cartSummary.classList.remove('show');
        }
    }

    updateCartSummaryPosition() {
        const cartSummary = document.querySelector('.modern-cart-summary');
        const cartToggle = document.querySelector('.modern-cart-toggle');
        
        if (!cartSummary || !cartToggle) return;
        
        const toggleRect = cartToggle.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const cartWidth = 380;
        const cartHeight = 400;
        const margin = 20;
        
        // Calculate best position
        const spaceBottom = viewportHeight - toggleRect.bottom - margin;
        const spaceTop = toggleRect.top - margin;
        const spaceRight = viewportWidth - toggleRect.right - margin;
        const spaceLeft = toggleRect.left - margin;
        
        if (spaceBottom >= cartHeight) {
            // Position below
            cartSummary.style.top = (toggleRect.bottom + margin) + 'px';
            cartSummary.style.left = (toggleRect.left + (toggleRect.width / 2)) + 'px';
            cartSummary.style.transform = 'translateX(-50%)';
        } else if (spaceTop >= cartHeight) {
            // Position above
            cartSummary.style.top = (toggleRect.top - cartHeight - margin) + 'px';
            cartSummary.style.left = (toggleRect.left + (toggleRect.width / 2)) + 'px';
            cartSummary.style.transform = 'translateX(-50%)';
        } else if (spaceRight >= cartWidth) {
            // Position right
            cartSummary.style.top = (toggleRect.top + (toggleRect.height / 2)) + 'px';
            cartSummary.style.left = (toggleRect.right + margin) + 'px';
            cartSummary.style.transform = 'translateY(-50%)';
        } else {
            // Position left
            cartSummary.style.top = (toggleRect.top + (toggleRect.height / 2)) + 'px';
            cartSummary.style.left = (toggleRect.left - cartWidth - margin) + 'px';
            cartSummary.style.transform = 'translateY(-50%)';
        }
    }

    renderCartItems() {
        const cartItems = document.querySelector('#cartItems');
        const cartTotal = document.querySelector('#cartTotal');
        
        if (!cartItems || !cartTotal) return;
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Your cart is empty</p>
                    <span>Add some services to get started</span>
                </div>
            `;
            cartTotal.textContent = 'KES 0';
            return;
        }
        
        const itemsHTML = this.cart.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h6>${item.service.name}</h6>
                    <div class="price">KES ${item.service.price}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="window.servicesPage.updateCartQuantity(${item.serviceId}, ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="window.servicesPage.updateCartQuantity(${item.serviceId}, ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-btn" onclick="window.servicesPage.removeFromCart(${item.serviceId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        cartItems.innerHTML = itemsHTML;
        
        const total = this.cart.reduce((sum, item) => sum + (item.service.price * item.quantity), 0);
        cartTotal.textContent = `KES ${total}`;
    }

    bindCartEvents() {
        // Add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart')) {
                this.handleAddToCart(e);
            }
        });

        // Close cart when clicking outside or close button
        document.addEventListener('click', (e) => {
            const cartSummary = document.querySelector('.modern-cart-summary');
            const cartToggle = document.querySelector('.modern-cart-toggle');
            
            // Close if clicking close button
            if (e.target.closest('#closeCartSummary')) {
                this.hideCartSummary();
                return;
            }
            
            // Close if clicking outside cart summary and cart toggle
            if (cartSummary && cartSummary.classList.contains('show') && 
                !cartSummary.contains(e.target) && 
                !cartToggle.contains(e.target)) {
                this.hideCartSummary();
            }
        });
    }

    showCartSummary() {
        const cartSummary = document.querySelector('.modern-cart-summary');
        if (cartSummary) {
            this.renderCartItems();
            this.updateCartSummaryPosition();
            cartSummary.classList.add('show');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.servicesPage = new ServicesPage();
});

