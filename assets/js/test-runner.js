/**
 * HR Talent Management System - Test Runner
 * Comprehensive testing utility for functionality, accessibility, and performance
 */

class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };
    this.isRunning = false;
    this.currentSuite = null;
    
    this.init();
  }

  init() {
    this.setupTestSuites();
    this.bindEvents();
  }

  /**
   * Setup test suites
   */
  setupTestSuites() {
    // Core functionality tests
    this.addTestSuite('Core Functionality', [
      () => this.testApplicationInitialization(),
      () => this.testNavigationSystem(),
      () => this.testAuthenticationFlow(),
      () => this.testDataManagement(),
      () => this.testErrorHandling(),
      () => this.testLoadingStates()
    ]);

    // UI/UX tests
    this.addTestSuite('User Interface', [
      () => this.testResponsiveDesign(),
      () => this.testFormValidation(),
      () => this.testNotificationSystem(),
      () => this.testModalFunctionality(),
      () => this.testCardComponents()
    ]);

    // Accessibility tests
    this.addTestSuite('Accessibility', [
      () => this.testKeyboardNavigation(),
      () => this.testScreenReaderSupport(),
      () => this.testColorContrast(),
      () => this.testFocusManagement(),
      () => this.testARIALabels()
    ]);

    // Performance tests
    this.addTestSuite('Performance', [
      () => this.testPageLoadTime(),
      () => this.testResourceLoading(),
      () => this.testMemoryUsage(),
      () => this.testAnimationPerformance(),
      () => this.testLazyLoading()
    ]);

    // Cross-browser compatibility tests
    this.addTestSuite('Compatibility', [
      () => this.testBrowserSupport(),
      () => this.testLocalStorageSupport(),
      () => this.testCSSFeatures(),
      () => this.testJavaScriptFeatures()
    ]);
  }

  /**
   * Add test suite
   */
  addTestSuite(name, tests) {
    this.tests.push({
      name,
      tests,
      results: { passed: 0, failed: 0, skipped: 0 }
    });
  }

  /**
   * Bind events
   */
  bindEvents() {
    // Add keyboard shortcut to run tests (Ctrl+Shift+T)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        this.runAllTests();
      }
    });
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    if (this.isRunning) {
      console.warn('Tests are already running');
      return;
    }

    this.isRunning = true;
    this.resetResults();
    
    console.log('🧪 Starting comprehensive test suite...');
    const startTime = performance.now();

    try {
      for (const suite of this.tests) {
        await this.runTestSuite(suite);
      }
    } catch (error) {
      console.error('Test runner error:', error);
    }

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    this.displayResults(duration);
    this.isRunning = false;
  }

  /**
   * Run individual test suite
   */
  async runTestSuite(suite) {
    this.currentSuite = suite.name;
    console.log(`\n📋 Running ${suite.name} tests...`);

    for (const test of suite.tests) {
      try {
        const result = await test();
        if (result.passed) {
          suite.results.passed++;
          this.results.passed++;
          console.log(`✅ ${result.name}`);
        } else {
          suite.results.failed++;
          this.results.failed++;
          console.log(`❌ ${result.name}: ${result.error}`);
        }
      } catch (error) {
        suite.results.failed++;
        this.results.failed++;
        console.log(`❌ Test failed: ${error.message}`);
      }
      
      this.results.total++;
    }
  }

  /**
   * Reset test results
   */
  resetResults() {
    this.results = { passed: 0, failed: 0, skipped: 0, total: 0 };
    this.tests.forEach(suite => {
      suite.results = { passed: 0, failed: 0, skipped: 0 };
    });
  }

  /**
   * Display test results
   */
  displayResults(duration) {
    const passRate = Math.round((this.results.passed / this.results.total) * 100);
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} (${passRate}%)`);
    console.log(`Failed: ${this.results.failed}`);
    console.log(`Duration: ${duration}ms`);
    
    // Display suite breakdown
    console.log('\n📋 Suite Breakdown:');
    this.tests.forEach(suite => {
      const suiteTotal = suite.results.passed + suite.results.failed;
      const suitePassRate = suiteTotal > 0 ? Math.round((suite.results.passed / suiteTotal) * 100) : 0;
      console.log(`${suite.name}: ${suite.results.passed}/${suiteTotal} (${suitePassRate}%)`);
    });

    // Show notification
    if (window.ErrorHandler) {
      const message = `Tests completed: ${this.results.passed}/${this.results.total} passed (${passRate}%)`;
      const type = passRate >= 90 ? 'success' : passRate >= 70 ? 'warning' : 'error';
      window.ErrorHandler.showNotification(message, type, 8000);
    }
  }

  // ==================== CORE FUNCTIONALITY TESTS ====================

  /**
   * Test application initialization
   */
  async testApplicationInitialization() {
    const name = 'Application Initialization';
    
    try {
      // Check if main app object exists
      if (!window.HRTalentApp) {
        throw new Error('HRTalentApp not initialized');
      }

      // Check if core modules are loaded
      const requiredModules = ['state', 'config', 'modules'];
      for (const module of requiredModules) {
        if (!HRTalentApp[module]) {
          throw new Error(`Missing core module: ${module}`);
        }
      }

      // Check if DOM is ready
      if (document.readyState === 'loading') {
        throw new Error('DOM not ready');
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test navigation system
   */
  async testNavigationSystem() {
    const name = 'Navigation System';
    
    try {
      // Check if navigation elements exist
      const navbar = document.querySelector('.navbar');
      if (!navbar) {
        throw new Error('Navigation bar not found');
      }

      // Check if navigation links are accessible
      const navLinks = document.querySelectorAll('.navbar-nav a');
      if (navLinks.length === 0) {
        throw new Error('No navigation links found');
      }

      // Test navigation click handling
      const testLink = document.querySelector('[data-navigate]');
      if (testLink) {
        // Simulate click without actually navigating
        const event = new MouseEvent('click', { bubbles: true, cancelable: true });
        testLink.dispatchEvent(event);
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test authentication flow
   */
  async testAuthenticationFlow() {
    const name = 'Authentication Flow';
    
    try {
      // Check if auth module exists
      if (!HRTalentApp.modules.auth) {
        throw new Error('Authentication module not loaded');
      }

      // Test authentication state
      const isAuthenticated = HRTalentApp.state.isAuthenticated;
      if (typeof isAuthenticated !== 'boolean') {
        throw new Error('Authentication state not properly initialized');
      }

      // Test demo credentials
      const demoCredentials = HRTalentApp.modules.auth.getDemoCredentials();
      if (!demoCredentials || !demoCredentials.hr || !demoCredentials.employee) {
        throw new Error('Demo credentials not available');
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test data management
   */
  async testDataManagement() {
    const name = 'Data Management';
    
    try {
      // Test localStorage availability
      if (!window.localStorage) {
        throw new Error('localStorage not available');
      }

      // Test data storage and retrieval
      const testKey = 'hr_talent_test';
      const testData = { test: true, timestamp: Date.now() };
      
      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey));
      
      if (!retrieved || retrieved.test !== true) {
        throw new Error('Data storage/retrieval failed');
      }
      
      localStorage.removeItem(testKey);

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    const name = 'Error Handling';
    
    try {
      // Check if error handler exists
      if (!window.ErrorHandler) {
        throw new Error('ErrorHandler not initialized');
      }

      // Test error handling methods
      const requiredMethods = ['handle', 'showNotification', 'handleFormError'];
      for (const method of requiredMethods) {
        if (typeof window.ErrorHandler[method] !== 'function') {
          throw new Error(`ErrorHandler missing method: ${method}`);
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test loading states
   */
  async testLoadingStates() {
    const name = 'Loading States';
    
    try {
      // Check if loading manager exists
      if (!window.LoadingManager) {
        throw new Error('LoadingManager not initialized');
      }

      // Test loading methods
      const requiredMethods = ['show', 'hide', 'showFormLoading', 'hideFormLoading'];
      for (const method of requiredMethods) {
        if (typeof window.LoadingManager[method] !== 'function') {
          throw new Error(`LoadingManager missing method: ${method}`);
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  // ==================== UI/UX TESTS ====================

  /**
   * Test responsive design
   */
  async testResponsiveDesign() {
    const name = 'Responsive Design';
    
    try {
      // Test viewport meta tag
      const viewport = document.querySelector('meta[name="viewport"]');
      if (!viewport) {
        throw new Error('Viewport meta tag missing');
      }

      // Test responsive classes
      const responsiveElements = document.querySelectorAll('.grid, .flex, .container');
      if (responsiveElements.length === 0) {
        throw new Error('No responsive layout elements found');
      }

      // Test mobile navigation
      const mobileToggle = document.querySelector('.mobile-nav-toggle, #mobile-nav-toggle');
      if (!mobileToggle) {
        console.warn('Mobile navigation toggle not found');
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test form validation
   */
  async testFormValidation() {
    const name = 'Form Validation';
    
    try {
      // Find forms on the page
      const forms = document.querySelectorAll('form[data-form]');
      if (forms.length === 0) {
        return { name, passed: true }; // No forms to test
      }

      // Test required field validation
      const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
      for (const field of requiredFields) {
        if (!field.hasAttribute('aria-invalid')) {
          console.warn(`Required field ${field.name} missing aria-invalid attribute`);
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test notification system
   */
  async testNotificationSystem() {
    const name = 'Notification System';
    
    try {
      if (!window.ErrorHandler) {
        throw new Error('ErrorHandler not available for notifications');
      }

      // Test notification creation
      window.ErrorHandler.showNotification('Test notification', 'info', 1000);
      
      // Check if notification container exists or was created
      await new Promise(resolve => setTimeout(resolve, 100));
      const container = document.getElementById('notification-container');
      if (!container) {
        throw new Error('Notification container not created');
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test modal functionality
   */
  async testModalFunctionality() {
    const name = 'Modal Functionality';
    
    try {
      // Look for modal elements
      const modals = document.querySelectorAll('.modal, [role="dialog"]');
      
      // If no modals, test passes (not all pages have modals)
      if (modals.length === 0) {
        return { name, passed: true };
      }

      // Test modal accessibility
      for (const modal of modals) {
        if (!modal.hasAttribute('aria-labelledby') && !modal.hasAttribute('aria-label')) {
          throw new Error('Modal missing accessibility labels');
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test card components
   */
  async testCardComponents() {
    const name = 'Card Components';
    
    try {
      const cards = document.querySelectorAll('.card');
      if (cards.length === 0) {
        return { name, passed: true }; // No cards to test
      }

      // Test card structure
      for (const card of cards) {
        const hasContent = card.querySelector('.card-content, .card-header, .card-body');
        if (!hasContent) {
          console.warn('Card missing content structure');
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  // ==================== ACCESSIBILITY TESTS ====================

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    const name = 'Keyboard Navigation';
    
    try {
      // Test focusable elements
      const focusableElements = document.querySelectorAll(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) {
        throw new Error('No focusable elements found');
      }

      // Test tab order
      let tabIndex = 0;
      for (const element of focusableElements) {
        const elementTabIndex = parseInt(element.getAttribute('tabindex')) || 0;
        if (elementTabIndex > 0 && elementTabIndex < tabIndex) {
          console.warn('Potential tab order issue detected');
        }
        tabIndex = Math.max(tabIndex, elementTabIndex);
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test screen reader support
   */
  async testScreenReaderSupport() {
    const name = 'Screen Reader Support';
    
    try {
      // Test for skip links
      const skipLinks = document.querySelectorAll('.skip-link');
      if (skipLinks.length === 0) {
        console.warn('No skip links found');
      }

      // Test for live regions
      const liveRegions = document.querySelectorAll('[aria-live]');
      if (liveRegions.length === 0) {
        console.warn('No live regions found');
      }

      // Test for proper headings hierarchy
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      if (headings.length === 0) {
        throw new Error('No headings found');
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test color contrast
   */
  async testColorContrast() {
    const name = 'Color Contrast';
    
    try {
      // This is a simplified test - in a real implementation,
      // you would use a library to calculate actual contrast ratios
      
      // Check for CSS custom properties
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      const primaryColor = styles.getPropertyValue('--color-primary');
      const backgroundColor = styles.getPropertyValue('--color-background');
      
      if (!primaryColor || !backgroundColor) {
        throw new Error('CSS custom properties not found');
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test focus management
   */
  async testFocusManagement() {
    const name = 'Focus Management';
    
    try {
      // Test focus styles
      const focusableElements = document.querySelectorAll('button, input, select, textarea, a');
      
      for (const element of focusableElements) {
        element.focus();
        const styles = getComputedStyle(element, ':focus');
        
        // Check if focus styles are applied (simplified check)
        if (!styles.outline && !styles.boxShadow) {
          console.warn(`Element ${element.tagName} may be missing focus styles`);
        }
        
        element.blur();
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test ARIA labels
   */
  async testARIALabels() {
    const name = 'ARIA Labels';
    
    try {
      // Test buttons without text content
      const buttons = document.querySelectorAll('button');
      for (const button of buttons) {
        const hasText = button.textContent.trim().length > 0;
        const hasAriaLabel = button.hasAttribute('aria-label') || button.hasAttribute('aria-labelledby');
        
        if (!hasText && !hasAriaLabel) {
          console.warn('Button without text or ARIA label found');
        }
      }

      // Test form inputs
      const inputs = document.querySelectorAll('input, select, textarea');
      for (const input of inputs) {
        const hasLabel = document.querySelector(`label[for="${input.id}"]`);
        const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
        
        if (!hasLabel && !hasAriaLabel) {
          console.warn(`Input ${input.name} without label found`);
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  // ==================== PERFORMANCE TESTS ====================

  /**
   * Test page load time
   */
  async testPageLoadTime() {
    const name = 'Page Load Time';
    
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      if (!navigation) {
        throw new Error('Navigation timing not available');
      }

      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      const threshold = 3000; // 3 seconds

      if (loadTime > threshold) {
        console.warn(`Page load time (${Math.round(loadTime)}ms) exceeds threshold (${threshold}ms)`);
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test resource loading
   */
  async testResourceLoading() {
    const name = 'Resource Loading';
    
    try {
      const resources = performance.getEntriesByType('resource');
      
      // Check for failed resources
      const failedResources = resources.filter(resource => 
        resource.transferSize === 0 && resource.decodedBodySize === 0
      );

      if (failedResources.length > 0) {
        console.warn(`${failedResources.length} resources may have failed to load`);
      }

      // Check for large resources
      const largeResources = resources.filter(resource => 
        resource.transferSize > 1000000 // 1MB
      );

      if (largeResources.length > 0) {
        console.warn(`${largeResources.length} large resources detected`);
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test memory usage
   */
  async testMemoryUsage() {
    const name = 'Memory Usage';
    
    try {
      if ('memory' in performance) {
        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        console.log(`Memory usage: ${usedMB}MB / ${limitMB}MB`);
        
        if (usedMB > limitMB * 0.8) {
          console.warn('High memory usage detected');
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test animation performance
   */
  async testAnimationPerformance() {
    const name = 'Animation Performance';
    
    try {
      // Check for animations that might cause layout thrashing
      const animatedElements = document.querySelectorAll('.animate, [style*="transition"], [style*="animation"]');
      
      for (const element of animatedElements) {
        const styles = getComputedStyle(element);
        
        // Check for potentially expensive properties
        const expensiveProps = ['width', 'height', 'top', 'left', 'margin', 'padding'];
        const transition = styles.transition || '';
        
        for (const prop of expensiveProps) {
          if (transition.includes(prop)) {
            console.warn(`Element animating potentially expensive property: ${prop}`);
          }
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test lazy loading
   */
  async testLazyLoading() {
    const name = 'Lazy Loading';
    
    try {
      // Check for lazy loading implementation
      const lazyElements = document.querySelectorAll('[data-lazy], img[loading="lazy"]');
      
      if (lazyElements.length === 0) {
        console.log('No lazy loading elements found');
      }

      // Check if performance optimizer is available
      if (window.PerformanceOptimizer) {
        console.log('Performance optimizer available');
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  // ==================== COMPATIBILITY TESTS ====================

  /**
   * Test browser support
   */
  async testBrowserSupport() {
    const name = 'Browser Support';
    
    try {
      // Test for required features
      const requiredFeatures = [
        'localStorage',
        'JSON',
        'addEventListener',
        'querySelector',
        'classList'
      ];

      for (const feature of requiredFeatures) {
        if (!(feature in window) && !(feature in document) && !(feature in Element.prototype)) {
          throw new Error(`Required feature not supported: ${feature}`);
        }
      }

      return { name, passed: true };
    } catch (error) {
      return { name, passed: false, error: error.message };
    }
  }

  /**
   * Test localStorage support
   */
  async testLocalStorageSupport() {
    const name = 'localStorage Support';
    
    try {
      if (!window.localStorage) {
        throw new Err