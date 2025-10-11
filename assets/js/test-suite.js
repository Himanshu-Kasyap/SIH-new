/**
 * HR Talent Management System - Test Suite
 * Comprehensive testing for functionality, accessibility, and performance
 */

class TestSuite {
  constructor() {
    this.testResults = {
      functionality: [],
      accessibility: [],
      performance: [],
      crossBrowser: [],
      responsive: []
    };
    
    this.testConfig = {
      timeout: 5000,
      retries: 3,
      verbose: true
    };
    
    this.init();
  }

  init() {
    console.log('Initializing Test Suite...');
    this.setupTestEnvironment();
  }

  /**
   * Setup test environment
   */
  setupTestEnvironment() {
    // Create test results container
    this.createTestResultsUI();
    
    // Setup test data
    this.setupTestData();
    
    // Initialize test utilities
    this.initTestUtils();
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('Starting comprehensive test suite...');
    
    try {
      // Show loading state
      this.showTestProgress('Starting tests...');
      
      // Run test categories
      await this.runFunctionalityTests();
      await this.runAccessibilityTests();
      await this.runPerformanceTests();
      await this.runResponsiveTests();
      await this.runCrossBrowserTests();
      
      // Generate final report
      this.generateTestReport();
      
    } catch (error) {
      console.error('Test suite failed:', error);
      this.showTestProgress('Test suite failed: ' + error.message, 'error');
    }
  }

  /**
   * Run functionality tests
   */
  async runFunctionalityTests() {
    this.showTestProgress('Running functionality tests...');
    
    const tests = [
      () => this.testAuthentication(),
      () => this.testNavigation(),
      () => this.testFormValidation(),
      () => this.testDataManagement(),
      () => this.testErrorHandling(),
      () => this.testLoadingStates()
    ];
    
    for (const test of tests) {
      try {
        const result = await this.runTest(test);
        this.testResults.functionality.push(result);
      } catch (error) {
        this.testResults.functionality.push({
          name: test.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Test authentication functionality
   */
  async testAuthentication() {
    const testName = 'Authentication System';
    console.log(`Testing: ${testName}`);
    
    try {
      // Test auth module exists
      const authModuleExists = window.HRTalentApp && window.HRTalentApp.modules.auth;
      
      // Test login validation
      const hasValidation = authModuleExists && 
        typeof window.HRTalentApp.modules.auth.validateLoginForm === 'function';
      
      // Test session management
      const hasSessionManagement = this.testLocalStorage();
      
      const passed = authModuleExists && hasValidation && hasSessionManagement;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          authModuleExists,
          hasValidation,
          hasSessionManagement
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test navigation
   */
  async testNavigation() {
    const testName = 'Navigation System';
    console.log(`Testing: ${testName}`);
    
    try {
      // Test navigation elements exist
      const navExists = document.querySelector('.navbar') !== null;
      const navLinks = document.querySelectorAll('.navbar-nav a');
      const hasNavLinks = navLinks.length > 0;
      const mobileToggle = document.querySelector('.mobile-nav-toggle');
      const hasMobileNav = mobileToggle !== null;
      
      const passed = navExists && hasNavLinks && hasMobileNav;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          navExists,
          hasNavLinks,
          hasMobileNav,
          linkCount: navLinks.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test form validation
   */
  async testFormValidation() {
    const testName = 'Form Validation';
    console.log(`Testing: ${testName}`);
    
    try {
      const errorHandlerExists = window.ErrorHandler !== undefined;
      const hasValidationMethods = window.ErrorHandler && 
        typeof window.ErrorHandler.handleFormError === 'function';
      const hasFieldValidation = window.ErrorHandler &&
        typeof window.ErrorHandler.showFieldError === 'function';
      
      const passed = errorHandlerExists && hasValidationMethods && hasFieldValidation;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          errorHandlerExists,
          hasValidationMethods,
          hasFieldValidation
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test data management
   */
  async testDataManagement() {
    const testName = 'Data Management';
    console.log(`Testing: ${testName}`);
    
    try {
      const storageAvailable = this.testLocalStorage();
      const dataModelsExist = document.querySelector('script[src*="data.js"]') !== null;
      const sampleDataExists = localStorage.getItem('hr_talent_users') !== null ||
        document.querySelector('script[src*="sample-data"]') !== null;
      
      const passed = storageAvailable && (dataModelsExist || sampleDataExists);
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          storageAvailable,
          dataModelsExist,
          sampleDataExists
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    const testName = 'Error Handling';
    console.log(`Testing: ${testName}`);
    
    try {
      const globalErrorHandler = window.ErrorHandler !== undefined;
      const notificationSystem = window.ErrorHandler &&
        typeof window.ErrorHandler.showNotification === 'function';
      const errorLogging = window.ErrorHandler &&
        typeof window.ErrorHandler.logError === 'function';
      
      const passed = globalErrorHandler && notificationSystem && errorLogging;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          globalErrorHandler,
          notificationSystem,
          errorLogging
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test loading states
   */
  async testLoadingStates() {
    const testName = 'Loading States';
    console.log(`Testing: ${testName}`);
    
    try {
      const loadingManagerExists = window.LoadingManager !== undefined;
      const hasLoadingMethods = window.LoadingManager &&
        typeof window.LoadingManager.show === 'function' &&
        typeof window.LoadingManager.hide === 'function';
      
      const passed = loadingManagerExists && hasLoadingMethods;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          loadingManagerExists,
          hasLoadingMethods
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run accessibility tests
   */
  async runAccessibilityTests() {
    this.showTestProgress('Running accessibility tests...');
    
    const tests = [
      () => this.testKeyboardNavigation(),
      () => this.testScreenReaderSupport(),
      () => this.testColorContrast(),
      () => this.testSemanticHTML()
    ];
    
    for (const test of tests) {
      try {
        const result = await this.runTest(test);
        this.testResults.accessibility.push(result);
      } catch (error) {
        this.testResults.accessibility.push({
          name: test.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation() {
    const testName = 'Keyboard Navigation';
    console.log(`Testing: ${testName}`);
    
    try {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const skipLinks = document.querySelectorAll('.skip-link');
      const hasFocusStyles = this.checkFocusStyles();
      
      const passed = focusableElements.length > 0 && skipLinks.length > 0 && hasFocusStyles;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          focusableCount: focusableElements.length,
          skipLinksCount: skipLinks.length,
          hasFocusStyles
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test screen reader support
   */
  async testScreenReaderSupport() {
    const testName = 'Screen Reader Support';
    console.log(`Testing: ${testName}`);
    
    try {
      const ariaLabels = document.querySelectorAll('[aria-label]');
      const liveRegions = document.querySelectorAll('[aria-live]');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const images = document.querySelectorAll('img');
      const imagesWithAlt = document.querySelectorAll('img[alt]');
      
      const passed = ariaLabels.length > 0 && liveRegions.length > 0 && 
        headings.length > 0 && images.length === imagesWithAlt.length;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          ariaLabelsCount: ariaLabels.length,
          liveRegionsCount: liveRegions.length,
          headingsCount: headings.length,
          imagesWithAltCount: imagesWithAlt.length,
          totalImagesCount: images.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test color contrast
   */
  async testColorContrast() {
    const testName = 'Color Contrast';
    console.log(`Testing: ${testName}`);
    
    try {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      
      const primaryColor = styles.getPropertyValue('--color-primary');
      const backgroundColor = styles.getPropertyValue('--color-background');
      const textColor = styles.getPropertyValue('--text-primary');
      
      const hasContrastVariables = primaryColor && backgroundColor && textColor;
      const hasHighContrastSupport = this.checkHighContrastSupport();
      
      const passed = hasContrastVariables && hasHighContrastSupport;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          hasContrastVariables,
          hasHighContrastSupport,
          primaryColor: primaryColor.trim(),
          backgroundColor: backgroundColor.trim(),
          textColor: textColor.trim()
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test semantic HTML
   */
  async testSemanticHTML() {
    const testName = 'Semantic HTML';
    console.log(`Testing: ${testName}`);
    
    try {
      const main = document.querySelector('main');
      const nav = document.querySelector('nav');
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const sections = document.querySelectorAll('section');
      const articles = document.querySelectorAll('article');
      const h1 = document.querySelectorAll('h1');
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      const passed = main && nav && headings.length > 0 && h1.length >= 1;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          hasMain: !!main,
          hasNav: !!nav,
          hasHeader: !!header,
          hasFooter: !!footer,
          sectionsCount: sections.length,
          articlesCount: articles.length,
          h1Count: h1.length,
          headingsCount: headings.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests() {
    this.showTestProgress('Running performance tests...');
    
    const tests = [
      () => this.testPageLoadTime(),
      () => this.testResourceOptimization()
    ];
    
    for (const test of tests) {
      try {
        const result = await this.runTest(test);
        this.testResults.performance.push(result);
      } catch (error) {
        this.testResults.performance.push({
          name: test.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Test page load time
   */
  async testPageLoadTime() {
    const testName = 'Page Load Time';
    console.log(`Testing: ${testName}`);
    
    try {
      const navigation = performance.getEntriesByType('navigation')[0];
      const loadTime = navigation ? navigation.loadEventEnd - navigation.fetchStart : 0;
      const domContentLoaded = navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0;
      
      const loadTimeThreshold = 3000;
      const domThreshold = 1500;
      
      const passed = loadTime < loadTimeThreshold && domContentLoaded < domThreshold;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          loadTime: Math.round(loadTime),
          domContentLoaded: Math.round(domContentLoaded),
          loadTimeThreshold,
          domThreshold,
          withinThreshold: passed
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test resource optimization
   */
  async testResourceOptimization() {
    const testName = 'Resource Optimization';
    console.log(`Testing: ${testName}`);
    
    try {
      const cssFiles = document.querySelectorAll('link[rel="stylesheet"]');
      const jsFiles = document.querySelectorAll('script[src]');
      const images = document.querySelectorAll('img');
      const lazyImages = document.querySelectorAll('img[loading="lazy"]');
      const preloadLinks = document.querySelectorAll('link[rel="preload"]');
      
      const passed = cssFiles.length > 0 && jsFiles.length > 0;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          cssFilesCount: cssFiles.length,
          jsFilesCount: jsFiles.length,
          imagesCount: images.length,
          lazyImagesCount: lazyImages.length,
          preloadLinksCount: preloadLinks.length
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run responsive tests
   */
  async runResponsiveTests() {
    this.showTestProgress('Running responsive design tests...');
    
    const tests = [
      () => this.testViewportMeta(),
      () => this.testMobileNavigation()
    ];
    
    for (const test of tests) {
      try {
        const result = await this.runTest(test);
        this.testResults.responsive.push(result);
      } catch (error) {
        this.testResults.responsive.push({
          name: test.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Test viewport meta tag
   */
  async testViewportMeta() {
    const testName = 'Viewport Meta Tag';
    console.log(`Testing: ${testName}`);
    
    try {
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      const hasViewportMeta = viewportMeta !== null;
      const viewportContent = viewportMeta ? viewportMeta.getAttribute('content') : '';
      
      const passed = hasViewportMeta && viewportContent.includes('width=device-width');
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          hasViewportMeta,
          viewportContent
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test mobile navigation
   */
  async testMobileNavigation() {
    const testName = 'Mobile Navigation';
    console.log(`Testing: ${testName}`);
    
    try {
      const mobileToggle = document.querySelector('.mobile-nav-toggle, .nav-toggle');
      const mobileMenu = document.querySelector('.mobile-nav-menu, .mobile-menu');
      
      const hasMobileToggle = mobileToggle !== null;
      const hasMobileMenu = mobileMenu !== null;
      
      const passed = hasMobileToggle && hasMobileMenu;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          hasMobileToggle,
          hasMobileMenu
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Run cross-browser tests
   */
  async runCrossBrowserTests() {
    this.showTestProgress('Running cross-browser compatibility tests...');
    
    const tests = [
      () => this.testBrowserSupport(),
      () => this.testFeatureDetection()
    ];
    
    for (const test of tests) {
      try {
        const result = await this.runTest(test);
        this.testResults.crossBrowser.push(result);
      } catch (error) {
        this.testResults.crossBrowser.push({
          name: test.name,
          status: 'failed',
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }
  }

  /**
   * Test browser support
   */
  async testBrowserSupport() {
    const testName = 'Browser Support';
    console.log(`Testing: ${testName}`);
    
    try {
      const userAgent = navigator.userAgent;
      const browserInfo = this.getBrowserInfo(userAgent);
      
      const hasES6Support = typeof Promise !== 'undefined';
      const hasLocalStorage = typeof Storage !== 'undefined';
      const hasCSS3Support = CSS && CSS.supports && CSS.supports('display', 'grid');
      
      const passed = hasES6Support && hasLocalStorage;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          ...browserInfo,
          hasES6Support,
          hasLocalStorage,
          hasCSS3Support
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Test feature detection
   */
  async testFeatureDetection() {
    const testName = 'Feature Detection';
    console.log(`Testing: ${testName}`);
    
    try {
      const features = {
        intersectionObserver: 'IntersectionObserver' in window,
        performanceObserver: 'PerformanceObserver' in window,
        serviceWorker: 'serviceWorker' in navigator,
        touchEvents: 'ontouchstart' in window,
        geolocation: 'geolocation' in navigator
      };
      
      const supportedFeatures = Object.values(features).filter(Boolean).length;
      const totalFeatures = Object.keys(features).length;
      const supportRatio = supportedFeatures / totalFeatures;
      
      const passed = supportRatio >= 0.5;
      
      return {
        name: testName,
        status: passed ? 'passed' : 'failed',
        details: {
          ...features,
          supportedFeatures,
          totalFeatures,
          supportRatio: Math.round(supportRatio * 100) + '%'
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        name: testName,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Helper methods

  /**
   * Run individual test with timeout and retry logic
   */
  async runTest(testFunction) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.testConfig.retries; attempt++) {
      try {
        const result = await Promise.race([
          testFunction(),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Test timeout')), this.testConfig.timeout)
          )
        ]);
        
        return result;
      } catch (error) {
        lastError = error;
        if (attempt < this.testConfig.retries) {
          console.warn(`Test attempt ${attempt} failed, retrying...`, error);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    throw lastError;
  }

  /**
   * Test localStorage availability
   */
  testLocalStorage() {
    try {
      const testKey = 'test_storage';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check focus styles
   */
  checkFocusStyles() {
    try {
      const stylesheets = Array.from(document.styleSheets);
      
      for (const stylesheet of stylesheets) {
        try {
          const rules = Array.from(stylesheet.cssRules || stylesheet.rules || []);
          const hasFocusRules = rules.some(rule => 
            rule.selectorText && rule.selectorText.includes(':focus')
          );
          
          if (hasFocusRules) return true;
        } catch (e) {
          continue;
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check high contrast support
   */
  checkHighContrastSupport() {
    try {
      return window.matchMedia && window.matchMedia('(prefers-contrast: high)');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get browser information
   */
  getBrowserInfo(userAgent) {
    const browsers = {
      chrome: /Chrome\/(\d+)/.exec(userAgent),
      firefox: /Firefox\/(\d+)/.exec(userAgent),
      safari: /Safari\/(\d+)/.exec(userAgent),
      edge: /Edge\/(\d+)/.exec(userAgent),
      ie: /MSIE (\d+)/.exec(userAgent)
    };
    
    for (const [name, match] of Object.entries(browsers)) {
      if (match) {
        return {
          name,
          version: match[1],
          userAgent
        };
      }
    }
    
    return {
      name: 'unknown',
      version: 'unknown',
      userAgent
    };
  }

  /**
   * Setup test data
   */
  setupTestData() {
    this.testData = {
      validUser: {
        email: 'test@company.com',
        password: 'test123',
        role: 'employee'
      },
      invalidUser: {
        email: 'invalid-email',
        password: '',
        role: 'employee'
      }
    };
  }

  /**
   * Initialize test utilities
   */
  initTestUtils() {
    window.TestUtils = {
      runSingleTest: (testName) => this.runSingleTest(testName),
      getTestResults: () => this.testResults,
      clearTestResults: () => this.clearTestResults()
    };
  }

  /**
   * Clear test results
   */
  clearTestResults() {
    this.testResults = {
      functionality: [],
      accessibility: [],
      performance: [],
      crossBrowser: [],
      responsive: []
    };
  }

  /**
   * Create test results UI
   */
  createTestResultsUI() {
    const testContainer = document.createElement('div');
    testContainer.id = 'test-results-container';
    testContainer.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 400px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: monospace;
      font-size: 12px;
      overflow-y: auto;
      display: none;
    `;
    
    testContainer.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 14px;">Test Results</h3>
        <button id="close-test-results" style="background: none; border: none; font-size: 16px; cursor: pointer;">&times;</button>
      </div>
      <div id="test-progress" style="margin-bottom: 12px; padding: 8px; background: #f5f5f5; border-radius: 4px;">
        Ready to run tests
      </div>
      <div id="test-results-content"></div>
      <div style="margin-top: 12px;">
        <button id="run-all-tests" style="width: 100%; padding: 8px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Run All Tests
        </button>
      </div>
    `;
    
    document.body.appendChild(testContainer);
    
    document.getElementById('close-test-results').addEventListener('click', () => {
      testContainer.style.display = 'none';
    });
    
    document.getElementById('run-all-tests').addEventListener('click', () => {
      this.runAllTests();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        testContainer.style.display = testContainer.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  /**
   * Show test progress
   */
  showTestProgress(message, type = 'info') {
    const progressElement = document.getElementById('test-progress');
    if (progressElement) {
      progressElement.textContent = message;
      progressElement.style.background = type === 'error' ? '#ffebee' : '#f5f5f5';
      progressElement.style.color = type === 'error' ? '#c62828' : '#333';
    }
    
    if (this.testConfig.verbose) {
      console.log(`Test Progress: ${message}`);
    }
  }

  /**
   * Generate test report
   */
  generateTestReport() {
    const allTests = [
      ...this.testResults.functionality,
      ...this.testResults.accessibility,
      ...this.testResults.performance,
      ...this.testResults.crossBrowser,
      ...this.testResults.responsive
    ];
    
    const passed = allTests.filter(test => test.status === 'passed').length;
    const failed = allTests.filter(test => test.status === 'failed').length;
    const total = allTests.length;
    
    const report = {
      summary: {
        total,
        passed,
        failed,
        passRate: Math.round((passed / total) * 100) + '%'
      },
      categories: {
        functionality: this.getCategoryStats(this.testResults.functionality),
        accessibility: this.getCategoryStats(this.testResults.accessibility),
        performance: this.getCategoryStats(this.testResults.performance),
        crossBrowser: this.getCategoryStats(this.testResults.crossBrowser),
        responsive: this.getCategoryStats(this.testResults.responsive)
      },
      details: this.testResults,
      timestamp: new Date().toISOString()
    };
    
    this.displayTestReport(report);
    console.log('Test Report:', report);
    
    return report;
  }

  /**
   * Get category statistics
   */
  getCategoryStats(tests) {
    const passed = tests.filter(test => test.status === 'passed').length;
    const failed = tests.filter(test => test.status === 'failed').length;
    const total = tests.length;
    
    return {
      total,
      passed,
      failed,
      passRate: total > 0 ? Math.round((passed / total) * 100) + '%' : '0%'
    };
  }

  /**
   * Display test report in UI
   */
  displayTestReport(report) {
    const contentElement = document.getElementById('test-results-content');
    if (!contentElement) return;
    
    const html = `
      <div style="margin-bottom: 12px;">
        <strong>Summary:</strong> ${report.summary.passed}/${report.summary.total} passed (${report.summary.passRate})
      </div>
      
      <div style="margin-bottom: 8px;">
        <div>Functionality: ${report.categories.functionality.passRate}</div>
        <div>Accessibility: ${report.categories.accessibility.passRate}</div>
        <div>Performance: ${report.categories.performance.passRate}</div>
        <div>Responsive: ${report.categories.responsive.passRate}</div>
        <div>Cross-browser: ${report.categories.crossBrowser.passRate}</div>
      </div>
      
      <details style="margin-top: 12px;">
        <summary style="cursor: pointer; font-weight: bold;">Detailed Results</summary>
        <pre style="font-size: 10px; margin-top: 8px; white-space: pre-wrap;">${JSON.stringify(report.details, null, 2)}</pre>
      </details>
    `;
    
    contentElement.innerHTML = html;
    
    const container = document.getElementById('test-results-container');
    if (container) {
      container.style.display = 'block';
    }
  }
}

// Initialize test suite
window.TestSuite = new TestSuite();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TestSuite;
}