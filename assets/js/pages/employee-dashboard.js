/**
 * Employee Dashboard - JavaScript Module
 * Handles employee-specific dashboard functionality, IDP progress, and recommendations
 */

class EmployeeDashboard {
    constructor() {
        this.currentUser = null;
        this.userRecommendations = [];
        this.skillGaps = {};
        this.idpProgress = null;
        this.init();
    }

    init() {
        // Check authentication
        this.currentUser = this.getCurrentUser();
        if (!this.currentUser || this.currentUser.role !== 'employee') {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        // Initialize dashboard components
        this.loadUserData();
        this.renderPersonalMetrics();
        this.renderIdpProgress();
        this.renderSkillGaps();
        this.renderRecommendations();
        this.attachEventListeners();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('hr_current_user');
        return userData ? JSON.parse(userData) : null;
    }

    loadUserData() {
        // Load user recommendations
        this.userRecommendations = recommendationService.getByEmployeeId(this.currentUser.id);
        
        // Calculate skill gaps from recommendations
        this.calculateSkillGaps();
        
        // Load IDP progress
        this.loadIdpProgress();
    }

    calculateSkillGaps() {
        this.skillGaps = {};
        
        // Get skill gaps from active recommendations
        this.userRecommendations.forEach(rec => {
            if (rec.status === 'accepted' || rec.status === 'in_progress') {
                Object.entries(rec.skillGaps).forEach(([skill, gap]) => {
                    if (!this.skillGaps[skill] || this.skillGaps[skill].priority === 'low') {
                        this.skillGaps[skill] = gap;
                    }
                });
            }
        });
    }

    loadIdpProgress() {
        // Mock IDP progress data - in real app this would come from backend
        this.idpProgress = {
            targetRole: 'Senior Software Engineer',
            timeline: 12, // months
            startDate: new Date('2024-01-01'),
            milestones: [
                {
                    id: 1,
                    title: 'Complete JavaScript Advanced Course',
                    description: 'Master advanced JavaScript concepts and patterns',
                    dueDate: new Date('2024-03-01'),
                    status: 'completed',
                    type: 'training'
                },
                {
                    id: 2,
                    title: 'Lead a Small Project',
                    description: 'Take ownership of a feature development project',
                    dueDate: new Date('2024-06-01'),
                    status: 'in_progress',
                    type: 'experience'
                },
                {
                    id: 3,
                    title: 'Mentor Junior Developer',
                    description: 'Provide guidance and support to a junior team member',
                    dueDate: new Date('2024-08-01'),
                    status: 'pending',
                    type: 'leadership'
                },
                {
                    id: 4,
                    title: 'Complete System Design Course',
                    description: 'Learn system architecture and design patterns',
                    dueDate: new Date('2024-10-01'),
                    status: 'pending',
                    type: 'training'
                }
            ]
        };
    }

    renderPersonalMetrics() {
        const metricsGrid = document.getElementById('personalMetricsGrid');
        if (!metricsGrid) return;

        const cardGrid = new CardGrid(metricsGrid, {
            columns: 3,
            gap: 'md'
        });

        // Calculate metrics
        const completedMilestones = this.idpProgress.milestones.filter(m => m.status === 'completed').length;
        const totalMilestones = this.idpProgress.milestones.length;
        const progressPercentage = Math.round((completedMilestones / totalMilestones) * 100);

        const skillGapCount = Object.keys(this.skillGaps).length;
        const highPriorityGaps = Object.values(this.skillGaps).filter(gap => gap.priority === 'high').length;

        const activeRecommendations = this.userRecommendations.filter(rec => 
            rec.status === 'accepted' || rec.status === 'in_progress'
        ).length;

        // Create metric cards
        const metrics = [
            {
                icon: 'trending-up',
                title: 'IDP Progress',
                value: `${progressPercentage}%`,
                subtitle: `${completedMilestones}/${totalMilestones} milestones`,
                color: progressPercentage >= 75 ? 'success' : progressPercentage >= 50 ? 'warning' : 'primary',
                trend: progressPercentage > 0 ? {
                    value: `+${completedMilestones}`,
                    direction: 'up',
                    label: 'completed'
                } : null
            },
            {
                icon: 'target',
                title: 'Skill Gaps',
                value: skillGapCount.toString(),
                subtitle: `${highPriorityGaps} high priority`,
                color: highPriorityGaps > 0 ? 'warning' : 'success'
            },
            {
                icon: 'book',
                title: 'Active Training',
                value: activeRecommendations.toString(),
                subtitle: 'recommendations',
                color: 'primary'
            }
        ];

        cardGrid.createMetricCards(metrics);
    }

    renderIdpProgress() {
        const container = document.getElementById('idpProgressContainer');
        if (!container || !this.idpProgress) return;

        const progressHTML = `
            <div class="idp-overview">
                <div class="idp-target">
                    <div class="target-role">
                        <span class="target-label">Target Role:</span>
                        <span class="target-value">${this.idpProgress.targetRole}</span>
                    </div>
                    <div class="target-timeline">
                        <span class="timeline-label">Timeline:</span>
                        <span class="timeline-value">${this.idpProgress.timeline} months</span>
                    </div>
                </div>
                <div class="idp-progress-bar">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.calculateIdpProgress()}%"></div>
                    </div>
                    <div class="progress-text">${this.calculateIdpProgress()}% Complete</div>
                </div>
            </div>
            <div class="idp-timeline">
                <h4 class="timeline-title">Development Milestones</h4>
                <div class="timeline-container">
                    ${this.renderTimelineMilestones()}
                </div>
            </div>
        `;

        container.innerHTML = progressHTML;
    }

    calculateIdpProgress() {
        const completed = this.idpProgress.milestones.filter(m => m.status === 'completed').length;
        const total = this.idpProgress.milestones.length;
        return Math.round((completed / total) * 100);
    }

    renderTimelineMilestones() {
        return this.idpProgress.milestones.map(milestone => {
            const statusIcon = this.getMilestoneStatusIcon(milestone.status);
            const typeIcon = this.getMilestoneTypeIcon(milestone.type);
            const isOverdue = new Date() > milestone.dueDate && milestone.status !== 'completed';
            
            return `
                <div class="timeline-item ${milestone.status} ${isOverdue ? 'overdue' : ''}">
                    <div class="timeline-marker">
                        <div class="marker-icon">${statusIcon}</div>
                    </div>
                    <div class="timeline-content">
                        <div class="milestone-header">
                            <div class="milestone-type">
                                <span class="type-icon">${typeIcon}</span>
                                <span class="type-label">${this.formatMilestoneType(milestone.type)}</span>
                            </div>
                            <div class="milestone-date">
                                ${this.formatDate(milestone.dueDate)}
                            </div>
                        </div>
                        <h5 class="milestone-title">${milestone.title}</h5>
                        <p class="milestone-description">${milestone.description}</p>
                        <div class="milestone-actions">
                            ${this.renderMilestoneActions(milestone)}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getMilestoneStatusIcon(status) {
        const icons = {
            completed: '✅',
            in_progress: '🔄',
            pending: '⏳'
        };
        return icons[status] || '⏳';
    }

    getMilestoneTypeIcon(type) {
        const icons = {
            training: '📚',
            experience: '💼',
            leadership: '👥',
            certification: '🏆'
        };
        return icons[type] || '📋';
    }

    formatMilestoneType(type) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    }

    renderMilestoneActions(milestone) {
        switch (milestone.status) {
            case 'completed':
                return '<span class="status-badge completed">Completed</span>';
            case 'in_progress':
                return `
                    <button class="btn btn-sm btn-primary milestone-btn" data-action="update-progress" data-id="${milestone.id}">
                        Update Progress
                    </button>
                `;
            case 'pending':
                return `
                    <button class="btn btn-sm btn-secondary milestone-btn" data-action="start-milestone" data-id="${milestone.id}">
                        Start
                    </button>
                `;
            default:
                return '';
        }
    }

    renderSkillGaps() {
        const container = document.getElementById('skillGapsList');
        if (!container) return;

        if (Object.keys(this.skillGaps).length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🎉</div>
                    <div class="empty-text">No skill gaps identified</div>
                    <div class="empty-subtext">Great job! Keep up the excellent work.</div>
                </div>
            `;
            return;
        }

        const skillGapsHTML = Object.entries(this.skillGaps).map(([skill, gap]) => {
            const progressPercentage = (gap.currentLevel / gap.requiredLevel) * 100;
            const priorityColor = this.getPriorityColor(gap.priority);
            
            return `
                <div class="skill-gap-item">
                    <div class="skill-gap-header">
                        <div class="skill-name">${skill}</div>
                        <div class="skill-levels">
                            <span class="current-level">${gap.currentLevel}</span>
                            <span class="level-separator">/</span>
                            <span class="required-level">${gap.requiredLevel}</span>
                        </div>
                    </div>
                    <div class="skill-gap-progress">
                        <div class="progress-bar">
                            <div class="progress-fill ${priorityColor}" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="priority-badge ${gap.priority}">
                            ${gap.priority.toUpperCase()}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = skillGapsHTML;
    }

    getPriorityColor(priority) {
        const colors = {
            high: 'danger',
            medium: 'warning',
            low: 'success'
        };
        return colors[priority] || 'primary';
    }

    renderRecommendations() {
        const container = document.getElementById('recommendationsList');
        if (!container) return;

        // Get top 3 active recommendations with training details
        const activeRecs = this.userRecommendations
            .filter(rec => rec.status === 'pending' || rec.status === 'accepted')
            .slice(0, 3);

        if (activeRecs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">💡</div>
                    <div class="empty-text">No active recommendations</div>
                    <div class="empty-subtext">Check back later for personalized suggestions</div>
                </div>
            `;
            return;
        }

        const recommendationsHTML = activeRecs.map(rec => {
            const prioritySkills = Object.entries(rec.skillGaps)
                .filter(([_, gap]) => gap.priority === 'high')
                .slice(0, 2);

            // Generate training recommendations for this role
            const trainingItems = this.generateTrainingRecommendations(rec);
            const progress = this.calculateRecommendationProgress(rec);

            return `
                <div class="recommendation-card ${rec.status}" data-rec-id="${rec.id}">
                    <div class="recommendation-header">
                        <div class="recommendation-title">${rec.targetRole}</div>
                        <div class="recommendation-confidence">
                            <span class="confidence-label">Match:</span>
                            <span class="confidence-value">${Math.round(rec.confidence * 100)}%</span>
                        </div>
                    </div>
                    <div class="recommendation-content">
                        <div class="key-skills">
                            <div class="skills-label">Key Skills to Develop:</div>
                            <div class="skills-list">
                                ${prioritySkills.map(([skill, gap]) => `
                                    <span class="skill-tag ${gap.priority}">${skill}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="recommendation-timeline">
                            <span class="timeline-icon">⏱️</span>
                            <span class="timeline-text">${rec.timeline} months timeline</span>
                        </div>
                        ${rec.status === 'accepted' ? `
                            <div class="recommendation-progress">
                                <div class="progress-label">Progress: ${progress}%</div>
                                <div class="progress-bar">
                                    <div class="progress-fill success" style="width: ${progress}%"></div>
                                </div>
                            </div>
                        ` : ''}
                        <div class="training-recommendations">
                            <div class="training-label">Recommended Training:</div>
                            <div class="training-list">
                                ${trainingItems.slice(0, 2).map(training => `
                                    <div class="training-item">
                                        <div class="training-info">
                                            <div class="training-title">${training.title}</div>
                                            <div class="training-meta">
                                                <span class="training-duration">${training.duration}</span>
                                                <span class="training-provider">${training.provider}</span>
                                                <span class="training-priority ${training.priority}">${training.priority.toUpperCase()}</span>
                                            </div>
                                        </div>
                                        <div class="training-actions">
                                            ${this.renderTrainingActions(training, rec)}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="recommendation-actions">
                        ${this.renderRecommendationActions(rec)}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = recommendationsHTML;
    }

    generateTrainingRecommendations(recommendation) {
        // Mock training data based on skill gaps
        const trainingDatabase = {
            'JavaScript': [
                { title: 'Advanced JavaScript Patterns', duration: '4 weeks', provider: 'Internal', priority: 'high' },
                { title: 'JavaScript ES6+ Masterclass', duration: '3 weeks', provider: 'Coursera', priority: 'medium' }
            ],
            'React': [
                { title: 'React Advanced Concepts', duration: '6 weeks', provider: 'Internal', priority: 'high' },
                { title: 'React Performance Optimization', duration: '2 weeks', provider: 'LinkedIn Learning', priority: 'medium' }
            ],
            'Leadership': [
                { title: 'Technical Leadership Fundamentals', duration: '8 weeks', provider: 'Internal', priority: 'high' },
                { title: 'Leading Development Teams', duration: '4 weeks', provider: 'Coursera', priority: 'medium' }
            ],
            'Node.js': [
                { title: 'Node.js Backend Development', duration: '5 weeks', provider: 'Internal', priority: 'medium' },
                { title: 'Microservices with Node.js', duration: '6 weeks', provider: 'Udemy', priority: 'low' }
            ],
            'Problem Solving': [
                { title: 'Algorithm Design & Analysis', duration: '8 weeks', provider: 'Internal', priority: 'medium' },
                { title: 'System Design Fundamentals', duration: '10 weeks', provider: 'Coursera', priority: 'high' }
            ]
        };

        const trainingItems = [];
        Object.keys(recommendation.skillGaps).forEach(skill => {
            if (trainingDatabase[skill]) {
                trainingItems.push(...trainingDatabase[skill]);
            }
        });

        // Sort by priority and return unique items
        return trainingItems
            .filter((item, index, self) => 
                index === self.findIndex(t => t.title === item.title)
            )
            .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
            });
    }

    calculateRecommendationProgress(recommendation) {
        // Mock progress calculation based on completed training and milestones
        if (recommendation.status !== 'accepted') return 0;
        
        // Simulate progress based on time elapsed and activities
        const startDate = new Date(recommendation.createdAt);
        const now = new Date();
        const timeElapsed = (now - startDate) / (1000 * 60 * 60 * 24 * 30); // months
        const timeProgress = Math.min((timeElapsed / recommendation.timeline) * 100, 100);
        
        // Add some randomness for demo purposes
        const activityBonus = Math.random() * 20;
        return Math.min(Math.round(timeProgress + activityBonus), 100);
    }

    renderTrainingActions(training, recommendation) {
        const isStarted = recommendation.status === 'accepted' && Math.random() > 0.5; // Mock started status
        const isCompleted = isStarted && Math.random() > 0.7; // Mock completed status

        if (isCompleted) {
            return `
                <span class="training-status completed">✅ Completed</span>
            `;
        } else if (isStarted) {
            return `
                <button class="btn btn-xs btn-primary training-btn" 
                        data-action="continue-training" 
                        data-training="${training.title}" 
                        data-rec-id="${recommendation.id}">
                    Continue
                </button>
            `;
        } else {
            return `
                <button class="btn btn-xs btn-secondary training-btn" 
                        data-action="start-training" 
                        data-training="${training.title}" 
                        data-rec-id="${recommendation.id}">
                    Start
                </button>
            `;
        }
    }

    renderRecommendationActions(recommendation) {
        switch (recommendation.status) {
            case 'pending':
                return `
                    <button class="btn btn-sm btn-success rec-btn" data-action="accept" data-id="${recommendation.id}">
                        <span>✅</span> Accept
                    </button>
                    <button class="btn btn-sm btn-secondary rec-btn" data-action="view-details" data-id="${recommendation.id}">
                        <span>👁️</span> Details
                    </button>
                `;
            case 'accepted':
                return `
                    <button class="btn btn-sm btn-primary rec-btn" data-action="view-progress" data-id="${recommendation.id}">
                        <span>📈</span> View Progress
                    </button>
                    <button class="btn btn-sm btn-secondary rec-btn" data-action="view-details" data-id="${recommendation.id}">
                        <span>👁️</span> Details
                    </button>
                `;
            default:
                return `
                    <button class="btn btn-sm btn-secondary rec-btn" data-action="view-details" data-id="${recommendation.id}">
                        <span>👁️</span> Details
                    </button>
                `;
        }
    }

    attachEventListeners() {
        // Header actions
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }

        const viewIdpBtn = document.getElementById('viewIdpBtn');
        if (viewIdpBtn) {
            viewIdpBtn.addEventListener('click', () => {
                window.location.href = '/pages/recommendations/idp.html';
            });
        }
        
        // Test notification button
        const testNotificationBtn = document.getElementById('testNotificationBtn');
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => this.handleTestNotification());
        }

        const editIdpBtn = document.getElementById('editIdpBtn');
        if (editIdpBtn) {
            editIdpBtn.addEventListener('click', () => {
                window.location.href = '/pages/recommendations/idp.html?edit=true';
            });
        }

        // Quick actions
        const quickActions = document.getElementById('quickActions');
        if (quickActions) {
            quickActions.addEventListener('click', (e) => {
                const actionBtn = e.target.closest('.action-btn');
                if (actionBtn) {
                    this.handleQuickAction(actionBtn.dataset.action);
                }
            });
        }

        // Milestone actions
        document.addEventListener('click', (e) => {
            const milestoneBtn = e.target.closest('.milestone-btn');
            if (milestoneBtn) {
                this.handleMilestoneAction(
                    milestoneBtn.dataset.action,
                    milestoneBtn.dataset.id
                );
            }

            const recBtn = e.target.closest('.rec-btn');
            if (recBtn) {
                this.handleRecommendationAction(
                    recBtn.dataset.action,
                    recBtn.dataset.id
                );
            }

            const trainingBtn = e.target.closest('.training-btn');
            if (trainingBtn) {
                this.handleTrainingAction(
                    trainingBtn.dataset.action,
                    trainingBtn.dataset.training,
                    trainingBtn.dataset.recId
                );
            }
        });
    }

    handleQuickAction(action) {
        const actions = {
            'update-skills': () => window.location.href = '/pages/profile/skills.html',
            'view-profile': () => window.location.href = '/pages/profile/view.html',
            'browse-training': () => window.location.href = '/pages/learning/catalog.html',
            'view-progress': () => window.location.href = '/pages/learning/progress.html'
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    handleMilestoneAction(action, milestoneId) {
        const milestone = this.idpProgress.milestones.find(m => m.id == milestoneId);
        if (!milestone) return;

        switch (action) {
            case 'start-milestone':
                milestone.status = 'in_progress';
                this.showNotification('Milestone started!', 'success');
                this.renderIdpProgress();
                break;
            case 'update-progress':
                // In a real app, this would open a progress update modal
                this.showNotification('Progress update feature coming soon!', 'info');
                break;
        }
    }

    handleRecommendationAction(action, recommendationId) {
        const recommendation = this.userRecommendations.find(r => r.id === recommendationId);
        if (!recommendation) return;

        switch (action) {
            case 'accept':
                recommendation.status = 'accepted';
                recommendationService.update(recommendationId, recommendation);
                this.showNotification('Recommendation accepted! Training plan activated.', 'success');
                this.renderRecommendations();
                this.renderPersonalMetrics(); // Update metrics
                break;
            case 'view-details':
                window.location.href = `/pages/recommendations/overview.html?id=${recommendationId}`;
                break;
            case 'view-progress':
                window.location.href = `/pages/learning/progress.html?rec=${recommendationId}`;
                break;
        }
    }

    handleTrainingAction(action, trainingTitle, recommendationId) {
        const recommendation = this.userRecommendations.find(r => r.id === recommendationId);
        if (!recommendation) return;

        switch (action) {
            case 'start-training':
                this.showNotification(`Starting "${trainingTitle}"...`, 'info');
                // In a real app, this would integrate with learning management system
                setTimeout(() => {
                    this.showNotification(`"${trainingTitle}" has been added to your learning path!`, 'success');
                    this.renderRecommendations(); // Re-render to show updated status
                }, 1500);
                break;
            case 'continue-training':
                this.showNotification(`Continuing "${trainingTitle}"...`, 'info');
                // Navigate to training content or learning platform
                window.location.href = `/pages/learning/catalog.html?course=${encodeURIComponent(trainingTitle)}`;
                break;
            case 'view-training-details':
                // Show training details modal or navigate to details page
                this.showTrainingDetails(trainingTitle, recommendationId);
                break;
        }
    }

    showTrainingDetails(trainingTitle, recommendationId) {
        // Mock training details - in real app this would fetch from API
        const trainingDetails = {
            title: trainingTitle,
            description: `Comprehensive training program for ${trainingTitle}`,
            duration: '4-6 weeks',
            format: 'Online, self-paced',
            prerequisites: 'Basic understanding of the subject',
            outcomes: ['Skill improvement', 'Certification', 'Career advancement']
        };

        // Create and show modal (simplified version)
        const modal = document.createElement('div');
        modal.className = 'training-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${trainingDetails.title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p><strong>Description:</strong> ${trainingDetails.description}</p>
                    <p><strong>Duration:</strong> ${trainingDetails.duration}</p>
                    <p><strong>Format:</strong> ${trainingDetails.format}</p>
                    <p><strong>Prerequisites:</strong> ${trainingDetails.prerequisites}</p>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.training-modal').remove()">
                        Enroll Now
                    </button>
                    <button class="btn btn-secondary" onclick="this.closest('.training-modal').remove()">
                        Close
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal when clicking outside or on close button
        modal.addEventListener('click', (e) => {
            if (e.target === modal || e.target.classList.contains('modal-close')) {
                modal.remove();
            }
        });
    }

    refreshDashboard() {
        this.showNotification('Refreshing dashboard...', 'info');
        
        // Reload data
        this.loadUserData();
        
        // Re-render components
        this.renderPersonalMetrics();
        this.renderIdpProgress();
        this.renderSkillGaps();
        this.renderRecommendations();
        
        setTimeout(() => {
            this.showNotification('Dashboard refreshed!', 'success');
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    handleTestNotification() {
        if (window.notificationSystem) {
            const testNotifications = [
                {
                    type: 'training_deadline',
                    title: 'Training Deadline Approaching',
                    message: 'Complete "React Advanced Concepts" by March 20th',
                    priority: 'high'
                },
                {
                    type: 'recommendation',
                    title: 'New Development Recommendation',
                    message: 'Based on your IDP, we recommend "System Design Fundamentals"',
                    priority: 'medium'
                },
                {
                    type: 'achievement',
                    title: 'Milestone Completed',
                    message: 'You have completed "Lead a Small Project" milestone',
                    priority: 'low'
                },
                {
                    type: 'reminder',
                    title: 'Weekly Check-in',
                    message: 'Don\'t forget to update your development progress',
                    priority: 'low'
                }
            ];
            
            const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
            window.notificationSystem.addNotification(randomNotification);
        } else {
            console.log('Notification system not available');
            this.showNotification('Test notification sent!', 'info');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EmployeeDashboard();
});