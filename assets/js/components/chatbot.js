/**
 * HR Talent Management System - Chatbot Component
 * AI Assistant for career development guidance and contextual help
 */

class Chatbot {
  constructor() {
    this.isOpen = false;
    this.currentUser = null;
    this.currentPage = null;
    this.conversationHistory = [];
    this.isTyping = false;
    
    // Predefined responses and help topics
    this.responses = this.initializeResponses();
    this.helpTopics = this.initializeHelpTopics();
    
    this.init();
  }
  
  /**
   * Initialize the chatbot
   */
  init() {
    this.getCurrentUser();
    this.getCurrentPage();
    this.createChatbotUI();
    this.bindEvents();
    this.loadConversationHistory();
    
    console.log('Chatbot initialized');
  }
  
  /**
   * Get current user from application state
   */
  getCurrentUser() {
    if (window.HRTalentApp && window.HRTalentApp.state.currentUser) {
      this.currentUser = window.HRTalentApp.state.currentUser;
    } else {
      // Fallback to localStorage
      const userData = localStorage.getItem('hr_talent_current_user');
      if (userData) {
        try {
          this.currentUser = JSON.parse(userData);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }
  
  /**
   * Get current page context
   */
  getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('dashboard')) {
      this.currentPage = this.currentUser?.role === 'hr' ? 'hr-dashboard' : 'employee-dashboard';
    } else if (path.includes('profile')) {
      this.currentPage = 'profile';
    } else if (path.includes('recommendations')) {
      this.currentPage = 'recommendations';
    } else if (path.includes('roles')) {
      this.currentPage = 'roles';
    } else if (path.includes('learning')) {
      this.currentPage = 'learning';
    } else if (path.includes('reports')) {
      this.currentPage = 'reports';
    } else if (path.includes('admin')) {
      this.currentPage = 'admin';
    } else {
      this.currentPage = 'general';
    }
  }
  
  /**
   * Create chatbot UI elements
   */
  createChatbotUI() {
    // Create chatbot container
    const chatbotContainer = document.createElement('div');
    chatbotContainer.id = 'chatbot-container';
    chatbotContainer.className = 'chatbot-container';
    
    chatbotContainer.innerHTML = `
      <div class="chatbot-toggle" id="chatbot-toggle">
        <div class="toggle-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <div class="notification-badge" id="chatbot-badge" style="display: none;">
          <span>1</span>
        </div>
      </div>
      
      <div class="chatbot-window" id="chatbot-window">
        <div class="chatbot-header">
          <div class="chatbot-title">
            <div class="chatbot-avatar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
              </svg>
            </div>
            <div class="chatbot-info">
              <div class="chatbot-name">HR Assistant</div>
              <div class="chatbot-status">Online</div>
            </div>
          </div>
          <button class="chatbot-close" id="chatbot-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div class="chatbot-messages" id="chatbot-messages">
          <div class="welcome-message">
            <div class="message bot-message">
              <div class="message-content">
                <p>Hi ${this.currentUser?.name || 'there'}! 👋</p>
                <p>I'm your HR Assistant. I can help you with career development, training recommendations, and answer questions about the talent management system.</p>
              </div>
            </div>
            <div class="quick-actions" id="quick-actions">
              ${this.generateQuickActions()}
            </div>
          </div>
        </div>
        
        <div class="chatbot-input">
          <div class="input-container">
            <input type="text" id="chatbot-message-input" placeholder="Ask me anything about your career development..." autocomplete="off">
            <button id="chatbot-send" class="send-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(chatbotContainer);
  }
  
  /**
   * Generate contextual quick actions based on user role and current page
   */
  generateQuickActions() {
    const actions = [];
    
    // Role-based actions
    if (this.currentUser?.role === 'hr' || this.currentUser?.role === 'admin') {
      actions.push(
        { text: 'How to use 9-box matrix?', action: 'help-nine-box' },
        { text: 'Succession planning tips', action: 'help-succession' },
        { text: 'Employee development guide', action: 'help-development' }
      );
    } else {
      actions.push(
        { text: 'View my skill gaps', action: 'help-skills' },
        { text: 'Career development tips', action: 'help-career' },
        { text: 'Training recommendations', action: 'help-training' }
      );
    }
    
    // Page-specific actions
    switch (this.currentPage) {
      case 'hr-dashboard':
        actions.push({ text: 'Dashboard features', action: 'help-hr-dashboard' });
        break;
      case 'employee-dashboard':
        actions.push({ text: 'My dashboard guide', action: 'help-employee-dashboard' });
        break;
      case 'profile':
        actions.push({ text: 'Profile management', action: 'help-profile' });
        break;
      case 'recommendations':
        actions.push({ text: 'Understanding recommendations', action: 'help-recommendations' });
        break;
      case 'learning':
        actions.push({ text: 'Learning resources', action: 'help-learning' });
        break;
    }
    
    return actions.slice(0, 4).map(action => 
      `<button class="quick-action-btn" data-action="${action.action}">${action.text}</button>`
    ).join('');
  }
  
  /**
   * Bind event listeners
   */
  bindEvents() {
    const toggle = document.getElementById('chatbot-toggle');
    const close = document.getElementById('chatbot-close');
    const input = document.getElementById('chatbot-message-input');
    const send = document.getElementById('chatbot-send');
    const quickActions = document.getElementById('quick-actions');
    
    toggle.addEventListener('click', () => this.toggleChatbot());
    close.addEventListener('click', () => this.closeChatbot());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    send.addEventListener('click', () => this.sendMessage());
    
    quickActions.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action-btn')) {
        const action = e.target.getAttribute('data-action');
        this.handleQuickAction(action);
      }
    });
    
    // Close chatbot when clicking outside
    document.addEventListener('click', (e) => {
      const chatbotContainer = document.getElementById('chatbot-container');
      if (this.isOpen && !chatbotContainer.contains(e.target)) {
        this.closeChatbot();
      }
    });
  }
  
  /**
   * Toggle chatbot visibility
   */
  toggleChatbot() {
    if (this.isOpen) {
      this.closeChatbot();
    } else {
      this.openChatbot();
    }
  }
  
  /**
   * Open chatbot
   */
  openChatbot() {
    const window = document.getElementById('chatbot-window');
    const badge = document.getElementById('chatbot-badge');
    
    window.classList.add('chatbot-open');
    badge.style.display = 'none';
    this.isOpen = true;
    
    // Focus input
    setTimeout(() => {
      const input = document.getElementById('chatbot-message-input');
      input.focus();
    }, 300);
    
    // Show contextual help if first time opening on this page
    if (!this.hasShownContextualHelp()) {
      this.showContextualHelp();
    }
  }
  
  /**
   * Close chatbot
   */
  closeChatbot() {
    const window = document.getElementById('chatbot-window');
    window.classList.remove('chatbot-open');
    this.isOpen = false;
  }
  
  /**
   * Send user message
   */
  sendMessage() {
    const input = document.getElementById('chatbot-message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    this.addMessage(message, 'user');
    input.value = '';
    
    // Process message and generate response
    this.processMessage(message);
  }
  
  /**
   * Add message to chat
   */
  addMessage(content, sender, isHTML = false) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    if (isHTML) {
      messageContent.innerHTML = content;
    } else {
      messageContent.textContent = content;
    }
    
    messageDiv.appendChild(messageContent);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Add to conversation history
    this.conversationHistory.push({
      content,
      sender,
      timestamp: new Date().toISOString()
    });
    
    this.saveConversationHistory();
  }
  
  /**
   * Process user message and generate response
   */
  async processMessage(message) {
    this.showTypingIndicator();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    
    const response = this.generateResponse(message);
    
    this.hideTypingIndicator();
    this.addMessage(response.content, 'bot', response.isHTML);
    
    // Add follow-up actions if available
    if (response.actions && response.actions.length > 0) {
      this.addFollowUpActions(response.actions);
    }
  }
  
  /**
   * Generate response based on user message
   */
  generateResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    // Check for specific keywords and patterns
    for (const [pattern, response] of Object.entries(this.responses)) {
      if (this.matchesPattern(lowerMessage, pattern)) {
        return this.personalizeResponse(response);
      }
    }
    
    // Default response
    return {
      content: "I understand you're asking about that topic. While I'm still learning, I can help you with career development, skill assessments, training recommendations, and navigating the talent management system. Try asking about specific features or use the quick action buttons!",
      isHTML: false,
      actions: [
        { text: 'View Help Topics', action: 'show-help-topics' },
        { text: 'Contact HR', action: 'contact-hr' }
      ]
    };
  }
  
  /**
   * Check if message matches a pattern
   */
  matchesPattern(message, pattern) {
    const keywords = pattern.split('|');
    return keywords.some(keyword => message.includes(keyword.trim()));
  }
  
  /**
   * Personalize response based on user context
   */
  personalizeResponse(response) {
    let content = response.content;
    
    // Replace placeholders
    content = content.replace('{name}', this.currentUser?.name || 'there');
    content = content.replace('{role}', this.currentUser?.role || 'user');
    content = content.replace('{department}', this.currentUser?.department || 'your department');
    
    return {
      ...response,
      content
    };
  }
  
  /**
   * Handle quick action buttons
   */
  handleQuickAction(action) {
    const actionResponse = this.helpTopics[action];
    
    if (actionResponse) {
      this.addMessage(actionResponse.content, 'bot', actionResponse.isHTML);
      
      if (actionResponse.actions) {
        this.addFollowUpActions(actionResponse.actions);
      }
    }
  }
  
  /**
   * Add follow-up action buttons
   */
  addFollowUpActions(actions) {
    const messagesContainer = document.getElementById('chatbot-messages');
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'follow-up-actions';
    
    actions.forEach(action => {
      const button = document.createElement('button');
      button.className = 'follow-up-btn';
      button.textContent = action.text;
      button.setAttribute('data-action', action.action);
      button.addEventListener('click', () => this.handleQuickAction(action.action));
      actionsDiv.appendChild(button);
    });
    
    messagesContainer.appendChild(actionsDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    if (this.isTyping) return;
    
    this.isTyping = true;
    const messagesContainer = document.getElementById('chatbot-messages');
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typing-indicator';
    typingDiv.className = 'message bot-message typing';
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
    this.isTyping = false;
  }
  
  /**
   * Show contextual help based on current page
   */
  showContextualHelp() {
    const contextualHelp = this.getContextualHelp();
    if (contextualHelp) {
      setTimeout(() => {
        this.addMessage(contextualHelp.content, 'bot', contextualHelp.isHTML);
      }, 1000);
      
      // Mark as shown for this session
      sessionStorage.setItem(`chatbot_help_shown_${this.currentPage}`, 'true');
    }
  }
  
  /**
   * Check if contextual help has been shown for current page
   */
  hasShownContextualHelp() {
    return sessionStorage.getItem(`chatbot_help_shown_${this.currentPage}`) === 'true';
  }
  
  /**
   * Get contextual help for current page
   */
  getContextualHelp() {
    const contextualHelp = {
      'hr-dashboard': {
        content: "I see you're on the HR Dashboard! I can help you understand the 9-box matrix, interpret employee metrics, or guide you through succession planning features.",
        isHTML: false
      },
      'employee-dashboard': {
        content: "Welcome to your dashboard! I can help you understand your IDP progress, skill gaps, or explain your training recommendations.",
        isHTML: false
      },
      'profile': {
        content: "Need help with your profile? I can guide you through updating your skills, adding achievements, or understanding how profile data affects your recommendations.",
        isHTML: false
      },
      'recommendations': {
        content: "Looking at your recommendations? I can explain how they're generated, help you prioritize learning paths, or answer questions about your development plan.",
        isHTML: false
      }
    };
    
    return contextualHelp[this.currentPage];
  }
  
  /**
   * Load conversation history from localStorage
   */
  loadConversationHistory() {
    const history = localStorage.getItem('hr_talent_chatbot_history');
    if (history) {
      try {
        this.conversationHistory = JSON.parse(history);
      } catch (error) {
        console.error('Error loading conversation history:', error);
      }
    }
  }
  
  /**
   * Save conversation history to localStorage
   */
  saveConversationHistory() {
    try {
      // Keep only last 50 messages
      const recentHistory = this.conversationHistory.slice(-50);
      localStorage.setItem('hr_talent_chatbot_history', JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Error saving conversation history:', error);
    }
  }
  
  /**
   * Initialize predefined responses
   */
  initializeResponses() {
    return {
      'hello|hi|hey|greetings': {
        content: "Hello {name}! How can I help you with your career development today?",
        isHTML: false,
        actions: [
          { text: 'View my recommendations', action: 'help-recommendations' },
          { text: 'Check skill gaps', action: 'help-skills' }
        ]
      },
      
      'skill|skills|gap|gaps|assessment': {
        content: "I can help you understand your skill gaps! Your skill assessment shows areas where you can improve to reach your career goals. You can update your skills in your profile and see personalized training recommendations.",
        isHTML: false,
        actions: [
          { text: 'How to update skills?', action: 'help-update-skills' },
          { text: 'View training catalog', action: 'help-training-catalog' }
        ]
      },
      
      'training|course|learning|development': {
        content: "Great question about training! The system provides personalized learning recommendations based on your skill gaps and career goals. You can find internal courses, external training, and track your progress.",
        isHTML: false,
        actions: [
          { text: 'Browse training catalog', action: 'help-training-catalog' },
          { text: 'Track my progress', action: 'help-progress' }
        ]
      },
      
      'career|promotion|advancement|growth': {
        content: "Career development is what we're all about! Your Individual Development Plan (IDP) shows a personalized roadmap to reach your target role. It includes skill development, training recommendations, and timeline milestones.",
        isHTML: false,
        actions: [
          { text: 'View my IDP', action: 'help-idp' },
          { text: 'Career planning tips', action: 'help-career-planning' }
        ]
      },
      
      'nine box|9 box|matrix|performance|potential': {
        content: "The 9-box matrix is a powerful tool for talent assessment! It plots employees based on performance (current results) vs potential (future capability). This helps identify high performers, future leaders, and development needs.",
        isHTML: false,
        actions: [
          { text: 'How to read the matrix?', action: 'help-matrix-reading' },
          { text: 'Succession planning', action: 'help-succession' }
        ]
      },
      
      'recommendation|recommendations|suggest|suggestions': {
        content: "Your recommendations are AI-powered suggestions based on your current skills, target role, and career goals. They include specific training courses, skill development activities, and timeline guidance.",
        isHTML: false,
        actions: [
          { text: 'How are they generated?', action: 'help-ai-recommendations' },
          { text: 'Customize my plan', action: 'help-customize-plan' }
        ]
      },
      
      'profile|update|edit|information': {
        content: "Your profile is the foundation of personalized recommendations! Keep it updated with your latest skills, achievements, and career goals. The more accurate your profile, the better your recommendations.",
        isHTML: false,
        actions: [
          { text: 'Profile best practices', action: 'help-profile-tips' },
          { text: 'Add achievements', action: 'help-achievements' }
        ]
      },
      
      'help|support|how|guide': {
        content: "I'm here to help! I can assist with career development, explain system features, guide you through processes, and answer questions about talent management. What specific area would you like help with?",
        isHTML: false,
        actions: [
          { text: 'System overview', action: 'help-overview' },
          { text: 'Getting started', action: 'help-getting-started' }
        ]
      }
    };
  }
  
  /**
   * Initialize help topics for quick actions
   */
  initializeHelpTopics() {
    return {
      'help-nine-box': {
        content: `<div class="help-content">
          <h4>Understanding the 9-Box Matrix</h4>
          <p>The 9-box matrix evaluates employees on two dimensions:</p>
          <ul>
            <li><strong>Performance:</strong> Current job results and achievements</li>
            <li><strong>Potential:</strong> Ability to take on greater responsibilities</li>
          </ul>
          <p>Each box represents different talent categories:</p>
          <ul>
            <li><strong>Top-right (Stars):</strong> High performers with high potential</li>
            <li><strong>Middle boxes:</strong> Solid contributors with development opportunities</li>
            <li><strong>Bottom-left:</strong> May need performance improvement or role change</li>
          </ul>
        </div>`,
        isHTML: true,
        actions: [
          { text: 'Succession planning tips', action: 'help-succession' },
          { text: 'Employee development', action: 'help-development' }
        ]
      },
      
      'help-succession': {
        content: `<div class="help-content">
          <h4>Succession Planning Best Practices</h4>
          <ul>
            <li>Identify critical roles and potential successors</li>
            <li>Assess readiness levels and development needs</li>
            <li>Create development plans for high-potential employees</li>
            <li>Monitor progress and adjust plans regularly</li>
            <li>Consider both internal and external candidates</li>
          </ul>
          <p>Use the 9-box matrix to identify succession candidates and the recommendation system to create development plans.</p>
        </div>`,
        isHTML: true
      },
      
      'help-skills': {
        content: `<div class="help-content">
          <h4>Understanding Your Skill Gaps</h4>
          <p>Skill gaps are the difference between your current abilities and what's required for your target role.</p>
          <p><strong>To view your skill gaps:</strong></p>
          <ol>
            <li>Go to your Profile → Skills section</li>
            <li>Review your current skill ratings</li>
            <li>Check the Recommendations page for gap analysis</li>
            <li>See suggested training to close gaps</li>
          </ol>
        </div>`,
        isHTML: true,
        actions: [
          { text: 'Update my skills', action: 'help-update-skills' },
          { text: 'View recommendations', action: 'help-recommendations' }
        ]
      },
      
      'help-career': {
        content: `<div class="help-content">
          <h4>Career Development Tips</h4>
          <ul>
            <li><strong>Set clear goals:</strong> Define your target role and timeline</li>
            <li><strong>Assess regularly:</strong> Update your skills and achievements</li>
            <li><strong>Follow your IDP:</strong> Complete recommended training and activities</li>
            <li><strong>Seek feedback:</strong> Get input from managers and mentors</li>
            <li><strong>Network actively:</strong> Build relationships across the organization</li>
          </ul>
        </div>`,
        isHTML: true,
        actions: [
          { text: 'View my IDP', action: 'help-idp' },
          { text: 'Training recommendations', action: 'help-training' }
        ]
      },
      
      'help-training': {
        content: `<div class="help-content">
          <h4>Training Recommendations</h4>
          <p>Your training recommendations are personalized based on:</p>
          <ul>
            <li>Your current skill levels</li>
            <li>Target role requirements</li>
            <li>Learning preferences</li>
            <li>Available time and resources</li>
          </ul>
          <p>Find your recommendations in the Learning section or on your dashboard.</p>
        </div>`,
        isHTML: true,
        actions: [
          { text: 'Browse catalog', action: 'help-training-catalog' },
          { text: 'Track progress', action: 'help-progress' }
        ]
      },
      
      'show-help-topics': {
        content: `<div class="help-content">
          <h4>Available Help Topics</h4>
          <p>I can help you with:</p>
          <ul>
            <li>Career development and planning</li>
            <li>Skill assessments and gap analysis</li>
            <li>Training recommendations and catalog</li>
            <li>Profile management and updates</li>
            <li>9-box matrix and succession planning</li>
            <li>Individual Development Plans (IDPs)</li>
            <li>System navigation and features</li>
          </ul>
          <p>Just ask me about any of these topics!</p>
        </div>`,
        isHTML: true
      }
    };
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for other components to initialize
  setTimeout(() => {
    window.HRTalentApp = window.HRTalentApp || {};
    window.HRTalentApp.chatbot = new Chatbot();
  }, 1000);
});

// Export for use by other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Chatbot;
}