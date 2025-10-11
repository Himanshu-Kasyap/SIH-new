/**
 * HR Talent Management System - Performance Optimization
 * Handles performance monitoring, optimization, and lazy loading
 */

class PerformanceOptimizer {
  constructor() {
    this.performanceMetrics = {
      pageLoadTime: 0,
      domContentLoadedTime: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      cumulativeLayoutShift: 0,
      firstInputDelay: 0
    };
    
    this.lazyLoadObserver = null;
    this.intersectionObserver = null;
    this.resizeObserver = null;
    
    this.init();
  }

  init() {
    this.measurePerformance();
    this.setupLazyLoading();
    this.setupImageOptimization();
    this.setupResourceHints();
    this.setupCaching();
    this.debounceEvents();
    this.optimizeAnimations();
  }

  /**
   * Measure and track performance metrics
   */
  measurePerformance() {
    // Wait for page to fully load
    window.addEventListener('load', () => {
      this.collectPerformanceMetrics();
    });

    // Measure DOM content loaded time
    document.addEventListener('DOMContentLoaded', () => {
      this.performanceMetrics.domContentLoadedTime = performance.now();
    });

    // Use Performance Observer API if available
    if ('PerformanceObserver' in window) {
      this.setupPerformanceObserver();
    }
  }

  /**
   * Collect performance metrics
   */
  collectPerformanceMetrics() {
    const navigation = performance.getEntriesByType('navigation')[0];
    
    if (navigation) {
      this.performanceMetrics.pageLoadTime = navigation.loadEventEnd - navigation.fetchStart;
      this.performanceMetrics.domContentLoadedTime = navigation.domContentLoadedEventEnd - navigation.fetchStart;
    }

    // Log performance metrics
    console.log('Performance Metrics:', this.performanceMetrics);
    
    // Send to analytics if needed
    this.reportPerformanceMetrics();
  }

  /**
   * Setup Performance Observer for Web Vitals
   */
  setupPerformanceObserver() {
    try {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            this.performanceMetrics.firstContentfulPaint = entry.startTime;
          }
        });
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.performanceMetrics.largestContentfulPaint = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cumulativeScore = 0;
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) {
            cumulativeScore += entry.value;
          }
        });
        this.performanceMetrics.cumulativeLayoutShift = cumulativeScore;
      }).observe({ entryTypes: ['layout-shift'] });

      // First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.performanceMetrics.firstInputDelay = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

    } catch (error) {
      console.warn('Performance Observer not fully supported:', error);
    }
  }

  /**
   * Setup lazy loading for images and components
   */
  setupLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyLoadObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadLazyElement(entry.target);
            this.lazyLoadObserver.unobserve(entry.target);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });

      // Observe lazy load elements
      this.observeLazyElements();
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadAllLazyElements();
    }
  }

  /**
   * Observe elements for lazy loading
   */
  observeLazyElements() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    lazyElements.forEach((element) => {
      this.lazyLoadObserver.observe(element);
    });
  }

  /**
   * Load lazy element
   */
  loadLazyElement(element) {
    const src = element.dataset.lazy;
    const type = element.dataset.lazyType || 'image';

    switch (type) {
      case 'image':
        this.loadLazyImage(element, src);
        break;
      case 'component':
        this.loadLazyComponent(element, src);
        break;
      case 'script':
        this.loadLazyScript(element, src);
        break;
      default:
        console.warn('Unknown lazy load type:', type);
    }
  }

  /**
   * Load lazy image
   */
  loadLazyImage(img, src) {
    const image = new Image();
    image.onload = () => {
      img.src = src;
      img.classList.add('loaded');
      img.removeAttribute('data-lazy');
    };
    image.onerror = () => {
      img.classList.add('error');
      console.error('Failed to load lazy image:', src);
    };
    image.src = src;
  }

  /**
   * Load lazy component
   */
  loadLazyComponent(element, componentName) {
    // Simulate component loading
    element.innerHTML = '<div class="loading-spinner"></div>';
    
    // In a real app, this would load the component dynamically
    setTimeout(() => {
      element.innerHTML = `<div class="component-${componentName}">Component loaded</div>`;
      element.classList.add('loaded');
      element.removeAttribute('data-lazy');
    }, 100);
  }

  /**
   * Load lazy script
   */
  loadLazyScript(element, src) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      element.classList.add('loaded');
      element.removeAttribute('data-lazy');
    };
    script.onerror = () => {
      element.classList.add('error');
      console.error('Failed to load lazy script:', src);
    };
    document.head.appendChild(script);
  }

  /**
   * Load all lazy elements (fallback)
   */
  loadAllLazyElements() {
    const lazyElements = document.querySelectorAll('[data-lazy]');
    lazyElements.forEach((element) => {
      this.loadLazyElement(element);
    });
  }

  /**
   * Setup image optimization
   */
  setupImageOptimization() {
    // Add loading="lazy" to images that don't have it
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img) => {
      if (!this.isInViewport(img)) {
        img.loading = 'lazy';
      }
    });

    // Setup responsive images
    this.setupResponsiveImages();
  }

  /**
   * Setup responsive images
   */
  setupResponsiveImages() {
    const images = document.querySelectorAll('img[data-responsive]');
    images.forEach((img) => {
      this.makeImageResponsive(img);
    });
  }

  /**
   * Make image responsive
   */
  makeImageResponsive(img) {
    const baseSrc = img.dataset.responsive;
    const sizes = img.dataset.sizes || '(max-width: 768px) 100vw, 50vw';
    
    // Create srcset for different screen sizes
    const srcset = [
      `${baseSrc}?w=320 320w`,
      `${baseSrc}?w=640 640w`,
      `${baseSrc}?w=1024 1024w`,
      `${baseSrc}?w=1920 1920w`
    ].join(', ');
    
    img.srcset = srcset;
    img.sizes = sizes;
  }

  /**
   * Setup resource hints
   */
  setupResourceHints() {
    // Preload critical resources
    this.preloadCriticalResources();
    
    // Prefetch likely next pages
    this.prefetchLikelyPages();
    
    // Preconnect to external domains
    this.preconnectExternalDomains();
  }

  /**
   * Preload critical resources
   */
  preloadCriticalResources() {
    const criticalResources = [
      { href: 'assets/css/main.css', as: 'style' },
      { href: 'assets/css/components.css', as: 'style' },
      { href: 'assets/js/main.js', as: 'script' }
    ];

    criticalResources.forEach((resource) => {
      if (!document.querySelector(`link[href="${resource.href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Prefetch likely next pages
   */
  prefetchLikelyPages() {
    const currentPath = window.location.pathname;
    let likelyPages = [];

    // Determine likely next pages based on current page
    if (currentPath.includes('login') || currentPath === '/') {
      likelyPages = [
        'pages/dashboard/hr.html',
        'pages/dashboard/employee.html'
      ];
    } else if (currentPath.includes('dashboard')) {
      likelyPages = [
        'pages/profile/view.html',
        'pages/recommendations/overview.html'
      ];
    }

    likelyPages.forEach((page) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = page;
      document.head.appendChild(link);
    });
  }

  /**
   * Preconnect to external domains
   */
  preconnectExternalDomains() {
    const externalDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    externalDomains.forEach((domain) => {
      if (!document.querySelector(`link[href="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = domain;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  /**
   * Setup caching strategies
   */
  setupCaching() {
    // Cache static resources in localStorage
    this.cacheStaticResources();
    
    // Setup service worker if available
    this.setupServiceWorker();
  }

  /**
   * Cache static resources
   */
  cacheStaticResources() {
    const cacheKey = 'hr_talent_static_cache';
    const cacheVersion = '1.0.0';
    
    try {
      const cachedVersion = localStorage.getItem(`${cacheKey}_version`);
      
      if (cachedVersion !== cacheVersion) {
        // Clear old cache
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(cacheKey)) {
            localStorage.removeItem(key);
          }
        });
        
        // Set new version
        localStorage.setItem(`${cacheKey}_version`, cacheVersion);
      }
    } catch (error) {
      console.warn('Cache setup failed:', error);
    }
  }

  /**
   * Setup service worker
   */
  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }
  }

  /**
   * Debounce expensive events
   */
  debounceEvents() {
    // Debounce resize events
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 250);
    });

    // Debounce scroll events
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.handleScroll();
      }, 16); // ~60fps
    }, { passive: true });
  }

  /**
   * Handle resize events
   */
  handleResize() {
    // Update responsive images
    this.updateResponsiveImages();
    
    // Recalculate layouts if needed
    this.recalculateLayouts();
  }

  /**
   * Handle scroll events
   */
  handleScroll() {
    // Update lazy loading
    if (this.lazyLoadObserver) {
      this.observeLazyElements();
    }
    
    // Update scroll-based animations
    this.updateScrollAnimations();
  }

  /**
   * Update responsive images on resize
   */
  updateResponsiveImages() {
    const images = document.querySelectorAll('img[data-responsive]');
    images.forEach((img) => {
      this.makeImageResponsive(img);
    });
  }

  /**
   * Recalculate layouts
   */
  recalculateLayouts() {
    // Force layout recalculation for dynamic components
    const dynamicComponents = document.querySelectorAll('.dynamic-layout');
    dynamicComponents.forEach((component) => {
      component.style.height = 'auto';
      const height = component.scrollHeight;
      component.style.height = `${height}px`;
    });
  }

  /**
   * Update scroll-based animations
   */
  updateScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-animate');
    animatedElements.forEach((element) => {
      if (this.isInViewport(element)) {
        element.classList.add('animate-in');
      }
    });
  }

  /**
   * Optimize animations
   */
  optimizeAnimations() {
    // Reduce animations for users who prefer reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.disableAnimations();
    }

    // Use CSS transforms instead of changing layout properties
    this.optimizeTransforms();
    
    // Use requestAnimationFrame for smooth animations
    this.setupRAFAnimations();
  }

  /**
   * Disable animations for reduced motion preference
   */
  disableAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      *, *::before, *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Optimize transforms
   */
  optimizeTransforms() {
    const animatedElements = document.querySelectorAll('.animate');
    animatedElements.forEach((element) => {
      // Force hardware acceleration
      element.style.willChange = 'transform';
      element.style.transform = 'translateZ(0)';
    });
  }

  /**
   * Setup requestAnimationFrame animations
   */
  setupRAFAnimations() {
    let animationId;
    
    const animate = () => {
      // Perform animation updates here
      this.updateAnimations();
      
      animationId = requestAnimationFrame(animate);
    };
    
    // Start animation loop
    animationId = requestAnimationFrame(animate);
    
    // Stop animation when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animationId = requestAnimationFrame(animate);
      }
    });
  }

  /**
   * Update animations
   */
  updateAnimations() {
    // Update any ongoing animations
    const activeAnimations = document.querySelectorAll('.animating');
    activeAnimations.forEach((element) => {
      // Update animation state
      this.updateElementAnimation(element);
    });
  }

  /**
   * Update individual element animation
   */
  updateElementAnimation(element) {
    // Placeholder for animation updates
    // In a real implementation, this would update animation properties
  }

  /**
   * Check if element is in viewport
   */
  isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * Report performance metrics
   */
  reportPerformanceMetrics() {
    // In a real app, this would send metrics to analytics
    console.log('Performance Report:', {
      ...this.performanceMetrics,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      url: window.location.href
    });
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return { ...this.performanceMetrics };
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    if (this.lazyLoadObserver) {
      this.lazyLoadObserver.disconnect();
    }
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}

// Initialize performance optimizer
window.PerformanceOptimizer = new PerformanceOptimizer();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PerformanceOptimizer;
}