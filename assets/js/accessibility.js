/**
 * Accessibility Module for HR Talent Management System
 * Handles keyboard navigation, ARIA updates, and screen reader support
 */

class AccessibilityManager {
    constructor() {
        this.focusableElements = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
            '[contenteditable="true"]'
        ].join(', ');
        
        this.keyboardUser = false;
        this.liveRegion = null;
        
        this.init();
    }
    
    init() {
        this.setupKeyboardDetection();
        this.setupLiveRegion();
        this.setupSkipLinks();
        this.setupFocusManagement();
        this.setupARIAUpdates();
        this.setupReducedMotion();
    }
    
    /**
     * Detect keyboard usage for focus management
     */
    setupKeyboardDetection() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                this.keyboardUser = true;
                document.body.classList.add('keyboard-user');
            }
        });
        
        document.addEventListener('mousedown', () => {
            this.keyboardUser = false;
            document.body.classList.remove('keyboard-user');
        });
    }
    
    /**
     * Setup live region for announcements
     */
    setupLiveRegion() {
        this.liveRegion = document.getElementById('live-region');
        if (!this.liveRegion) {
            this.liveRegion = document.createElement('div');
            this.liveRegion.id = 'live-region';
            this.liveRegion.className = 'live-region';
            this.liveRegion.setAttribute('aria-live', 'polite');
            this.liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(this.liveRegion);
        }
    }
    
    /**
     * Setup skip links functionality
     */
    setupSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link');
        skipLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                
                if (target) {
                    target.focus();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    this.announce(`Skipped to ${target.getAttribute('aria-label') || target.textContent || targetId}`);
                }
            });
        });
    }
    
    /**
     * Setup focus management for modals and dropdowns
     */
    setupFocusManagement() {
        // Handle modal focus trapping
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.handleEscapeKey();
            }
            
            if (e.key === 'Tab') {
                this.handleTabKey(e);
            }
        });
    }
    
    /**
     * Handle escape key for closing modals/dropdowns
     */
    handleEscapeKey() {
        // Close any open modals
        const openModals = document.querySelectorAll('.modal[aria-hidden="false"]');
        openModals.forEach(modal => {
            this.closeModal(modal);
        });
        
        // Close any open dropdowns
        const openDropdowns = document.querySelectorAll('[aria-expanded="true"]');
        openDropdowns.forEach(dropdown => {
            this.closeDropdown(dropdown);
        });
    }
    
    /**
     * Handle tab key for focus trapping
     */
    handleTabKey(e) {
        const activeModal = document.querySelector('.modal[aria-hidden="false"]');
        if (activeModal) {
            this.trapFocus(e, activeModal);
        }
    }
    
    /**
     * Trap focus within a container
     */
    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(this.focusableElements);
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
    
    /**
     * Setup ARIA updates for dynamic content
     */
    setupARIAUpdates() {
        // Update ARIA labels for loading states
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'aria-busy') {
                    const element = mutation.target;
                    if (element.getAttribute('aria-busy') === 'true') {
                        this.announce('Loading...');
                    }
                }
            });
        });
        
        observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ['aria-busy', 'aria-expanded', 'aria-selected']
        });
    }
    
    /**
     * Setup reduced motion preferences
     */
    setupReducedMotion() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.body.classList.add('reduced-motion');
        }
    }
    
    /**
     * Announce message to screen readers
     */
    announce(message, priority = 'polite') {
        if (!this.liveRegion) return;
        
        this.liveRegion.setAttribute('aria-live', priority);
        this.liveRegion.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
            this.liveRegion.textContent = '';
        }, 1000);
    }
    
    /**
     * Open modal with proper focus management
     */
    openModal(modal) {
        const previousFocus = document.activeElement;
        
        modal.setAttribute('aria-hidden', 'false');
        modal.style.display = 'flex';
        
        // Focus first focusable element in modal
        const firstFocusable = modal.querySelector(this.focusableElements);
        if (firstFocusable) {
            firstFocusable.focus();
        }
        
        // Store previous focus for restoration
        modal.dataset.previousFocus = previousFocus.id || 'body';
        
        this.announce('Modal opened');
    }
    
    /**
     * Close modal and restore focus
     */
    closeModal(modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.style.display = 'none';
        
        // Restore previous focus
        const previousFocusId = modal.dataset.previousFocus;
        const previousElement = previousFocusId === 'body' ? document.body : document.getElementById(previousFocusId);
        
        if (previousElement) {
            previousElement.focus();
        }
        
        this.announce('Modal closed');
    }
    
    /**
     * Toggle dropdown with proper ARIA states
     */
    toggleDropdown(trigger) {
        const expanded = trigger.getAttribute('aria-expanded') === 'true';
        const dropdown = document.getElementById(trigger.getAttribute('aria-controls'));
        
        if (expanded) {
            this.closeDropdown(trigger);
        } else {
            this.openDropdown(trigger);
        }
    }
    
    /**
     * Open dropdown
     */
    openDropdown(trigger) {
        const dropdown = document.getElementById(trigger.getAttribute('aria-controls'));
        
        trigger.setAttribute('aria-expanded', 'true');
        if (dropdown) {
            dropdown.classList.add('dropdown-open');
            dropdown.setAttribute('aria-hidden', 'false');
        }
        
        this.announce('Menu opened');
    }
    
    /**
     * Close dropdown
     */
    closeDropdown(trigger) {
        const dropdown = document.getElementById(trigger.getAttribute('aria-controls'));
        
        trigger.setAttribute('aria-expanded', 'false');
        if (dropdown) {
            dropdown.classList.remove('dropdown-open');
            dropdown.setAttribute('aria-hidden', 'true');
        }
        
        this.announce('Menu closed');
    }
    
    /**
     * Update form field error states
     */
    updateFieldError(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = document.getElementById(`${fieldId}-error`);
        
        if (!field || !errorElement) return;
        
        if (errorMessage) {
            field.setAttribute('aria-invalid', 'true');
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
            this.announce(`Error: ${errorMessage}`, 'assertive');
        } else {
            field.setAttribute('aria-invalid', 'false');
            field.classList.remove('error');
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    /**
     * Update loading state with proper ARIA
     */
    updateLoadingState(element, isLoading, loadingText = 'Loading...') {
        if (isLoading) {
            element.setAttribute('aria-busy', 'true');
            element.setAttribute('aria-describedby', element.id + '-loading');
            
            // Add loading text for screen readers
            let loadingElement = document.getElementById(element.id + '-loading');
            if (!loadingElement) {
                loadingElement = document.createElement('span');
                loadingElement.id = element.id + '-loading';
                loadingElement.className = 'sr-only';
                element.appendChild(loadingElement);
            }
            loadingElement.textContent = loadingText;
            
            this.announce(loadingText);
        } else {
            element.setAttribute('aria-busy', 'false');
            element.removeAttribute('aria-describedby');
            
            const loadingElement = document.getElementById(element.id + '-loading');
            if (loadingElement) {
                loadingElement.remove();
            }
            
            this.announce('Loading complete');
        }
    }
    
    /**
     * Setup keyboard navigation for custom components
     */
    setupKeyboardNavigation(container, options = {}) {
        const {
            arrowKeys = true,
            enterKey = true,
            spaceKey = true,
            homeEndKeys = true
        } = options;
        
        container.addEventListener('keydown', (e) => {
            const focusableElements = Array.from(container.querySelectorAll(this.focusableElements));
            const currentIndex = focusableElements.indexOf(document.activeElement);
            
            switch (e.key) {
                case 'ArrowDown':
                case 'ArrowRight':
                    if (arrowKeys && currentIndex < focusableElements.length - 1) {
                        e.preventDefault();
                        focusableElements[currentIndex + 1].focus();
                    }
                    break;
                    
                case 'ArrowUp':
                case 'ArrowLeft':
                    if (arrowKeys && currentIndex > 0) {
                        e.preventDefault();
                        focusableElements[currentIndex - 1].focus();
                    }
                    break;
                    
                case 'Home':
                    if (homeEndKeys) {
                        e.preventDefault();
                        focusableElements[0].focus();
                    }
                    break;
                    
                case 'End':
                    if (homeEndKeys) {
                        e.preventDefault();
                        focusableElements[focusableElements.length - 1].focus();
                    }
                    break;
                    
                case 'Enter':
                    if (enterKey && document.activeElement.click) {
                        e.preventDefault();
                        document.activeElement.click();
                    }
                    break;
                    
                case ' ':
                    if (spaceKey && document.activeElement.tagName === 'BUTTON') {
                        e.preventDefault();
                        document.activeElement.click();
                    }
                    break;
            }
        });
    }
    
    /**
     * Ensure color contrast compliance
     */
    checkColorContrast() {
        // This would typically integrate with a color contrast checking library
        // For now, we'll add high contrast mode detection
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            document.body.classList.add('high-contrast');
        }
    }
    
    /**
     * Setup roving tabindex for component groups
     */
    setupRovingTabindex(container, selector) {
        const items = container.querySelectorAll(selector);
        
        // Set initial tabindex
        items.forEach((item, index) => {
            item.setAttribute('tabindex', index === 0 ? '0' : '-1');
        });
        
        // Handle focus changes
        container.addEventListener('keydown', (e) => {
            const currentItem = document.activeElement;
            const currentIndex = Array.from(items).indexOf(currentItem);
            let nextIndex = currentIndex;
            
            switch (e.key) {
                case 'ArrowRight':
                case 'ArrowDown':
                    e.preventDefault();
                    nextIndex = (currentIndex + 1) % items.length;
                    break;
                    
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    nextIndex = (currentIndex - 1 + items.length) % items.length;
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    nextIndex = 0;
                    break;
                    
                case 'End':
                    e.preventDefault();
                    nextIndex = items.length - 1;
                    break;
            }
            
            if (nextIndex !== currentIndex) {
                items[currentIndex].setAttribute('tabindex', '-1');
                items[nextIndex].setAttribute('tabindex', '0');
                items[nextIndex].focus();
            }
        });
    }
}

// Initialize accessibility manager
const accessibilityManager = new AccessibilityManager();

// Export for use in other modules
if (typeof window !== 'undefined') {
    window.AccessibilityManager = accessibilityManager;
}