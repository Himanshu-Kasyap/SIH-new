/**
 * Recommendations Overview Page
 * Handles AI-powered career recommendations and skill gap analysis
 */

class RecommendationsOverview {
    constructor() {
        this.currentUser = null;
        this.selectedTargetRole = null;
        this.currentRecommendation = null;
        this.roles = [];
        
        this.init();
    }

    async init() {
        try {
            // Check authentication
            this.currentUser = HRData.dataStore.getCurrentUser();
            if (!this.currentUser) {
                window.location.href = '../../index.html';
                return;
            }

            // Initialize navigation
            if (window.Navigation) {
                window.Navigation.init();
            }

            // Load data and setup UI
            await this.loadData();
            this.setupEventListeners();
            this.loadCurrentRecommendations();
            
        } catch (error) {
            console.error('Error initializing recommendations overview:', error);
            this.showError('Failed to load recommendations page');
        }
    }

    async loadData() {
        try {
            // Load all roles for target role selection
            this.roles = HRData.roleService.getAll();
            this.populateRoleSelector();
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    populateRoleSelector() {
        const roleSelect = document.getElementById('target-role-select');
        if (!roleSelect) return;

        // Clear existing options except the first one
        roleSelect.innerHTML = '<option value="">Select a target role...</option>';

        // Group roles by department
        const rolesByDepartment = {};
        this.roles.forEach(role => {
            if (!rolesByDepartment[role.department]) {
                rolesByDepartment[role.department] = [];
            }
            rolesByDepartment[role.department].push(role);
        });

        // Add options grouped by department
        Object.keys(rolesByDepartment).sort().forEach(department => {
            const optgroup = document.createElement('optgroup');
            optgroup.label = department;
            
            rolesByDepartment[department].forEach(role => {
                const option = document.createElement('option');
                option.value = role.id;
                option.textContent = `${role.title} (${role.level})`;
                optgroup.appendChild(option);
            });
            
            roleSelect.appendChild(optgroup);
        });
    }

    setupEventListeners() {
        // Target role selection
        const roleSelect = document.getElementById('target-role-select');
        const analyzeBtn = document.getElementById('analyze-btn');
        
        if (roleSelect) {
            roleSelect.addEventListener('change', (e) => {
                const roleId = e.target.value;
                analyzeBtn.disabled = !roleId;
                
                if (roleId) {
                    this.selectedTargetRole = this.roles.find(role => role.id === roleId);
                } else {
                    this.selectedTargetRole = null;
                    this.hideAnalysisResults();
                }
            });
        }

        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeCareerFit();
            });
        }

        // Action buttons
        const createIdpBtn = document.getElementById('create-idp-btn');
        const saveRecommendationsBtn = document.getElementById('save-recommendations-btn');

        if (createIdpBtn) {
            createIdpBtn.addEventListener('click', () => {
                this.createIndividualDevelopmentPlan();
            });
        }

        if (saveRecommendationsBtn) {
            saveRecommendationsBtn.addEventListener('click', () => {
                this.saveCurrentRecommendation();
            });
        }
    }

    async analyzeCareerFit() {
        if (!this.selectedTargetRole) {
            this.showError('Please select a target role first');
            return;
        }

        try {
            this.showLoading('Analyzing career fit...');
            
            // Generate AI recommendation
            const recommendation = await this.generateAIRecommendation(
                this.currentUser, 
                this.selectedTargetRole
            );
            
            this.currentRecommendation = recommendation;
            
            // Display results
            this.displaySkillGapAnalysis(recommendation.skillGaps);
            this.displayLearningPath(recommendation.learningPath);
            this.showAnalysisResults();
            
            this.hideLoading();
            
        } catch (error) {
            console.error('Error analyzing career fit:', error);
            this.hideLoading();
            this.showError('Failed to analyze career fit. Please try again.');
        }
    }

    async generateAIRecommendation(user, targetRole) {
        // AI-powered recommendation generation logic
        const skillGaps = this.calculateSkillGaps(user, targetRole);
        const learningPath = this.generateLearningPath(skillGaps, targetRole);
        const timeline = this.calculateTimeline(skillGaps);
        const confidence = this.calculateConfidence(user, targetRole, skillGaps);

        const recommendation = new HRData.Recommendation({
            employeeId: user.id,
            targetRole: targetRole.id,
            skillGaps: skillGaps,
            learningPath: learningPath,
            timeline: timeline,
            confidence: confidence,
            status: 'pending'
        });

        return recommendation;
    }

    calculateSkillGaps(user, targetRole) {
        const skillGaps = {};
        
        // Analyze each required skill for the target role
        Object.entries(targetRole.requiredSkills).forEach(([skillName, requirements]) => {
            const currentLevel = user.skills[skillName]?.level || 0;
            const requiredLevel = requirements.minimumLevel;
            
            if (currentLevel < requiredLevel) {
                const gap = requiredLevel - currentLevel;
                let priority = 'medium';
                
                // Determine priority based on skill importance and gap size
                if (requirements.critical && gap >= 2) {
                    priority = 'high';
                } else if (requirements.critical || gap >= 3) {
                    priority = 'high';
                } else if (gap >= 2 || requirements.weight > 0.8) {
                    priority = 'medium';
                } else {
                    priority = 'low';
                }
                
                skillGaps[skillName] = {
                    currentLevel: currentLevel,
                    requiredLevel: requiredLevel,
                    priority: priority,
                    gap: gap,
                    weight: requirements.weight,
                    critical: requirements.critical
                };
            }
        });
        
        return skillGaps;
    }

    generateLearningPath(skillGaps, targetRole) {
        const learningPath = [];
        
        // Sort skill gaps by priority and impact
        const sortedGaps = Object.entries(skillGaps).sort((a, b) => {
            const [, gapA] = a;
            const [, gapB] = b;
            
            // Priority order: high > medium > low
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[gapB.priority] - priorityOrder[gapA.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            
            // If same priority, sort by gap size * weight
            return (gapB.gap * gapB.weight) - (gapA.gap * gapA.weight);
        });

        // Generate learning items for each skill gap
        sortedGaps.forEach(([skillName, gap], index) => {
            const learningItems = this.generateLearningItemsForSkill(skillName, gap, index);
            learningPath.push(...learningItems);
        });

        return learningPath;
    }

    generateLearningItemsForSkill(skillName, gap, sequenceIndex) {
        const items = [];
        const baseMonth = Math.floor(sequenceIndex / 2) + 1; // Stagger learning items
        
        // Generate different types of learning based on skill and gap
        const gapSize = gap.gap;
        
        if (gapSize >= 1) {
            // Online course
            items.push({
                type: 'course',
                title: `${skillName} Fundamentals Course`,
                description: `Complete an online course to build foundational knowledge in ${skillName}`,
                provider: this.getRecommendedProvider(skillName),
                duration: '4-6 weeks',
                effort: '5-8 hours/week',
                month: baseMonth,
                priority: gap.priority,
                skillImpact: Math.min(2, gapSize)
            });
        }
        
        if (gapSize >= 2) {
            // Hands-on project
            items.push({
                type: 'project',
                title: `${skillName} Practice Project`,
                description: `Apply ${skillName} skills in a real-world project or assignment`,
                duration: '2-3 weeks',
                effort: '10-15 hours/week',
                month: baseMonth + 1,
                priority: gap.priority,
                skillImpact: Math.min(2, gapSize - 1)
            });
        }
        
        if (gapSize >= 3 || gap.critical) {
            // Mentoring or advanced training
            items.push({
                type: 'mentoring',
                title: `${skillName} Mentoring Session`,
                description: `Work with a senior colleague or external mentor to develop advanced ${skillName} skills`,
                duration: '4-8 weeks',
                effort: '2-3 hours/week',
                month: baseMonth + 2,
                priority: gap.priority,
                skillImpact: Math.min(2, gapSize - 2)
            });
        }
        
        return items;
    }

    getRecommendedProvider(skillName) {
        const providers = {
            'JavaScript': 'Coursera - JavaScript Essentials',
            'Python': 'edX - Python Programming',
            'React': 'Udemy - React Complete Guide',
            'Leadership': 'LinkedIn Learning - Leadership Foundations',
            'Project Management': 'PMI - Project Management Basics',
            'Data Analysis': 'Coursera - Data Analysis with Python',
            'Communication': 'Toastmasters International',
            'Strategic Planning': 'Harvard Business School Online'
        };
        
        return providers[skillName] || 'Internal Training Program';
    }

    calculateTimeline(skillGaps) {
        // Calculate timeline based on number and complexity of skill gaps
        const totalGaps = Object.keys(skillGaps).length;
        const highPriorityGaps = Object.values(skillGaps).filter(gap => gap.priority === 'high').length;
        const averageGapSize = Object.values(skillGaps).reduce((sum, gap) => sum + gap.gap, 0) / totalGaps;
        
        // Base timeline calculation
        let months = 6; // Base 6 months
        
        // Add time based on number of gaps
        months += Math.floor(totalGaps / 2) * 2;
        
        // Add extra time for high priority gaps
        months += highPriorityGaps * 2;
        
        // Add time based on average gap size
        months += Math.floor(averageGapSize) * 2;
        
        // Cap at reasonable limits
        return Math.min(Math.max(months, 3), 24);
    }

    calculateConfidence(user, targetRole, skillGaps) {
        // Calculate AI confidence score based on various factors
        let confidence = 0.5; // Base confidence
        
        // Factor 1: User's current experience level
        const experienceMatch = Math.min(user.experience / targetRole.experience, 1);
        confidence += experienceMatch * 0.2;
        
        // Factor 2: Number of existing skills that match
        const requiredSkills = Object.keys(targetRole.requiredSkills);
        const matchingSkills = requiredSkills.filter(skill => 
            user.skills[skill] && user.skills[skill].level >= targetRole.requiredSkills[skill].minimumLevel
        );
        const skillMatchRatio = matchingSkills.length / requiredSkills.length;
        confidence += skillMatchRatio * 0.3;
        
        // Factor 3: Severity of skill gaps (lower gaps = higher confidence)
        const totalGapSeverity = Object.values(skillGaps).reduce((sum, gap) => sum + gap.gap, 0);
        const maxPossibleGaps = Object.keys(skillGaps).length * 5; // Max gap per skill is 5
        const gapSeverityRatio = 1 - (totalGapSeverity / Math.max(maxPossibleGaps, 1));
        confidence += gapSeverityRatio * 0.2;
        
        // Ensure confidence is between 0 and 1
        return Math.max(0.1, Math.min(0.95, confidence));
    }

    displaySkillGapAnalysis(skillGaps) {
        const container = document.getElementById('skill-gaps-grid');
        if (!container) return;

        container.innerHTML = '';

        if (Object.keys(skillGaps).length === 0) {
            container.innerHTML = `
                <div class="no-gaps-message">
                    <h3>🎉 Congratulations!</h3>
                    <p>You already meet all the skill requirements for this role.</p>
                </div>
            `;
            return;
        }

        Object.entries(skillGaps).forEach(([skillName, gap]) => {
            const gapCard = document.createElement('div');
            gapCard.className = `skill-gap-card priority-${gap.priority}`;
            
            gapCard.innerHTML = `
                <div class="skill-gap-header">
                    <h4>${skillName}</h4>
                    <span class="priority-badge priority-${gap.priority}">${gap.priority.toUpperCase()}</span>
                </div>
                <div class="skill-levels">
                    <div class="current-level">
                        <span class="label">Current:</span>
                        <div class="level-bar">
                            ${this.renderSkillLevel(gap.currentLevel)}
                        </div>
                    </div>
                    <div class="required-level">
                        <span class="label">Required:</span>
                        <div class="level-bar">
                            ${this.renderSkillLevel(gap.requiredLevel)}
                        </div>
                    </div>
                </div>
                <div class="gap-info">
                    <span class="gap-size">Gap: ${gap.gap} level${gap.gap > 1 ? 's' : ''}</span>
                    ${gap.critical ? '<span class="critical-badge">Critical Skill</span>' : ''}
                </div>
            `;
            
            container.appendChild(gapCard);
        });
    }

    renderSkillLevel(level) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(`<span class="star ${i <= level ? 'filled' : ''}">${i <= level ? '★' : '☆'}</span>`);
        }
        return stars.join('');
    }

    displayLearningPath(learningPath) {
        const container = document.getElementById('path-timeline');
        if (!container) return;

        container.innerHTML = '';

        if (learningPath.length === 0) {
            container.innerHTML = '<p class="no-path-message">No specific learning path needed - you\'re ready for this role!</p>';
            return;
        }

        // Group learning items by month
        const itemsByMonth = {};
        learningPath.forEach(item => {
            if (!itemsByMonth[item.month]) {
                itemsByMonth[item.month] = [];
            }
            itemsByMonth[item.month].push(item);
        });

        // Create timeline
        Object.keys(itemsByMonth).sort((a, b) => parseInt(a) - parseInt(b)).forEach(month => {
            const monthSection = document.createElement('div');
            monthSection.className = 'timeline-month';
            
            monthSection.innerHTML = `
                <div class="month-header">
                    <h4>Month ${month}</h4>
                </div>
                <div class="month-items">
                    ${itemsByMonth[month].map(item => this.renderLearningItem(item)).join('')}
                </div>
            `;
            
            container.appendChild(monthSection);
        });
    }

    renderLearningItem(item) {
        const typeIcons = {
            course: '📚',
            project: '🛠️',
            mentoring: '👥',
            certification: '🏆',
            workshop: '🎯'
        };

        return `
            <div class="learning-item priority-${item.priority}">
                <div class="item-header">
                    <span class="item-icon">${typeIcons[item.type] || '📖'}</span>
                    <h5>${item.title}</h5>
                    <span class="priority-badge priority-${item.priority}">${item.priority}</span>
                </div>
                <p class="item-description">${item.description}</p>
                <div class="item-details">
                    ${item.provider ? `<span class="provider">📍 ${item.provider}</span>` : ''}
                    <span class="duration">⏱️ ${item.duration}</span>
                    ${item.effort ? `<span class="effort">💪 ${item.effort}</span>` : ''}
                </div>
            </div>
        `;
    }

    showAnalysisResults() {
        const skillGapSection = document.getElementById('skill-gap-section');
        const learningPathSection = document.getElementById('learning-path-section');
        
        if (skillGapSection) skillGapSection.style.display = 'block';
        if (learningPathSection) learningPathSection.style.display = 'block';
        
        // Smooth scroll to results
        skillGapSection?.scrollIntoView({ behavior: 'smooth' });
    }

    hideAnalysisResults() {
        const skillGapSection = document.getElementById('skill-gap-section');
        const learningPathSection = document.getElementById('learning-path-section');
        
        if (skillGapSection) skillGapSection.style.display = 'none';
        if (learningPathSection) learningPathSection.style.display = 'none';
    }

    async saveCurrentRecommendation() {
        if (!this.currentRecommendation) {
            this.showError('No recommendation to save');
            return;
        }

        try {
            // Save recommendation to storage
            const savedRecommendation = HRData.recommendationService.create(this.currentRecommendation);
            
            // Refresh current recommendations display
            this.loadCurrentRecommendations();
            
            this.showSuccess('Recommendation saved successfully!');
            
        } catch (error) {
            console.error('Error saving recommendation:', error);
            this.showError('Failed to save recommendation');
        }
    }

    createIndividualDevelopmentPlan() {
        if (!this.currentRecommendation) {
            this.showError('Please generate a recommendation first');
            return;
        }

        // Navigate to IDP page with current recommendation data
        const params = new URLSearchParams({
            recommendationId: this.currentRecommendation.id || 'temp',
            targetRole: this.selectedTargetRole.id
        });
        
        window.location.href = `idp.html?${params.toString()}`;
    }

    loadCurrentRecommendations() {
        const container = document.getElementById('recommendations-grid');
        if (!container) return;

        try {
            const recommendations = HRData.recommendationService.getByEmployeeId(this.currentUser.id);
            
            container.innerHTML = '';

            if (recommendations.length === 0) {
                container.innerHTML = `
                    <div class="no-recommendations">
                        <p>No recommendations yet. Generate your first career recommendation above!</p>
                    </div>
                `;
                return;
            }

            recommendations.forEach(rec => {
                const targetRole = this.roles.find(role => role.id === rec.targetRole);
                const recCard = this.createRecommendationCard(rec, targetRole);
                container.appendChild(recCard);
            });

        } catch (error) {
            console.error('Error loading current recommendations:', error);
            container.innerHTML = '<p class="error-message">Failed to load recommendations</p>';
        }
    }

    createRecommendationCard(recommendation, targetRole) {
        const card = document.createElement('div');
        card.className = 'recommendation-card';
        
        const confidencePercent = Math.round(recommendation.confidence * 100);
        const skillGapCount = Object.keys(recommendation.skillGaps).length;
        const createdDate = new Date(recommendation.createdAt).toLocaleDateString();
        
        card.innerHTML = `
            <div class="rec-card-header">
                <h4>${targetRole?.title || 'Unknown Role'}</h4>
                <span class="confidence-badge">${confidencePercent}% match</span>
            </div>
            <div class="rec-card-body">
                <p class="target-role">${targetRole?.department || 'Unknown Department'}</p>
                <div class="rec-stats">
                    <span class="skill-gaps">${skillGapCount} skill gap${skillGapCount !== 1 ? 's' : ''}</span>
                    <span class="timeline">${recommendation.timeline} month timeline</span>
                </div>
                <p class="created-date">Created: ${createdDate}</p>
            </div>
            <div class="rec-card-actions">
                <button class="btn btn-sm btn-primary" onclick="recommendationsOverview.viewRecommendation('${recommendation.id}')">
                    View Details
                </button>
                <button class="btn btn-sm btn-secondary" onclick="recommendationsOverview.createIdpFromRecommendation('${recommendation.id}')">
                    Create IDP
                </button>
            </div>
        `;
        
        return card;
    }

    viewRecommendation(recommendationId) {
        // Navigate to detailed view or show modal
        window.location.href = `compare.html?recommendationId=${recommendationId}`;
    }

    createIdpFromRecommendation(recommendationId) {
        // Navigate to IDP creation with existing recommendation
        window.location.href = `idp.html?recommendationId=${recommendationId}`;
    }

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.querySelector('p').textContent = message;
            overlay.style.display = 'flex';
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper notification system
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        // Simple success display - could be enhanced with a proper notification system
        alert(`Success: ${message}`);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.recommendationsOverview = new RecommendationsOverview();
});