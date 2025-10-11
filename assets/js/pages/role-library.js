/**
 * Role Library Page JavaScript
 * Handles role display, search, filtering, and detail viewing
 */

class RoleLibrary {
    constructor() {
        this.roles = [];
        this.filteredRoles = [];
        this.currentUser = null;
        this.searchTerm = '';
        this.filters = {
            department: '',
            level: ''
        };
        
        this.init();
    }

    init() {
        this.currentUser = this.getCurrentUser();
        this.checkAuthentication();
        this.loadRoles();
        this.populateFilters();
        this.attachEventListeners();
        this.renderRoles();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('hr_current_user');
        return userData ? JSON.parse(userData) : null;
    }

    checkAuthentication() {
        if (!this.currentUser) {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        // Check if user has permission to view roles
        if (this.currentUser.role !== 'hr' && this.currentUser.role !== 'admin') {
            this.showError('You do not have permission to access this page.');
            setTimeout(() => {
                window.location.href = '/pages/dashboard/employee.html';
            }, 2000);
        }
    }

    loadRoles() {
        try {
            this.showLoading(true);
            this.roles = window.HRData.roleService.getAll();
            this.filteredRoles = [...this.roles];
            this.showLoading(false);
        } catch (error) {
            console.error('Error loading roles:', error);
            this.showError('Failed to load roles. Please try again.');
            this.showLoading(false);
        }
    }

    populateFilters() {
        const departments = [...new Set(this.roles.map(role => role.department))].sort();
        const departmentFilter = document.getElementById('departmentFilter');
        
        if (departmentFilter) {
            departments.forEach(dept => {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                departmentFilter.appendChild(option);
            });
        }
    }

    attachEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.applyFilters();
            });
        }

        // Filter controls
        const departmentFilter = document.getElementById('departmentFilter');
        const levelFilter = document.getElementById('levelFilter');
        
        if (departmentFilter) {
            departmentFilter.addEventListener('change', (e) => {
                this.filters.department = e.target.value;
                this.applyFilters();
            });
        }

        if (levelFilter) {
            levelFilter.addEventListener('change', (e) => {
                this.filters.level = e.target.value;
                this.applyFilters();
            });
        }

        // Clear filters button
        const clearFiltersBtn = document.getElementById('clearFiltersBtn');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Create role buttons
        const createRoleBtn = document.getElementById('createRoleBtn');
        const createFirstRoleBtn = document.getElementById('createFirstRoleBtn');
        
        if (createRoleBtn) {
            createRoleBtn.addEventListener('click', () => {
                this.navigateToCreateRole();
            });
        }

        if (createFirstRoleBtn) {
            createFirstRoleBtn.addEventListener('click', () => {
                this.navigateToCreateRole();
            });
        }

        // Modal controls
        const modal = document.getElementById('roleDetailModal');
        const modalOverlay = document.getElementById('modalOverlay');
        const modalClose = document.getElementById('modalClose');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        const editRoleBtn = document.getElementById('editRoleBtn');

        if (modalOverlay) {
            modalOverlay.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modalClose) {
            modalClose.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        if (editRoleBtn) {
            editRoleBtn.addEventListener('click', () => {
                const roleId = editRoleBtn.dataset.roleId;
                if (roleId) {
                    this.navigateToEditRole(roleId);
                }
            });
        }
    }

    applyFilters() {
        this.filteredRoles = this.roles.filter(role => {
            // Search filter
            const matchesSearch = !this.searchTerm || 
                role.title.toLowerCase().includes(this.searchTerm) ||
                role.department.toLowerCase().includes(this.searchTerm) ||
                Object.keys(role.requiredSkills).some(skill => 
                    skill.toLowerCase().includes(this.searchTerm)
                );

            // Department filter
            const matchesDepartment = !this.filters.department || 
                role.department === this.filters.department;

            // Level filter
            const matchesLevel = !this.filters.level || 
                role.level === this.filters.level;

            return matchesSearch && matchesDepartment && matchesLevel;
        });

        this.renderRoles();
    }

    clearFilters() {
        this.searchTerm = '';
        this.filters = { department: '', level: '' };
        
        // Reset form controls
        const searchInput = document.getElementById('searchInput');
        const departmentFilter = document.getElementById('departmentFilter');
        const levelFilter = document.getElementById('levelFilter');
        
        if (searchInput) searchInput.value = '';
        if (departmentFilter) departmentFilter.value = '';
        if (levelFilter) levelFilter.value = '';
        
        this.filteredRoles = [...this.roles];
        this.renderRoles();
    }

    renderRoles() {
        const rolesGrid = document.getElementById('rolesGrid');
        const emptyState = document.getElementById('emptyState');
        const resultsCount = document.getElementById('resultsCount');
        
        if (!rolesGrid) return;

        // Update results count
        if (resultsCount) {
            const count = this.filteredRoles.length;
            resultsCount.textContent = `${count} role${count !== 1 ? 's' : ''} found`;
        }

        // Show/hide empty state
        if (this.filteredRoles.length === 0) {
            rolesGrid.style.display = 'none';
            if (emptyState) emptyState.style.display = 'block';
            return;
        } else {
            rolesGrid.style.display = 'grid';
            if (emptyState) emptyState.style.display = 'none';
        }

        // Render role cards
        rolesGrid.innerHTML = this.filteredRoles.map(role => this.createRoleCard(role)).join('');
        
        // Attach click listeners to role cards
        this.attachRoleCardListeners();
    }

    createRoleCard(role) {
        const criticalSkills = Object.entries(role.requiredSkills)
            .filter(([_, req]) => req.critical)
            .slice(0, 3);
        
        const allSkills = Object.keys(role.requiredSkills).slice(0, 5);
        const remainingSkillsCount = Math.max(0, Object.keys(role.requiredSkills).length - 5);

        return `
            <div class="role-card" data-role-id="${role.id}">
                <div class="role-card-header">
                    <div>
                        <h3 class="role-title">${this.escapeHtml(role.title)}</h3>
                        <p class="role-department">${this.escapeHtml(role.department)}</p>
                    </div>
                    <span class="role-level">${this.escapeHtml(role.level)}</span>
                </div>
                
                <div class="role-info">
                    <div class="role-info-item">
                        <span class="role-info-icon">💼</span>
                        <span>${role.experience} years experience required</span>
                    </div>
                    <div class="role-info-item">
                        <span class="role-info-icon">🎓</span>
                        <span>${role.education.length} education requirement${role.education.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div class="role-info-item">
                        <span class="role-info-icon">⭐</span>
                        <span>${Object.keys(role.requiredSkills).length} required skills</span>
                    </div>
                </div>

                <div class="role-skills">
                    <div class="role-skills-title">Key Skills</div>
                    <div class="skills-list">
                        ${allSkills.map(skill => {
                            const isCritical = role.requiredSkills[skill]?.critical;
                            return `<span class="skill-tag ${isCritical ? 'critical' : ''}">${this.escapeHtml(skill)}</span>`;
                        }).join('')}
                        ${remainingSkillsCount > 0 ? `<span class="skill-tag">+${remainingSkillsCount} more</span>` : ''}
                    </div>
                </div>

                <div class="role-actions">
                    <button class="role-action-btn view-details-btn" data-role-id="${role.id}">
                        View Details
                    </button>
                    <button class="role-action-btn primary edit-role-btn" data-role-id="${role.id}">
                        Edit Role
                    </button>
                </div>
            </div>
        `;
    }

    attachRoleCardListeners() {
        // View details buttons
        document.querySelectorAll('.view-details-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const roleId = btn.dataset.roleId;
                this.showRoleDetails(roleId);
            });
        });

        // Edit role buttons
        document.querySelectorAll('.edit-role-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const roleId = btn.dataset.roleId;
                this.navigateToEditRole(roleId);
            });
        });

        // Role card click (show details)
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', () => {
                const roleId = card.dataset.roleId;
                this.showRoleDetails(roleId);
            });
        });
    }

    showRoleDetails(roleId) {
        const role = this.roles.find(r => r.id === roleId);
        if (!role) {
            this.showError('Role not found.');
            return;
        }

        const modal = document.getElementById('roleDetailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const editRoleBtn = document.getElementById('editRoleBtn');

        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = role.title;
        modalBody.innerHTML = this.createRoleDetailContent(role);
        
        if (editRoleBtn) {
            editRoleBtn.dataset.roleId = roleId;
        }

        modal.classList.add('modal-open');
    }

    createRoleDetailContent(role) {
        return `
            <div class="role-detail-section">
                <h3 class="role-detail-title">Basic Information</h3>
                <div class="role-detail-content">
                    <p><strong>Department:</strong> ${this.escapeHtml(role.department)}</p>
                    <p><strong>Level:</strong> ${this.escapeHtml(role.level)}</p>
                    <p><strong>Experience Required:</strong> ${role.experience} years</p>
                    <p><strong>Created:</strong> ${this.formatDate(role.createdAt)}</p>
                    <p><strong>Last Updated:</strong> ${this.formatDate(role.updatedAt)}</p>
                </div>
            </div>

            <div class="role-detail-section">
                <h3 class="role-detail-title">Education Requirements</h3>
                <div class="role-detail-content">
                    ${role.education.length > 0 ? 
                        `<ul class="competencies-list">
                            ${role.education.map(edu => `<li class="competency-item">${this.escapeHtml(edu)}</li>`).join('')}
                        </ul>` : 
                        '<p>No specific education requirements defined.</p>'
                    }
                </div>
            </div>

            <div class="role-detail-section">
                <h3 class="role-detail-title">Core Competencies</h3>
                <div class="role-detail-content">
                    ${role.competencies.length > 0 ? 
                        `<ul class="competencies-list">
                            ${role.competencies.map(comp => `<li class="competency-item">${this.escapeHtml(comp)}</li>`).join('')}
                        </ul>` : 
                        '<p>No core competencies defined.</p>'
                    }
                </div>
            </div>

            <div class="role-detail-section">
                <h3 class="role-detail-title">Required Skills</h3>
                <div class="role-detail-content">
                    ${Object.keys(role.requiredSkills).length > 0 ? 
                        `<ul class="skills-detail-list">
                            ${Object.entries(role.requiredSkills).map(([skill, req]) => `
                                <li class="skill-detail-item">
                                    <span class="skill-name">${this.escapeHtml(skill)}</span>
                                    <div class="skill-requirements">
                                        <span class="skill-level">Level ${req.minimumLevel}</span>
                                        ${req.critical ? '<span class="skill-critical">Critical</span>' : ''}
                                        <span style="font-size: 0.75rem; color: var(--text-muted);">Weight: ${req.weight}</span>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>` : 
                        '<p>No required skills defined.</p>'
                    }
                </div>
            </div>
        `;
    }

    closeModal() {
        const modal = document.getElementById('roleDetailModal');
        if (modal) {
            modal.classList.remove('modal-open');
        }
    }

    navigateToCreateRole() {
        window.location.href = '/pages/roles/edit.html';
    }

    navigateToEditRole(roleId) {
        window.location.href = `/pages/roles/edit.html?id=${roleId}`;
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = show ? 'flex' : 'none';
        }
    }

    showError(message) {
        // Create a simple toast notification
        const toast = document.createElement('div');
        toast.className = 'error-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--color-danger);
            color: white;
            padding: var(--space-sm) var(--space-md);
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-lg);
            z-index: 3000;
            font-size: var(--font-size-sm);
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}

// Initialize the role library when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.roleLibrary = new RoleLibrary();
});