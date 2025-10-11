/**
 * Profile Management Module
 * Handles profile viewing, editing, and validation
 */

class ProfileManager {
    constructor() {
        this.currentUser = null;
        this.originalData = null;
        this.hasUnsavedChanges = false;
        this.isEditing = false;
        
        this.init();
    }

    init() {
        // Check authentication
        if (!this.checkAuth()) {
            return;
        }

        // Load current user data
        this.loadCurrentUser();
        
        // Initialize page based on current page
        const currentPage = window.location.pathname;
        if (currentPage.includes('edit.html')) {
            this.initEditPage();
        } else {
            this.initViewPage();
        }

        // Set up navigation
        this.setupNavigation();
    }

    checkAuth() {
        const currentUser = HRData.dataStore.getCurrentUser();
        if (!currentUser) {
            window.location.href = '../../index.html';
            return false;
        }
        this.currentUser = currentUser;
        return true;
    }

    loadCurrentUser() {
        try {
            // Get fresh user data from storage
            const userData = HRData.userService.getById(this.currentUser.id);
            if (userData) {
                this.currentUser = userData;
                this.originalData = JSON.parse(JSON.stringify(userData));
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.showError('Failed to load user data');
        }
    }

    setupNavigation() {
        // Initialize navigation component
        if (window.NavigationComponent) {
            const nav = new NavigationComponent();
            nav.render();
        }
    }

    // View Page Methods
    initViewPage() {
        this.renderProfileView();
        this.setupViewPageEvents();
    }

    renderProfileView() {
        if (!this.currentUser) return;

        // Update profile header
        this.updateElement('profile-name', this.currentUser.name);
        this.updateElement('profile-position', this.currentUser.position);
        this.updateElement('profile-department', this.currentUser.department);
        this.updateElement('profile-email', this.currentUser.email);
        this.updateElement('profile-experience', this.currentUser.experience);

        // Update avatar initials
        const initials = this.getInitials(this.currentUser.name);
        this.updateElement('avatar-initials', initials);

        // Update detailed information
        this.updateElement('detail-name', this.currentUser.name);
        this.updateElement('detail-email', this.currentUser.email);
        this.updateElement('detail-position', this.currentUser.position);
        this.updateElement('detail-department', this.currentUser.department);
        this.updateElement('detail-experience', `${this.currentUser.experience} years`);
        this.updateElement('detail-role', this.capitalizeFirst(this.currentUser.role));

        // Render education
        this.renderEducation();

        // Render performance metrics
        this.renderPerformanceMetrics();

        // Render skills overview
        this.renderSkillsOverview();

        // Render achievements
        this.renderAchievements();

        // Hide loading overlay
        this.hideLoading();
    }

    renderEducation() {
        const container = document.getElementById('education-list');
        if (!container) return;

        if (!this.currentUser.education || this.currentUser.education.length === 0) {
            container.innerHTML = '<div class="no-data">No education information available</div>';
            return;
        }

        const educationHTML = this.currentUser.education.map(edu => `
            <div class="education-item">
                <h4>${this.escapeHtml(edu)}</h4>
            </div>
        `).join('');

        container.innerHTML = educationHTML;
    }

    renderPerformanceMetrics() {
        // Render performance stars
        this.renderStars('performance-stars', this.currentUser.performance);
        this.updateElement('performance-value', `${this.currentUser.performance}/5`);

        // Render potential stars
        this.renderStars('potential-stars', this.currentUser.potential);
        this.updateElement('potential-value', `${this.currentUser.potential}/5`);
    }

    renderStars(containerId, rating) {
        const container = document.getElementById(containerId);
        if (!container) return;

        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= rating ? 'filled' : '';
            starsHTML += `<span class="star ${filled}">★</span>`;
        }
        container.innerHTML = starsHTML;
    }

    renderSkillsOverview() {
        const container = document.getElementById('skills-overview');
        if (!container) return;

        if (!this.currentUser.skills || Object.keys(this.currentUser.skills).length === 0) {
            container.innerHTML = '<div class="no-data">No skills information available</div>';
            return;
        }

        // Show top 6 skills
        const topSkills = Object.entries(this.currentUser.skills)
            .sort(([,a], [,b]) => b.level - a.level)
            .slice(0, 6);

        const skillsHTML = topSkills.map(([skillName, skillData]) => `
            <div class="skill-tag">
                <span>${this.escapeHtml(skillName)}</span>
                <div class="skill-level">
                    ${this.renderSkillDots(skillData.level)}
                </div>
            </div>
        `).join('');

        container.innerHTML = skillsHTML;
    }

    renderSkillDots(level) {
        let dotsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= level ? 'filled' : '';
            dotsHTML += `<div class="skill-dot ${filled}"></div>`;
        }
        return dotsHTML;
    }

    renderAchievements() {
        // Update summary stats
        this.updateAchievementsSummary();

        const container = document.getElementById('achievements-list');
        if (!container) return;

        if (!this.currentUser.achievements || this.currentUser.achievements.length === 0) {
            container.innerHTML = '<div class="no-data">No achievements recorded yet. Add your first achievement to get started!</div>';
            return;
        }

        // Show recent achievements (last 6)
        const recentAchievements = this.currentUser.achievements
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
            .slice(0, 6);

        const achievementsHTML = recentAchievements.map(achievement => {
            const icon = this.getAchievementIcon(achievement.type);
            const skills = achievement.skills ? achievement.skills.split(',').map(s => s.trim()).filter(s => s) : [];
            const skillsHTML = skills.length > 0 ? `
                <div class="achievement-skills">
                    ${skills.map(skill => `<span class="achievement-skill-tag">${this.escapeHtml(skill)}</span>`).join('')}
                </div>
            ` : '';
            
            const urlHTML = achievement.url ? `
                <div class="achievement-url">
                    <a href="${this.escapeHtml(achievement.url)}" target="_blank" rel="noopener noreferrer">
                        View Certificate/Evidence →
                    </a>
                </div>
            ` : '';

            return `
                <div class="achievement-item" data-achievement-id="${achievement.id}">
                    <div class="achievement-icon ${achievement.type || 'other'}">${icon}</div>
                    <div class="achievement-content">
                        <h4>${this.escapeHtml(achievement.title || 'Achievement')}</h4>
                        <p>${this.escapeHtml(achievement.description || 'No description available')}</p>
                        <div class="achievement-meta">
                            <span class="achievement-date">
                                <span class="icon">📅</span>
                                ${this.formatDate(achievement.date || achievement.createdAt)}
                            </span>
                            ${achievement.provider ? `
                                <span class="achievement-provider">
                                    <span class="icon">🏢</span>
                                    ${this.escapeHtml(achievement.provider)}
                                </span>
                            ` : ''}
                        </div>
                        ${skillsHTML}
                        ${urlHTML}
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = achievementsHTML;
    }

    updateAchievementsSummary() {
        if (!this.currentUser.achievements) return;

        const total = this.currentUser.achievements.length;
        const certifications = this.currentUser.achievements.filter(a => a.type === 'certification').length;
        const feedback = this.currentUser.achievements.filter(a => a.type === 'feedback').length;

        this.updateElement('total-achievements', total);
        this.updateElement('certifications-count', certifications);
        this.updateElement('feedback-count', feedback);
    }

    getAchievementIcon(type) {
        const icons = {
            training: '🎓',
            certification: '🏆',
            project: '🚀',
            feedback: '💬',
            milestone: '🎯',
            other: '⭐'
        };
        return icons[type] || icons.other;
    }

    setupViewPageEvents() {
        // Edit profile button
        const editBtn = document.getElementById('edit-profile-btn');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                window.location.href = 'edit.html';
            });
        }
    }

    // Edit Page Methods
    initEditPage() {
        this.isEditing = true;
        this.populateEditForm();
        this.setupEditPageEvents();
        this.hideLoading();
    }

    populateEditForm() {
        if (!this.currentUser) return;

        // Populate basic information
        this.setInputValue('edit-name', this.currentUser.name);
        this.setInputValue('edit-email', this.currentUser.email);
        this.setInputValue('edit-position', this.currentUser.position);
        this.setInputValue('edit-department', this.currentUser.department);
        this.setInputValue('edit-experience', this.currentUser.experience);
        this.setInputValue('edit-role', this.currentUser.role);

        // Populate performance metrics (show only for HR/admin)
        if (this.currentUser.role === 'hr' || this.currentUser.role === 'admin') {
            document.getElementById('performance-section').style.display = 'block';
            this.setInputValue('edit-performance', this.currentUser.performance);
            this.setInputValue('edit-potential', this.currentUser.potential);
            this.updateRatingDisplay('performance', this.currentUser.performance);
            this.updateRatingDisplay('potential', this.currentUser.potential);
        }

        // Populate education
        this.populateEducation();

        // Populate achievements
        this.populateAchievements();
    }

    populateEducation() {
        const container = document.getElementById('education-container');
        if (!container) return;

        container.innerHTML = '';

        if (this.currentUser.education && this.currentUser.education.length > 0) {
            this.currentUser.education.forEach((edu, index) => {
                this.addEducationEntry(edu, index);
            });
        } else {
            this.addEducationEntry('', 0);
        }
    }

    addEducationEntry(value = '', index = 0) {
        const container = document.getElementById('education-container');
        if (!container) return;

        const entryHTML = `
            <div class="education-entry" data-index="${index}">
                <input type="text" 
                       name="education-${index}" 
                       value="${this.escapeHtml(value)}" 
                       placeholder="e.g., Bachelor's in Computer Science"
                       maxlength="200">
                <button type="button" class="remove-education" onclick="profileManager.removeEducationEntry(${index})">
                    Remove
                </button>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', entryHTML);
    }

    removeEducationEntry(index) {
        const entry = document.querySelector(`[data-index="${index}"]`);
        if (entry) {
            entry.remove();
            this.markAsChanged();
        }
    }

    setupEditPageEvents() {
        // Form submission
        const form = document.getElementById('profile-edit-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile();
            });
        }

        // Cancel buttons
        document.getElementById('cancel-edit-btn')?.addEventListener('click', this.handleCancel.bind(this));
        document.getElementById('cancel-btn')?.addEventListener('click', this.handleCancel.bind(this));

        // Add education button
        document.getElementById('add-education-btn')?.addEventListener('click', () => {
            const container = document.getElementById('education-container');
            const newIndex = container.children.length;
            this.addEducationEntry('', newIndex);
            this.markAsChanged();
        });

        // Add achievement button
        document.getElementById('add-achievement-btn')?.addEventListener('click', () => {
            this.showAddAchievementModal();
        });

        // Achievement forms
        document.getElementById('add-achievement-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddAchievement();
        });

        document.getElementById('edit-achievement-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditAchievement();
        });

        // Delete achievement button
        document.getElementById('delete-achievement-btn')?.addEventListener('click', () => {
            this.handleDeleteAchievement();
        });

        // Rating sliders
        document.getElementById('edit-performance')?.addEventListener('input', (e) => {
            this.updateRatingDisplay('performance', e.target.value);
            this.markAsChanged();
        });

        document.getElementById('edit-potential')?.addEventListener('input', (e) => {
            this.updateRatingDisplay('potential', e.target.value);
            this.markAsChanged();
        });

        // Form change detection
        form?.addEventListener('input', () => {
            this.markAsChanged();
        });

        // Prevent accidental navigation
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    updateRatingDisplay(type, value) {
        const display = document.getElementById(`${type}-display`);
        if (display) {
            display.textContent = value;
        }
    }

    markAsChanged() {
        this.hasUnsavedChanges = true;
    }

    handleCancel() {
        if (this.hasUnsavedChanges) {
            this.showConfirmModal(
                'You have unsaved changes. Are you sure you want to leave without saving?',
                () => {
                    window.location.href = 'view.html';
                }
            );
        } else {
            window.location.href = 'view.html';
        }
    }

    async saveProfile() {
        try {
            this.showLoading('Saving profile...');

            // Collect form data
            const formData = this.collectFormData();

            // Validate form data
            const validation = this.validateFormData(formData);
            if (!validation.isValid) {
                this.showValidationErrors(validation.errors);
                this.hideLoading();
                return;
            }

            // Update user data
            const updatedUser = { ...this.currentUser, ...formData };
            
            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user session
            HRData.dataStore.setCurrentUser(updatedUser);
            
            this.hasUnsavedChanges = false;
            this.hideLoading();
            this.showSuccess('Profile updated successfully!', () => {
                window.location.href = 'view.html';
            });

        } catch (error) {
            console.error('Error saving profile:', error);
            this.hideLoading();
            this.showError('Failed to save profile. Please try again.');
        }
    }

    collectFormData() {
        const formData = {
            name: this.getInputValue('edit-name'),
            email: this.getInputValue('edit-email'),
            position: this.getInputValue('edit-position'),
            department: this.getInputValue('edit-department'),
            experience: parseInt(this.getInputValue('edit-experience')) || 0,
            role: this.getInputValue('edit-role'),
            updatedAt: new Date().toISOString()
        };

        // Collect education
        const educationInputs = document.querySelectorAll('[name^="education-"]');
        formData.education = Array.from(educationInputs)
            .map(input => input.value.trim())
            .filter(value => value.length > 0);

        // Collect performance metrics if visible
        const performanceSection = document.getElementById('performance-section');
        if (performanceSection && performanceSection.style.display !== 'none') {
            formData.performance = parseInt(this.getInputValue('edit-performance')) || 3;
            formData.potential = parseInt(this.getInputValue('edit-potential')) || 3;
        }

        return formData;
    }

    validateFormData(data) {
        const errors = {};

        // Name validation
        if (!data.name || data.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters long';
        }

        // Email validation
        if (!data.email || !this.isValidEmail(data.email)) {
            errors.email = 'Please enter a valid email address';
        }

        // Position validation
        if (!data.position || data.position.trim().length < 2) {
            errors.position = 'Position must be at least 2 characters long';
        }

        // Department validation
        if (!data.department) {
            errors.department = 'Please select a department';
        }

        // Experience validation
        if (data.experience < 0 || data.experience > 50) {
            errors.experience = 'Experience must be between 0 and 50 years';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    showValidationErrors(errors) {
        // Clear previous errors
        document.querySelectorAll('.field-error').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });

        document.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });

        // Show new errors
        Object.entries(errors).forEach(([field, message]) => {
            const input = document.getElementById(`edit-${field}`);
            const errorEl = document.getElementById(`${field}-error`);

            if (input) {
                input.classList.add('error');
            }

            if (errorEl) {
                errorEl.textContent = message;
                errorEl.classList.add('show');
            }
        });

        // Scroll to first error
        const firstError = document.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    // Utility Methods
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value || '';
        }
    }

    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input) {
            input.value = value || '';
        }
    }

    getInputValue(id) {
        const input = document.getElementById(id);
        return input ? input.value.trim() : '';
    }

    getInitials(name) {
        if (!name) return '--';
        return name.split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    }

    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Modal Methods
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const messageEl = overlay.querySelector('p');
            if (messageEl) {
                messageEl.textContent = message;
            }
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showSuccess(message, callback = null) {
        const modal = document.getElementById('success-modal');
        if (modal) {
            const messageEl = modal.querySelector('.modal-body p');
            if (messageEl) {
                messageEl.textContent = message;
            }
            modal.style.display = 'flex';

            if (callback) {
                const okBtn = modal.querySelector('.btn-primary');
                if (okBtn) {
                    okBtn.onclick = () => {
                        this.closeModal('success-modal');
                        callback();
                    };
                }
            }
        }
    }

    showError(message) {
        const modal = document.getElementById('error-modal');
        if (modal) {
            const messageEl = document.getElementById('error-message');
            if (messageEl) {
                messageEl.textContent = message;
            }
            modal.style.display = 'flex';
        }
    }

    showConfirmModal(message, onConfirm) {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            const messageEl = modal.querySelector('.modal-body p');
            if (messageEl) {
                messageEl.textContent = message;
            }

            const confirmBtn = document.getElementById('confirm-leave-btn');
            if (confirmBtn) {
                confirmBtn.onclick = () => {
                    this.closeModal('confirm-modal');
                    onConfirm();
                };
            }

            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Achievement Management Methods
    populateAchievements() {
        const container = document.getElementById('achievements-container');
        if (!container) return;

        if (!this.currentUser.achievements || this.currentUser.achievements.length === 0) {
            container.innerHTML = `
                <div class="no-data">
                    <p>No achievements recorded yet.</p>
                    <button class="btn btn-primary" onclick="profileManager.showAddAchievementModal()">
                        <span class="icon">+</span>
                        Add Your First Achievement
                    </button>
                </div>
            `;
            return;
        }

        // Sort achievements by date (newest first)
        const sortedAchievements = [...this.currentUser.achievements]
            .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

        const achievementsHTML = sortedAchievements.map(achievement => `
            <div class="achievement-management-item">
                <div class="achievement-icon ${achievement.type || 'other'}">
                    ${this.getAchievementIcon(achievement.type)}
                </div>
                <div class="achievement-management-content">
                    <h5>${this.escapeHtml(achievement.title)}</h5>
                    <p>
                        <span class="achievement-type-icon ${achievement.type}"></span>
                        ${this.capitalizeFirst(achievement.type || 'other')} • 
                        ${this.formatDate(achievement.date || achievement.createdAt)}
                        ${achievement.provider ? ` • ${this.escapeHtml(achievement.provider)}` : ''}
                    </p>
                </div>
                <div class="achievement-management-actions">
                    <button class="edit-achievement-btn" onclick="profileManager.showEditAchievementModal('${achievement.id}')">
                        Edit
                    </button>
                    <button class="delete-achievement-btn" onclick="profileManager.confirmDeleteAchievement('${achievement.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = achievementsHTML;
    }

    showAddAchievementModal() {
        // Reset form
        document.getElementById('add-achievement-form').reset();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('achievement-date').value = today;
        
        // Clear errors
        this.clearFormErrors('add-achievement-form');
        
        // Show modal
        document.getElementById('add-achievement-modal').style.display = 'flex';
    }

    showEditAchievementModal(achievementId) {
        const achievement = this.currentUser.achievements.find(a => a.id === achievementId);
        if (!achievement) return;

        // Populate form
        document.getElementById('edit-achievement-type').value = achievement.type || '';
        document.getElementById('edit-achievement-title').value = achievement.title || '';
        document.getElementById('edit-achievement-description').value = achievement.description || '';
        document.getElementById('edit-achievement-provider').value = achievement.provider || '';
        document.getElementById('edit-achievement-date').value = achievement.date || '';
        document.getElementById('edit-achievement-skills').value = achievement.skills || '';
        document.getElementById('edit-achievement-url').value = achievement.url || '';
        document.getElementById('edit-achievement-id').value = achievement.id;
        
        // Clear errors
        this.clearFormErrors('edit-achievement-form');
        
        // Show modal
        document.getElementById('edit-achievement-modal').style.display = 'flex';
    }

    async handleAddAchievement() {
        try {
            const formData = this.collectAchievementFormData('add-achievement-form');
            const validation = this.validateAchievementData(formData);

            if (!validation.isValid) {
                this.showAchievementFormErrors('add-achievement-form', validation.errors);
                return;
            }

            this.showLoading('Adding achievement...');

            // Create achievement object
            const achievement = {
                id: this.generateId(),
                ...formData,
                createdAt: new Date().toISOString()
            };

            // Add to user data
            const updatedUser = { ...this.currentUser };
            if (!updatedUser.achievements) {
                updatedUser.achievements = [];
            }
            updatedUser.achievements.push(achievement);

            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user
            this.currentUser = updatedUser;
            HRData.dataStore.setCurrentUser(updatedUser);

            this.hideLoading();
            this.closeModal('add-achievement-modal');
            this.showSuccess('Achievement added successfully!');
            
            // Re-render achievements
            this.populateAchievements();
            this.markAsChanged();

        } catch (error) {
            console.error('Error adding achievement:', error);
            this.hideLoading();
            this.showError('Failed to add achievement. Please try again.');
        }
    }

    async handleEditAchievement() {
        try {
            const formData = this.collectAchievementFormData('edit-achievement-form');
            const validation = this.validateAchievementData(formData);

            if (!validation.isValid) {
                this.showAchievementFormErrors('edit-achievement-form', validation.errors);
                return;
            }

            this.showLoading('Updating achievement...');

            const achievementId = document.getElementById('edit-achievement-id').value;
            
            // Update achievement in user data
            const updatedUser = { ...this.currentUser };
            const achievementIndex = updatedUser.achievements.findIndex(a => a.id === achievementId);
            
            if (achievementIndex === -1) {
                throw new Error('Achievement not found');
            }

            updatedUser.achievements[achievementIndex] = {
                ...updatedUser.achievements[achievementIndex],
                ...formData,
                updatedAt: new Date().toISOString()
            };

            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user
            this.currentUser = updatedUser;
            HRData.dataStore.setCurrentUser(updatedUser);

            this.hideLoading();
            this.closeModal('edit-achievement-modal');
            this.showSuccess('Achievement updated successfully!');
            
            // Re-render achievements
            this.populateAchievements();
            this.markAsChanged();

        } catch (error) {
            console.error('Error updating achievement:', error);
            this.hideLoading();
            this.showError('Failed to update achievement. Please try again.');
        }
    }

    confirmDeleteAchievement(achievementId) {
        const achievement = this.currentUser.achievements.find(a => a.id === achievementId);
        if (!achievement) return;

        if (confirm(`Are you sure you want to delete "${achievement.title}"? This action cannot be undone.`)) {
            this.handleDeleteAchievement(achievementId);
        }
    }

    async handleDeleteAchievement(achievementId = null) {
        try {
            const idToDelete = achievementId || document.getElementById('edit-achievement-id').value;
            
            this.showLoading('Deleting achievement...');

            // Remove achievement from user data
            const updatedUser = { ...this.currentUser };
            updatedUser.achievements = updatedUser.achievements.filter(a => a.id !== idToDelete);

            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user
            this.currentUser = updatedUser;
            HRData.dataStore.setCurrentUser(updatedUser);

            this.hideLoading();
            
            if (!achievementId) {
                this.closeModal('edit-achievement-modal');
            }
            
            this.showSuccess('Achievement deleted successfully!');
            
            // Re-render achievements
            this.populateAchievements();
            this.markAsChanged();

        } catch (error) {
            console.error('Error deleting achievement:', error);
            this.hideLoading();
            this.showError('Failed to delete achievement. Please try again.');
        }
    }

    collectAchievementFormData(formId) {
        const prefix = formId === 'add-achievement-form' ? 'achievement' : 'edit-achievement';
        
        return {
            type: document.getElementById(`${prefix}-type`).value,
            title: document.getElementById(`${prefix}-title`).value.trim(),
            description: document.getElementById(`${prefix}-description`).value.trim(),
            provider: document.getElementById(`${prefix}-provider`).value.trim(),
            date: document.getElementById(`${prefix}-date`).value,
            skills: document.getElementById(`${prefix}-skills`).value.trim(),
            url: document.getElementById(`${prefix}-url`).value.trim()
        };
    }

    validateAchievementData(data) {
        const errors = {};

        if (!data.type) {
            errors.type = 'Please select an achievement type';
        }

        if (!data.title || data.title.length < 2) {
            errors.title = 'Title must be at least 2 characters long';
        }

        if (data.title && data.title.length > 100) {
            errors.title = 'Title must be less than 100 characters';
        }

        if (!data.date) {
            errors.date = 'Please select the date achieved';
        }

        if (data.date && new Date(data.date) > new Date()) {
            errors.date = 'Achievement date cannot be in the future';
        }

        if (data.description && data.description.length > 500) {
            errors.description = 'Description must be less than 500 characters';
        }

        if (data.url && !this.isValidUrl(data.url)) {
            errors.url = 'Please enter a valid URL';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    showAchievementFormErrors(formId, errors) {
        this.clearFormErrors(formId);

        const prefix = formId === 'add-achievement-form' ? 'achievement' : 'edit-achievement';

        Object.entries(errors).forEach(([field, message]) => {
            const errorEl = document.getElementById(`${prefix}-${field}-error`);
            
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.classList.add('show');
            }
        });
    }

    generateId() {
        return 'ach_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});

// Global modal close function
window.closeModal = function(modalId) {
    if (window.profileManager) {
        window.profileManager.closeModal(modalId);
    }
};

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });

    // Close modal when clicking close button
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
});