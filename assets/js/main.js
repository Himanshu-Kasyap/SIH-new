/**
 * HR Talent Management System - Core Application Logic
 * Main JavaScript file that initializes the application and provides core functionality
 */

// Application namespace
window.HRTalentApp = {
  // Application state
  state: {
    currentUser: null,
    isAuthenticated: false,
    currentPage: null
  },
  
  // Configuration
  config: {
    appName: 'HR Talent Management System',
    version: '1.0.0',
    storagePrefix: 'hr_talent_',
    routes: {
      login: '/index.html',
      hrDashboard: '/pages/dashboard/hr.html',
      employeeDashboard: '/pages/dashboard/employee.html',
      profile: '/pages/profile/view.html'
    }
  },
  
  // Core modules (will be populated by other JS files)
  modules: {
    auth: null,
    data: null,
    ui: null,
    router: null
  }
};

/**
 * Application initialization
 */
class App {
  constructor() {
    this.init();
  }
  
  /**
   * Initialize the application
   */
  init() {
    console.log(`Initializing ${HRTalentApp.config.appName} v${HRTalentApp.config.version}`);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }
  }
  
  /**
   * Called when DOM is ready
   */
  onDOMReady() {
    console.log('DOM ready, starting application...');
    
    // Initialize core functionality
    this.initializeAccessibility();
    this.initializeEventListeners();
    this.initializeNavigation();
    this.checkAuthentication();
    this.initializeNotificationSystem();
    this.initializePage();
    
    console.log('Application initialized successfully');
  }
  
  /**
   * Initialize accessibility features
   */
  initializeAccessibility() {
    // Accessibility manager is initialized by its own script
    // This ensures proper keyboard navigation and ARIA support
    console.log('Accessibility features initialized');
    
    // Add mobile navigation toggle functionality
    this.setupMobileNavigation();
    
    // Setup form accessibility enhancements
    this.setupFormAccessibility();
  }
  
  /**
   * Initialize global event listeners
   */
  initializeEventListeners() {
    // Handle navigation clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-navigate]')) {
        e.preventDefault();
        const url = e.target.getAttribute('data-navigate');
        this.navigate(url);
      }
    });
    
    // Handle logout clicks
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-logout]')) {
        e.preventDefault();
        this.logout();
      }
    });
    
    // Handle form submissions
    document.addEventListener('submit', (e) => {
      if (e.target.matches('form[data-form]')) {
        e.preventDefault();
        this.handleFormSubmission(e.target);
      }
    });
    
    // Handle window resize for responsive features
    window.addEventListener('resize', this.debounce(() => {
      this.handleResize();
    }, 250));
  }
  
  /**
   * Initialize navigation based on current page
   */
  initializeNavigation() {
    const currentPath = window.location.pathname;
    HRTalentApp.state.currentPage = this.getPageFromPath(currentPath);
    
    // Update active navigation items
    this.updateActiveNavigation();
  }
  
  /**
   * Initialize notification system
   */
  initializeNotificationSystem() {
    // Notification system will be initialized by its own module
    // This ensures it's available across all pages
    console.log('Notification system initialization triggered');
  }
  
  /**
   * Check if user is authenticated
   */
  checkAuthentication() {
    const currentUser = localStorage.getItem(`${HRTalentApp.config.storagePrefix}current_user`);
    
    if (currentUser) {
      try {
        HRTalentApp.state.currentUser = JSON.parse(currentUser);
        HRTalentApp.state.isAuthenticated = true;
        console.log('User authenticated:', HRTalentApp.state.currentUser.name);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.logout();
      }
    }
  }
  
  /**
   * Initialize page-specific functionality
   */
  initializePage() {
    const pageType = this.getPageType();
    console.log('Initializing page:', pageType);
    
    switch (pageType) {
      case 'login':
        this.initializeLoginPage();
        break;
      case 'dashboard':
        this.initializeDashboardPage();
        break;
      case 'profile':
        this.initializeProfilePage();
        break;
      default:
        console.log('No specific initialization for page type:', pageType);
    }
  }
  
  /**
   * Get page type from current URL
   */
  getPageType() {
    const path = window.location.pathname;
    
    if (path.includes('dashboard')) return 'dashboard';
    if (path.includes('profile')) return 'profile';
    if (path.includes('login') || path === '/' || path === '/index.html') return 'login';
    
    return 'unknown';
  }
  
  /**
   * Get page identifier from path
   */
  getPageFromPath(path) {
    const segments = path.split('/').filter(segment => segment);
    return segments.join('-') || 'home';
  }
  
  /**
   * Initialize login page
   */
  initializeLoginPage() {
    // Redirect if already authenticated
    if (HRTalentApp.state.isAuthenticated) {
      const user = HRTalentApp.state.currentUser;
      const redirectUrl = user.role === 'hr' || user.role === 'admin' 
        ? HRTalentApp.config.routes.hrDashboard 
        : HRTalentApp.config.routes.employeeDashboard;
      
      this.navigate(redirectUrl);
      return;
    }
    
    console.log('Login page initialized');
  }
  
  /**
   * Initialize dashboard page
   */
  initializeDashboardPage() {
    // Ensure user is authenticated
    if (!HRTalentApp.state.isAuthenticated) {
      this.navigate(HRTalentApp.config.routes.login);
      return;
    }
    
    console.log('Dashboard page initialized');
  }
  
  /**
   * Initialize profile page
   */
  initializeProfilePage() {
    // Ensure user is authenticated
    if (!HRTalentApp.state.isAuthenticated) {
      this.navigate(HRTalentApp.config.routes.login);
      return;
    }
    
    console.log('Profile page initialized');
  }
  
  /**
   * Handle form submission with error handling and loading states
   */
  async handleFormSubmission(form) {
    const formType = form.getAttribute('data-form');
    console.log('Handling form submission:', formType);
    
    try {
      // Clear previous errors
      if (window.ErrorHandler) {
        window.ErrorHandler.clearFormErrors(form);
      }
      
      // Show loading state
      if (window.LoadingManager) {
        window.LoadingManager.showFormLoading(form, 'Processing...');
      }
      
      // Form handling will be implemented in auth.js and other modules
      if (HRTalentApp.modules.auth && typeof HRTalentApp.modules.auth.handleForm === 'function') {
        await HRTalentApp.modules.auth.handleForm(form, formType);
      } else {
        // Simulate processing for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Form handler not implemented');
      }
      
    } catch (error) {
      // Handle form submission errors
      if (window.ErrorHandler) {
        if (error.validationErrors) {
          window.ErrorHandler.handleFormError(form, error.validationErrors);
        } else {
          window.ErrorHandler.handle(error, 'Form Submission');
        }
      }
    } finally {
      // Hide loading state
      if (window.LoadingManager) {
        window.LoadingManager.hideFormLoading(form);
      }
    }
  }
  
  /**
   * Navigate to a URL
   */
  navigate(url) {
    console.log('Navigating to:', url);
    window.location.href = url;
  }
  
  /**
   * Logout user
   */
  logout() {
    console.log('Logging out user');
    
    // Clear user data
    HRTalentApp.state.currentUser = null;
    HRTalentApp.state.isAuthenticated = false;
    
    // Clear localStorage
    localStorage.removeItem(`${HRTalentApp.config.storagePrefix}current_user`);
    
    // Redirect to login
    this.navigate(HRTalentApp.config.routes.login);
  }
  
  /**
   * Update active navigation items
   */
  updateActiveNavigation() {
    const navLinks = document.querySelectorAll('.navbar-nav a');
    const currentPath = window.location.pathname;
    
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && currentPath.includes(href.replace('./', ''))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    console.log('Window resized to:', window.innerWidth, 'x', window.innerHeight);
    // Responsive handling will be added as needed
  }
  
  /**
   * Utility: Debounce function
   */
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
  
  /**
   * Setup mobile navigation accessibility
   */
  setupMobileNavigation() {
    const mobileToggle = document.getElementById('mobile-nav-toggle');
    const mobileMenu = document.getElementById('mobile-nav-menu');
    
    if (mobileToggle && mobileMenu) {
      mobileToggle.addEventListener('click', () => {
        const isExpanded = mobileToggle.getAttribute('aria-expanded') === 'true';
        
        mobileToggle.setAttribute('aria-expanded', !isExpanded);
        mobileToggle.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        
        if (window.AccessibilityManager) {
          window.AccessibilityManager.announce(
            isExpanded ? 'Navigation menu closed' : 'Navigation menu opened'
          );
        }
      });
      
      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!mobileToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileToggle.setAttribute('aria-expanded', 'false');
          mobileToggle.classList.remove('active');
          mobileMenu.classList.remove('active');
        }
      });
    }
  }
  
  /**
   * Setup form accessibility enhancements
   */
  setupFormAccessibility() {
    // Add real-time validation feedback
    const forms = document.querySelectorAll('form[data-form]');
    forms.forEach(form => {
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => {
        input.addEventListener('blur', () => {
          this.validateField(input);
        });
        
        input.addEventListener('input', () => {
          // Clear error state on input
          if (input.classList.contains('error')) {
            this.clearFieldError(input);
          }
        });
      });
    });
  }
  
  /**
   * Validate individual form field
   */
  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    let errorMessage = '';
    
    if (required && !value) {
      errorMessage = `${this.getFieldLabel(field)} is required`;
    } else if (type === 'email' && value && !this.isValidEmail(value)) {
      errorMessage = 'Please enter a valid email address';
    }
    
    // Use ErrorHandler for consistent error display
    if (window.ErrorHandler) {
      if (errorMessage) {
        window.ErrorHandler.showFieldError(field.closest('form'), field.name || field.id, errorMessage);
      } else {
        window.ErrorHandler.clearFieldError(field);
      }
    }
    
    return !errorMessage;
  }
  
  /**
   * Clear field error state
   */
  clearFieldError(field) {
    if (window.ErrorHandler) {
      window.ErrorHandler.clearFieldError(field);
    }
  }
  
  /**
   * Get field label text
   */
  getFieldLabel(field) {
    const label = document.querySelector(`label[for="${field.id}"]`);
    return label ? label.textContent.replace('*', '').trim() : field.name || 'Field';
  }
  
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Utility: Show notification with accessibility support
   */
  showNotification(message, type = 'info', duration = 5000) {
    // Use ErrorHandler's notification system for consistency
    if (window.ErrorHandler) {
      window.ErrorHandler.showNotification(message, type, duration);
    } else {
      // Fallback implementation
      console.log(`Notification (${type}):`, message);
    }
  }
  
  /**
   * Utility: Format date
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(new Date(date));
  }
  
  /**
   * Utility: Generate unique ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Initialize application when script loads
const app = new App();

// Export for use by other modules
window.HRTalentApp.app = app;