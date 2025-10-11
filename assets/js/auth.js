/**
 * HR Talent Management System - Authentication Module
 * Handles user authentication, role-based routing, and session management
 */

class AuthModule {
  constructor() {
    this.currentRole = 'hr';
    this.isLoading = false;
    
    // Demo credentials for testing
    this.demoCredentials = {
      hr: [
        { email: 'hr@company.com', password: 'hr123', name: 'Sarah Johnson', role: 'hr', department: 'Human Resources' },
        { email: 'admin@company.com', password: 'admin123', name: 'Michael Chen', role: 'admin', department: 'Administration' }
      ],
      employee: [
        { email: 'john.doe@company.com', password: 'emp123', name: 'John Doe', role: 'employee', department: 'Engineering', position: 'Senior Developer' },
        { email: 'jane.smith@company.com', password: 'emp123', name: 'Jane Smith', role: 'employee', department: 'Marketing', position: 'Marketing Manager' },
        { email: 'bob.wilson@company.com', password: 'emp123', name: 'Bob Wilson', role: 'employee', department: 'Sales', position: 'Sales Representative' }
      ]
    };
    
    this.init();
  }
  
  /**
   * Initialize authentication module
   */
  init() {
    console.log('Initializing Authentication Module');
    this.loadExistingEmployees();
    this.bindEvents();
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    // Role switch button
    document.addEventListener('click', (e) => {
      if (e.target.matches('#switch-role')) {
        this.toggleRole();
      }
    });
    
    // Form validation on input
    document.addEventListener('input', (e) => {
      if (e.target.matches('#email, #password')) {
        this.clearFieldError(e.target);
      }
    });
  }
  
  /**
   * Handle form submission
   */
  async handleForm(form, formType) {
    if (formType === 'login') {
      await this.handleLogin(form);
    } else if (formType === 'register') {
      await this.handleRegister(form);
    } else if (formType === 'hr-register') {
      await this.handleHRRegister(form);
    } else if (formType === 'forgot-password') {
      await this.handleForgotPassword(form);
    }
  }
  
  /**
   * Handle login form submission
   */
  async handleLogin(form) {
    if (this.isLoading) return;
    
    const formData = new FormData(form);
    const email = formData.get('email').trim();
    const password = formData.get('password');
    const role = formData.get('role');
    
    try {
      // Clear previous errors
      if (window.ErrorHandler) {
        window.ErrorHandler.clearFormErrors(form);
      }
      
      // Validate form
      const validation = this.validateLoginForm(email, password);
      if (!validation.isValid) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleFormError(form, validation.errors);
        }
        return;
      }
      
      // Show loading state
      if (window.LoadingManager) {
        window.LoadingManager.showFormLoading(form, 'Signing in...');
      }
      
      // Simulate API call delay
      await this.delay(1000);
      
      // Authenticate user
      const user = this.authenticateUser(email, password, role);
      
      if (user) {
        // Store user session
        this.storeUserSession(user);
        
        // Show success message
        if (window.ErrorHandler) {
          window.ErrorHandler.showNotification('Login successful! Redirecting...', 'success', 2000);
        }
        
        // Redirect based on role
        setTimeout(() => {
          this.redirectAfterLogin(user);
        }, 1500);
      } else {
        throw new Error('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      if (window.ErrorHandler) {
        window.ErrorHandler.handle(error, 'Login');
      }
    } finally {
      if (window.LoadingManager) {
        window.LoadingManager.hideFormLoading(form);
      }
    }
  }
  
  /**
   * Validate login form
   */
  validateLoginForm(email, password) {
    const errors = {};
    let isValid = true;
    
    // Email validation
    if (!email) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!this.isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 3) {
      errors.password = 'Password must be at least 3 characters long';
      isValid = false;
    }
    
    return { isValid, errors };
  }
  
  /**
   * Authenticate user against demo credentials
   */
  authenticateUser(email, password, role) {
    const credentials = this.demoCredentials[role] || [];
    
    return credentials.find(user => 
      user.email.toLowerCase() === email.toLowerCase() && 
      user.password === password
    );
  }
  
  /**
   * Store user session
   */
  storeUserSession(user) {
    const sessionData = {
      id: HRTalentApp.app.generateId(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      position: user.position || null,
      loginTime: new Date().toISOString()
    };
    
    // Store in localStorage
    localStorage.setItem(`${HRTalentApp.config.storagePrefix}current_user`, JSON.stringify(sessionData));
    
    // Update application state
    HRTalentApp.state.currentUser = sessionData;
    HRTalentApp.state.isAuthenticated = true;
    
    console.log('User session stored:', sessionData);
  }
  
  /**
   * Redirect user after successful login
   */
  redirectAfterLogin(user) {
    let redirectUrl;
    
    if (user.role === 'hr' || user.role === 'admin') {
      redirectUrl = '../../pages/dashboard/hr.html';
    } else {
      redirectUrl = '../../pages/dashboard/employee.html';
    }
    
    console.log('Redirecting to:', redirectUrl);
    window.location.href = redirectUrl;
  }
  
  /**
   * Switch between HR and Employee login
   */
  toggleRole() {
    if (this.currentRole === 'hr') {
      this.switchToEmployeeLogin();
    } else {
      this.switchToHRLogin();
    }
  }
  
  /**
   * Switch to HR login mode
   */
  switchToHRLogin() {
    this.currentRole = 'hr';
    
    // Update UI elements
    const icon = document.getElementById('login-icon');
    const title = document.getElementById('login-title');
    const subtitle = document.getElementById('login-subtitle');
    const roleInput = document.getElementById('user-role');
    const switchButton = document.getElementById('switch-role');
    
    if (icon) icon.textContent = '👥';
    if (title) title.textContent = 'HR & Admin Login';
    if (subtitle) subtitle.textContent = 'Access talent management tools and analytics';
    if (roleInput) roleInput.value = 'hr';
    if (switchButton) switchButton.textContent = 'Switch to Employee Login';
    
    // Clear form
    this.clearForm();
    
    console.log('Switched to HR login mode');
  }
  
  /**
   * Switch to Employee login mode
   */
  switchToEmployeeLogin() {
    this.currentRole = 'employee';
    
    // Update UI elements
    const icon = document.getElementById('login-icon');
    const title = document.getElementById('login-title');
    const subtitle = document.getElementById('login-subtitle');
    const roleInput = document.getElementById('user-role');
    const switchButton = document.getElementById('switch-role');
    
    if (icon) icon.textContent = '🎯';
    if (title) title.textContent = 'Employee Login';
    if (subtitle) subtitle.textContent = 'Access your development dashboard and career tools';
    if (roleInput) roleInput.value = 'employee';
    if (switchButton) switchButton.textContent = 'Switch to HR Login';
    
    // Clear form
    this.clearForm();
    
    console.log('Switched to Employee login mode');
  }  
  /
**
   * Show validation errors
   */
  showValidationErrors(errors) {
    Object.keys(errors).forEach(field => {
      this.showFieldError(field, errors[field]);
    });
  }
  
  /**
   * Show field-specific error
   */
  showFieldError(fieldName, message) {
    const field = document.getElementById(fieldName);
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (field) {
      field.classList.add('error');
      field.setAttribute('aria-invalid', 'true');
    }
    
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }
  
  /**
   * Clear field error
   */
  clearFieldError(field) {
    const fieldName = field.id;
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    
    if (errorElement) {
      errorElement.style.display = 'none';
      errorElement.textContent = '';
    }
  }
  
  /**
   * Clear all form errors
   */
  clearAllErrors() {
    // Clear general error message
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.style.display = 'none';
      errorMessage.textContent = '';
    }
    
    // Clear field errors
    const errorElements = document.querySelectorAll('.form-error');
    errorElements.forEach(element => {
      element.style.display = 'none';
      element.textContent = '';
    });
    
    // Remove error classes from inputs
    const inputs = document.querySelectorAll('.form-input.error');
    inputs.forEach(input => {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
    });
  }
  
  /**
   * Show general error message
   */
  showError(message) {
    const errorMessage = document.getElementById('error-message');
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        errorMessage.style.display = 'none';
      }, 5000);
    }
  }
  
  /**
   * Set loading state
   */
  setLoadingState(loading) {
    this.isLoading = loading;
    
    const button = document.getElementById('login-button');
    const buttonText = document.getElementById('login-button-text');
    const loadingSpinner = document.getElementById('login-loading');
    
    if (button && buttonText && loadingSpinner) {
      if (loading) {
        button.disabled = true;
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
      } else {
        button.disabled = false;
        buttonText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
      }
    }
  }
  
  /**
   * Clear login form
   */
  clearForm() {
    const form = document.getElementById('login-form');
    if (form) {
      form.reset();
      this.clearAllErrors();
    }
  }
  
  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  /**
   * Utility: Create delay for async operations
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get demo credentials for display (for development/demo purposes)
   */
  getDemoCredentials() {
    return {
      hr: this.demoCredentials.hr.map(user => ({
        email: user.email,
        role: user.role,
        name: user.name
      })),
      employee: this.demoCredentials.employee.map(user => ({
        email: user.email,
        role: user.role,
        name: user.name
      }))
    };
  }
  
  /**
   * Logout current user
   */
  logout() {
    // Clear session data
    localStorage.removeItem(`${HRTalentApp.config.storagePrefix}current_user`);
    
    // Update application state
    HRTalentApp.state.currentUser = null;
    HRTalentApp.state.isAuthenticated = false;
    
    // Show notification
    HRTalentApp.app.showNotification('You have been logged out successfully', 'success');
    
    // Redirect to login
    window.location.href = '../../index.html';
    
    console.log('User logged out');
  }
}

// Initialize and register the authentication module
document.addEventListener('DOMContentLoaded', function() {
  HRTalentApp.modules.auth = new AuthModule();
  console.log('Authentication module registered');
}); 
 /**
   * Handle registration form submission
   */
  async handleRegister(form) {
    if (this.isLoading) return;
    
    const formData = new FormData(form);
    const registrationData = {
      firstName: formData.get('firstName').trim(),
      lastName: formData.get('lastName').trim(),
      email: formData.get('email').trim(),
      department: formData.get('department'),
      position: formData.get('position').trim(),
      tempPassword: formData.get('tempPassword'),
      confirmPassword: formData.get('confirmPassword')
    };
    
    // Clear previous errors
    this.clearAllErrors();
    
    // Validate form
    const validation = this.validateRegistrationForm(registrationData);
    if (!validation.isValid) {
      this.showValidationErrors(validation.errors);
      return;
    }
    
    // Show loading state
    this.setLoadingState(true, 'register');
    
    try {
      // Simulate API call delay
      await this.delay(1500);
      
      // Create new employee
      const newEmployee = this.createEmployee(registrationData);
      
      if (newEmployee) {
        // Show success message
        this.showSuccess('Employee registered successfully! They can now log in with their credentials.');
        
        // Clear form after successful registration
        setTimeout(() => {
          form.reset();
          this.clearAllErrors();
        }, 2000);
      } else {
        this.showError('Failed to register employee. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showError('An error occurred during registration. Please try again.');
    } finally {
      this.setLoadingState(false, 'register');
    }
  }
  
  /**
   * Validate registration form
   */
  validateRegistrationForm(data) {
    const errors = {};
    let isValid = true;
    
    // First name validation
    if (!data.firstName) {
      errors.firstName = 'First name is required';
      isValid = false;
    } else if (data.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
      isValid = false;
    }
    
    // Last name validation
    if (!data.lastName) {
      errors.lastName = 'Last name is required';
      isValid = false;
    } else if (data.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
      isValid = false;
    }
    
    // Email validation
    if (!data.email) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    } else if (this.emailExists(data.email)) {
      errors.email = 'This email address is already registered';
      isValid = false;
    }
    
    // Department validation
    if (!data.department) {
      errors.department = 'Department is required';
      isValid = false;
    }
    
    // Position validation
    if (!data.position) {
      errors.position = 'Position is required';
      isValid = false;
    } else if (data.position.length < 2) {
      errors.position = 'Position must be at least 2 characters long';
      isValid = false;
    }
    
    // Password validation
    if (!data.tempPassword) {
      errors.tempPassword = 'Temporary password is required';
      isValid = false;
    } else if (data.tempPassword.length < 6) {
      errors.tempPassword = 'Password must be at least 6 characters long';
      isValid = false;
    }
    
    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm the password';
      isValid = false;
    } else if (data.tempPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    return { isValid, errors };
  }
  
  /**
   * Check if email already exists
   */
  emailExists(email) {
    const allCredentials = [...this.demoCredentials.hr, ...this.demoCredentials.employee];
    return allCredentials.some(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  /**
   * Create new employee
   */
  createEmployee(data) {
    const newEmployee = {
      email: data.email,
      password: data.tempPassword,
      name: `${data.firstName} ${data.lastName}`,
      role: 'employee',
      department: data.department,
      position: data.position,
      isNewUser: true,
      createdAt: new Date().toISOString()
    };
    
    // Add to demo credentials (in a real app, this would be sent to the server)
    this.demoCredentials.employee.push(newEmployee);
    
    // Store in localStorage for persistence
    const existingEmployees = JSON.parse(localStorage.getItem(`${HRTalentApp.config.storagePrefix}employees`) || '[]');
    existingEmployees.push(newEmployee);
    localStorage.setItem(`${HRTalentApp.config.storagePrefix}employees`, JSON.stringify(existingEmployees));
    
    console.log('New employee created:', newEmployee);
    return newEmployee;
  }
  
  /**
   * Handle forgot password form submission
   */
  async handleForgotPassword(form) {
    if (this.isLoading) return;
    
    const formData = new FormData(form);
    const email = formData.get('email').trim();
    
    // Clear previous errors
    this.clearAllErrors();
    
    // Validate email
    if (!email) {
      this.showFieldError('email', 'Email address is required');
      return;
    }
    
    if (!this.isValidEmail(email)) {
      this.showFieldError('email', 'Please enter a valid email address');
      return;
    }
    
    // Show loading state
    this.setLoadingState(true, 'reset');
    
    try {
      // Simulate API call delay
      await this.delay(2000);
      
      // Check if email exists
      const userExists = this.checkEmailExists(email);
      
      if (userExists) {
        // Show success message (in real app, email would be sent)
        this.showSuccess(`Password reset instructions have been sent to ${email}. Please check your inbox and follow the instructions to reset your password.`);
        
        // Clear form
        setTimeout(() => {
          form.reset();
        }, 1000);
      } else {
        // For security, we still show success even if email doesn't exist
        this.showSuccess(`If an account with ${email} exists, password reset instructions have been sent.`);
        
        // Clear form
        setTimeout(() => {
          form.reset();
        }, 1000);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      this.showError('An error occurred while processing your request. Please try again.');
    } finally {
      this.setLoadingState(false, 'reset');
    }
  }
  
  /**
   * Check if email exists in the system
   */
  checkEmailExists(email) {
    const allCredentials = [...this.demoCredentials.hr, ...this.demoCredentials.employee];
    return allCredentials.some(user => user.email.toLowerCase() === email.toLowerCase());
  }
  
  /**
   * Show success message
   */
  showSuccess(message) {
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
      successMessage.textContent = message;
      successMessage.style.display = 'block';
      
      // Auto-hide after 8 seconds
      setTimeout(() => {
        successMessage.style.display = 'none';
      }, 8000);
    }
  }
  
  /**
   * Set loading state for different forms
   */
  setLoadingState(loading, formType = 'login') {
    this.isLoading = loading;
    
    let button, buttonText, loadingSpinner;
    
    if (formType === 'register') {
      button = document.getElementById('register-button');
      buttonText = document.getElementById('register-button-text');
      loadingSpinner = document.getElementById('register-loading');
    } else if (formType === 'reset') {
      button = document.getElementById('reset-button');
      buttonText = document.getElementById('reset-button-text');
      loadingSpinner = document.getElementById('reset-loading');
    } else {
      button = document.getElementById('login-button');
      buttonText = document.getElementById('login-button-text');
      loadingSpinner = document.getElementById('login-loading');
    }
    
    if (button && buttonText && loadingSpinner) {
      if (loading) {
        button.disabled = true;
        buttonText.style.display = 'none';
        loadingSpinner.style.display = 'inline-block';
      } else {
        button.disabled = false;
        buttonText.style.display = 'inline';
        loadingSpinner.style.display = 'none';
      }
    }
  }
  
  /**
   * Handle HR registration form submission
   */
  async handleHRRegister(form) {
    if (this.isLoading) return;
    
    const formData = new FormData(form);
    const registrationData = {
      firstName: formData.get('firstName').trim(),
      lastName: formData.get('lastName').trim(),
      email: formData.get('email').trim(),
      employeeId: formData.get('employeeId').trim(),
      role: formData.get('role'),
      department: formData.get('department'),
      position: formData.get('position').trim(),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      termsAccepted: formData.get('termsAccepted'),
      dataAccess: formData.get('dataAccess')
    };
    
    try {
      // Clear previous errors
      if (window.ErrorHandler) {
        window.ErrorHandler.clearFormErrors(form);
      }
      
      // Validate form
      const validation = this.validateHRRegistrationForm(registrationData);
      if (!validation.isValid) {
        if (window.ErrorHandler) {
          window.ErrorHandler.handleFormError(form, validation.errors);
        }
        return;
      }
      
      // Show loading state
      if (window.LoadingManager) {
        window.LoadingManager.showFormLoading(form, 'Creating HR account...');
      }
      
      // Simulate API call delay
      await this.delay(2000);
      
      // Create new HR user
      const newHRUser = this.createHRUser(registrationData);
      
      if (newHRUser) {
        // Show success message
        if (window.ErrorHandler) {
          window.ErrorHandler.showNotification('HR administrator account created successfully! You can now log in with your credentials.', 'success', 5000);
        }
        
        // Clear form after successful registration
        setTimeout(() => {
          form.reset();
          // Redirect to login page
          window.location.href = 'login.html';
        }, 2000);
      } else {
        throw new Error('Failed to create HR administrator account. Please try again.');
      }
    } catch (error) {
      console.error('HR registration error:', error);
      if (window.ErrorHandler) {
        window.ErrorHandler.handle(error, 'HR Registration');
      }
    } finally {
      if (window.LoadingManager) {
        window.LoadingManager.hideFormLoading(form);
      }
    }
  }
  
  /**
   * Validate HR registration form
   */
  validateHRRegistrationForm(data) {
    const errors = {};
    let isValid = true;
    
    // First name validation
    if (!data.firstName) {
      errors.firstName = 'First name is required';
      isValid = false;
    } else if (data.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
      isValid = false;
    }
    
    // Last name validation
    if (!data.lastName) {
      errors.lastName = 'Last name is required';
      isValid = false;
    } else if (data.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
      isValid = false;
    }
    
    // Email validation
    if (!data.email) {
      errors.email = 'Email address is required';
      isValid = false;
    } else if (!this.isValidEmail(data.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    } else if (this.emailExists(data.email)) {
      errors.email = 'This email address is already registered';
      isValid = false;
    }
    
    // Employee ID validation
    if (!data.employeeId) {
      errors.employeeId = 'Employee ID is required';
      isValid = false;
    } else if (data.employeeId.length < 3) {
      errors.employeeId = 'Employee ID must be at least 3 characters long';
      isValid = false;
    }
    
    // Role validation
    if (!data.role) {
      errors.role = 'HR role is required';
      isValid = false;
    }
    
    // Department validation
    if (!data.department) {
      errors.department = 'Department is required';
      isValid = false;
    }
    
    // Position validation
    if (!data.position) {
      errors.position = 'Job title is required';
      isValid = false;
    } else if (data.position.length < 2) {
      errors.position = 'Job title must be at least 2 characters long';
      isValid = false;
    }
    
    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
      isValid = false;
    } else if (!this.isStrongPassword(data.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character';
      isValid = false;
    }
    
    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm the password';
      isValid = false;
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    
    // Terms acceptance validation
    if (!data.termsAccepted) {
      errors.termsAccepted = 'You must accept the terms of service';
      isValid = false;
    }
    
    // Data access agreement validation
    if (!data.dataAccess) {
      errors.dataAccess = 'You must acknowledge data access responsibilities';
      isValid = false;
    }
    
    return { isValid, errors };
  }
  
  /**
   * Check if password meets strength requirements
   */
  isStrongPassword(password) {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    return Object.values(requirements).every(Boolean);
  }
  
  /**
   * Create new HR user
   */
  createHRUser(data) {
    const newHRUser = {
      email: data.email,
      password: data.password,
      name: `${data.firstName} ${data.lastName}`,
      role: data.role === 'admin' ? 'admin' : 'hr',
      department: data.department,
      position: data.position,
      employeeId: data.employeeId,
      isNewUser: true,
      createdAt: new Date().toISOString(),
      permissions: this.getHRPermissions(data.role)
    };
    
    // Add to demo credentials
    this.demoCredentials.hr.push(newHRUser);
    
    // Store in localStorage for persistence
    const existingHRUsers = JSON.parse(localStorage.getItem(`${HRTalentApp.config.storagePrefix}hr_users`) || '[]');
    existingHRUsers.push(newHRUser);
    localStorage.setItem(`${HRTalentApp.config.storagePrefix}hr_users`, JSON.stringify(existingHRUsers));
    
    console.log('New HR user created:', newHRUser);
    return newHRUser;
  }
  
  /**
   * Get HR permissions based on role
   */
  getHRPermissions(role) {
    const permissions = {
      'hr': ['view_employees', 'edit_employees', 'view_reports'],
      'hr-manager': ['view_employees', 'edit_employees', 'view_reports', 'manage_team', 'approve_requests'],
      'hr-director': ['view_employees', 'edit_employees', 'view_reports', 'manage_team', 'approve_requests', 'system_config'],
      'admin': ['all_permissions']
    };
    
    return permissions[role] || permissions['hr'];
  }
  
  /**
   * Load existing employees from localStorage
   */
  loadExistingEmployees() {
    const existingEmployees = JSON.parse(localStorage.getItem(`${HRTalentApp.config.storagePrefix}employees`) || '[]');
    
    // Merge with demo credentials
    existingEmployees.forEach(employee => {
      if (!this.emailExists(employee.email)) {
        this.demoCredentials.employee.push(employee);
      }
    });
    
    // Load existing HR users
    const existingHRUsers = JSON.parse(localStorage.getItem(`${HRTalentApp.config.storagePrefix}hr_users`) || '[]');
    existingHRUsers.forEach(hrUser => {
      if (!this.emailExists(hrUser.email)) {
        this.demoCredentials.hr.push(hrUser);
      }
    });
    
    console.log('Loaded existing employees:', existingEmployees.length);
    console.log('Loaded existing HR users:', existingHRUsers.length);
  }