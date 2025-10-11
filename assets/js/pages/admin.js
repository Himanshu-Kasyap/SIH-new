// Admin Settings Page JavaScript

class AdminManager {
    constructor() {
        this.currentTab = 'users';
        this.users = [];
        this.roles = [];
        this.permissions = [];
        this.aiConfig = {};
        this.feedback = [];
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupTabs();
        this.renderUsers();
        this.renderRoles();
        this.renderPermissions();
        this.loadAIConfig();
        this.renderFeedback();
    }

    loadData() {
        // Load users from storage
        const storedUsers = localStorage.getItem('hr_users');
        this.users = storedUsers ? JSON.parse(storedUsers) : this.getDefaultUsers();
        
        // Load roles from storage
        const storedRoles = localStorage.getItem('hr_roles');
        this.roles = storedRoles ? JSON.parse(storedRoles) : this.getDefaultRoles();
        
        // Load permissions
        this.permissions = this.getDefaultPermissions();
        
        // Load AI config
        const storedConfig = localStorage.getItem('hr_ai_config');
        this.aiConfig = storedConfig ? JSON.parse(storedConfig) : this.getDefaultAIConfig();
        
        // Load feedback
        const storedFeedback = localStorage.getItem('hr_feedback');
        this.feedback = storedFeedback ? JSON.parse(storedFeedback) : [];
    }

    getDefaultUsers() {
        return [
            {
                id: 'admin-1',
                name: 'System Administrator',
                email: 'admin@company.com',
                role: 'admin',
                department: 'IT',
                position: 'System Administrator',
                status: 'active',
                lastLogin: new Date().toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: 'hr-1',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@company.com',
                role: 'hr',
                department: 'Human Resources',
                position: 'HR Manager',
                status: 'active',
                lastLogin: new Date(Date.now() - 86400000).toISOString(),
                createdAt: new Date(Date.now() - 2592000000).toISOString()
            }
        ];
    }

    getDefaultRoles() {
        return [
            {
                id: 'admin',
                title: 'Administrator',
                department: 'IT',
                level: 'director',
                description: 'Full system access and user management capabilities'
            },
            {
                id: 'hr',
                title: 'HR Manager',
                department: 'Human Resources',
                level: 'manager',
                description: 'Manage employee data, succession planning, and talent development'
            },
            {
                id: 'employee',
                title: 'Employee',
                department: 'Various',
                level: 'entry',
                description: 'Standard employee access to personal development features'
            }
        ];
    }

    getDefaultPermissions() {
        return [
            { feature: 'User Management', admin: true, hr: false, employee: false },
            { feature: 'Role Management', admin: true, hr: false, employee: false },
            { feature: 'AI Configuration', admin: true, hr: false, employee: false },
            { feature: 'View All Employees', admin: true, hr: true, employee: false },
            { feature: 'Edit Employee Profiles', admin: true, hr: true, employee: false },
            { feature: 'View 9-Box Matrix', admin: true, hr: true, employee: false },
            { feature: 'Create IDPs', admin: true, hr: true, employee: false },
            { feature: 'View Reports', admin: true, hr: true, employee: false },
            { feature: 'Manage Training Catalog', admin: true, hr: true, employee: false },
            { feature: 'View Own Profile', admin: true, hr: true, employee: true },
            { feature: 'Edit Own Profile', admin: true, hr: true, employee: true },
            { feature: 'View Own IDP', admin: true, hr: true, employee: true },
            { feature: 'Complete Training', admin: true, hr: true, employee: true },
            { feature: 'Provide Feedback', admin: true, hr: true, employee: true }
        ];
    }

    getDefaultAIConfig() {
        return {
            openaiApiKey: '',
            modelName: 'gpt-3.5-turbo',
            performanceWeight: 50,
            potentialWeight: 50,
            recommendationThreshold: 70,
            maxRecommendations: 5
        };
    }

    setupEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // User management
        document.getElementById('add-user-btn').addEventListener('click', () => {
            this.openUserModal();
        });

        document.getElementById('user-search').addEventListener('input', (e) => {
            this.filterUsers(e.target.value);
        });

        document.getElementById('role-filter').addEventListener('change', (e) => {
            this.filterUsers(document.getElementById('user-search').value, e.target.value);
        });

        // User form
        document.getElementById('user-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveUser();
        });

        document.getElementById('cancel-user').addEventListener('click', () => {
            this.closeUserModal();
        });

        // Role management
        document.getElementById('add-role-btn').addEventListener('click', () => {
            this.openRoleModal();
        });

        document.getElementById('role-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveRole();
        });

        document.getElementById('cancel-role').addEventListener('click', () => {
            this.closeRoleModal();
        });

        // AI Configuration
        document.getElementById('ai-config-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveAIConfig();
        });

        // Range inputs
        document.querySelectorAll('input[type="range"]').forEach(range => {
            range.addEventListener('input', (e) => {
                const valueSpan = e.target.nextElementSibling;
                if (valueSpan && valueSpan.classList.contains('range-value')) {
                    valueSpan.textContent = e.target.value + '%';
                }
            });
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.classList.remove('active');
            });
        });

        // Close modals on backdrop click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Permissions checkboxes
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('permission-checkbox')) {
                this.updatePermission(e.target);
            }
        });

        // Feedback filters
        const feedbackTypeFilter = document.getElementById('feedback-type-filter');
        const feedbackStatusFilter = document.getElementById('feedback-status-filter');
        const feedbackPriorityFilter = document.getElementById('feedback-priority-filter');
        
        if (feedbackTypeFilter) {
            feedbackTypeFilter.addEventListener('change', () => this.filterFeedback());
        }
        if (feedbackStatusFilter) {
            feedbackStatusFilter.addEventListener('change', () => this.filterFeedback());
        }
        if (feedbackPriorityFilter) {
            feedbackPriorityFilter.addEventListener('change', () => this.filterFeedback());
        }

        // Feedback modal actions
        const closeFeedbackBtn = document.getElementById('close-feedback');
        const rejectFeedbackBtn = document.getElementById('reject-feedback');
        const implementFeedbackBtn = document.getElementById('implement-feedback');
        
        if (closeFeedbackBtn) {
            closeFeedbackBtn.addEventListener('click', () => {
                document.getElementById('feedback-modal').classList.remove('active');
            });
        }
        if (rejectFeedbackBtn) {
            rejectFeedbackBtn.addEventListener('click', () => this.updateFeedbackStatus('rejected'));
        }
        if (implementFeedbackBtn) {
            implementFeedbackBtn.addEventListener('click', () => this.updateFeedbackStatus('implemented'));
        }
    }

    setupTabs() {
        this.switchTab('users');
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        this.currentTab = tabName;
    }

    // User Management Methods
    renderUsers(filteredUsers = null) {
        const users = filteredUsers || this.users;
        const tbody = document.getElementById('users-table-body');
        
        tbody.innerHTML = users.map(user => `
            <tr>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="user-role">${user.role.toUpperCase()}</span></td>
                <td>${user.department}</td>
                <td><span class="user-status ${user.status}">${user.status.toUpperCase()}</span></td>
                <td>${new Date(user.lastLogin).toLocaleDateString()}</td>
                <td class="user-actions">
                    <button class="action-btn edit" onclick="adminManager.editUser('${user.id}')">Edit</button>
                    <button class="action-btn delete" onclick="adminManager.deleteUser('${user.id}')">Delete</button>
                </td>
            </tr>
        `).join('');

        // Populate department filter
        const departments = [...new Set(this.users.map(user => user.department))];
        const departmentFilter = document.getElementById('department-filter');
        departmentFilter.innerHTML = '<option value="">All Departments</option>' +
            departments.map(dept => `<option value="${dept}">${dept}</option>`).join('');
    }

    filterUsers(searchTerm = '', roleFilter = '', departmentFilter = '') {
        let filtered = this.users;

        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (roleFilter) {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        if (departmentFilter) {
            filtered = filtered.filter(user => user.department === departmentFilter);
        }

        this.renderUsers(filtered);
    }

    openUserModal(userId = null) {
        const modal = document.getElementById('user-modal');
        const form = document.getElementById('user-form');
        const title = document.getElementById('user-modal-title');

        if (userId) {
            const user = this.users.find(u => u.id === userId);
            title.textContent = 'Edit User';
            this.populateUserForm(user);
        } else {
            title.textContent = 'Add New User';
            form.reset();
            document.getElementById('user-id').value = '';
        }

        modal.classList.add('active');
    }

    closeUserModal() {
        document.getElementById('user-modal').classList.remove('active');
    }

    populateUserForm(user) {
        document.getElementById('user-id').value = user.id;
        document.getElementById('user-name').value = user.name;
        document.getElementById('user-email').value = user.email;
        document.getElementById('user-role').value = user.role;
        document.getElementById('user-department').value = user.department;
        document.getElementById('user-position').value = user.position;
        document.getElementById('user-status').value = user.status;
    }

    saveUser() {
        const form = document.getElementById('user-form');
        const formData = new FormData(form);
        const userData = Object.fromEntries(formData);

        if (userData.id) {
            // Update existing user
            const index = this.users.findIndex(u => u.id === userData.id);
            if (index !== -1) {
                this.users[index] = { ...this.users[index], ...userData };
            }
        } else {
            // Create new user
            userData.id = 'user-' + Date.now();
            userData.createdAt = new Date().toISOString();
            userData.lastLogin = new Date().toISOString();
            this.users.push(userData);
        }

        this.saveUsersToStorage();
        this.renderUsers();
        this.closeUserModal();
        this.showNotification('User saved successfully', 'success');
    }

    editUser(userId) {
        this.openUserModal(userId);
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            this.users = this.users.filter(u => u.id !== userId);
            this.saveUsersToStorage();
            this.renderUsers();
            this.showNotification('User deleted successfully', 'success');
        }
    }

    saveUsersToStorage() {
        localStorage.setItem('hr_users', JSON.stringify(this.users));
    }

    // Role Management Methods
    renderRoles() {
        const rolesGrid = document.getElementById('roles-grid');
        
        rolesGrid.innerHTML = this.roles.map(role => `
            <div class="role-card">
                <h3>${role.title}</h3>
                <div class="role-meta">
                    ${role.department} • ${role.level.charAt(0).toUpperCase() + role.level.slice(1)} Level
                </div>
                <div class="role-description">
                    ${role.description || 'No description provided'}
                </div>
                <div class="role-actions">
                    <button class="action-btn edit" onclick="adminManager.editRole('${role.id}')">Edit</button>
                    <button class="action-btn delete" onclick="adminManager.deleteRole('${role.id}')">Delete</button>
                </div>
            </div>
        `).join('');
    }

    openRoleModal(roleId = null) {
        const modal = document.getElementById('role-modal');
        const form = document.getElementById('role-form');
        const title = document.getElementById('role-modal-title');

        if (roleId) {
            const role = this.roles.find(r => r.id === roleId);
            title.textContent = 'Edit Role';
            this.populateRoleForm(role);
        } else {
            title.textContent = 'Create New Role';
            form.reset();
            document.getElementById('role-id').value = '';
        }

        modal.classList.add('active');
    }

    closeRoleModal() {
        document.getElementById('role-modal').classList.remove('active');
    }

    populateRoleForm(role) {
        document.getElementById('role-id').value = role.id;
        document.getElementById('role-title').value = role.title;
        document.getElementById('role-department').value = role.department;
        document.getElementById('role-level').value = role.level;
        document.getElementById('role-description').value = role.description || '';
    }

    saveRole() {
        const form = document.getElementById('role-form');
        const formData = new FormData(form);
        const roleData = Object.fromEntries(formData);

        if (roleData.id) {
            // Update existing role
            const index = this.roles.findIndex(r => r.id === roleData.id);
            if (index !== -1) {
                this.roles[index] = { ...this.roles[index], ...roleData };
            }
        } else {
            // Create new role
            roleData.id = 'role-' + Date.now();
            this.roles.push(roleData);
        }

        this.saveRolesToStorage();
        this.renderRoles();
        this.closeRoleModal();
        this.showNotification('Role saved successfully', 'success');
    }

    editRole(roleId) {
        this.openRoleModal(roleId);
    }

    deleteRole(roleId) {
        if (confirm('Are you sure you want to delete this role?')) {
            this.roles = this.roles.filter(r => r.id !== roleId);
            this.saveRolesToStorage();
            this.renderRoles();
            this.showNotification('Role deleted successfully', 'success');
        }
    }

    saveRolesToStorage() {
        localStorage.setItem('hr_roles', JSON.stringify(this.roles));
    }

    // Permissions Management
    renderPermissions() {
        const tbody = document.getElementById('permissions-table-body');
        
        tbody.innerHTML = this.permissions.map(permission => `
            <tr>
                <td>${permission.feature}</td>
                <td>
                    <input type="checkbox" class="permission-checkbox" 
                           data-feature="${permission.feature}" 
                           data-role="admin" 
                           ${permission.admin ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" class="permission-checkbox" 
                           data-feature="${permission.feature}" 
                           data-role="hr" 
                           ${permission.hr ? 'checked' : ''}>
                </td>
                <td>
                    <input type="checkbox" class="permission-checkbox" 
                           data-feature="${permission.feature}" 
                           data-role="employee" 
                           ${permission.employee ? 'checked' : ''}>
                </td>
            </tr>
        `).join('');
    }

    updatePermission(checkbox) {
        const feature = checkbox.dataset.feature;
        const role = checkbox.dataset.role;
        const isChecked = checkbox.checked;

        const permission = this.permissions.find(p => p.feature === feature);
        if (permission) {
            permission[role] = isChecked;
            this.savePermissionsToStorage();
            this.showNotification('Permission updated', 'success');
        }
    }

    savePermissionsToStorage() {
        localStorage.setItem('hr_permissions', JSON.stringify(this.permissions));
    }

    // AI Configuration
    loadAIConfig() {
        const form = document.getElementById('ai-config-form');
        
        document.getElementById('openai-api-key').value = this.aiConfig.openaiApiKey || '';
        document.getElementById('model-name').value = this.aiConfig.modelName || 'gpt-3.5-turbo';
        document.getElementById('performance-weight').value = this.aiConfig.performanceWeight || 50;
        document.getElementById('potential-weight').value = this.aiConfig.potentialWeight || 50;
        document.getElementById('recommendation-threshold').value = this.aiConfig.recommendationThreshold || 70;
        document.getElementById('max-recommendations').value = this.aiConfig.maxRecommendations || 5;

        // Update range value displays
        document.querySelectorAll('input[type="range"]').forEach(range => {
            const valueSpan = range.nextElementSibling;
            if (valueSpan && valueSpan.classList.contains('range-value')) {
                valueSpan.textContent = range.value + '%';
            }
        });
    }

    saveAIConfig() {
        const form = document.getElementById('ai-config-form');
        const formData = new FormData(form);
        this.aiConfig = Object.fromEntries(formData);

        // Convert numeric values
        this.aiConfig.performanceWeight = parseInt(this.aiConfig.performanceWeight);
        this.aiConfig.potentialWeight = parseInt(this.aiConfig.potentialWeight);
        this.aiConfig.recommendationThreshold = parseInt(this.aiConfig.recommendationThreshold);
        this.aiConfig.maxRecommendations = parseInt(this.aiConfig.maxRecommendations);

        localStorage.setItem('hr_ai_config', JSON.stringify(this.aiConfig));
        this.showNotification('AI configuration saved successfully', 'success');
    }

    // Utility Methods
    // Feedback Management Methods
    renderFeedback() {
        this.renderFeedbackStats();
        this.renderFeedbackList();
    }

    renderFeedbackStats() {
        const totalFeedback = document.getElementById('total-feedback');
        const pendingFeedback = document.getElementById('pending-feedback');
        const implementedSuggestions = document.getElementById('implemented-suggestions');
        const avgRating = document.getElementById('avg-rating');

        if (totalFeedback) totalFeedback.textContent = this.feedback.length;
        
        if (pendingFeedback) {
            const pending = this.feedback.filter(f => f.status === 'pending').length;
            pendingFeedback.textContent = pending;
        }
        
        if (implementedSuggestions) {
            const implemented = this.feedback.filter(f => f.status === 'implemented').length;
            implementedSuggestions.textContent = implemented;
        }
        
        if (avgRating) {
            const ratings = this.feedback.map(f => f.rating || 0);
            const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
            avgRating.textContent = average.toFixed(1);
        }
    }

    renderFeedbackList(filteredFeedback = null) {
        const container = document.getElementById('feedback-list');
        if (!container) return;

        const feedback = filteredFeedback || this.feedback;
        
        if (feedback.length === 0) {
            container.innerHTML = '<p>No feedback to display.</p>';
            return;
        }

        container.innerHTML = feedback
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(item => `
                <div class="feedback-list-item" onclick="adminManager.viewFeedbackDetail('${item.id}')">
                    <div class="feedback-list-item-header">
                        <h3 class="feedback-list-item-title">${item.title}</h3>
                        <div class="feedback-list-item-meta">
                            <span class="feedback-item-type ${item.type}">${item.type}</span>
                            <span class="feedback-item-priority ${item.priority}">${item.priority}</span>
                            <span class="feedback-status ${item.status}">${item.status.replace('-', ' ')}</span>
                        </div>
                    </div>
                    <div class="feedback-list-item-description">
                        ${item.description}
                    </div>
                    <div class="feedback-list-item-footer">
                        <span class="feedback-submitter">
                            ${item.anonymous ? 'Anonymous' : item.userName}
                        </span>
                        <span class="feedback-date">
                            ${new Date(item.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            `).join('');
    }

    filterFeedback() {
        const typeFilter = document.getElementById('feedback-type-filter').value;
        const statusFilter = document.getElementById('feedback-status-filter').value;
        const priorityFilter = document.getElementById('feedback-priority-filter').value;

        let filtered = this.feedback;

        if (typeFilter) {
            filtered = filtered.filter(f => f.type === typeFilter);
        }
        if (statusFilter) {
            filtered = filtered.filter(f => f.status === statusFilter);
        }
        if (priorityFilter) {
            filtered = filtered.filter(f => f.priority === priorityFilter);
        }

        this.renderFeedbackList(filtered);
    }

    viewFeedbackDetail(feedbackId) {
        const feedback = this.feedback.find(f => f.id === feedbackId);
        if (!feedback) return;

        const modal = document.getElementById('feedback-modal');
        const detailContainer = document.getElementById('feedback-detail');
        
        detailContainer.innerHTML = `
            <div class="feedback-detail-header">
                <h3 class="feedback-detail-title">${feedback.title}</h3>
                <div class="feedback-detail-meta">
                    <span class="feedback-item-type ${feedback.type}">${feedback.type}</span>
                    <span class="feedback-item-priority ${feedback.priority}">${feedback.priority}</span>
                    <span class="feedback-status ${feedback.status}">${feedback.status.replace('-', ' ')}</span>
                </div>
            </div>
            <div class="feedback-detail-description">
                ${feedback.description}
            </div>
            <div class="feedback-detail-info">
                <div class="feedback-detail-info-item">
                    <div class="feedback-detail-info-label">Submitted By</div>
                    <div class="feedback-detail-info-value">${feedback.anonymous ? 'Anonymous' : feedback.userName}</div>
                </div>
                <div class="feedback-detail-info-item">
                    <div class="feedback-detail-info-label">Category</div>
                    <div class="feedback-detail-info-value">${feedback.category}</div>
                </div>
                <div class="feedback-detail-info-item">
                    <div class="feedback-detail-info-label">Rating</div>
                    <div class="feedback-detail-info-value">${'★'.repeat(feedback.rating || 0)}${'☆'.repeat(5 - (feedback.rating || 0))}</div>
                </div>
                <div class="feedback-detail-info-item">
                    <div class="feedback-detail-info-label">Submitted</div>
                    <div class="feedback-detail-info-value">${new Date(feedback.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="feedback-detail-info-item">
                    <div class="feedback-detail-info-label">Last Updated</div>
                    <div class="feedback-detail-info-value">${new Date(feedback.updatedAt).toLocaleDateString()}</div>
                </div>
            </div>
        `;

        // Store current feedback ID for status updates
        modal.dataset.feedbackId = feedbackId;
        modal.classList.add('active');
    }

    updateFeedbackStatus(newStatus) {
        const modal = document.getElementById('feedback-modal');
        const feedbackId = modal.dataset.feedbackId;
        
        if (!feedbackId) return;

        const feedback = this.feedback.find(f => f.id === feedbackId);
        if (feedback) {
            feedback.status = newStatus;
            feedback.updatedAt = new Date().toISOString();
            
            this.saveFeedbackToStorage();
            this.renderFeedback();
            modal.classList.remove('active');
            
            this.showNotification(`Feedback marked as ${newStatus}`, 'success');
        }
    }

    saveFeedbackToStorage() {
        localStorage.setItem('hr_feedback', JSON.stringify(this.feedback));
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '1rem 1.5rem',
            borderRadius: '6px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });

        // Set background color based on type
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };
        notification.style.backgroundColor = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Initialize admin manager when page loads
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
    adminManager = new AdminManager();
});