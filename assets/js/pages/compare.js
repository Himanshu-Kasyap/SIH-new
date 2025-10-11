/**
 * Role Comparison Page
 * Handles detailed comparison between current profile and target role
 */

class ComparePage {
    constructor() {
        this.currentUser = null;
        this.targetRole = null;
        this.currentRecommendation = null;
        this.allRoles = [];
        this.comparisonData = null;
        this.currentView = 'chart';
        this.activeTab = 'high';
        this.filters = {
            gap: '',
            priority: ''
        };
        
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

            // Load data
            await this.loadData();
            this.setupEventListeners();
            this.performComparison();
            this.renderComparison();
            
        } catch (error) {
            console.error('Error initializing compare page:', error);
            this.showError('Failed to load comparison page');
        }
    }

    async loadData() {
        try {
            // Load all roles
            this.allRoles = HRData.roleService.getAll();
            
            // Get target role from URL parameters or recommendation
            const urlParams = new URLSearchParams(window.location.search);
            const recommendationId = urlParams.get('recommendationId');
            const targetRoleId = urlParams.get('targetRole');

            if (recommendationId) {
                this.currentRecommendation = HRData.recommendationService.getById(recommendationId);
                if (this.currentRecommendation) {
                    this.targetRole = HRData.roleService.getById(this.currentRecommendation.targetRole);
                }
            } else if (targetRoleId) {
                this.targetRole = HRData.roleService.getById(targetRoleId);
            }

            if (!this.targetRole) {
                // Default to first available role or show role selection
                if (this.allRoles.length > 0) {
                    this.targetRole = this.allRoles[0];
                } else {
                    throw new Error('No roles available for comparison');
                }
            }

        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // View toggle
        const chartViewBtn = document.getElementById('chart-view-btn');
        const tableViewBtn = document.getElementById('table-view-btn');

        if (chartViewBtn) {
            chartViewBtn.addEventListener('click', () => this.switchView('chart'));
        }

        if (tableViewBtn) {
            tableViewBtn.addEventListener('click', () => this.switchView('table'));
        }

        // Filters
        const gapFilter = document.getElementById('gap-filter');
        const priorityFilter = document.getElementById('priority-filter');

        if (gapFilter) {
            gapFilter.addEventListener('change', (e) => {
                this.filters.gap = e.target.value;
                this.applyFilters();
            });
        }

        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                this.filters.priority = e.target.value;
                this.applyFilters();
            });
        }

        // Priority tabs
        const priorityTabs = document.querySelectorAll('.priority-tab');
        priorityTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchPriorityTab(e.target.dataset.priority);
            });
        });

        // Action buttons
        const changeTargetRoleBtn = document.getElementById('change-target-role-btn');
        const exportComparisonBtn = document.getElementById('export-comparison-btn');
        const createDevelopmentPlanBtn = document.getElementById('create-development-plan-btn');
        const saveComparisonBtn = document.getElementById('save-comparison-btn');

        if (changeTargetRoleBtn) {
            changeTargetRoleBtn.addEventListener('click', () => this.showRoleSelectionModal());
        }

        if (exportComparisonBtn) {
            exportComparisonBtn.addEventListener('click', () => this.exportComparison());
        }

        if (createDevelopmentPlanBtn) {
            createDevelopmentPlanBtn.addEventListener('click', () => this.createDevelopmentPlan());
        }

        if (saveComparisonBtn) {
            saveComparisonBtn.addEventListener('click', () => this.saveComparison());
        }

        // Role search
        const roleSearchInput = document.getElementById('role-search-input');
        if (roleSearchInput) {
            roleSearchInput.addEventListener('input', (e) => this.filterRoles(e.target.value));
        }
    }

    performComparison() {
        this.comparisonData = {
            overallMatch: this.calculateOverallMatch(),
            skillsMatch: this.calculateSkillsMatch(),
            experienceMatch: this.calculateExperienceMatch(),
            readinessScore: this.calculateReadinessScore(),
            skillGaps: this.calculateSkillGaps(),
            experienceGap: this.calculateExperienceGap(),
            educationMatch: this.calculateEducationMatch(),
            recommendations: this.generateRecommendations(),
            alternativeRoles: this.findAlternativeRoles()
        };
    }

    calculateOverallMatch() {
        const skillsWeight = 0.5;
        const experienceWeight = 0.3;
        const educationWeight = 0.2;

        const skillsMatch = this.calculateSkillsMatch();
        const experienceMatch = this.calculateExperienceMatch();
        const educationMatch = this.calculateEducationMatch();

        const overallMatch = (
            skillsMatch * skillsWeight +
            experienceMatch * experienceWeight +
            educationMatch * educationWeight
        );

        return Math.round(overallMatch);
    }

    calculateSkillsMatch() {
        const requiredSkills = this.targetRole.requiredSkills;
        const userSkills = this.currentUser.skills;

        if (Object.keys(requiredSkills).length === 0) return 100;

        let totalWeight = 0;
        let matchedWeight = 0;

        Object.entries(requiredSkills).forEach(([skillName, requirements]) => {
            const weight = requirements.weight || 1;
            totalWeight += weight;

            const userLevel = userSkills[skillName]?.level || 0;
            const requiredLevel = requirements.minimumLevel;

            if (userLevel >= requiredLevel) {
                matchedWeight += weight;
            } else {
                // Partial credit for partial skill level
                const partialCredit = Math.max(0, userLevel / requiredLevel);
                matchedWeight += weight * partialCredit;
            }
        });

        return totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 100;
    }

    calculateExperienceMatch() {
        const requiredExperience = this.targetRole.experience || 0;
        const userExperience = this.currentUser.experience || 0;

        if (requiredExperience === 0) return 100;

        const match = Math.min(userExperience / requiredExperience, 1);
        return Math.round(match * 100);
    }

    calculateEducationMatch() {
        const requiredEducation = this.targetRole.education || [];
        const userEducation = this.currentUser.education || [];

        if (requiredEducation.length === 0) return 100;

        let matches = 0;
        requiredEducation.forEach(reqEd => {
            const hasMatch = userEducation.some(userEd => 
                userEd.toLowerCase().includes(reqEd.toLowerCase()) ||
                reqEd.toLowerCase().includes(userEd.toLowerCase())
            );
            if (hasMatch) matches++;
        });

        return Math.round((matches / requiredEducation.length) * 100);
    }

    calculateReadinessScore() {
        // Readiness score considers multiple factors
        const skillsMatch = this.calculateSkillsMatch();
        const experienceMatch = this.calculateExperienceMatch();
        const educationMatch = this.calculateEducationMatch();

        // Performance and potential from user profile
        const performanceScore = (this.currentUser.performance || 3) * 20; // Convert 1-5 to 0-100
        const potentialScore = (this.currentUser.potential || 3) * 20;

        // Weighted average
        const readiness = (
            skillsMatch * 0.4 +
            experienceMatch * 0.2 +
            educationMatch * 0.1 +
            performanceScore * 0.15 +
            potentialScore * 0.15
        );

        return Math.round(readiness);
    }

    calculateSkillGaps() {
        const skillGaps = {};
        const requiredSkills = this.targetRole.requiredSkills;
        const userSkills = this.currentUser.skills;

        Object.entries(requiredSkills).forEach(([skillName, requirements]) => {
            const currentLevel = userSkills[skillName]?.level || 0;
            const requiredLevel = requirements.minimumLevel;
            const gap = Math.max(0, requiredLevel - currentLevel);

            let priority = 'low';
            if (requirements.critical && gap > 0) {
                priority = 'critical';
            } else if (gap >= 3) {
                priority = 'high';
            } else if (gap >= 2) {
                priority = 'medium';
            } else if (gap >= 1) {
                priority = 'low';
            }

            skillGaps[skillName] = {
                currentLevel,
                requiredLevel,
                gap,
                priority,
                weight: requirements.weight || 1,
                critical: requirements.critical || false,
                status: gap === 0 ? 'ready' : gap <= 1 ? 'close' : gap <= 2 ? 'moderate' : 'significant'
            };
        });

        return skillGaps;
    }

    calculateExperienceGap() {
        const requiredExperience = this.targetRole.experience || 0;
        const userExperience = this.currentUser.experience || 0;
        const gap = Math.max(0, requiredExperience - userExperience);

        return {
            current: userExperience,
            required: requiredExperience,
            gap: gap,
            status: gap === 0 ? 'ready' : gap <= 1 ? 'close' : gap <= 3 ? 'moderate' : 'significant'
        };
    }

    showError(message) {
        alert(`Error: ${message}`);
    }

    showSuccess(message) {
        alert(`Success: ${message}`);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.comparePage = new ComparePage();
});    gene
rateRecommendations() {
        const recommendations = {
            high: [],
            medium: [],
            low: []
        };

        const skillGaps = this.calculateSkillGaps();

        // Generate skill-based recommendations
        Object.entries(skillGaps).forEach(([skillName, gap]) => {
            if (gap.gap > 0) {
                const recommendation = {
                    type: 'skill',
                    title: `Develop ${skillName} Skills`,
                    description: `Improve ${skillName} from level ${gap.currentLevel} to ${gap.requiredLevel}`,
                    priority: gap.priority,
                    actions: this.generateSkillActions(skillName, gap),
                    timeline: this.estimateSkillTimeline(gap.gap),
                    impact: gap.critical ? 'High' : gap.weight > 0.8 ? 'Medium' : 'Low'
                };

                if (gap.priority === 'critical') {
                    recommendations.high.push(recommendation);
                } else if (gap.priority === 'high') {
                    recommendations.high.push(recommendation);
                } else if (gap.priority === 'medium') {
                    recommendations.medium.push(recommendation);
                } else {
                    recommendations.low.push(recommendation);
                }
            }
        });

        return recommendations;
    }

    generateSkillActions(skillName, gap) {
        const actions = [];
        const gapSize = gap.gap;

        if (gapSize >= 1) {
            actions.push(`Take an online course in ${skillName}`);
        }

        if (gapSize >= 2) {
            actions.push(`Work on a hands-on project using ${skillName}`);
        }

        if (gapSize >= 3 || gap.critical) {
            actions.push(`Find a mentor with expertise in ${skillName}`);
            actions.push(`Attend workshops or conferences on ${skillName}`);
        }

        return actions;
    }

    estimateSkillTimeline(gapSize) {
        if (gapSize <= 1) return '2-3 months';
        if (gapSize <= 2) return '4-6 months';
        if (gapSize <= 3) return '6-9 months';
        return '9-12 months';
    }

    findAlternativeRoles() {
        const alternatives = [];
        const currentSkills = this.currentUser.skills;

        this.allRoles.forEach(role => {
            if (role.id === this.targetRole.id) return;

            const matchScore = this.calculateRoleMatchScore(role, currentSkills);
            
            if (matchScore >= 60) {
                alternatives.push({
                    role: role,
                    matchScore: matchScore,
                    keyStrengths: this.identifyKeyStrengths(role, currentSkills),
                    mainGaps: this.identifyMainGaps(role, currentSkills)
                });
            }
        });

        return alternatives
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);
    }

    calculateRoleMatchScore(role, userSkills) {
        const requiredSkills = role.requiredSkills;
        if (Object.keys(requiredSkills).length === 0) return 50;

        let totalWeight = 0;
        let matchedWeight = 0;

        Object.entries(requiredSkills).forEach(([skillName, requirements]) => {
            const weight = requirements.weight || 1;
            totalWeight += weight;

            const userLevel = userSkills[skillName]?.level || 0;
            const requiredLevel = requirements.minimumLevel;

            if (userLevel >= requiredLevel) {
                matchedWeight += weight;
            } else {
                const partialCredit = Math.max(0, userLevel / requiredLevel);
                matchedWeight += weight * partialCredit;
            }
        });

        return totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 50;
    }

    identifyKeyStrengths(role, userSkills) {
        const strengths = [];
        const requiredSkills = role.requiredSkills;

        Object.entries(requiredSkills).forEach(([skillName, requirements]) => {
            const userLevel = userSkills[skillName]?.level || 0;
            const requiredLevel = requirements.minimumLevel;

            if (userLevel >= requiredLevel) {
                strengths.push(skillName);
            }
        });

        return strengths.slice(0, 3);
    }

    identifyMainGaps(role, userSkills) {
        const gaps = [];
        const requiredSkills = role.requiredSkills;

        Object.entries(requiredSkills).forEach(([skillName, requirements]) => {
            const userLevel = userSkills[skillName]?.level || 0;
            const requiredLevel = requirements.minimumLevel;
            const gap = requiredLevel - userLevel;

            if (gap > 0) {
                gaps.push({ skill: skillName, gap: gap });
            }
        });

        return gaps
            .sort((a, b) => b.gap - a.gap)
            .slice(0, 2)
            .map(item => item.skill);
    }

    renderComparison() {
        this.renderOverview();
        this.renderRoleInfo();
        this.renderSkillsComparison();
        this.renderExperienceComparison();
        this.renderRecommendations();
        this.renderAlternativeRoles();
    }

    renderOverview() {
        document.getElementById('overall-match-score').textContent = this.comparisonData.overallMatch + '%';
        document.getElementById('skills-match-score').textContent = this.comparisonData.skillsMatch + '%';
        document.getElementById('experience-match-score').textContent = this.comparisonData.experienceMatch + '%';
        document.getElementById('readiness-score').textContent = this.comparisonData.readinessScore + '%';
    }

    renderRoleInfo() {
        // Current role details
        const currentRoleDetails = document.getElementById('current-role-details');
        if (currentRoleDetails) {
            currentRoleDetails.innerHTML = `
                <div class="role-detail-item">
                    <strong>Position:</strong> ${this.currentUser.position || 'Not specified'}
                </div>
                <div class="role-detail-item">
                    <strong>Department:</strong> ${this.currentUser.department || 'Not specified'}
                </div>
                <div class="role-detail-item">
                    <strong>Experience:</strong> ${this.currentUser.experience || 0} years
                </div>
            `;
        }

        // Target role details
        document.getElementById('target-role-title').textContent = this.targetRole.title;
        const targetRoleDetails = document.getElementById('target-role-details');
        if (targetRoleDetails) {
            targetRoleDetails.innerHTML = `
                <div class="role-detail-item">
                    <strong>Department:</strong> ${this.targetRole.department}
                </div>
                <div class="role-detail-item">
                    <strong>Level:</strong> ${this.targetRole.level}
                </div>
                <div class="role-detail-item">
                    <strong>Required Experience:</strong> ${this.targetRole.experience || 0} years
                </div>
            `;
        }
    }

    renderSkillsComparison() {
        if (this.currentView === 'chart') {
            this.renderSkillsChart();
        } else {
            this.renderSkillsTable();
        }
    }

    renderSkillsChart() {
        const container = document.getElementById('skills-chart');
        if (!container) return;

        container.innerHTML = '';
        const skillGaps = this.comparisonData.skillGaps;

        Object.entries(skillGaps).forEach(([skillName, gap]) => {
            const skillBar = document.createElement('div');
            skillBar.className = 'skill-comparison-bar';
            skillBar.dataset.skill = skillName;
            skillBar.dataset.priority = gap.priority;
            skillBar.dataset.gap = gap.status;

            skillBar.innerHTML = `
                <div class="skill-name">${skillName}</div>
                <div class="skill-bars">
                    <div class="skill-bar-container">
                        <div class="skill-bar current-skill-bar">
                            <div class="skill-bar-fill" style="width: ${(gap.currentLevel / 5) * 100}%"></div>
                        </div>
                        <span class="skill-level-text">${gap.currentLevel}/5</span>
                    </div>
                    <div class="skill-bar-container">
                        <div class="skill-bar required-skill-bar">
                            <div class="skill-bar-fill" style="width: ${(gap.requiredLevel / 5) * 100}%"></div>
                        </div>
                        <span class="skill-level-text">${gap.requiredLevel}/5</span>
                    </div>
                </div>
                <div class="skill-gap-indicator ${gap.status}">
                    ${gap.gap === 0 ? '✓ Ready' : `Gap: ${gap.gap} level${gap.gap > 1 ? 's' : ''}`}
                </div>
            `;

            container.appendChild(skillBar);
        });
    }

    renderSkillsTable() {
        const tbody = document.getElementById('skills-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';
        const skillGaps = this.comparisonData.skillGaps;

        Object.entries(skillGaps).forEach(([skillName, gap]) => {
            const row = document.createElement('tr');
            row.dataset.skill = skillName;
            row.dataset.priority = gap.priority;
            row.dataset.gap = gap.status;

            const statusIcon = gap.gap === 0 ? '✅' : gap.gap <= 1 ? '⚠️' : '❌';

            row.innerHTML = `
                <td class="skill-name-cell">${skillName}</td>
                <td class="level-cell">${gap.currentLevel}/5</td>
                <td class="level-cell">${gap.requiredLevel}/5</td>
                <td class="gap-cell">${gap.gap}</td>
                <td class="priority-cell">
                    <span class="priority-badge priority-${gap.priority}">${gap.priority.toUpperCase()}</span>
                </td>
                <td class="weight-cell">${gap.weight}</td>
                <td class="status-cell">
                    <span class="status-indicator ${gap.status}">${statusIcon}</span>
                </td>
            `;

            tbody.appendChild(row);
        });
    }

    renderExperienceComparison() {
        // Simple implementation for now
        console.log('Rendering experience comparison');
    }

    renderRecommendations() {
        const container = document.getElementById('recommendations-content');
        if (!container) return;

        const recommendations = this.comparisonData.recommendations[this.activeTab];
        
        container.innerHTML = '';

        if (recommendations.length === 0) {
            container.innerHTML = `
                <div class="no-recommendations">
                    <p>No ${this.activeTab} priority recommendations at this time.</p>
                </div>
            `;
            return;
        }

        recommendations.forEach(rec => {
            const recCard = document.createElement('div');
            recCard.className = `recommendation-card priority-${rec.priority}`;

            recCard.innerHTML = `
                <div class="rec-header">
                    <h4>${rec.title}</h4>
                    <span class="rec-impact">${rec.impact} Impact</span>
                </div>
                <p class="rec-description">${rec.description}</p>
                <div class="rec-timeline">
                    <strong>Timeline:</strong> ${rec.timeline}
                </div>
                <div class="rec-actions-list">
                    <strong>Actions:</strong>
                    <ul>
                        ${rec.actions.map(action => `<li>${action}</li>`).join('')}
                    </ul>
                </div>
            `;

            container.appendChild(recCard);
        });
    }

    renderAlternativeRoles() {
        const container = document.getElementById('alternative-roles-grid');
        if (!container) return;

        container.innerHTML = '';
        const alternatives = this.comparisonData.alternativeRoles;

        if (alternatives.length === 0) {
            container.innerHTML = `
                <div class="no-alternatives">
                    <p>No alternative role suggestions available.</p>
                </div>
            `;
            return;
        }

        alternatives.forEach(alt => {
            const altCard = document.createElement('div');
            altCard.className = 'alternative-role-card';

            altCard.innerHTML = `
                <div class="alt-role-header">
                    <h4>${alt.role.title}</h4>
                    <span class="match-score">${alt.matchScore}% match</span>
                </div>
                <div class="alt-role-details">
                    <p><strong>Department:</strong> ${alt.role.department}</p>
                    <p><strong>Level:</strong> ${alt.role.level}</p>
                </div>
                <div class="alt-role-actions">
                    <button class="btn btn-sm btn-outline" onclick="comparePage.compareWithRole('${alt.role.id}')">
                        Compare
                    </button>
                </div>
            `;

            container.appendChild(altCard);
        });
    }

    switchView(view) {
        this.currentView = view;
        
        const chartView = document.getElementById('skills-chart-view');
        const tableView = document.getElementById('skills-table-view');
        const chartBtn = document.getElementById('chart-view-btn');
        const tableBtn = document.getElementById('table-view-btn');

        if (view === 'chart') {
            chartView.style.display = 'block';
            tableView.style.display = 'none';
            chartBtn.classList.add('btn-primary');
            chartBtn.classList.remove('btn-outline');
            tableBtn.classList.add('btn-outline');
            tableBtn.classList.remove('btn-primary');
            this.renderSkillsChart();
        } else {
            chartView.style.display = 'none';
            tableView.style.display = 'block';
            tableBtn.classList.add('btn-primary');
            tableBtn.classList.remove('btn-outline');
            chartBtn.classList.add('btn-outline');
            chartBtn.classList.remove('btn-primary');
            this.renderSkillsTable();
        }
    }

    switchPriorityTab(priority) {
        this.activeTab = priority;
        
        document.querySelectorAll('.priority-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-priority="${priority}"]`).classList.add('active');
        this.renderRecommendations();
    }

    applyFilters() {
        const items = document.querySelectorAll('[data-skill]');
        
        items.forEach(item => {
            const priority = item.dataset.priority;
            const gap = item.dataset.gap;
            
            let show = true;
            
            if (this.filters.gap) {
                const gapFilter = this.filters.gap;
                if (gapFilter === 'no-gap' && gap !== 'ready') show = false;
                if (gapFilter === 'small-gap' && gap !== 'close') show = false;
                if (gapFilter === 'medium-gap' && gap !== 'moderate') show = false;
                if (gapFilter === 'large-gap' && gap !== 'significant') show = false;
            }
            
            if (this.filters.priority) {
                if (this.filters.priority === 'critical' && priority !== 'critical') show = false;
                if (this.filters.priority !== 'critical' && this.filters.priority !== priority) show = false;
            }
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    showRoleSelectionModal() {
        const modal = document.getElementById('role-selection-modal');
        modal.style.display = 'flex';
    }

    closeRoleSelectionModal() {
        const modal = document.getElementById('role-selection-modal');
        modal.style.display = 'none';
    }

    filterRoles(searchTerm) {
        // Simple role filtering implementation
        console.log('Filtering roles:', searchTerm);
    }

    selectTargetRole(roleId) {
        this.targetRole = HRData.roleService.getById(roleId);
        this.closeRoleSelectionModal();
        this.performComparison();
        this.renderComparison();
        this.showSuccess('Target role updated successfully');
    }

    compareWithRole(roleId) {
        window.location.href = `compare.html?targetRole=${roleId}`;
    }

    createDevelopmentPlan() {
        const params = new URLSearchParams({
            targetRole: this.targetRole.id,
            fromComparison: 'true'
        });
        
        window.location.href = `idp.html?${params.toString()}`;
    }

    async saveComparison() {
        try {
            const recommendation = new HRData.Recommendation({
                employeeId: this.currentUser.id,
                targetRole: this.targetRole.id,
                skillGaps: this.comparisonData.skillGaps,
                learningPath: [],
                timeline: 12,
                confidence: this.comparisonData.readinessScore / 100,
                status: 'pending'
            });

            HRData.recommendationService.create(recommendation);
            this.showSuccess('Comparison analysis saved successfully!');
            
        } catch (error) {
            console.error('Error saving comparison:', error);
            this.showError('Failed to save comparison analysis');
        }
    }

    exportComparison() {
        this.showSuccess('Export functionality would be implemented here');
    }
}