/**
 * BigG's Laundromat - Main JavaScript
 * Handles all interactive functionality and API calls
 */

class BigGsLaundromat {
    constructor() {
        this.init();
        this.bindEvents();
        this.loadServices();
    }

    init() {
        // Initialize components
        this.navbar = document.getElementById('mainNav');
        this.contactForm = document.getElementById('contactForm');
        this.serviceCards = document.querySelectorAll('.service-card');
        this.floatingCards = document.querySelectorAll('.floating-card');
        
        // API Configuration
        this.apiBaseUrl = '/api';
        this.currentServices = [];
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Initialize animations
        this.initScrollAnimations();
        this.initNavbarScroll();
        
        console.log('BigG\'s Laundromat initialized successfully');
    }

    bindEvents() {
        // Contact form submission
        if (this.contactForm) {
            this.contactForm.addEventListener('submit', (e) => this.handleContactSubmit(e));
        }

        // Service card hover effects only (no click navigation)
        this.serviceCards.forEach(card => {
            card.addEventListener('mouseenter', (e) => this.handleServiceCardHover(e, true));
            card.addEventListener('mouseleave', (e) => this.handleServiceCardHover(e, false));
        });

        // Floating card interactions
        this.floatingCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleFloatingCardClick(e));
            card.addEventListener('mouseenter', (e) => this.handleFloatingCardHover(e, true));
            card.addEventListener('mouseleave', (e) => this.handleFloatingCardHover(e, false));
        });

        // Order buttons
        document.querySelectorAll('.order-now-btn, .order-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleOrderButtonClick(e));
        });

        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => this.handleSmoothScroll(e));
        });

        // Window events
        window.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('load', () => this.handlePageLoad());
    }

    async loadServices() {
        try {
            // For now, use static services data since API is not implemented
            this.currentServices = [
                {
                    id: 1,
                    name: "Laundry & Dry Cleaning",
                    description: "Professional laundry and dry cleaning services",
                    price: 500,
                    category: "laundry"
                },
                {
                    id: 2,
                    name: "Home & Upholstery Cleaning",
                    description: "Deep cleaning for your home and furniture",
                    price: 800,
                    category: "upholstery"
                },
                {
                    id: 3,
                    name: "Hotels & Office Cleaning",
                    description: "Commercial cleaning services for businesses",
                    price: 1200,
                    category: "hotels"
                },
                {
                    id: 4,
                    name: "Auto Detailing",
                    description: "Complete car cleaning and detailing",
                    price: 600,
                    category: "auto"
                }
            ];
            console.log('Services loaded:', this.currentServices);
        } catch (error) {
            console.error('Error loading services:', error);
        }
    }

    initScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fadeInUp');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.service-card, .feature-card, .flow-step').forEach(el => {
            observer.observe(el);
        });
    }

    initNavbarScroll() {
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100) {
                this.navbar.classList.add('scrolled');
            } else {
                this.navbar.classList.remove('scrolled');
            }

            // Keep navbar visible - no hiding on scroll
            this.navbar.style.transform = 'translateY(0)';
            
            lastScrollTop = scrollTop;
        });
    }

    handleContactSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name') || e.target.querySelector('input[placeholder*="Name"]').value,
            email: formData.get('email') || e.target.querySelector('input[placeholder*="Email"]').value,
            phone: formData.get('phone') || e.target.querySelector('input[placeholder*="Phone"]').value,
            subject: formData.get('subject') || e.target.querySelector('input[placeholder*="Subject"]').value,
            message: formData.get('message') || e.target.querySelector('textarea').value
        };

        this.submitContactForm(data);
    }

    async submitContactForm(data) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                this.showNotification('Thank you for your message! We will get back to you soon.', 'success');
                this.contactForm.reset();
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Failed to send message. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.showNotification('Failed to send message. Please try again.', 'error');
        }
    }

    // Service card click handler removed - only "View Details" buttons navigate

    handleServiceCardHover(e, isEntering) {
        const card = e.currentTarget;
        
        if (isEntering) {
            card.classList.add('hover-lift');
            card.querySelector('.service-icon').classList.add('animate-pulse');
        } else {
            card.classList.remove('hover-lift');
            card.querySelector('.service-icon').classList.remove('animate-pulse');
        }
    }

    handleFloatingCardClick(e) {
        const card = e.currentTarget;
        const serviceText = card.querySelector('span').textContent.toLowerCase();
        
        // Add click animation
        card.classList.add('animate-rubber');
        setTimeout(() => card.classList.remove('animate-rubber'), 1000);
        
        // Navigate to relevant service category
        let category = '';
        if (serviceText.includes('laundry')) category = 'laundry_dry_cleaning';
        else if (serviceText.includes('upholstery')) category = 'home_upholstery';
        else if (serviceText.includes('auto')) category = 'auto_detailing';
        else if (serviceText.includes('office')) category = 'hotels_office';
        
        if (category) {
            const servicePages = {
                'laundry_dry_cleaning': 'laundry.html',
                'home_upholstery': 'upholstery.html',
                'hotels_office': 'hotels.html',
                'auto_detailing': 'auto.html'
            };
            
            const targetPage = servicePages[category] || 'laundry.html';
            window.location.href = targetPage;
        }
    }

    handleFloatingCardHover(e, isEntering) {
        const card = e.currentTarget;
        
        if (isEntering) {
            card.classList.add('hover-scale');
            card.querySelector('i').classList.add('animate-heartBeat');
        } else {
            card.classList.remove('hover-scale');
            card.querySelector('i').classList.remove('animate-heartBeat');
        }
    }

    handleOrderButtonClick(e) {
        e.preventDefault();
        
        // Add click animation
        e.target.classList.add('animate-pulse');
        setTimeout(() => e.target.classList.remove('animate-pulse'), 1000);
        
        // Navigate to checkout
        window.location.href = 'checkout.html';
    }

    handleSmoothScroll(e) {
        e.preventDefault();
        
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            const offsetTop = targetElement.offsetTop - 80; // Account for fixed navbar
            
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    handleScroll() {
        // Parallax effect for background elements
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.bubble, .particle');
        
        parallaxElements.forEach((element, index) => {
            const speed = 0.5 + (index % 3) * 0.1;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    }

    handleResize() {
        // Handle responsive adjustments
        const isMobile = window.innerWidth < 768;
        
        // Adjust floating cards for mobile
        this.floatingCards.forEach(card => {
            if (isMobile) {
                card.style.transform = 'scale(0.8)';
            } else {
                card.style.transform = 'scale(1)';
            }
        });
    }

    handlePageLoad() {
        // Add page load animations
        document.body.classList.add('loaded');
        
        // Animate hero elements
        setTimeout(() => {
            const heroContent = document.querySelector('.hero-content');
            const heroVisual = document.querySelector('.hero-visual');
            
            if (heroContent) {
                heroContent.classList.add('animate-fadeInLeft');
            }
            if (heroVisual) {
                heroVisual.classList.add('animate-fadeInRight');
            }
        }, 300);
        
        // Start background animations
        this.startBackgroundAnimations();
    }

    startBackgroundAnimations() {
        // Add random delays to bubbles
        document.querySelectorAll('.bubble').forEach((bubble, index) => {
            bubble.style.animationDelay = `${index * 0.5}s`;
        });
        
        // Add random delays to particles
        document.querySelectorAll('.particle').forEach((particle, index) => {
            particle.style.animationDelay = `${index * 0.8}s`;
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
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
        
        // Add styles
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
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // Utility methods
    formatCurrency(amount, currency = 'KES') {
        return `${currency} ${parseFloat(amount).toLocaleString()}`;
    }

    formatPhoneNumber(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('254')) {
            return `+${cleaned}`;
        } else if (cleaned.startsWith('0')) {
            return `+254${cleaned.substring(1)}`;
        }
        return `+254${cleaned}`;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePhone(phone) {
        const re = /^(\+254|254|0)[17]\d{8}$/;
        return re.test(phone.replace(/\s/g, ''));
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // API helper methods
    async apiRequest(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`${this.apiBaseUrl}${endpoint}`, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Cart management
    addToCart(serviceId, quantity = 1) {
        const service = this.currentServices.find(s => s.id === serviceId);
        if (service) {
            const existingItem = this.cart.find(item => item.serviceId === serviceId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.cart.push({
                    serviceId,
                    quantity,
                    service: service
                });
            }
            
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartDisplay();
            this.updateCartBadge();
            this.updateCartDropdown();
            this.showNotification('Service added to cart!', 'success');
        }
    }

    removeFromCart(serviceId) {
        this.cart = this.cart.filter(item => item.serviceId !== serviceId);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartDisplay();
        this.updateCartBadge();
        this.updateCartDropdown();
    }

    updateCartDisplay() {
        const cartCount = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartElements = document.querySelectorAll('.cart-count');
        cartElements.forEach(el => {
            el.textContent = cartCount;
            el.style.display = cartCount > 0 ? 'block' : 'none';
        });
    }

    getCartTotal() {
        return this.cart.reduce((total, item) => {
            return total + (item.service.base_price * item.quantity);
        }, 0);
    }

    clearCart() {
        this.cart = [];
        localStorage.removeItem('cart');
        this.updateCartDisplay();
        this.updateCartBadge();
        this.updateCartDropdown();
    }

    updateCartBadge() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.getElementById('navCartBadge');
        const cartItemCount = document.getElementById('cartItemCount');
        
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            cartBadge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
        }
        
        if (cartItemCount) {
            cartItemCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
        }
    }

    updateCartDropdown() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartDropdownFooter = document.getElementById('cartDropdownFooter');
        const cartTotal = document.getElementById('cartTotal');
        
        if (!cartItems || !cartEmpty || !cartDropdownFooter || !cartTotal) return;
        
        if (this.cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartItems.innerHTML = '';
            cartDropdownFooter.style.display = 'none';
        } else {
            cartEmpty.style.display = 'none';
            cartDropdownFooter.style.display = 'block';
            
            cartItems.innerHTML = this.cart.map(item => `
                <div class="cart-item">
                    <div class="cart-item-image">
                        <i class="fas fa-tshirt"></i>
                    </div>
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.service.name}</div>
                        <div class="cart-item-price">$${item.service.base_price.toFixed(2)}</div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateCartQuantity('${item.serviceId}', ${item.quantity - 1})">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartQuantity('${item.serviceId}', ${item.quantity + 1})">+</button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            const total = this.cart.reduce((sum, item) => sum + (item.service.base_price * item.quantity), 0);
            cartTotal.textContent = `$${total.toFixed(2)}`;
        }
    }

    updateCartQuantity(serviceId, newQuantity) {
        if (newQuantity <= 0) {
            this.removeFromCart(serviceId);
        } else {
            const item = this.cart.find(item => item.serviceId === serviceId);
            if (item) {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
                this.updateCartBadge();
                this.updateCartDropdown();
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.bigGsLaundromat = new BigGsLaundromat();
    // Update cart badge and dropdown on page load
    if (window.bigGsLaundromat) {
        window.bigGsLaundromat.updateCartBadge();
        window.bigGsLaundromat.updateCartDropdown();
    }
});

// Global functions for cart dropdown
window.updateCartQuantity = function(serviceId, newQuantity) {
    if (window.bigGsLaundromat) {
        window.bigGsLaundromat.updateCartQuantity(serviceId, newQuantity);
    }
};

window.clearCart = function() {
    if (window.bigGsLaundromat) {
        window.bigGsLaundromat.clearCart();
    }
};

// Global utility functions
window.showLoading = function(element) {
    element.innerHTML = '<div class="spinner"></div>';
};

window.hideLoading = function(element, originalContent) {
    element.innerHTML = originalContent;
};

window.formatCurrency = function(amount, currency = 'KES') {
    return `${currency} ${parseFloat(amount).toLocaleString()}`;
};

window.validateForm = function(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
};

// Service Worker Registration (for PWA functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
