/**
 * HR Talent Management System - Notification Component
 * Manages training deadlines, updates, and system notifications
 */
class NotificationSystem {
    constructor() {
        this.notifications = [];
        this.preferences = {
            trainingDeadlines: true,
            systemUpdates: true,
            recommendations: true,
            achievements: true
        };
        this.storageKey = 'hr_notifications';
        this.preferencesKey = 'hr_notification_preferences';
        this.init();
    }

    init() {
        this.loadNotifications();
        this.loadPreferences();
        this.generateSampleNotifications();
        this.render();
        this.attachEventListeners();
        this.startPeriodicCheck();
    }

    loadNotifications() {
        const stored = localStorage.getItem(this.storageKey);
        this.notifications = stored ? JSON.parse(stored) : [];
    }

    loadPreferences() {
        const stored = localStorage.getItem(this.preferencesKey);
        if (stored) {
            this.preferences = { ...this.preferences, ...JSON.parse(stored) };
        }
    }

    saveNotifications() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    }

    savePreferences() {
        localStorage.setItem(this.preferencesKey, JSON.stringify(this.preferences));
    }

    generateSampleNotifications() {
        const currentUser = this.getCurrentUser();
        if (!currentUser || this.notifications.length > 0) return;

        const sampleNotifications = [
            {
                id: 'notif_1',
                type: 'training_deadline',
                title: 'Training Deadline Approaching',
                message: 'Complete "Leadership Fundamentals" by March 15th',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
                read: false,
                priority: 'high',
                actionUrl: '/pages/learning/progress.html'
            },
            {
                id: 'notif_2',
                type: 'recommendation',
                title: 'New Development Recommendation',
                message: 'Based on your profile, we recommend "Data Analysis with Python"',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
                read: false,
                priority: 'medium',
                actionUrl: '/pages/recommendations/overview.html'
            },
            {
                id: 'notif_3',
                type: 'achievement',
                title: 'Skill Assessment Completed',
                message: 'Your JavaScript skills have been updated to Level 4',
                timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
                read: true,
                priority: 'low',
                actionUrl: '/pages/profile/skills.html'
            }
        ];

        if (currentUser.role === 'hr') {
            sampleNotifications.push({
                id: 'notif_4',
                type: 'system_update',
                title: 'New Employee Onboarded',
                message: 'Sarah Johnson has completed her profile setup',
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
                read: false,
                priority: 'medium',
                actionUrl: '/pages/profile/view.html?id=sarah_johnson'
            });
        }

        this.notifications = sampleNotifications;
        this.saveNotifications();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('hr_current_user');
        return userData ? JSON.parse(userData) : null;
    }

    addNotification(notification) {
        const newNotification = {
            id: `notif_${Date.now()}`,
            timestamp: new Date(),
            read: false,
            priority: 'medium',
            ...notification
        };
        
        this.notifications.unshift(newNotification);
        this.saveNotifications();
        this.updateBadge();
        this.showToast(newNotification);
    }

    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            this.saveNotifications();
            this.updateBadge();
            this.render();
        }
    }

    markAllAsRead() {
        this.notifications.forEach(n => n.read = true);
        this.saveNotifications();
        this.updateBadge();
        this.render();
    }

    deleteNotification(notificationId) {
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.saveNotifications();
        this.updateBadge();
        this.render();
    }

    getUnreadCount() {
        return this.notifications.filter(n => !n.read).length;
    }

    render() {
        this.renderNotificationBell();
        this.renderNotificationDropdown();
        this.updateBadge();
    }

    renderNotificationBell() {
        const existingBell = document.querySelector('.notification-bell');
        if (existingBell) return;

        const navUser = document.querySelector('.nav-user');
        if (!navUser) return;

        const bellHTML = `
            <div class="notification-bell" id="notificationBell">
                <span class="bell-icon">🔔</span>
                <span class="notification-badge" id="notificationBadge">0</span>
            </div>
        `;

        navUser.insertAdjacentHTML('afterbegin', bellHTML);
    }

    renderNotificationDropdown() {
        const existingDropdown = document.getElementById('notificationDropdown');
        if (existingDropdown) {
            existingDropdown.innerHTML = this.generateDropdownHTML();
            return;
        }

        const navUser = document.querySelector('.nav-user');
        if (!navUser) return;

        const dropdownHTML = `
            <div class="notification-dropdown" id="notificationDropdown">
                ${this.generateDropdownHTML()}
            </div>
        `;

        navUser.insertAdjacentHTML('beforeend', dropdownHTML);
    }

    generateDropdownHTML() {
        const unreadCount = this.getUnreadCount();
        const recentNotifications = this.notifications.slice(0, 10);

        return `
            <div class="notification-header">
                <h3>Notifications</h3>
                <div class="notification-actions">
                    ${unreadCount > 0 ? `<button class="mark-all-read-btn" id="markAllReadBtn">Mark all read</button>` : ''}
                    <button class="settings-btn" id="notificationSettingsBtn">⚙️</button>
                </div>
            </div>
            
            <div class="notification-list">
                ${recentNotifications.length > 0 ? 
                    recentNotifications.map(notification => this.generateNotificationHTML(notification)).join('') :
                    '<div class="no-notifications">No notifications</div>'
                }
            </div>
            
            ${this.notifications.length > 10 ? 
                '<div class="notification-footer"><a href="#" class="view-all-link">View all notifications</a></div>' : 
                ''
            }
        `;
    }

    generateNotificationHTML(notification) {
        const timeAgo = this.getTimeAgo(notification.timestamp);
        const priorityClass = `priority-${notification.priority}`;
        const readClass = notification.read ? 'read' : 'unread';

        return `
            <div class="notification-item ${readClass} ${priorityClass}" data-id="${notification.id}">
                <div class="notification-icon">
                    ${this.getNotificationIcon(notification.type)}
                </div>
                <div class="notification-content">
                    <div class="notification-title">${notification.title}</div>
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">${timeAgo}</div>
                </div>
                <div class="notification-actions">
                    ${!notification.read ? '<button class="mark-read-btn" title="Mark as read">✓</button>' : ''}
                    <button class="delete-btn" title="Delete">×</button>
                </div>
            </div>
        `;
    }

    getNotificationIcon(type) {
        const icons = {
            training_deadline: '⏰',
            recommendation: '💡',
            achievement: '🏆',
            system_update: '📢',
            reminder: '📝'
        };
        return icons[type] || '📢';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInSeconds = Math.floor((now - time) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return time.toLocaleDateString();
    }

    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;

        const unreadCount = this.getUnreadCount();
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }

    showToast(notification) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="toast-icon">${this.getNotificationIcon(notification.type)}</div>
            <div class="toast-content">
                <div class="toast-title">${notification.title}</div>
                <div class="toast-message">${notification.message}</div>
            </div>
            <button class="toast-close">×</button>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 5000);

        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });
    }

    attachEventListeners() {
        // Notification bell click
        document.addEventListener('click', (e) => {
            if (e.target.closest('#notificationBell')) {
                e.stopPropagation();
                this.toggleDropdown();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.notification-dropdown') && !e.target.closest('#notificationBell')) {
                this.closeDropdown();
            }
        });

        // Notification item clicks
        document.addEventListener('click', (e) => {
            const notificationItem = e.target.closest('.notification-item');
            if (!notificationItem) return;

            const notificationId = notificationItem.dataset.id;
            
            if (e.target.classList.contains('mark-read-btn')) {
                e.stopPropagation();
                this.markAsRead(notificationId);
            } else if (e.target.classList.contains('delete-btn')) {
                e.stopPropagation();
                this.deleteNotification(notificationId);
            } else {
                // Click on notification item - mark as read and navigate
                this.markAsRead(notificationId);
                const notification = this.notifications.find(n => n.id === notificationId);
                if (notification && notification.actionUrl) {
                    window.location.href = notification.actionUrl;
                }
            }
        });

        // Mark all as read
        document.addEventListener('click', (e) => {
            if (e.target.id === 'markAllReadBtn') {
                this.markAllAsRead();
            }
        });

        // Settings button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'notificationSettingsBtn') {
                this.showSettings();
            }
        });
    }

    toggleDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (!dropdown) return;

        dropdown.classList.toggle('show');
    }

    closeDropdown() {
        const dropdown = document.getElementById('notificationDropdown');
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    showSettings() {
        const modal = document.createElement('div');
        modal.className = 'notification-settings-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Notification Preferences</h3>
                    <button class="modal-close">×</button>
                </div>
                <div class="modal-body">
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" ${this.preferences.trainingDeadlines ? 'checked' : ''} data-pref="trainingDeadlines">
                            Training Deadlines
                        </label>
                        <p>Get notified about upcoming training deadlines</p>
                    </div>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" ${this.preferences.systemUpdates ? 'checked' : ''} data-pref="systemUpdates">
                            System Updates
                        </label>
                        <p>Receive notifications about system changes and updates</p>
                    </div>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" ${this.preferences.recommendations ? 'checked' : ''} data-pref="recommendations">
                            Recommendations
                        </label>
                        <p>Get notified about new development recommendations</p>
                    </div>
                    <div class="preference-item">
                        <label>
                            <input type="checkbox" ${this.preferences.achievements ? 'checked' : ''} data-pref="achievements">
                            Achievements
                        </label>
                        <p>Receive notifications about completed achievements</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" id="cancelSettings">Cancel</button>
                    <button class="btn btn-primary" id="saveSettings">Save Preferences</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        setTimeout(() => modal.classList.add('show'), 100);

        // Event listeners for modal
        modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#cancelSettings').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#saveSettings').addEventListener('click', () => this.saveSettingsFromModal(modal));
    }

    closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => modal.remove(), 300);
    }

    saveSettingsFromModal(modal) {
        const checkboxes = modal.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const pref = checkbox.dataset.pref;
            this.preferences[pref] = checkbox.checked;
        });
        
        this.savePreferences();
        this.closeModal(modal);
        this.showToast({
            type: 'system_update',
            title: 'Settings Saved',
            message: 'Your notification preferences have been updated'
        });
    }

    startPeriodicCheck() {
        // Check for new notifications every 5 minutes
        setInterval(() => {
            this.checkForNewNotifications();
        }, 5 * 60 * 1000);
    }

    checkForNewNotifications() {
        // This would typically check with a server
        // For demo purposes, we'll occasionally add a random notification
        if (Math.random() < 0.1) { // 10% chance every 5 minutes
            const sampleNotifications = [
                {
                    type: 'reminder',
                    title: 'Weekly Check-in',
                    message: 'Don\'t forget to update your development progress',
                    priority: 'low'
                },
                {
                    type: 'training_deadline',
                    title: 'Training Reminder',
                    message: 'You have 2 days left to complete "Project Management Basics"',
                    priority: 'high'
                }
            ];
            
            const randomNotification = sampleNotifications[Math.floor(Math.random() * sampleNotifications.length)];
            this.addNotification(randomNotification);
        }
    }

    // Public API methods
    notify(type, title, message, options = {}) {
        if (!this.preferences[type] && type !== 'system_update') return;
        
        this.addNotification({
            type,
            title,
            message,
            ...options
        });
    }

    notifyTrainingDeadline(courseName, deadline) {
        this.notify('training_deadline', 'Training Deadline', `Complete "${courseName}" by ${deadline}`, {
            priority: 'high',
            actionUrl: '/pages/learning/progress.html'
        });
    }

    notifyNewRecommendation(recommendation) {
        this.notify('recommendation', 'New Recommendation', recommendation, {
            priority: 'medium',
            actionUrl: '/pages/recommendations/overview.html'
        });
    }

    notifyAchievement(achievement) {
        this.notify('achievement', 'Achievement Unlocked', achievement, {
            priority: 'low',
            actionUrl: '/pages/profile/view.html'
        });
    }
}

// Initialize notification system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notificationSystem = new NotificationSystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;