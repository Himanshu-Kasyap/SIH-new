/**
 * HR Talent Management System - Error Handling and Loading States
 * Comprehensive error handling with user-friendly messages and loading indicators
 */

class ErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.init();
  }

  init() {
    // Global error handlers
    window.addEventListener('error', (event) => {
      this.handleGlobalError(event.error, 'JavaScript Error', event.filename, event.lineno);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleGlobalError(event.reason, 'Unhandled Promise Rejection');
      event.preventDefault();
    });

    // Network error detection
    window.addEventListener('online', () => {
      this.showNotification('Connection restored', 'success');
    });

    window.addEventListener('offline', () => {
      this.showNotification('Connection lost. Some features may not work properly.', 'warning', 0);
    });
  }

  /**
   * Handle global JavaScript errors
   */
  handleGlobalError(error, context, filename = '', line = 0) {
    const errorInfo = {
      message: error.message || error,
      context,
      filename,
      line,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logError(errorInfo);
    
    // Show user-friendly error message
    const userMessage = this.getUserFriendlyMessage(error);
    this.showNotification(userMessage, 'error');
    
    console.error('Global error caught:', errorInfo);
  }

  /**
   * Handle specific application errors
   */
  handle(error, context = 'Application') {
    const errorInfo = {
      message: error.message || error,
      context,
      timestamp: new Date().toISOString(),
      stack: error.stack || '',
      url: window.location.href
    };

    this.logError(errorInfo);
    
    const userMessage = this.getUserFriendlyMessage(error, context);
    this.showNotification(userMessage, 'error');
    
    console.error(`Error in ${context}:`, error);
    
    return false; // Indicate error was handled
  }

  /**
   * Handle form validation errors
   */
  handleFormError(form, errors) {
    if (!form || !errors) return;

    // Clear previous errors
    this.clearFormErrors(form);

    if (Array.isArray(errors)) {
      // Multiple field errors
      errors.forEach(error => {
        if (error.field && error.message) {
          this.showFieldError(form, error.field, error.message);
        }
      });
    } else if (typeof errors === 'object') {
      // Object with field keys
      Object.keys(errors).forEach(field => {
        this.showFieldError(form, field, errors[field]);
      });
    } else {
      // General form error
      this.showFormError(form, errors);
    }

    // Focus first error field
    const firstErrorField = form.querySelector('.form-input.error');
    if (firstErrorField) {
      firstErrorField.focus();
      
      // Announce error to screen readers
      if (window.AccessibilityManager) {
        window.AccessibilityManager.announce(
          `Form has errors. Please review and correct the highlighted fields.`,
          'assertive'
        );
      }
    }
  }

  /**
   * Show field-specific error
   */
  showFieldError(form, fieldName, message) {
    const field = form.querySelector(`[name="${fieldName}"], #${fieldName}`);
    if (!field) return;

    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');

    // Create or update error message
    let errorElement = form.querySelector(`#${fieldName}-error`);
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.id = `${fieldName}-error`;
      errorElement.className = 'form-error';
      errorElement.setAttribute('role', 'alert');
      errorElement.setAttribute('aria-live', 'polite');
      
      field.parentNode.appendChild(errorElement);
      field.setAttribute('aria-describedby', errorElement.id);
    }

    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }

  /**
   * Show general form error
   */
  showFormError(form, message) {
    let errorContainer = form.querySelector('.form-errors');
    if (!errorContainer) {
      errorContainer = document.createElement('div');
      errorContainer.className = 'form-errors';
      errorContainer.setAttribute('role', 'alert');
      errorContainer.setAttribute('aria-live', 'assertive');
      form.insertBefore(errorContainer, form.firstChild);
    }

    errorContainer.innerHTML = `
      <div class="alert alert-error">
        <span class="alert-icon">⚠</span>
        <span class="alert-message">${message}</span>
      </div>
    `;
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /**
   * Clear all form errors
   */
  clearFormErrors(form) {
    // Remove field errors
    const errorFields = form.querySelectorAll('.form-input.error');
    errorFields.forEach(field => {
      field.classList.remove('error');
      field.removeAttribute('aria-invalid');
    });

    // Remove error messages
    const errorMessages = form.querySelectorAll('.form-error');
    errorMessages.forEach(error => error.remove());

    // Remove general form errors
    const errorContainer = form.querySelector('.form-errors');
    if (errorContainer) {
      errorContainer.remove();
    }
  }

  /**
   * Clear specific field error
   */
  clearFieldError(field) {
    if (!field) return;

    field.classList.remove('error');
    field.removeAttribute('aria-invalid');

    const errorId = field.getAttribute('aria-describedby');
    if (errorId) {
      const errorElement = document.getElementById(errorId);
      if (errorElement) {
        errorElement.remove();
      }
      field.removeAttribute('aria-describedby');
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserFriendlyMessage(error, context = '') {
    const message = error.message || error;
    
    // Network errors
    if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    }
    
    // Storage errors
    if (message.includes('localStorage') || message.includes('storage')) {
      return 'Unable to save data locally. Please ensure you have sufficient storage space.';
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('invalid')) {
      return 'Please check your input and try again.';
    }
    
    // Authentication errors
    if (message.includes('auth') || message.includes('login') || message.includes('credential')) {
      return 'Authentication failed. Please check your credentials and try again.';
    }
    
    // Permission errors
    if (message.includes('permission') || message.includes('unauthorized')) {
      return 'You do not have permission to perform this action.';
    }
    
    // Generic errors based on context
    switch (context.toLowerCase()) {
      case 'form':
      case 'form submission':
        return 'There was a problem submitting the form. Please review your information and try again.';
      case 'data loading':
      case 'data':
        return 'Unable to load data. Please refresh the page and try again.';
      case 'save':
      case 'saving':
        return 'Unable to save changes. Please try again.';
      case 'delete':
      case 'deletion':
        return 'Unable to delete item. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  }

  /**
   * Log error for debugging
   */
  logError(errorInfo) {
    this.errorLog.unshift(errorInfo);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }
    
    // Store in localStorage for debugging
    try {
      localStorage.setItem('hr_talent_error_log', JSON.stringify(this.errorLog.slice(0, 10)));
    } catch (e) {
      // Ignore storage errors when logging
    }
  }

  /**
   * Show notification with accessibility support
   */
  showNotification(message, type = 'info', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
    notification.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite');
    
    const icon = this.getNotificationIcon(type);
    notification.innerHTML = `
      <span class="notification-icon">${icon}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">&times;</button>
    `;
    
    // Add to notification container or body
    let container = document.getElementById('notification-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-container';
      container.className = 'notification-container';
      document.body.appendChild(container);
    }
    
    container.appendChild(notification);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.removeNotification(notification);
    });
    
    // Auto remove after duration (unless duration is 0)
    if (duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification);
      }, duration);
    }
    
    // Announce to screen readers
    if (window.AccessibilityManager) {
      window.AccessibilityManager.announce(message, type === 'error' ? 'assertive' : 'polite');
    }
    
    console.log(`Notification (${type}):`, message);
  }

  /**
   * Remove notification with animation
   */
  removeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    notification.style.animation = 'slideOut 0.3s ease-in forwards';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Get icon for notification type
   */
  getNotificationIcon(type) {
    const icons = {
      success: '✓',
      error: '⚠',
      warning: '⚠',
      info: 'ℹ'
    };
    return icons[type] || icons.info;
  }

  /**
   * Get error log for debugging
   */
  getErrorLog() {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog() {
    this.errorLog = [];
    try {
      localStorage.removeItem('hr_talent_error_log');
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Check if user is online
   */
  isOnline() {
    return navigator.onLine;
  }

  /**
   * Retry function with exponential backoff
   */
  async retry(fn, maxAttempts = 3, baseDelay = 1000) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          throw error;
        }
        
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Retry attempt ${attempt} failed, retrying in ${delay}ms...`);
      }
    }
    
    throw lastError;
  }
}

// Loading State Manager
class LoadingManager {
  constructor() {
    this.loadingStates = new Map();
    this.init();
  }

  init() {
    // Create global loading overlay
    this.createGlobalLoadingOverlay();
  }

  /**
   * Show loading state for specific element or globally
   */
  show(target = null, message = 'Loading...') {
    const loadingId = target ? this.getElementId(target) : 'global';
    
    if (target) {
      this.showElementLoading(target, message, loadingId);
    } else {
      this.showGlobalLoading(message);
    }
    
    this.loadingStates.set(loadingId, {
      target,
      message,
      startTime: Date.now()
    });
    
    // Announce to screen readers
    if (window.AccessibilityManager) {
      window.AccessibilityManager.announce(message, 'polite');
    }
  }

  /**
   * Hide loading state
   */
  hide(target = null) {
    const loadingId = target ? this.getElementId(target) : 'global';
    
    if (target) {
      this.hideElementLoading(target);
    } else {
      this.hideGlobalLoading();
    }
    
    const loadingState = this.loadingStates.get(loadingId);
    if (loadingState) {
      const duration = Date.now() - loadingState.startTime;
      console.log(`Loading completed for ${loadingId} in ${duration}ms`);
      this.loadingStates.delete(loadingId);
    }
    
    // Announce completion to screen readers
    if (window.AccessibilityManager) {
      window.AccessibilityManager.announce('Loading complete', 'polite');
    }
  }

  /**
   * Show loading for specific element
   */
  showElementLoading(element, message, loadingId) {
    if (!element) return;
    
    // Store original content
    if (!element.dataset.originalContent) {
      element.dataset.originalContent = element.innerHTML;
    }
    
    // Add loading class and attributes
    element.classList.add('loading-state');
    element.setAttribute('aria-busy', 'true');
    element.setAttribute('aria-live', 'polite');
    
    // Create loading content
    const loadingContent = `
      <div class="loading-content">
        <div class="loading-spinner" aria-hidden="true"></div>
        <span class="loading-message">${message}</span>
      </div>
    `;
    
    // Handle different element types
    if (element.tagName === 'BUTTON') {
      element.disabled = true;
      element.innerHTML = loadingContent;
    } else if (element.classList.contains('card') || element.classList.contains('form-group')) {
      const overlay = document.createElement('div');
      overlay.className = 'loading-overlay';
      overlay.innerHTML = loadingContent;
      overlay.setAttribute('data-loading-id', loadingId);
      
      element.style.position = 'relative';
      element.appendChild(overlay);
    } else {
      element.innerHTML = loadingContent;
    }
  }

  /**
   * Hide loading for specific element
   */
  hideElementLoading(element) {
    if (!element) return;
    
    element.classList.remove('loading-state');
    element.removeAttribute('aria-busy');
    
    // Remove loading overlay if present
    const overlay = element.querySelector('.loading-overlay');
    if (overlay) {
      overlay.remove();
    } else {
      // Restore original content
      const originalContent = element.dataset.originalContent;
      if (originalContent) {
        element.innerHTML = originalContent;
        delete element.dataset.originalContent;
      }
    }
    
    // Re-enable buttons
    if (element.tagName === 'BUTTON') {
      element.disabled = false;
    }
  }

  /**
   * Show global loading overlay
   */
  showGlobalLoading(message = 'Loading...') {
    const overlay = document.getElementById('global-loading-overlay');
    if (overlay) {
      overlay.querySelector('.loading-message').textContent = message;
      overlay.style.display = 'flex';
      overlay.setAttribute('aria-hidden', 'false');
      
      // Prevent scrolling
      document.body.style.overflow = 'hidden';
    }
  }

  /**
   * Hide global loading overlay
   */
  hideGlobalLoading() {
    const overlay = document.getElementById('global-loading-overlay');
    if (overlay) {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      
      // Restore scrolling
      document.body.style.overflow = '';
    }
  }

  /**
   * Create global loading overlay
   */
  createGlobalLoadingOverlay() {
    if (document.getElementById('global-loading-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.className = 'global-loading-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner large" aria-hidden="true"></div>
        <span class="loading-message">Loading...</span>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  /**
   * Get unique ID for element
   */
  getElementId(element) {
    if (element.id) return element.id;
    if (element.className) return element.className.replace(/\s+/g, '-');
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Show loading for form submission
   */
  showFormLoading(form, message = 'Submitting...') {
    if (!form) return;
    
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      this.show(submitButton, message);
    }
    
    // Disable all form inputs
    const inputs = form.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      input.disabled = true;
    });
    
    form.classList.add('form-loading');
  }

  /**
   * Hide loading for form submission
   */
  hideFormLoading(form) {
    if (!form) return;
    
    const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
    if (submitButton) {
      this.hide(submitButton);
    }
    
    // Re-enable all form inputs
    const inputs = form.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      input.disabled = false;
    });
    
    form.classList.remove('form-loading');
  }

  /**
   * Check if any loading states are active
   */
  isLoading(target = null) {
    if (target) {
      const loadingId = this.getElementId(target);
      return this.loadingStates.has(loadingId);
    }
    return this.loadingStates.size > 0;
  }

  /**
   * Get all active loading states
   */
  getActiveLoadingStates() {
    return Array.from(this.loadingStates.entries());
  }
}

// Initialize global instances
window.ErrorHandler = new ErrorHandler();
window.LoadingManager = new LoadingManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorHandler, LoadingManager };
}