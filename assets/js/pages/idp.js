/**
 * Individual Development Plan Page
 * Handles personalized development roadmap with timeline, tasks, and progress tracking
 */

class IDPPage {
    constructor() {
        this.currentUser = null;
        this.currentRecommendation = null;
        this.targetRole = null;
        this.learningItems = [];
        this.notes = [];
        this.currentView = 'timeline';
        this.filters = {
            priority: '',
            status: ''
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

            // Load data from URL parameters or storage
            await this.loadIDPData();
            this.setupEventListeners();
            this.renderIDPOverview();
            this.renderTimeline();
            this.renderSkillProgress();
            this.loadNotes();
            
        } catch (error) {
            console.error('Error initializing IDP page:', error);
            this.showError('Failed to load development plan');
        }
    }

    async loadIDPData() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const recommendationId = urlParams.get('recommendationId');
            const targetRoleId = urlParams.get('targetRole');

            if (recommendationId && recommendationId !== 'temp') {
                // Load existing recommendation
                this.currentRecommendation = HRData.recommendationService.getById(recommendationId);
                if (this.currentRecommendation) {
                    this.targetRole = HRData.roleService.getById(this.currentRecommendation.targetRole);
                    this.learningItems = this.currentRecommendation.learningPath.map(item => ({
                        ...item,
                        status: item.status || 'not_started',
                        progress: item.progress || 0,
                        completedAt: item.completedAt || null
                    }));
                }
            } else if (targetRoleId) {
                // Create new IDP from target role
                this.targetRole = HRData.roleService.getById(targetRoleId);
                if (this.targetRole) {
                    // Generate recommendation if not exists
                    this.currentRecommendation = await this.generateRecommendationForRole(this.targetRole);
                    this.learningItems = this.currentRecommendation.learningPath.map(item => ({
                        ...item,
                        status: 'not_started',
                        progress: 0,
                        completedAt: null
                    }));
                }
            } else {
                // Load most recent recommendation for user
                const recommendations = HRData.recommendationService.getByEmployeeId(this.currentUser.id);
                if (recommendations.length > 0) {
                    this.currentRecommendation = recommendations[recommendations.length - 1];
                    this.targetRole = HRData.roleService.getById(this.currentRecommendation.targetRole);
                    this.learningItems = this.currentRecommendation.learningPath.map(item => ({
                        ...item,
                        status: item.status || 'not_started',
                        progress: item.progress || 0,
                        completedAt: item.completedAt || null
                    }));
                }
            }

            if (!this.currentRecommendation || !this.targetRole) {
                throw new Error('No development plan found. Please generate a recommendation first.');
            }

        } catch (error) {
            console.error('Error loading IDP data:', error);
            throw error;
        }
    }

    async generateRecommendationForRole(targetRole) {
        // Use the same AI logic from recommendations-overview.js
        const skillGaps = this.calculateSkillGaps(this.currentUser, targetRole);
        const learningPath = this.generateLearningPath(skillGaps, targetRole);
        const timeline = this.calculateTimeline(skillGaps);
        const confidence = this.calculateConfidence(this.currentUser, targetRole, skillGaps);

        return new HRData.Recommendation({
            employeeId: this.currentUser.id,
            targetRole: targetRole.id,
            skillGaps: skillGaps,
            learningPath: learningPath,
            timeline: timeline,
            confidence: confidence,
            status: 'pending'
        });
    }

    calculateSkillGaps(user, targetRole) {
        const skillGaps = {};
        
        Object.entries(targetRole.requiredSkills).forEach(([skillName, requirements]) => {
            const currentLevel = user.skills[skillName]?.level || 0;
            const requiredLevel = requirements.minimumLevel;
            
            if (currentLevel < requiredLevel) {
                const gap = requiredLevel - currentLevel;
                let priority = 'medium';
                
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
        
        const sortedGaps = Object.entries(skillGaps).sort((a, b) => {
            const [, gapA] = a;
            const [, gapB] = b;
            
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const priorityDiff = priorityOrder[gapB.priority] - priorityOrder[gapA.priority];
            
            if (priorityDiff !== 0) return priorityDiff;
            return (gapB.gap * gapB.weight) - (gapA.gap * gapA.weight);
        });

        sortedGaps.forEach(([skillName, gap], index) => {
            const learningItems = this.generateLearningItemsForSkill(skillName, gap, index);
            learningPath.push(...learningItems);
        });

        return learningPath;
    }

    generateLearningItemsForSkill(skillName, gap, sequenceIndex) {
        const items = [];
        const baseMonth = Math.floor(sequenceIndex / 2) + 1;
        const gapSize = gap.gap;
        
        if (gapSize >= 1) {
            items.push({
                id: this.generateId(),
                type: 'course',
                title: `${skillName} Fundamentals Course`,
                description: `Complete an online course to build foundational knowledge in ${skillName}`,
                provider: this.getRecommendedProvider(skillName),
                duration: '4-6 weeks',
                effort: '5-8 hours/week',
                month: baseMonth,
                priority: gap.priority,
                skillImpact: Math.min(2, gapSize),
                targetSkill: skillName
            });
        }
        
        if (gapSize >= 2) {
            items.push({
                id: this.generateId(),
                type: 'project',
                title: `${skillName} Practice Project`,
                description: `Apply ${skillName} skills in a real-world project or assignment`,
                duration: '2-3 weeks',
                effort: '10-15 hours/week',
                month: baseMonth + 1,
                priority: gap.priority,
                skillImpact: Math.min(2, gapSize - 1),
                targetSkill: skillName
            });
        }
        
        if (gapSize >= 3 || gap.critical) {
            items.push({
                id: this.generateId(),
                type: 'mentoring',
                title: `${skillName} Mentoring Session`,
                description: `Work with a senior colleague or external mentor to develop advanced ${skillName} skills`,
                duration: '4-8 weeks',
                effort: '2-3 hours/week',
                month: baseMonth + 2,
                priority: gap.priority,
                skillImpact: Math.min(2, gapSize - 2),
                targetSkill: skillName
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
        const totalGaps = Object.keys(skillGaps).length;
        const highPriorityGaps = Object.values(skillGaps).filter(gap => gap.priority === 'high').length;
        const averageGapSize = Object.values(skillGaps).reduce((sum, gap) => sum + gap.gap, 0) / totalGaps;
        
        let months = 6;
        months += Math.floor(totalGaps / 2) * 2;
        months += highPriorityGaps * 2;
        months += Math.floor(averageGapSize) * 2;
        
        return Math.min(Math.max(months, 3), 24);
    }

    calculateConfidence(user, targetRole, skillGaps) {
        let confidence = 0.5;
        
        const experienceMatch = Math.min(user.experience / targetRole.experience, 1);
        confidence += experienceMatch * 0.2;
        
        const requiredSkills = Object.keys(targetRole.requiredSkills);
        const matchingSkills = requiredSkills.filter(skill => 
            user.skills[skill] && user.skills[skill].level >= targetRole.requiredSkills[skill].minimumLevel
        );
        const skillMatchRatio = matchingSkills.length / requiredSkills.length;
        confidence += skillMatchRatio * 0.3;
        
        const totalGapSeverity = Object.values(skillGaps).reduce((sum, gap) => sum + gap.gap, 0);
        const maxPossibleGaps = Object.keys(skillGaps).length * 5;
        const gapSeverityRatio = 1 - (totalGapSeverity / Math.max(maxPossibleGaps, 1));
        confidence += gapSeverityRatio * 0.2;
        
        return Math.max(0.1, Math.min(0.95, confidence));
    }

    generateId() {
        return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    setupEventListeners() {
        // View toggle
        const timelineViewBtn = document.getElementById('timeline-view-btn');
        const kanbanViewBtn = document.getElementById('kanban-view-btn');

        if (timelineViewBtn) {
            timelineViewBtn.addEventListener('click', () => this.switchView('timeline'));
        }

        if (kanbanViewBtn) {
            kanbanViewBtn.addEventListener('click', () => this.switchView('kanban'));
        }

        // Filters
        const priorityFilter = document.getElementById('priority-filter');
        const statusFilter = document.getElementById('status-filter');

        if (priorityFilter) {
            priorityFilter.addEventListener('change', (e) => {
                this.filters.priority = e.target.value;
                this.applyFilters();
            });
        }

        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.filters.status = e.target.value;
                this.applyFilters();
            });
        }

        // Notes
        const addNoteBtn = document.getElementById('add-note-btn');
        if (addNoteBtn) {
            addNoteBtn.addEventListener('click', () => this.addNote());
        }

        // IDP actions
        const editIdpBtn = document.getElementById('edit-idp-btn');
        const exportIdpBtn = document.getElementById('export-idp-btn');

        if (editIdpBtn) {
            editIdpBtn.addEventListener('click', () => this.editIDP());
        }

        if (exportIdpBtn) {
            exportIdpBtn.addEventListener('click', () => this.exportIDP());
        }
    }

    renderIDPOverview() {
        // Update summary cards
        document.getElementById('target-role-title').textContent = this.targetRole.title;
        document.getElementById('confidence-score').textContent = Math.round(this.currentRecommendation.confidence * 100) + '%';
        document.getElementById('timeline-months').textContent = this.currentRecommendation.timeline + ' months';
        document.getElementById('learning-items-count').textContent = this.learningItems.length;

        // Update progress
        this.updateOverallProgress();
    }

    updateOverallProgress() {
        const completedItems = this.learningItems.filter(item => item.status === 'completed').length;
        const totalItems = this.learningItems.length;
        const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        const progressFill = document.getElementById('overall-progress-fill');
        const progressText = document.getElementById('overall-progress-text');

        if (progressFill) {
            progressFill.style.width = progressPercent + '%';
        }

        if (progressText) {
            progressText.textContent = progressPercent + '% Complete';
        }

        // Update milestone indicators
        const milestones = document.querySelectorAll('.milestone');
        milestones.forEach(milestone => {
            const milestoneValue = parseInt(milestone.dataset.milestone);
            const marker = milestone.querySelector('.milestone-marker');
            
            if (progressPercent >= milestoneValue) {
                marker.classList.add('completed');
            } else {
                marker.classList.remove('completed');
            }
        });
    }

    renderTimeline() {
        const container = document.getElementById('timeline-container');
        if (!container) return;

        container.innerHTML = '';

        // Group items by month
        const itemsByMonth = {};
        this.learningItems.forEach(item => {
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
                    <div class="month-progress">
                        ${this.renderMonthProgress(itemsByMonth[month])}
                    </div>
                </div>
                <div class="month-items">
                    ${itemsByMonth[month].map(item => this.renderTimelineItem(item)).join('')}
                </div>
            `;
            
            container.appendChild(monthSection);
        });
    }

    renderMonthProgress(items) {
        const completedItems = items.filter(item => item.status === 'completed').length;
        const totalItems = items.length;
        const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

        return `
            <div class="month-progress-bar">
                <div class="month-progress-fill" style="width: ${progressPercent}%"></div>
            </div>
            <span class="month-progress-text">${completedItems}/${totalItems} completed</span>
        `;
    }

    renderTimelineItem(item) {
        const typeIcons = {
            course: '📚',
            project: '🛠️',
            mentoring: '👥',
            certification: '🏆',
            workshop: '🎯'
        };

        const statusClasses = {
            not_started: 'status-not-started',
            in_progress: 'status-in-progress',
            completed: 'status-completed'
        };

        return `
            <div class="timeline-item ${statusClasses[item.status]} priority-${item.priority}" data-item-id="${item.id}">
                <div class="item-status-indicator">
                    <div class="status-dot"></div>
                </div>
                <div class="item-content">
                    <div class="item-header">
                        <span class="item-icon">${typeIcons[item.type] || '📖'}</span>
                        <h5>${item.title}</h5>
                        <span class="priority-badge priority-${item.priority}">${item.priority}</span>
                        <div class="item-actions">
                            <button class="btn btn-sm btn-outline" onclick="idpPage.viewTaskDetails('${item.id}')">
                                View Details
                            </button>
                            ${item.status !== 'completed' ? 
                                `<button class="btn btn-sm btn-primary" onclick="idpPage.updateTaskStatus('${item.id}', '${item.status === 'not_started' ? 'in_progress' : 'completed'}')">
                                    ${item.status === 'not_started' ? 'Start' : 'Complete'}
                                </button>` : 
                                '<span class="completed-badge">✓ Completed</span>'
                            }
                        </div>
                    </div>
                    <p class="item-description">${item.description}</p>
                    <div class="item-details">
                        ${item.provider ? `<span class="provider">📍 ${item.provider}</span>` : ''}
                        <span class="duration">⏱️ ${item.duration}</span>
                        ${item.effort ? `<span class="effort">💪 ${item.effort}</span>` : ''}
                        ${item.targetSkill ? `<span class="target-skill">🎯 ${item.targetSkill}</span>` : ''}
                    </div>
                    ${item.status === 'in_progress' ? `
                        <div class="progress-section">
                            <label>Progress: ${item.progress || 0}%</label>
                            <input type="range" min="0" max="100" value="${item.progress || 0}" 
                                   onchange="idpPage.updateTaskProgress('${item.id}', this.value)">
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderKanban() {
        const columns = {
            'not_started': document.getElementById('kanban-not-started'),
            'in_progress': document.getElementById('kanban-in-progress'),
            'completed': document.getElementById('kanban-completed')
        };

        // Clear columns
        Object.values(columns).forEach(column => {
            if (column) column.innerHTML = '';
        });

        // Add items to columns
        this.learningItems.forEach(item => {
            const column = columns[item.status];
            if (column) {
                const itemElement = document.createElement('div');
                itemElement.className = `kanban-item priority-${item.priority}`;
                itemElement.innerHTML = this.renderKanbanItem(item);
                column.appendChild(itemElement);
            }
        });
    }

    renderKanbanItem(item) {
        const typeIcons = {
            course: '📚',
            project: '🛠️',
            mentoring: '👥',
            certification: '🏆',
            workshop: '🎯'
        };

        return `
            <div class="kanban-item-header">
                <span class="item-icon">${typeIcons[item.type] || '📖'}</span>
                <span class="priority-badge priority-${item.priority}">${item.priority}</span>
            </div>
            <h5>${item.title}</h5>
            <p class="item-description">${item.description}</p>
            <div class="item-meta">
                <span class="duration">⏱️ ${item.duration}</span>
                <span class="month">📅 Month ${item.month}</span>
            </div>
            <div class="kanban-item-actions">
                <button class="btn btn-sm btn-outline" onclick="idpPage.viewTaskDetails('${item.id}')">
                    Details
                </button>
                ${item.status !== 'completed' ? 
                    `<button class="btn btn-sm btn-primary" onclick="idpPage.updateTaskStatus('${item.id}', '${item.status === 'not_started' ? 'in_progress' : 'completed'}')">
                        ${item.status === 'not_started' ? 'Start' : 'Complete'}
                    </button>` : 
                    '<span class="completed-badge">✓</span>'
                }
            </div>
        `;
    }

    renderSkillProgress() {
        const container = document.getElementById('skills-progress-grid');
        if (!container) return;

        container.innerHTML = '';

        // Get unique skills from learning items
        const skillsMap = {};
        this.learningItems.forEach(item => {
            if (item.targetSkill) {
                if (!skillsMap[item.targetSkill]) {
                    skillsMap[item.targetSkill] = {
                        name: item.targetSkill,
                        items: [],
                        currentLevel: this.currentUser.skills[item.targetSkill]?.level || 0,
                        targetLevel: this.currentRecommendation.skillGaps[item.targetSkill]?.requiredLevel || 5
                    };
                }
                skillsMap[item.targetSkill].items.push(item);
            }
        });

        Object.values(skillsMap).forEach(skill => {
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-progress-card';
            
            const completedItems = skill.items.filter(item => item.status === 'completed').length;
            const totalItems = skill.items.length;
            const progressPercent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
            
            // Estimate current skill level based on progress
            const estimatedLevel = skill.currentLevel + ((skill.targetLevel - skill.currentLevel) * (progressPercent / 100));
            
            skillCard.innerHTML = `
                <div class="skill-header">
                    <h4>${skill.name}</h4>
                    <span class="skill-progress-percent">${progressPercent}%</span>
                </div>
                <div class="skill-levels">
                    <div class="level-indicator">
                        <span class="level-label">Current</span>
                        <div class="level-stars">
                            ${this.renderSkillStars(Math.floor(estimatedLevel))}
                        </div>
                        <span class="level-value">${Math.floor(estimatedLevel)}/5</span>
                    </div>
                    <div class="level-indicator">
                        <span class="level-label">Target</span>
                        <div class="level-stars">
                            ${this.renderSkillStars(skill.targetLevel)}
                        </div>
                        <span class="level-value">${skill.targetLevel}/5</span>
                    </div>
                </div>
                <div class="skill-progress-bar">
                    <div class="skill-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="skill-items-summary">
                    ${completedItems}/${totalItems} learning activities completed
                </div>
            `;
            
            container.appendChild(skillCard);
        });
    }

    renderSkillStars(level) {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(`<span class="star ${i <= level ? 'filled' : ''}">${i <= level ? '★' : '☆'}</span>`);
        }
        return stars.join('');
    }

    switchView(view) {
        this.currentView = view;
        
        const timelineContainer = document.getElementById('timeline-container');
        const kanbanContainer = document.getElementById('kanban-container');
        const timelineBtn = document.getElementById('timeline-view-btn');
        const kanbanBtn = document.getElementById('kanban-view-btn');

        if (view === 'timeline') {
            timelineContainer.style.display = 'block';
            kanbanContainer.style.display = 'none';
            timelineBtn.classList.add('btn-primary');
            timelineBtn.classList.remove('btn-outline');
            kanbanBtn.classList.add('btn-outline');
            kanbanBtn.classList.remove('btn-primary');
        } else {
            timelineContainer.style.display = 'none';
            kanbanContainer.style.display = 'flex';
            kanbanBtn.classList.add('btn-primary');
            kanbanBtn.classList.remove('btn-outline');
            timelineBtn.classList.add('btn-outline');
            timelineBtn.classList.remove('btn-primary');
            this.renderKanban();
        }
    }

    applyFilters() {
        const items = document.querySelectorAll('.timeline-item, .kanban-item');
        
        items.forEach(item => {
            const itemId = item.dataset.itemId || item.querySelector('[data-item-id]')?.dataset.itemId;
            const learningItem = this.learningItems.find(li => li.id === itemId);
            
            if (!learningItem) return;
            
            let show = true;
            
            if (this.filters.priority && learningItem.priority !== this.filters.priority) {
                show = false;
            }
            
            if (this.filters.status && learningItem.status !== this.filters.status) {
                show = false;
            }
            
            item.style.display = show ? 'block' : 'none';
        });
    }

    updateTaskStatus(itemId, newStatus) {
        const item = this.learningItems.find(item => item.id === itemId);
        if (!item) return;

        item.status = newStatus;
        
        if (newStatus === 'completed') {
            item.progress = 100;
            item.completedAt = new Date().toISOString();
        } else if (newStatus === 'in_progress' && item.progress === 0) {
            item.progress = 10; // Start with some progress
        }

        // Update displays
        this.updateOverallProgress();
        this.renderTimeline();
        this.renderSkillProgress();
        
        if (this.currentView === 'kanban') {
            this.renderKanban();
        }

        // Save to storage
        this.saveIDPProgress();
        
        this.showSuccess(`Task marked as ${newStatus.replace('_', ' ')}`);
    }

    updateTaskProgress(itemId, progress) {
        const item = this.learningItems.find(item => item.id === itemId);
        if (!item) return;

        item.progress = parseInt(progress);
        
        if (item.progress === 100 && item.status !== 'completed') {
            item.status = 'completed';
            item.completedAt = new Date().toISOString();
        } else if (item.progress > 0 && item.status === 'not_started') {
            item.status = 'in_progress';
        }

        // Update displays
        this.updateOverallProgress();
        this.renderSkillProgress();
        
        // Save to storage
        this.saveIDPProgress();
    }

    viewTaskDetails(itemId) {
        const item = this.learningItems.find(item => item.id === itemId);
        if (!item) return;

        const modal = document.getElementById('task-modal');
        const title = document.getElementById('modal-task-title');
        const content = document.getElementById('modal-task-content');

        title.textContent = item.title;
        content.innerHTML = `
            <div class="task-detail-content">
                <div class="task-meta">
                    <span class="task-type">${item.type.toUpperCase()}</span>
                    <span class="task-priority priority-${item.priority}">${item.priority.toUpperCase()} PRIORITY</span>
                    <span class="task-status status-${item.status}">${item.status.replace('_', ' ').toUpperCase()}</span>
                </div>
                
                <p class="task-description">${item.description}</p>
                
                <div class="task-details-grid">
                    ${item.provider ? `<div class="detail-item"><strong>Provider:</strong> ${item.provider}</div>` : ''}
                    <div class="detail-item"><strong>Duration:</strong> ${item.duration}</div>
                    ${item.effort ? `<div class="detail-item"><strong>Effort:</strong> ${item.effort}</div>` : ''}
                    <div class="detail-item"><strong>Scheduled:</strong> Month ${item.month}</div>
                    ${item.targetSkill ? `<div class="detail-item"><strong>Target Skill:</strong> ${item.targetSkill}</div>` : ''}
                    ${item.skillImpact ? `<div class="detail-item"><strong>Skill Impact:</strong> +${item.skillImpact} levels</div>` : ''}
                </div>
                
                ${item.status === 'in_progress' ? `
                    <div class="progress-section">
                        <label><strong>Progress: ${item.progress || 0}%</strong></label>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${item.progress || 0}%"></div>
                        </div>
                    </div>
                ` : ''}
                
                ${item.completedAt ? `
                    <div class="completion-info">
                        <strong>Completed:</strong> ${new Date(item.completedAt).toLocaleDateString()}
                    </div>
                ` : ''}
            </div>
        `;

        // Setup modal buttons
        const markCompleteBtn = document.getElementById('modal-mark-complete-btn');
        const markProgressBtn = document.getElementById('modal-mark-progress-btn');

        markCompleteBtn.style.display = item.status !== 'completed' ? 'inline-block' : 'none';
        markProgressBtn.style.display = item.status === 'not_started' ? 'inline-block' : 'none';

        markCompleteBtn.onclick = () => {
            this.updateTaskStatus(itemId, 'completed');
            this.closeTaskModal();
        };

        markProgressBtn.onclick = () => {
            this.updateTaskStatus(itemId, 'in_progress');
            this.closeTaskModal();
        };

        modal.style.display = 'flex';
    }

    closeTaskModal() {
        const modal = document.getElementById('task-modal');
        modal.style.display = 'none';
    }

    addNote() {
        const noteText = document.getElementById('new-note-text').value.trim();
        const noteCategory = document.getElementById('note-category').value;

        if (!noteText) {
            this.showError('Please enter a note');
            return;
        }

        const note = {
            id: this.generateId(),
            text: noteText,
            category: noteCategory,
            createdAt: new Date().toISOString(),
            userId: this.currentUser.id
        };

        this.notes.push(note);
        this.saveNotes();
        this.renderNotes();

        // Clear form
        document.getElementById('new-note-text').value = '';
        document.getElementById('note-category').value = 'general';

        this.showSuccess('Note added successfully');
    }

    loadNotes() {
        try {
            const savedNotes = localStorage.getItem(`idp_notes_${this.currentUser.id}`);
            this.notes = savedNotes ? JSON.parse(savedNotes) : [];
            this.renderNotes();
        } catch (error) {
            console.error('Error loading notes:', error);
            this.notes = [];
        }
    }

    saveNotes() {
        try {
            localStorage.setItem(`idp_notes_${this.currentUser.id}`, JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error saving notes:', error);
        }
    }

    renderNotes() {
        const container = document.getElementById('notes-list');
        if (!container) return;

        container.innerHTML = '';

        if (this.notes.length === 0) {
            container.innerHTML = '<p class="no-notes">No notes yet. Add your first note above!</p>';
            return;
        }

        // Sort notes by date (newest first)
        const sortedNotes = [...this.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        sortedNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.className = `note-item category-${note.category}`;
            
            const categoryIcons = {
                general: '📝',
                achievement: '🏆',
                challenge: '⚠️',
                insight: '💡',
                goal: '🎯'
            };

            noteElement.innerHTML = `
                <div class="note-header">
                    <span class="note-icon">${categoryIcons[note.category] || '📝'}</span>
                    <span class="note-category">${note.category.toUpperCase()}</span>
                    <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
                    <button class="note-delete" onclick="idpPage.deleteNote('${note.id}')">&times;</button>
                </div>
                <div class="note-content">
                    ${note.text}
                </div>
            `;
            
            container.appendChild(noteElement);
        });
    }

    deleteNote(noteId) {
        if (confirm('Are you sure you want to delete this note?')) {
            this.notes = this.notes.filter(note => note.id !== noteId);
            this.saveNotes();
            this.renderNotes();
            this.showSuccess('Note deleted');
        }
    }

    saveIDPProgress() {
        try {
            // Update the recommendation with current progress
            if (this.currentRecommendation.id) {
                this.currentRecommendation.learningPath = this.learningItems;
                this.currentRecommendation.updatedAt = new Date().toISOString();
                HRData.recommendationService.update(this.currentRecommendation.id, this.currentRecommendation);
            }
        } catch (error) {
            console.error('Error saving IDP progress:', error);
        }
    }

    editIDP() {
        // Navigate back to recommendations overview for editing
        window.location.href = 'overview.html';
    }

    exportIDP() {
        // Simple export functionality - could be enhanced with proper PDF generation
        const content = this.generateExportContent();
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `IDP_${this.currentUser.name}_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('IDP exported successfully');
    }

    generateExportContent() {
        const completedItems = this.learningItems.filter(item => item.status === 'completed').length;
        const progressPercent = Math.round((completedItems / this.learningItems.length) * 100);

        let content = `INDIVIDUAL DEVELOPMENT PLAN\n`;
        content += `Generated: ${new Date().toLocaleDateString()}\n`;
        content += `Employee: ${this.currentUser.name}\n`;
        content += `Target Role: ${this.targetRole.title}\n`;
        content += `Department: ${this.targetRole.department}\n`;
        content += `Timeline: ${this.currentRecommendation.timeline} months\n`;
        content += `Readiness Score: ${Math.round(this.currentRecommendation.confidence * 100)}%\n`;
        content += `Overall Progress: ${progressPercent}%\n\n`;

        content += `LEARNING ACTIVITIES:\n`;
        content += `===================\n\n`;

        // Group by month
        const itemsByMonth = {};
        this.learningItems.forEach(item => {
            if (!itemsByMonth[item.month]) {
                itemsByMonth[item.month] = [];
            }
            itemsByMonth[item.month].push(item);
        });

        Object.keys(itemsByMonth).sort((a, b) => parseInt(a) - parseInt(b)).forEach(month => {
            content += `Month ${month}:\n`;
            content += `---------\n`;
            
            itemsByMonth[month].forEach(item => {
                content += `• ${item.title} [${item.status.toUpperCase()}]\n`;
                content += `  Type: ${item.type}\n`;
                content += `  Priority: ${item.priority}\n`;
                content += `  Duration: ${item.duration}\n`;
                if (item.provider) content += `  Provider: ${item.provider}\n`;
                if (item.effort) content += `  Effort: ${item.effort}\n`;
                content += `  Description: ${item.description}\n\n`;
            });
        });

        if (this.notes.length > 0) {
            content += `NOTES & REFLECTIONS:\n`;
            content += `===================\n\n`;
            
            this.notes.forEach(note => {
                content += `[${note.category.toUpperCase()}] ${new Date(note.createdAt).toLocaleDateString()}\n`;
                content += `${note.text}\n\n`;
            });
        }

        return content;
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
    window.idpPage = new IDPPage();
});