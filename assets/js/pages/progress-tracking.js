/**
 * Learning Progress Tracking JavaScript
 * Handles progress display, updates, and completion tracking
 */

class ProgressTracker {
    constructor() {
        this.currentUser = null;
        this.userProgress = [];
        this.courses = [];
        this.filteredProgress = [];
        this.currentFilter = 'all';
        this.currentSort = 'recent';
        this.selectedProgressId = null;
        
        this.init();
    }

    async init() {
        try {
            // Get current user
            this.currentUser = HRData.dataStore.getCurrentUser();
            if (!this.currentUser) {
                window.location.href = '../../index.html';
                return;
            }

            // Load data
            await this.loadData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial render
            this.renderOverview();
            this.renderProgressList();
            
        } catch (error) {
            console.error('Error initializing progress tracker:', error);
            this.showError('Failed to load progress data');
        }
    }

    async loadData() {
        try {
            // Load courses and user progress
            this.courses = HRData.trainingService.getAllCourses();
            this.userProgress = HRData.trainingService.getUserProgress(this.currentUser.id);
            
            // Create progress records for enrolled courses that don't have progress yet
            const enrolledCourseIds = this.userProgress.map(p => p.courseId);
            
            // For demo purposes, create some sample progress if none exists
            if (this.userProgress.length === 0) {
                await this.createSampleProgress();
                this.userProgress = HRData.trainingService.getUserProgress(this.currentUser.id);
            }
            
            this.applyFilters();
            
        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    async createSampleProgress() {
        // Create sample progress for demonstration
        const sampleProgressData = [
            {
                userId: this.currentUser.id,
                courseId: this.courses[0]?.id,
                status: 'completed',
                progress: 100,
                startedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                timeSpent: 480, // 8 hours
                rating: 5,
                feedback: 'Excellent course! Really helped me understand leadership principles.'
            },
            {
                userId: this.currentUser.id,
                courseId: this.courses[1]?.id,
                status: 'in_progress',
                progress: 65,
                startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                lastAccessedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                timeSpent: 420 // 7 hours
            },
            {
                userId: this.currentUser.id,
                courseId: this.courses[2]?.id,
                status: 'in_progress',
                progress: 25,
                startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                lastAccessedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                timeSpent: 120 // 2 hours
            }
        ];

        for (const progressData of sampleProgressData) {
            if (progressData.courseId) {
                try {
                    HRData.trainingService.createProgress(progressData);
                } catch (error) {
                    console.error('Error creating sample progress:', error);
                }
            }
        }
    }

    setupEventListeners() {
        // Browse catalog button
        const browseCatalogBtn = document.getElementById('browseCatalogBtn');
        if (browseCatalogBtn) {
            browseCatalogBtn.addEventListener('click', () => {
                window.location.href = 'catalog.html';
            });
        }

        // Filter tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Sort select
        const sortSelect = document.getElementById('sortSelect');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentSort = e.target.value;
                this.applyFilters();
            });
        }

        // Start learning button
        const startLearningBtn = document.getElementById('startLearningBtn');
        if (startLearningBtn) {
            startLearningBtn.addEventListener('click', () => {
                window.location.href = 'catalog.html';
            });
        }

        // Modal close events
        this.setupModalEvents();

        // Progress slider
        const progressSlider = document.getElementById('progressSlider');
        const progressValue = document.getElementById('progressValue');
        if (progressSlider && progressValue) {
            progressSlider.addEventListener('input', (e) => {
                progressValue.textContent = `${e.target.value}%`;
            });
        }

        // Save progress button
        const saveProgressBtn = document.getElementById('saveProgressBtn');
        if (saveProgressBtn) {
            saveProgressBtn.addEventListener('click', () => {
                this.saveProgressUpdate();
            });
        }

        // Update progress button
        const updateProgressBtn = document.getElementById('updateProgressBtn');
        if (updateProgressBtn) {
            updateProgressBtn.addEventListener('click', () => {
                this.showUpdateModal();
            });
        }

        // Mark complete button
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        if (markCompleteBtn) {
            markCompleteBtn.addEventListener('click', () => {
                this.markCourseComplete();
            });
        }
    }

    setupModalEvents() {
        // Progress modal
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        
        [modalClose, modalOverlay, modalCloseBtn].forEach(element => {
            if (element) {
                element.addEventListener('click', () => {
                    this.closeProgressModal();
                });
            }
        });

        // Update modal
        const updateModalClose = document.getElementById('updateModalClose');
        const updateModalOverlay = document.getElementById('updateModalOverlay');
        const updateModalCancel = document.getElementById('updateModalCancel');
        
        [updateModalClose, updateModalOverlay, updateModalCancel].forEach(element => {
            if (element) {
                element.addEventListener('click', () => {
                    this.closeUpdateModal();
                });
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        
        this.applyFilters();
    }

    applyFilters() {
        // Filter by status
        this.filteredProgress = this.userProgress.filter(progress => {
            if (this.currentFilter === 'all') return true;
            return progress.status === this.currentFilter;
        });

        // Sort
        this.filteredProgress.sort((a, b) => {
            switch (this.currentSort) {
                case 'recent':
                    return new Date(b.lastAccessedAt || b.updatedAt) - new Date(a.lastAccessedAt || a.updatedAt);
                case 'progress':
                    return b.progress - a.progress;
                case 'title':
                    const courseA = this.getCourseById(a.courseId);
                    const courseB = this.getCourseById(b.courseId);
                    return (courseA?.title || '').localeCompare(courseB?.title || '');
                case 'completion':
                    if (!a.completedAt && !b.completedAt) return 0;
                    if (!a.completedAt) return 1;
                    if (!b.completedAt) return -1;
                    return new Date(b.completedAt) - new Date(a.completedAt);
                default:
                    return 0;
            }
        });

        this.renderProgressList();
    }

    renderOverview() {
        const analytics = HRData.trainingService.getUserAnalytics(this.currentUser.id);
        
        // Update overview cards
        document.getElementById('totalCoursesCount').textContent = analytics.totalCourses;
        document.getElementById('completedCoursesCount').textContent = analytics.completedCourses;
        document.getElementById('inProgressCoursesCount').textContent = analytics.inProgressCourses;
        document.getElementById('totalTimeSpent').textContent = `${Math.round(analytics.totalTimeSpent / 60)}h`;
        
        // Update completion chart
        const completionPercentage = Math.round(analytics.completionRate);
        document.getElementById('completionPercentage').textContent = `${completionPercentage}%`;
        document.getElementById('progressFill').style.width = `${completionPercentage}%`;
    }

    renderProgressList() {
        const progressList = document.getElementById('progressList');
        const emptyState = document.getElementById('emptyState');
        
        if (!progressList) return;

        if (this.filteredProgress.length === 0) {
            progressList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        progressList.style.display = 'flex';
        emptyState.style.display = 'none';

        progressList.innerHTML = this.filteredProgress.map(progress => 
            this.createProgressItem(progress)
        ).join('');

        // Add click listeners
        progressList.querySelectorAll('.progress-item').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.showProgressDetail(this.filteredProgress[index]);
            });
        });
    }

    createProgressItem(progress) {
        const course = this.getCourseById(progress.courseId);
        if (!course) return '';

        const statusClass = `status-${progress.status.replace('_', '-')}`;
        const statusText = progress.status.replace('_', ' ').toUpperCase();
        
        const lastAccessed = progress.lastAccessedAt ? 
            new Date(progress.lastAccessedAt).toLocaleDateString() : 
            'Never';
        
        const timeSpentHours = Math.round(progress.timeSpent / 60 * 10) / 10;

        return `
            <div class="progress-item" data-progress-id="${progress.id}">
                <div class="progress-item-header">
                    <div class="progress-item-info">
                        <h3 class="progress-item-title">${course.title}</h3>
                        <div class="progress-item-provider">
                            <div class="provider-icon provider-${course.provider.toLowerCase().replace(/\s+/g, '-')}"></div>
                            ${course.provider}
                        </div>
                        <div class="progress-item-meta">
                            <div class="meta-item">
                                <span>⏱️</span>
                                <span>${course.duration}h total</span>
                            </div>
                            <div class="meta-item">
                                <span>📅</span>
                                <span>Last accessed: ${lastAccessed}</span>
                            </div>
                            <div class="meta-item">
                                <span>⏰</span>
                                <span>${timeSpentHours}h spent</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="progress-item-status">
                        <div class="status-badge ${statusClass}">${statusText}</div>
                        <div class="progress-percentage">${progress.progress}%</div>
                    </div>
                </div>
                
                <div class="progress-item-bar">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.progress}%"></div>
                    </div>
                    <div class="progress-item-details">
                        <span>Progress: ${progress.progress}%</span>
                        ${progress.completedAt ? 
                            `<span>Completed: ${new Date(progress.completedAt).toLocaleDateString()}</span>` :
                            `<span>Started: ${new Date(progress.startedAt).toLocaleDateString()}</span>`
                        }
                    </div>
                </div>
                
                <div class="progress-actions">
                    <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); progressTracker.showProgressDetail(progressTracker.getProgressById('${progress.id}'))">
                        View Details
                    </button>
                    ${progress.status === 'in_progress' ? `
                        <button class="btn btn-small btn-secondary" onclick="event.stopPropagation(); progressTracker.quickUpdateProgress('${progress.id}')">
                            Update Progress
                        </button>
                    ` : ''}
                    ${course.url ? `
                        <button class="btn btn-small btn-outline" onclick="event.stopPropagation(); window.open('${course.url}', '_blank')">
                            Open Course
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    showProgressDetail(progress) {
        const course = this.getCourseById(progress.courseId);
        if (!course) return;

        this.selectedProgressId = progress.id;
        
        const modal = document.getElementById('progressModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const updateProgressBtn = document.getElementById('updateProgressBtn');
        const markCompleteBtn = document.getElementById('markCompleteBtn');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = `${course.title} - Progress`;
        
        const timeSpentHours = Math.round(progress.timeSpent / 60 * 10) / 10;
        const estimatedCompletion = progress.progress > 0 ? 
            Math.ceil((course.duration - timeSpentHours) / (timeSpentHours / (progress.progress / 100))) : 
            course.duration;

        modalBody.innerHTML = `
            <div class="progress-detail-header">
                <div class="progress-detail-info">
                    <h3 class="progress-detail-title">${course.title}</h3>
                    <div class="progress-detail-provider">
                        <div class="provider-icon provider-${course.provider.toLowerCase().replace(/\s+/g, '-')}"></div>
                        ${course.provider}
                    </div>
                </div>
            </div>
            
            <div class="progress-detail-stats">
                <div class="stat-item">
                    <span class="stat-value">${progress.progress}%</span>
                    <span class="stat-label">Progress</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${timeSpentHours}h</span>
                    <span class="stat-label">Time Spent</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${course.duration}h</span>
                    <span class="stat-label">Total Duration</span>
                </div>
                <div class="stat-item">
                    <span class="stat-value">${progress.status === 'completed' ? '0h' : estimatedCompletion + 'h'}</span>
                    <span class="stat-label">Remaining</span>
                </div>
            </div>
            
            <div class="progress-bar" style="margin-bottom: 24px;">
                <div class="progress-fill" style="width: ${progress.progress}%"></div>
            </div>
            
            <div class="progress-timeline">
                <h4 class="timeline-title">Progress Timeline</h4>
                <div class="timeline-item">
                    <div class="timeline-icon timeline-started">S</div>
                    <div class="timeline-content">
                        <div class="timeline-event">Course Started</div>
                        <div class="timeline-date">${new Date(progress.startedAt).toLocaleDateString()}</div>
                    </div>
                </div>
                ${progress.lastAccessedAt && progress.lastAccessedAt !== progress.startedAt ? `
                    <div class="timeline-item">
                        <div class="timeline-icon timeline-progress">P</div>
                        <div class="timeline-content">
                            <div class="timeline-event">Last Progress Update</div>
                            <div class="timeline-date">${new Date(progress.lastAccessedAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                ` : ''}
                ${progress.completedAt ? `
                    <div class="timeline-item">
                        <div class="timeline-icon timeline-completed">C</div>
                        <div class="timeline-content">
                            <div class="timeline-event">Course Completed</div>
                            <div class="timeline-date">${new Date(progress.completedAt).toLocaleDateString()}</div>
                        </div>
                    </div>
                ` : ''}
            </div>
            
            ${progress.feedback ? `
                <div class="progress-feedback">
                    <h4>Your Feedback</h4>
                    <p>${progress.feedback}</p>
                    ${progress.rating > 0 ? `
                        <div class="rating">
                            Rating: ${'★'.repeat(progress.rating)}${'☆'.repeat(5 - progress.rating)}
                        </div>
                    ` : ''}
                </div>
            ` : ''}
        `;
        
        // Show/hide action buttons based on status
        updateProgressBtn.style.display = progress.status === 'in_progress' ? 'inline-block' : 'none';
        markCompleteBtn.style.display = progress.status === 'in_progress' && progress.progress < 100 ? 'inline-block' : 'none';
        
        modal.style.display = 'flex';
    }

    showUpdateModal() {
        if (!this.selectedProgressId) return;
        
        const progress = this.getProgressById(this.selectedProgressId);
        if (!progress) return;
        
        const updateModal = document.getElementById('updateModal');
        const progressSlider = document.getElementById('progressSlider');
        const progressValue = document.getElementById('progressValue');
        const timeSpentInput = document.getElementById('timeSpentInput');
        const notesInput = document.getElementById('notesInput');
        
        if (!updateModal) return;
        
        // Set current values
        progressSlider.value = progress.progress;
        progressValue.textContent = `${progress.progress}%`;
        timeSpentInput.value = progress.timeSpent || 0;
        notesInput.value = '';
        
        updateModal.style.display = 'flex';
    }

    async saveProgressUpdate() {
        if (!this.selectedProgressId) return;
        
        const progressSlider = document.getElementById('progressSlider');
        const timeSpentInput = document.getElementById('timeSpentInput');
        const notesInput = document.getElementById('notesInput');
        
        const newProgress = parseInt(progressSlider.value);
        const additionalTime = parseInt(timeSpentInput.value) || 0;
        const notes = notesInput.value.trim();
        
        try {
            const progress = this.getProgressById(this.selectedProgressId);
            if (!progress) return;
            
            // Update progress
            progress.progress = newProgress;
            progress.timeSpent = (progress.timeSpent || 0) + additionalTime;
            progress.lastAccessedAt = new Date().toISOString();
            progress.updatedAt = new Date().toISOString();
            
            if (newProgress === 100) {
                progress.status = 'completed';
                progress.completedAt = new Date().toISOString();
                
                // Update user skills based on course completion
                await this.updateUserSkillsFromCourse(progress.courseId);
            }
            
            // Save to storage
            HRData.dataStore.update('hr_user_progress', progress.id, progress);
            
            // Refresh data and UI
            await this.loadData();
            this.renderOverview();
            this.renderProgressList();
            
            this.closeUpdateModal();
            this.closeProgressModal();
            
            this.showSuccess('Progress updated successfully!');
            
        } catch (error) {
            console.error('Error updating progress:', error);
            this.showError('Failed to update progress');
        }
    }

    async markCourseComplete() {
        if (!this.selectedProgressId) return;
        
        try {
            const progress = this.getProgressById(this.selectedProgressId);
            if (!progress) return;
            
            // Mark as complete
            progress.progress = 100;
            progress.status = 'completed';
            progress.completedAt = new Date().toISOString();
            progress.lastAccessedAt = new Date().toISOString();
            progress.updatedAt = new Date().toISOString();
            
            // Update user skills
            await this.updateUserSkillsFromCourse(progress.courseId);
            
            // Save to storage
            HRData.dataStore.update('hr_user_progress', progress.id, progress);
            
            // Refresh data and UI
            await this.loadData();
            this.renderOverview();
            this.renderProgressList();
            
            this.closeProgressModal();
            
            this.showSuccess('Course marked as complete! Your skills have been updated.');
            
        } catch (error) {
            console.error('Error marking course complete:', error);
            this.showError('Failed to mark course as complete');
        }
    }

    async updateUserSkillsFromCourse(courseId) {
        try {
            const course = this.getCourseById(courseId);
            if (!course || !course.skills) return;
            
            const user = HRData.userService.getById(this.currentUser.id);
            if (!user) return;
            
            // Update user skills based on course completion
            course.skills.forEach(skillName => {
                const currentLevel = user.skills[skillName]?.level || 0;
                const newLevel = Math.min(5, currentLevel + 1); // Increase by 1, max 5
                
                user.updateSkill(skillName, newLevel, true);
            });
            
            // Save updated user
            HRData.userService.update(user.id, user);
            
            // Update current user in session
            HRData.dataStore.setCurrentUser(user);
            this.currentUser = user;
            
        } catch (error) {
            console.error('Error updating user skills:', error);
        }
    }

    quickUpdateProgress(progressId) {
        this.selectedProgressId = progressId;
        this.showUpdateModal();
    }

    closeProgressModal() {
        const modal = document.getElementById('progressModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.selectedProgressId = null;
    }

    closeUpdateModal() {
        const updateModal = document.getElementById('updateModal');
        if (updateModal) {
            updateModal.style.display = 'none';
        }
    }

    getCourseById(courseId) {
        return this.courses.find(course => course.id === courseId);
    }

    getProgressById(progressId) {
        return this.userProgress.find(progress => progress.id === progressId);
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showInfo(message) {
        this.showNotification(message, 'info');
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span class="notification-message">${message}</span>
            <button class="notification-close">✕</button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);

        // Manual close
        notification.querySelector('.notification-close').addEventListener('click', () => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        });
    }
}

// Initialize progress tracker when page loads
let progressTracker;
document.addEventListener('DOMContentLoaded', () => {
    progressTracker = new ProgressTracker();
});

// Export for global access
window.progressTracker = progressTracker;