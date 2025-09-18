/**
 * Services Page Controller
 * Handles service filtering and interactions (cart functionality removed)
 */

class ServicesPage {
    constructor() {
        this.currentCategory = 'all';
        this.services = [];
        
        this.init();
        this.bindEvents();
        this.loadServices();
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.servicesPage = new ServicesPage();
});
