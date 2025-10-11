/**
 * HR Dashboard JavaScript
 * Handles HR-specific dashboard functionality including metrics, activities, and quick actions
 */

class HRDashboard {
    constructor() {
        this.currentUser = null;
        this.employees = [];
        this.roles = [];
        this.recommendations = [];
        this.metricsGrid = null;
        this.nineBoxMatrix = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing HR Dashboard...');
        
        // Check authentication and role
        if (!this.checkAuthentication()) {
            return;
        }
        
        // Initialize components
        this.initializeComponents();
        
        // Load data
        await this.loadData();
        
        // Render dashboard
        this.renderDashboard();
        
        // Attach event listeners
        this.attachEventListeners();
        
        console.log('HR Dashboard initialized successfully');
    }

    checkAuthentication() {
        this.currentUser = HRData.dataStore.getCurrentUser();
        
        if (!this.currentUser) {
            console.log('No authenticated user, redirecting to login');
            window.location.href = '/pages/auth/login.html';
            return false;
        }
        
        if (this.currentUser.role !== 'hr' && this.currentUser.role !== 'admin') {
            console.log('User not authorized for HR dashboard');
            window.location.href = '/pages/dashboard/employee.html';
            return false;
        }
        
        return true;
    }

    initializeComponents() {
        // Initialize metrics grid
        const metricsContainer = document.getElementById('metricsGrid');
        if (metricsContainer) {
            this.metricsGrid = new CardGrid(metricsContainer, {
                columns: 'auto',
                gap: 'md',
                className: 'metrics-cards'
            });
        }
        
        // Initialize 9-box matrix
        const matrixContainer = document.getElementById('nineBoxMatrix');
        if (matrixContainer && window.NineBoxMatrix) {
            this.nineBoxMatrix = new NineBoxMatrix(matrixContainer, {
                onEmployeeClick: (employee) => this.onEmployeeSelected(employee),
                onPositionChange: (employee, newPosition) => this.onMatrixPositionChanged(employee, newPosition),
                showTooltips: true,
                allowDrag: true
            });
        }
    }

    async loadData() {
        try {
            // Load all employees
            this.employees = HRData.userService.getAll();
            
            // Load roles
            this.roles = HRData.roleService.getAll();
            
            // Load recommendations
            this.recommendations = HRData.recommendationService.getAll();
            
            console.log(`Loaded ${this.employees.length} employees, ${this.roles.length} roles, ${this.recommendations.length} recommendations`);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.showNotification('Error loading dashboard data', 'error');
        }
    }

    renderDashboard() {
        this.renderMetrics();
        this.renderSuccessionStats();
        this.renderRecentActivities();
        
        // Render 9-box matrix if component is available
        if (this.nineBoxMatrix) {
            this.nineBoxMatrix.render(this.employees);
        }
    }

    renderMetrics() {
        if (!this.metricsGrid) return;
        
        const metrics = this.calculateMetrics();
        
        // Clear existing cards
        this.metricsGrid.clear();
        
        // Create metric cards
        metrics.forEach(metric => {
            this.metricsGrid.addCard({
                type: 'metric',
                icon: metric.icon,
                title: metric.title,
                value: metric.value,
                subtitle: metric.subtitle,
                trend: metric.trend,
                color: metric.color
            });
        });
    }

    calculateMetrics() {
        const totalEmployees = this.employees.length;
        const hrEmployees = this.employees.filter(emp => emp.role === 'hr' || emp.role === 'admin').length;
        const regularEmployees = totalEmployees - hrEmployees;
        
        // Calculate performance metrics
        const highPerformers = this.employees.filter(emp => emp.performance >= 4).length;
        const highPotential = this.employees.filter(emp => emp.potential >= 4).length;
        const topTalent = this.employees.filter(emp => emp.performance >= 4 && emp.potential >= 4).length;
        
        // Calculate succession readiness
        const successionReady = this.employees.filter(emp => 
            emp.performance >= 4 && emp.potential >= 3
        ).length;
        
        // Calculate active recommendations
        const activeRecommendations = this.recommendations.filter(rec => 
            rec.status === 'pending' || rec.status === 'in_progress'
        ).length;
        
        return [
            {
                icon: 'users',
                title: 'Total Employees',
                value: regularEmployees.toString(),
                subtitle: `${hrEmployees} HR staff`,
                color: 'primary',
                trend: null
            },
            {
                icon: 'star',
                title: 'High Performers',
                value: highPerformers.toString(),
                subtitle: `${Math.round((highPerformers / totalEmployees) * 100)}% of workforce`,
                color: 'success',
                trend: {
                    value: '+5%',
                    direction: 'up',
                    label: 'vs last quarter'
                }
            },
            {
                icon: 'trending-up',
                title: 'High Potential',
                value: highPotential.toString(),
                subtitle: `${Math.round((highPotential / totalEmployees) * 100)}% of workforce`,
                color: 'warning',
                trend: {
                    value: '+2%',
                    direction: 'up',
                    label: 'vs last quarter'
                }
            },
            {
                icon: 'award',
                title: 'Top Talent',
                value: topTalent.toString(),
                subtitle: 'High performance & potential',
                color: 'success',
                trend: null
            },
            {
                icon: 'target',
                title: 'Succession Ready',
                value: successionReady.toString(),
                subtitle: 'Ready for promotion',
                color: 'primary',
                trend: {
                    value: '+3',
                    direction: 'up',
                    label: 'new this month'
                }
            },
            {
                icon: 'clipboard-list',
                title: 'Active IDPs',
                value: activeRecommendations.toString(),
                subtitle: 'In progress development plans',
                color: 'warning',
                trend: null
            }
        ];
    }

    renderSuccessionStats() {
        const container = document.getElementById('successionStats');
        if (!container) return;
        
        const stats = this.calculateSuccessionStats();
        
        container.innerHTML = stats.map(stat => `
            <div class="succession-stat">
                <div class="stat-info">
                    <div class="stat-label">${stat.label}</div>
                    <div class="stat-value">${stat.value}</div>
                </div>
                <div class="stat-indicator ${stat.level}"></div>
            </div>
        `).join('');
    }

    calculateSuccessionStats() {
        const totalEmployees = this.employees.length;
        
        // Calculate succession readiness by category
        const readyNow = this.employees.filter(emp => 
            emp.performance >= 4 && emp.potential >= 4
        ).length;
        
        const ready1to2Years = this.employees.filter(emp => 
            emp.performance >= 3 && emp.potential >= 4
        ).length;
        
        const ready3to5Years = this.employees.filter(emp => 
            emp.performance >= 3 && emp.potential >= 3
        ).length;
        
        const needsDevelopment = totalEmployees - readyNow - ready1to2Years - ready3to5Years;
        
        return [
            {
                label: 'Ready Now',
                value: readyNow,
                level: readyNow > 0 ? 'high' : 'low'
            },
            {
                label: 'Ready 1-2 Years',
                value: ready1to2Years,
                level: ready1to2Years > 2 ? 'high' : ready1to2Years > 0 ? 'medium' : 'low'
            },
            {
                label: 'Ready 3-5 Years',
                value: ready3to5Years,
                level: ready3to5Years > 5 ? 'high' : ready3to5Years > 2 ? 'medium' : 'low'
            },
            {
                label: 'Needs Development',
                value: needsDevelopment,
                level: needsDevelopment < 3 ? 'high' : needsDevelopment < 6 ? 'medium' : 'low'
            }
        ];
    }

    renderRecentActivities() {
        const container = document.getElementById('activitiesList');
        if (!container) return;
        
        const activities = this.generateRecentActivities();
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p class="empty-message">No recent activities</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon ${activity.type}">
                    ${activity.icon}
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    generateRecentActivities() {
        const activities = [];
        
        // Generate sample activities based on current data
        const recentRecommendations = this.recommendations
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);
        
        recentRecommendations.forEach(rec => {
            const employee = this.employees.find(emp => emp.id === rec.employeeId);
            if (employee) {
                activities.push({
                    icon: '💡',
                    type: 'info',
                    title: 'New IDP Generated',
                    description: `Development plan created for ${employee.name}`,
                    time: this.formatTimeAgo(rec.createdAt)
                });
            }
        });
        
        // Add some sample activities
        activities.push(
            {
                icon: '⭐',
                type: 'success',
                title: 'Performance Review Completed',
                description: 'Q4 reviews completed for Engineering team',
                time: '2 hours ago'
            },
            {
                icon: '📊',
                type: 'info',
                title: 'Skills Assessment Updated',
                description: '5 employees completed skill assessments',
                time: '4 hours ago'
            },
            {
                icon: '🎯',
                type: 'warning',
                title: 'Succession Gap Identified',
                description: 'Senior Developer role needs succession planning',
                time: '1 day ago'
            }
        );
        
        return activities.slice(0, 5);
    }

    attachEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshDashboard());
        }
        
        // Add employee button
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        if (addEmployeeBtn) {
            addEmployeeBtn.addEventListener('click', () => this.handleAddEmployee());
        }
        
        // Test notification button
        const testNotificationBtn = document.getElementById('testNotificationBtn');
        if (testNotificationBtn) {
            testNotificationBtn.addEventListener('click', () => this.handleTestNotification());
        }
        
        // Matrix fullscreen button
        const matrixFullscreenBtn = document.getElementById('matrixFullscreenBtn');
        if (matrixFullscreenBtn) {
            matrixFullscreenBtn.addEventListener('click', () => this.handleMatrixFullscreen());
        }
        
        // Quick action buttons
        const quickActions = document.querySelectorAll('.action-btn[data-action]');
        quickActions.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.currentTarget.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    async refreshDashboard() {
        console.log('Refreshing dashboard data...');
        
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<span class="loading"></span> Refreshing...';
        }
        
        try {
            await this.loadData();
            this.renderDashboard();
            this.showNotification('Dashboard refreshed successfully', 'success');
        } catch (error) {
            console.error('Error refreshing dashboard:', error);
            this.showNotification('Error refreshing dashboard', 'error');
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<span>🔄</span> Refresh Data';
            }
        }
    }

    handleAddEmployee() {
        // Navigate to employee registration page
        window.location.href = '/pages/auth/register.html';
    }

    handleMatrixFullscreen() {
        // Navigate to full 9-box matrix page
        window.location.href = '/pages/matrix/nine-box.html';
    }

    handleQuickAction(action) {
        console.log('Quick action clicked:', action);
        
        const actionRoutes = {
            'generate-reports': '/pages/reports/analytics.html',
            'review-idps': '/pages/recommendations/overview.html',
            'manage-roles': '/pages/roles/library.html',
            'view-analytics': '/pages/reports/analytics.html'
        };
        
        const route = actionRoutes[action];
        if (route) {
            window.location.href = route;
        } else {
            this.showNotification(`${action} feature coming soon!`, 'info');
        }
    }
    
    handleTestNotification() {
        if (window.notificationSystem) {
            const testNotifications = [
                {
                    type: 'training_deadline',
                    title: 'Training Deadline Approaching',
                    message: 'Complete "Leadership Fundamentals" by March 15th',
                    priority: 'high'
                },
                {
                    type: 'recommendation',
                    title: 'New Development Recommendation',
                    message: 'Based on your profile, we recommend "Data Analysis with Python"',
                    priority: 'medium'
                },
                {
                    type: 'achievement',
                    title: 'Skill Assessment Completed',
                    message: 'Your JavaScript skills have been updated to Level 4',
                    priority: 'low'
                },
                {
                    type: 'system_update',
                    title: 'New Employee Onboarded',
                    message: 'Sarah Johnson has completed her profile setup',
                    priority: 'medium'
                }
            ];
            
            const randomNotification = testNotifications[Math.floor(Math.random() * testNotifications.length)];
            window.notificationSystem.addNotification(randomNotification);
        } else {
            console.log('Notification system not available');
            this.showNotification('Test notification sent!', 'info');
        }
    }

    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    }

    showNotification(message, type = 'info') {
        // Use the global app notification system
        if (window.HRTalentApp && window.HRTalentApp.app) {
            window.HRTalentApp.app.showNotification(message, type);
        } else {
            console.log(`Notification (${type}): ${message}`);
        }
    }

    // Method to handle employee selection from 9-box matrix
    onEmployeeSelected(employee) {
        console.log('Employee selected from matrix:', employee.name);
        
        // Show employee details modal or navigate to profile
        this.showEmployeeDetails(employee);
    }

    showEmployeeDetails(employee) {
        // For now, navigate to employee profile
        // In a real app, this might show a modal with quick actions
        window.location.href = `/pages/profile/view.html?id=${employee.id}`;
    }

    // Method to handle matrix position changes
    onMatrixPositionChanged(employee, newPosition) {
        console.log(`Employee ${employee.name} moved to position:`, newPosition);
        
        // Update employee performance/potential scores
        try {
            const updatedEmployee = {
                ...employee,
                performance: newPosition.performance,
                potential: newPosition.potential,
                updatedAt: new Date().toISOString()
            };
            
            HRData.userService.update(employee.id, updatedEmployee);
            
            // Refresh metrics to reflect changes
            this.renderMetrics();
            this.renderSuccessionStats();
            
            this.showNotification(`Updated ${employee.name}'s position in 9-box matrix`, 'success');
        } catch (error) {
            console.error('Error updating employee position:', error);
            this.showNotification('Error updating employee position', 'error');
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the HR dashboard page
    if (window.location.pathname.includes('/dashboard/hr.html')) {
        window.hrDashboard = new HRDashboard();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HRDashboard;
}