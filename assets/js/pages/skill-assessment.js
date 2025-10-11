/**
 * Skill Assessment Module
 * Handles skill rating, management, and gap analysis
 */

class SkillAssessmentManager {
    constructor() {
        this.currentUser = null;
        this.skills = {};
        this.filteredSkills = {};
        this.currentFilter = 'all';
        this.skillCategories = {
            technical: ['JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB', 'DevOps', 'Cloud Computing'],
            soft: ['Communication', 'Problem Solving', 'Team Building', 'Customer Service', 'Adaptability', 'Time Management'],
            leadership: ['Leadership', 'Project Management', 'Strategic Planning', 'Mentoring', 'Decision Making', 'Conflict Resolution'],
            domain: ['Data Analysis', 'Machine Learning', 'UI/UX Design', 'Marketing', 'Sales', 'Finance', 'HR Management']
        };
        
        this.skillSets = {
            development: [
                { name: 'JavaScript', level: 3, category: 'technical' },
                { name: 'Python', level: 2, category: 'technical' },
                { name: 'React', level: 3, category: 'technical' },
                { name: 'Node.js', level: 2, category: 'technical' },
                { name: 'SQL', level: 3, category: 'technical' },
                { name: 'Git', level: 4, category: 'technical' }
            ],
            pm: [
                { name: 'Agile Methodology', level: 4, category: 'leadership' },
                { name: 'Project Management', level: 4, category: 'leadership' },
                { name: 'Leadership', level: 3, category: 'leadership' },
                { name: 'Communication', level: 4, category: 'soft' },
                { name: 'Strategic Planning', level: 3, category: 'leadership' }
            ],
            data: [
                { name: 'Data Analysis', level: 4, category: 'domain' },
                { name: 'SQL', level: 4, category: 'technical' },
                { name: 'Python', level: 3, category: 'technical' },
                { name: 'Machine Learning', level: 2, category: 'domain' },
                { name: 'Statistics', level: 3, category: 'domain' }
            ],
            marketing: [
                { name: 'Digital Marketing', level: 4, category: 'domain' },
                { name: 'Marketing', level: 4, category: 'domain' },
                { name: 'Data Analysis', level: 3, category: 'domain' },
                { name: 'Communication', level: 4, category: 'soft' },
                { name: 'Strategic Planning', level: 3, category: 'leadership' }
            ]
        };

        this.init();
    }

    init() {
        // Check authentication
        if (!this.checkAuth()) {
            return;
        }

        // Load user skills
        this.loadUserSkills();
        
        // Setup navigation
        this.setupNavigation();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Render initial content
        this.renderSkillsOverview();
        this.renderSkillsGrid();
        
        // Hide loading
        this.hideLoading();
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

    loadUserSkills() {
        try {
            // Get fresh user data
            const userData = HRData.userService.getById(this.currentUser.id);
            if (userData && userData.skills) {
                this.skills = userData.skills;
                this.filteredSkills = { ...this.skills };
            }
        } catch (error) {
            console.error('Error loading user skills:', error);
            this.showError('Failed to load skills data');
        }
    }

    setupNavigation() {
        if (window.NavigationComponent) {
            const nav = new NavigationComponent();
            nav.render();
        }
    }

    setupEventListeners() {
        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleCategoryFilter(e.target.dataset.category);
            });
        });

        // Add skill button
        document.getElementById('add-skill-btn')?.addEventListener('click', () => {
            this.showAddSkillModal();
        });

        // Import skills button
        document.getElementById('import-skills-btn')?.addEventListener('click', () => {
            this.showImportSkillsModal();
        });

        // Analyze gaps button
        document.getElementById('analyze-gaps-btn')?.addEventListener('click', () => {
            this.analyzeSkillGaps();
        });

        // Add skill form
        document.getElementById('add-skill-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddSkill();
        });

        // Edit skill form
        document.getElementById('edit-skill-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditSkill();
        });

        // Delete skill button
        document.getElementById('delete-skill-btn')?.addEventListener('click', () => {
            this.handleDeleteSkill();
        });

        // Import skill set buttons
        document.querySelectorAll('[data-skillset]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.importSkillSet(e.target.dataset.skillset);
            });
        });

        // Rating stars for add skill modal
        this.setupRatingStars('add-skill-stars', 'skill-level');
        
        // Rating stars for edit skill modal
        this.setupRatingStars('edit-skill-stars', 'edit-skill-level');
    }

    setupRatingStars(containerId, inputId) {
        const container = document.getElementById(containerId);
        const input = document.getElementById(inputId);
        
        if (!container || !input) return;

        const stars = container.querySelectorAll('.star');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                const rating = index + 1;
                input.value = rating;
                this.updateStarDisplay(container, rating);
            });

            star.addEventListener('mouseenter', () => {
                this.updateStarHover(container, index + 1);
            });
        });

        container.addEventListener('mouseleave', () => {
            const currentRating = parseInt(input.value) || 1;
            this.updateStarDisplay(container, currentRating);
        });
    }

    updateStarDisplay(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.remove('selected', 'hover');
            if (index < rating) {
                star.classList.add('selected');
            }
        });
    }

    updateStarHover(container, rating) {
        const stars = container.querySelectorAll('.star');
        stars.forEach((star, index) => {
            star.classList.remove('hover');
            if (index < rating) {
                star.classList.add('hover');
            }
        });
    }

    handleCategoryFilter(category) {
        this.currentFilter = category;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Filter skills
        this.filterSkills(category);
        
        // Re-render grid
        this.renderSkillsGrid();
    }

    filterSkills(category) {
        if (category === 'all') {
            this.filteredSkills = { ...this.skills };
            return;
        }

        this.filteredSkills = {};
        Object.entries(this.skills).forEach(([skillName, skillData]) => {
            const skillCategory = this.getSkillCategory(skillName);
            if (skillCategory === category) {
                this.filteredSkills[skillName] = skillData;
            }
        });
    }

    getSkillCategory(skillName) {
        for (const [category, skills] of Object.entries(this.skillCategories)) {
            if (skills.includes(skillName)) {
                return category;
            }
        }
        return 'domain'; // Default category
    }

    renderSkillsOverview() {
        const totalSkills = Object.keys(this.skills).length;
        const verifiedSkills = Object.values(this.skills).filter(skill => skill.verified).length;
        const avgLevel = totalSkills > 0 ? 
            (Object.values(this.skills).reduce((sum, skill) => sum + skill.level, 0) / totalSkills).toFixed(1) : 
            '0.0';

        // Calculate skill gaps (skills below level 3)
        const skillGaps = Object.values(this.skills).filter(skill => skill.level < 3).length;

        this.updateElement('total-skills', totalSkills);
        this.updateElement('verified-skills', verifiedSkills);
        this.updateElement('avg-level', avgLevel);
        this.updateElement('skill-gaps', skillGaps);
    }

    renderSkillsGrid() {
        const container = document.getElementById('skills-grid');
        if (!container) return;

        const skillEntries = Object.entries(this.filteredSkills);

        if (skillEntries.length === 0) {
            container.innerHTML = this.renderNoSkillsState();
            return;
        }

        const skillsHTML = skillEntries.map(([skillName, skillData]) => {
            return this.renderSkillCard(skillName, skillData);
        }).join('');

        container.innerHTML = skillsHTML;

        // Add click listeners to skill cards
        container.querySelectorAll('.skill-card').forEach(card => {
            card.addEventListener('click', () => {
                const skillName = card.dataset.skillName;
                this.showEditSkillModal(skillName);
            });
        });
    }

    renderSkillCard(skillName, skillData) {
        const category = this.getSkillCategory(skillName);
        const levelText = this.getLevelText(skillData.level);
        const starsHTML = this.renderStars(skillData.level);
        const verifiedBadge = skillData.verified ? 
            '<span class="skill-verified"><span class="icon">✓</span>Verified</span>' : '';
        const lastUpdated = this.formatDate(skillData.lastUpdated);

        return `
            <div class="skill-card" data-skill-name="${this.escapeHtml(skillName)}">
                <div class="skill-card-header">
                    <h4 class="skill-name">${this.escapeHtml(skillName)}</h4>
                    ${verifiedBadge}
                </div>
                <div class="skill-level-display">
                    <div class="skill-stars">${starsHTML}</div>
                    <span class="skill-level-text">${levelText}</span>
                </div>
                <div class="skill-meta">
                    <span class="skill-category">${this.capitalizeFirst(category)}</span>
                    <span class="skill-updated">Updated ${lastUpdated}</span>
                </div>
            </div>
        `;
    }

    renderStars(level) {
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const filled = i <= level ? 'filled' : '';
            starsHTML += `<span class="star ${filled}">★</span>`;
        }
        return starsHTML;
    }

    renderNoSkillsState() {
        return `
            <div class="no-skills">
                <h3>No Skills Added Yet</h3>
                <p>Start building your skill profile by adding your first skill.</p>
                <button class="btn btn-primary" onclick="skillAssessmentManager.showAddSkillModal()">
                    <span class="icon">+</span>
                    Add Your First Skill
                </button>
            </div>
        `;
    }

    getLevelText(level) {
        const levels = {
            1: 'Beginner',
            2: 'Basic',
            3: 'Intermediate',
            4: 'Advanced',
            5: 'Expert'
        };
        return levels[level] || 'Unknown';
    }

    showAddSkillModal() {
        // Reset form
        document.getElementById('add-skill-form').reset();
        document.getElementById('skill-level').value = '1';
        this.updateStarDisplay(document.getElementById('add-skill-stars'), 1);
        
        // Clear errors
        this.clearFormErrors('add-skill-form');
        
        // Show modal
        document.getElementById('add-skill-modal').style.display = 'flex';
    }

    showEditSkillModal(skillName) {
        const skillData = this.skills[skillName];
        if (!skillData) return;

        // Populate form
        document.getElementById('edit-skill-name').value = skillName;
        document.getElementById('edit-skill-level').value = skillData.level;
        document.getElementById('edit-skill-verified').checked = skillData.verified;
        document.getElementById('edit-skill-original-name').value = skillName;

        // Update stars
        this.updateStarDisplay(document.getElementById('edit-skill-stars'), skillData.level);
        
        // Clear errors
        this.clearFormErrors('edit-skill-form');
        
        // Show modal
        document.getElementById('edit-skill-modal').style.display = 'flex';
    }

    showImportSkillsModal() {
        document.getElementById('import-skills-modal').style.display = 'flex';
    }

    async handleAddSkill() {
        try {
            const formData = this.collectAddSkillFormData();
            const validation = this.validateSkillData(formData);

            if (!validation.isValid) {
                this.showFormErrors('add-skill-form', validation.errors);
                return;
            }

            // Check if skill already exists
            if (this.skills[formData.skillName]) {
                this.showFormErrors('add-skill-form', { 
                    skillName: 'This skill already exists. Use the edit function to update it.' 
                });
                return;
            }

            this.showLoading('Adding skill...');

            // Add skill to user data
            const updatedUser = { ...this.currentUser };
            updatedUser.skills[formData.skillName] = {
                level: formData.level,
                verified: formData.verified,
                lastUpdated: new Date().toISOString()
            };

            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user and local data
            this.currentUser = updatedUser;
            HRData.dataStore.setCurrentUser(updatedUser);
            this.skills = updatedUser.skills;
            this.filterSkills(this.currentFilter);

            this.hideLoading();
            this.closeModal('add-skill-modal');
            this.showSuccess('Skill added successfully!');
            
            // Re-render
            this.renderSkillsOverview();
            this.renderSkillsGrid();

        } catch (error) {
            console.error('Error adding skill:', error);
            this.hideLoading();
            this.showError('Failed to add skill. Please try again.');
        }
    }

    async handleEditSkill() {
        try {
            const formData = this.collectEditSkillFormData();
            const validation = this.validateSkillData(formData);

            if (!validation.isValid) {
                this.showFormErrors('edit-skill-form', validation.errors);
                return;
            }

            const originalName = formData.originalName;
            const newName = formData.skillName;

            // Check if renaming to existing skill
            if (originalName !== newName && this.skills[newName]) {
                this.showFormErrors('edit-skill-form', { 
                    skillName: 'A skill with this name already exists.' 
                });
                return;
            }

            this.showLoading('Updating skill...');

            // Update skill in user data
            const updatedUser = { ...this.currentUser };
            
            // Remove old skill if name changed
            if (originalName !== newName) {
                delete updatedUser.skills[originalName];
            }
            
            // Add/update skill
            updatedUser.skills[newName] = {
                level: formData.level,
                verified: formData.verified,
                lastUpdated: new Date().toISOString()
            };

            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user and local data
            this.currentUser = updatedUser;
            HRData.dataStore.setCurrentUser(updatedUser);
            this.skills = updatedUser.skills;
            this.filterSkills(this.currentFilter);

            this.hideLoading();
            this.closeModal('edit-skill-modal');
            this.showSuccess('Skill updated successfully!');
            
            // Re-render
            this.renderSkillsOverview();
            this.renderSkillsGrid();

        } catch (error) {
            console.error('Error updating skill:', error);
            this.hideLoading();
            this.showError('Failed to update skill. Please try again.');
        }
    }

    async handleDeleteSkill() {
        const skillName = document.getElementById('edit-skill-original-name').value;
        
        if (!confirm(`Are you sure you want to delete the skill "${skillName}"? This action cannot be undone.`)) {
            return;
        }

        try {
            this.showLoading('Deleting skill...');

            // Remove skill from user data
            const updatedUser = { ...this.currentUser };
            delete updatedUser.skills[skillName];

            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user and local data
            this.currentUser = updatedUser;
            HRData.dataStore.setCurrentUser(updatedUser);
            this.skills = updatedUser.skills;
            this.filterSkills(this.currentFilter);

            this.hideLoading();
            this.closeModal('edit-skill-modal');
            this.showSuccess('Skill deleted successfully!');
            
            // Re-render
            this.renderSkillsOverview();
            this.renderSkillsGrid();

        } catch (error) {
            console.error('Error deleting skill:', error);
            this.hideLoading();
            this.showError('Failed to delete skill. Please try again.');
        }
    }

    async importSkillSet(skillSetName) {
        const skillSet = this.skillSets[skillSetName];
        if (!skillSet) return;

        try {
            this.showLoading('Importing skills...');

            const updatedUser = { ...this.currentUser };
            let importedCount = 0;

            skillSet.forEach(skill => {
                if (!updatedUser.skills[skill.name]) {
                    updatedUser.skills[skill.name] = {
                        level: skill.level,
                        verified: false,
                        lastUpdated: new Date().toISOString()
                    };
                    importedCount++;
                }
            });

            if (importedCount === 0) {
                this.hideLoading();
                this.showError('All skills from this set are already in your profile.');
                return;
            }

            // Save to storage
            await HRData.userService.update(this.currentUser.id, updatedUser);
            
            // Update current user and local data
            this.currentUser = updatedUser;
            HRData.dataStore.setCurrentUser(updatedUser);
            this.skills = updatedUser.skills;
            this.filterSkills(this.currentFilter);

            this.hideLoading();
            this.closeModal('import-skills-modal');
            this.showSuccess(`Successfully imported ${importedCount} new skills!`);
            
            // Re-render
            this.renderSkillsOverview();
            this.renderSkillsGrid();

        } catch (error) {
            console.error('Error importing skills:', error);
            this.hideLoading();
            this.showError('Failed to import skills. Please try again.');
        }
    }

    analyzeSkillGaps() {
        this.showLoading('Analyzing skill gaps...');

        // Simulate gap analysis
        setTimeout(() => {
            const gaps = this.calculateSkillGaps();
            this.renderSkillGaps(gaps);
            this.hideLoading();
        }, 1500);
    }

    calculateSkillGaps() {
        // Simple gap analysis - skills below level 3 are considered gaps
        const gaps = [];
        
        Object.entries(this.skills).forEach(([skillName, skillData]) => {
            if (skillData.level < 3) {
                gaps.push({
                    skillName,
                    currentLevel: skillData.level,
                    targetLevel: 3,
                    priority: skillData.level === 1 ? 'high' : 'medium',
                    recommendations: this.getSkillRecommendations(skillName, skillData.level)
                });
            }
        });

        // Add some common skills that might be missing
        const commonSkills = ['Communication', 'Leadership', 'Problem Solving'];
        commonSkills.forEach(skill => {
            if (!this.skills[skill]) {
                gaps.push({
                    skillName: skill,
                    currentLevel: 0,
                    targetLevel: 3,
                    priority: 'high',
                    recommendations: this.getSkillRecommendations(skill, 0)
                });
            }
        });

        return gaps.slice(0, 6); // Limit to top 6 gaps
    }

    getSkillRecommendations(skillName, currentLevel) {
        const recommendations = {
            'Communication': ['Take a public speaking course', 'Practice active listening', 'Join a professional networking group'],
            'Leadership': ['Volunteer to lead a project', 'Take a leadership workshop', 'Find a mentor in leadership'],
            'Problem Solving': ['Practice coding challenges', 'Take on complex projects', 'Learn analytical frameworks'],
            'JavaScript': ['Complete online JavaScript course', 'Build personal projects', 'Contribute to open source'],
            'Python': ['Take Python fundamentals course', 'Practice with coding exercises', 'Build data analysis projects']
        };

        return recommendations[skillName] || [
            'Take relevant online courses',
            'Practice through hands-on projects',
            'Seek mentorship or guidance'
        ];
    }

    renderSkillGaps(gaps) {
        const container = document.getElementById('skill-gaps-content');
        if (!container) return;

        if (gaps.length === 0) {
            container.innerHTML = '<div class="no-data">Great job! No significant skill gaps identified.</div>';
            return;
        }

        const gapsHTML = gaps.map(gap => {
            const progress = (gap.currentLevel / gap.targetLevel) * 100;
            const recommendationsHTML = gap.recommendations.map(rec => `<li>${rec}</li>`).join('');

            return `
                <div class="gap-item">
                    <div class="gap-header">
                        <h4 class="gap-skill-name">${this.escapeHtml(gap.skillName)}</h4>
                        <span class="gap-priority ${gap.priority}">${gap.priority}</span>
                    </div>
                    <div class="gap-details">
                        <div class="gap-levels">
                            <span>Current: ${gap.currentLevel}/5</span>
                            <span>Target: ${gap.targetLevel}/5</span>
                        </div>
                    </div>
                    <div class="gap-progress">
                        <div class="gap-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="gap-recommendations">
                        <h5>Recommended Actions:</h5>
                        <ul>${recommendationsHTML}</ul>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = `<div class="gap-analysis-grid">${gapsHTML}</div>`;
    }

    collectAddSkillFormData() {
        return {
            skillName: document.getElementById('skill-name').value.trim(),
            level: parseInt(document.getElementById('skill-level').value),
            verified: document.getElementById('skill-verified').checked
        };
    }

    collectEditSkillFormData() {
        return {
            skillName: document.getElementById('edit-skill-name').value.trim(),
            level: parseInt(document.getElementById('edit-skill-level').value),
            verified: document.getElementById('edit-skill-verified').checked,
            originalName: document.getElementById('edit-skill-original-name').value
        };
    }

    validateSkillData(data) {
        const errors = {};

        if (!data.skillName || data.skillName.length < 2) {
            errors.skillName = 'Skill name must be at least 2 characters long';
        }

        if (data.skillName && data.skillName.length > 50) {
            errors.skillName = 'Skill name must be less than 50 characters';
        }

        if (!data.level || data.level < 1 || data.level > 5) {
            errors.level = 'Skill level must be between 1 and 5';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    showFormErrors(formId, errors) {
        this.clearFormErrors(formId);

        Object.entries(errors).forEach(([field, message]) => {
            const errorEl = document.getElementById(`${field}-error`) || 
                           document.getElementById(`${formId.replace('-form', '')}-${field}-error`);
            
            if (errorEl) {
                errorEl.textContent = message;
                errorEl.classList.add('show');
            }
        });
    }

    clearFormErrors(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.querySelectorAll('.field-error').forEach(el => {
                el.classList.remove('show');
                el.textContent = '';
            });
        }
    }

    // Utility Methods
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(dateString) {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
    }

    // Modal Methods
    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            const messageEl = overlay.querySelector('p');
            if (messageEl) messageEl.textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    showSuccess(message) {
        const modal = document.getElementById('success-modal');
        if (modal) {
            const messageEl = document.getElementById('success-message');
            if (messageEl) messageEl.textContent = message;
            modal.style.display = 'flex';
        }
    }

    showError(message) {
        const modal = document.getElementById('error-modal');
        if (modal) {
            const messageEl = document.getElementById('error-message');
            if (messageEl) messageEl.textContent = message;
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    }
}

// Initialize skill assessment manager
document.addEventListener('DOMContentLoaded', () => {
    window.skillAssessmentManager = new SkillAssessmentManager();
});

// Global modal functions
window.closeModal = function(modalId) {
    if (window.skillAssessmentManager) {
        window.skillAssessmentManager.closeModal(modalId);
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
            if (modal) modal.style.display = 'none';
        });
    });
});