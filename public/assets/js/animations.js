/**
 * BigG's Laundromat - Animation Controller
 * Handles advanced animations and visual effects
 */

class AnimationController {
    constructor() {
        this.init();
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.createParticleSystem();
    }

    init() {
        this.animationQueue = [];
        this.isAnimating = false;
        this.scrollPosition = 0;
        this.mousePosition = { x: 0, y: 0 };
        
        // Performance settings
        this.useHardwareAcceleration = true;
        this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        if (this.reduceMotion) {
            document.body.classList.add('reduce-motion');
        }
        
        console.log('Animation Controller initialized');
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: [0, 0.1, 0.5, 1],
            rootMargin: '0px 0px -50px 0px'
        };

        this.intersectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.handleIntersection(entry);
            });
        }, observerOptions);

        // Observe elements that should animate on scroll
        this.observeElements();
    }

    observeElements() {
        const elementsToObserve = [
            '.service-card',
            '.feature-card',
            '.flow-step',
            '.hero-content',
            '.hero-visual',
            '.section-title',
            '.section-subtitle',
            '.contact-item',
            '.floating-card'
        ];

        elementsToObserve.forEach(selector => {
            document.querySelectorAll(selector).forEach(element => {
                this.intersectionObserver.observe(element);
            });
        });
    }

    handleIntersection(entry) {
        const element = entry.target;
        const intersectionRatio = entry.intersectionRatio;
        
        if (intersectionRatio > 0.1 && !element.classList.contains('animated')) {
            this.animateElement(element, intersectionRatio);
            element.classList.add('animated');
        }
    }

    animateElement(element, ratio) {
        if (this.reduceMotion) return;
        
        const animationType = this.getElementAnimationType(element);
        const delay = this.getElementDelay(element);
        
        setTimeout(() => {
            element.classList.add(`animate-${animationType}`);
            
            // Add stagger effect for multiple elements
            if (element.parentElement.children.length > 1) {
                const siblings = Array.from(element.parentElement.children);
                const index = siblings.indexOf(element);
                element.style.animationDelay = `${index * 0.1}s`;
            }
        }, delay);
    }

    getElementAnimationType(element) {
        // Determine animation type based on element class or position
        if (element.classList.contains('service-card')) return 'fadeInUp';
        if (element.classList.contains('feature-card')) return 'fadeInUp';
        if (element.classList.contains('flow-step')) return 'zoomIn';
        if (element.classList.contains('hero-content')) return 'fadeInLeft';
        if (element.classList.contains('hero-visual')) return 'fadeInRight';
        if (element.classList.contains('section-title')) return 'fadeInDown';
        if (element.classList.contains('contact-item')) return 'slideInLeft';
        if (element.classList.contains('floating-card')) return 'flipInY';
        
        return 'fadeInUp';
    }

    getElementDelay(element) {
        // Add random delay for more natural animation
        return Math.random() * 200;
    }

    setupScrollAnimations() {
        let ticking = false;
        
        const updateScrollAnimations = () => {
            this.scrollPosition = window.pageYOffset;
            this.updateParallaxElements();
            this.updateScrollProgress();
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        });
    }

    updateParallaxElements() {
        const parallaxElements = document.querySelectorAll('[data-parallax]');
        
        parallaxElements.forEach(element => {
            const speed = parseFloat(element.dataset.parallax) || 0.5;
            const yPos = -(this.scrollPosition * speed);
            element.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }

    updateScrollProgress() {
        const scrollProgress = this.scrollPosition / (document.body.scrollHeight - window.innerHeight);
        const progressBar = document.querySelector('.scroll-progress');
        
        if (progressBar) {
            progressBar.style.width = `${scrollProgress * 100}%`;
        }
    }

    setupHoverEffects() {
        // Enhanced hover effects for interactive elements
        document.querySelectorAll('.service-card, .feature-card, .floating-card').forEach(element => {
            this.addHoverEffects(element);
        });
    }

    addHoverEffects(element) {
        element.addEventListener('mouseenter', (e) => {
            this.handleMouseEnter(e.target);
        });
        
        element.addEventListener('mouseleave', (e) => {
            this.handleMouseLeave(e.target);
        });
        
        element.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
    }

    handleMouseEnter(element) {
        if (this.reduceMotion) return;
        
        element.classList.add('hover-lift');
        
        // Add ripple effect
        this.createRippleEffect(element);
        
        // Animate child elements
        const icon = element.querySelector('.service-icon, .feature-icon');
        if (icon) {
            icon.classList.add('animate-pulse');
        }
    }

    handleMouseLeave(element) {
        element.classList.remove('hover-lift');
        
        const icon = element.querySelector('.service-icon, .feature-icon');
        if (icon) {
            icon.classList.remove('animate-pulse');
        }
    }

    handleMouseMove(e) {
        if (this.reduceMotion) return;
        
        this.mousePosition.x = e.clientX;
        this.mousePosition.y = e.clientY;
        
        // Update cursor position for custom cursor effects
        this.updateCustomCursor();
    }

    createRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(30, 58, 138, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            pointer-events: none;
        `;
        
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (this.mousePosition.x - rect.left - size / 2) + 'px';
        ripple.style.top = (this.mousePosition.y - rect.top - size / 2) + 'px';
        
        element.style.position = 'relative';
        element.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    }

    updateCustomCursor() {
        const cursor = document.querySelector('.custom-cursor');
        if (cursor) {
            cursor.style.left = this.mousePosition.x + 'px';
            cursor.style.top = this.mousePosition.y + 'px';
        }
    }

    createParticleSystem() {
        if (this.reduceMotion) return;
        
        this.particleContainer = document.createElement('div');
        this.particleContainer.className = 'particle-system';
        this.particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: -1;
        `;
        
        document.body.appendChild(this.particleContainer);
        
        this.createParticles();
        this.animateParticles();
    }

    createParticles() {
        const particleCount = 20;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'dynamic-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(30, 58, 138, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 5}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            
            this.particleContainer.appendChild(particle);
        }
    }

    animateParticles() {
        const particles = this.particleContainer.querySelectorAll('.dynamic-particle');
        
        particles.forEach(particle => {
            const speed = Math.random() * 2 + 1;
            const direction = Math.random() * 360;
            
            setInterval(() => {
                const currentLeft = parseFloat(particle.style.left);
                const currentTop = parseFloat(particle.style.top);
                
                const newLeft = currentLeft + Math.cos(direction * Math.PI / 180) * speed;
                const newTop = currentTop + Math.sin(direction * Math.PI / 180) * speed;
                
                particle.style.left = (newLeft % 100) + '%';
                particle.style.top = (newTop % 100) + '%';
            }, 50);
        });
    }

    // Advanced animation methods
    animateSequence(elements, animations, delays = []) {
        elements.forEach((element, index) => {
            const delay = delays[index] || index * 100;
            
            setTimeout(() => {
                element.classList.add(`animate-${animations[index] || 'fadeInUp'}`);
            }, delay);
        });
    }

    createLoadingAnimation(element) {
        const loadingHTML = `
            <div class="loading-animation">
                <div class="loading-spinner"></div>
                <div class="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        element.innerHTML = loadingHTML;
    }

    createProgressAnimation(element, duration = 2000) {
        const progressBar = element.querySelector('.progress-bar-fill');
        if (progressBar) {
            progressBar.style.transition = `width ${duration}ms ease-out`;
            progressBar.style.width = '100%';
        }
    }

    // Text animation effects
    animateText(element, text, speed = 50) {
        element.textContent = '';
        let index = 0;
        
        const typeWriter = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(typeWriter, speed);
            }
        };
        
        typeWriter();
    }

    animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const counter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current).toLocaleString();
                requestAnimationFrame(counter);
            } else {
                element.textContent = target.toLocaleString();
            }
        };
        
        counter();
    }

    // Morphing animations
    morphShape(element, fromShape, toShape, duration = 1000) {
        const keyframes = [
            { clipPath: fromShape },
            { clipPath: toShape }
        ];
        
        element.animate(keyframes, {
            duration: duration,
            easing: 'ease-in-out',
            fill: 'forwards'
        });
    }

    // 3D transform animations
    rotate3D(element, axis, angle, duration = 1000) {
        const transform = `rotate3d(${axis.x}, ${axis.y}, ${axis.z}, ${angle}deg)`;
        
        element.style.transition = `transform ${duration}ms ease-in-out`;
        element.style.transform = transform;
        
        setTimeout(() => {
            element.style.transform = 'rotate3d(0, 0, 0, 0deg)';
        }, duration);
    }

    // Stagger animation for lists
    staggerAnimation(elements, animationClass, staggerDelay = 100) {
        elements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add(animationClass);
            }, index * staggerDelay);
        });
    }

    // Chained animations
    chainAnimations(element, animations, delays = []) {
        animations.forEach((animation, index) => {
            const delay = delays[index] || index * 500;
            
            setTimeout(() => {
                element.classList.add(`animate-${animation}`);
                
                // Remove previous animation class
                if (index > 0) {
                    element.classList.remove(`animate-${animations[index - 1]}`);
                }
            }, delay);
        });
    }

    // Performance monitoring
    monitorPerformance() {
        if (this.useHardwareAcceleration) {
            document.querySelectorAll('.animate-float, .animate-bounce, .animate-pulse').forEach(element => {
                element.style.willChange = 'transform';
                element.style.transform = 'translateZ(0)';
            });
        }
    }

    // Cleanup method
    destroy() {
        if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
        }
        
        if (this.particleContainer) {
            this.particleContainer.remove();
        }
        
        // Remove all animation classes
        document.querySelectorAll('[class*="animate-"]').forEach(element => {
            element.className = element.className.replace(/animate-\w+/g, '');
        });
    }
}

// CSS for additional animations
const additionalStyles = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(4);
            opacity: 0;
        }
    }

    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .loading-animation {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }

    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(30, 58, 138, 0.1);
        border-left: 4px solid #1E3A8A;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    .loading-dots {
        display: flex;
        gap: 0.5rem;
    }

    .loading-dots span {
        width: 8px;
        height: 8px;
        background: #1E3A8A;
        border-radius: 50%;
        animation: bounce 1.4s ease-in-out infinite both;
    }

    .loading-dots span:nth-child(1) { animation-delay: -0.32s; }
    .loading-dots span:nth-child(2) { animation-delay: -0.16s; }

    .scroll-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #1E3A8A, #3B82F6);
        z-index: 10000;
        transition: width 0.1s ease-out;
    }

    .custom-cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        background: rgba(30, 58, 138, 0.5);
        border-radius: 50%;
        pointer-events: none;
        z-index: 10000;
        transition: transform 0.1s ease-out;
    }

    .reduce-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize animation controller
document.addEventListener('DOMContentLoaded', () => {
    window.animationController = new AnimationController();
});

// Export for use in other modules
window.AnimationController = AnimationController;


