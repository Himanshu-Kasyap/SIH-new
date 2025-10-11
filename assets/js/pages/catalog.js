/**
 * Training Catalog Page JavaScript
 * Handles course display, search, filtering, and enrollment
 */

class TrainingCatalog {
    constructor() {
        this.courses = [];
        this.filteredCourses = [];
        this.currentView = 'grid';
        this.currentUser = null;
        this.filters = {
            search: '',
            category: '',
            provider: '',
            duration: ''
        };
        
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

            // Initialize sample courses if none exist
            await this.initializeSampleCourses();
            
            // Load courses
            this.loadCourses();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initial render
            this.renderCourses();
            
        } catch (error) {
            console.error('Error initializing catalog:', error);
            this.showError('Failed to load training catalog');
        }
    }

    async initializeSampleCourses() {
        const existingCourses = HRData.trainingService.getAllCourses();
        if (existingCourses.length > 0) {
            return; // Sample data already exists
        }

        const sampleCourses = [
            // Internal Courses
            {
                title: 'Leadership Fundamentals',
                description: 'Develop essential leadership skills including team management, communication, and strategic thinking. Perfect for emerging leaders and managers.',
                provider: 'Internal',
                category: 'Leadership',
                skills: ['Leadership', 'Team Building', 'Communication', 'Strategic Planning'],
                duration: 8,
                level: 'Intermediate',
                rating: 4.5,
                ratingCount: 127,
                price: 0,
                outline: [
                    'Introduction to Leadership Styles',
                    'Effective Communication Strategies',
                    'Building High-Performance Teams',
                    'Strategic Decision Making',
                    'Leading Through Change'
                ],
                learningOutcomes: [
                    'Understand different leadership styles and when to apply them',
                    'Develop effective communication and feedback skills',
                    'Learn to build and motivate high-performing teams'
                ]
            },
            {
                title: 'Agile Project Management',
                description: 'Master agile methodologies including Scrum and Kanban. Learn to manage projects efficiently in fast-paced environments.',
                provider: 'Internal',
                category: 'Project Management',
                skills: ['Project Management', 'Agile Methodology', 'Team Building'],
                duration: 12,
                level: 'Intermediate',
                rating: 4.3,
                ratingCount: 89,
                price: 0,
                outline: [
                    'Agile Principles and Values',
                    'Scrum Framework Deep Dive',
                    'Kanban Implementation',
                    'Sprint Planning and Retrospectives',
                    'Scaling Agile in Organizations'
                ]
            },
            {
                title: 'Data Analysis with Python',
                description: 'Learn data analysis fundamentals using Python, pandas, and visualization libraries. No prior programming experience required.',
                provider: 'Internal',
                category: 'Data Analysis',
                skills: ['Python', 'Data Analysis', 'Problem Solving'],
                duration: 20,
                level: 'Beginner',
                rating: 4.7,
                ratingCount: 156,
                price: 0,
                outline: [
                    'Python Basics for Data Analysis',
                    'Working with Pandas DataFrames',
                    'Data Cleaning and Preparation',
                    'Statistical Analysis Fundamentals',
                    'Data Visualization with Matplotlib'
                ]
            },
            
            // External Courses - Coursera
            {
                title: 'Machine Learning Specialization',
                description: 'Comprehensive machine learning course covering supervised and unsupervised learning, neural networks, and practical applications.',
                provider: 'Coursera',
                category: 'Technical',
                skills: ['Machine Learning', 'Python', 'Data Analysis'],
                duration: 45,
                level: 'Advanced',
                rating: 4.8,
                ratingCount: 2341,
                price: 49,
                url: 'https://coursera.org/specializations/machine-learning',
                outline: [
                    'Supervised Machine Learning',
                    'Advanced Learning Algorithms',
                    'Unsupervised Learning',
                    'Reinforcement Learning'
                ]
            },
            {
                title: 'Google Data Analytics Certificate',
                description: 'Professional certificate program that prepares you for an entry-level role in data analytics with hands-on practice.',
                provider: 'Coursera',
                category: 'Data Analysis',
                skills: ['Data Analysis', 'SQL', 'Spreadsheets'],
                duration: 180,
                level: 'Beginner',
                rating: 4.6,
                ratingCount: 15678,
                price: 39,
                url: 'https://coursera.org/professional-certificates/google-data-analytics'
            },
            
            // LinkedIn Learning
            {
                title: 'React.js Essential Training',
                description: 'Learn React fundamentals including components, state management, and modern React patterns. Build real-world applications.',
                provider: 'LinkedIn Learning',
                category: 'Technical',
                skills: ['React', 'JavaScript', 'Web Development'],
                duration: 6,
                level: 'Intermediate',
                rating: 4.4,
                ratingCount: 892,
                price: 29.99,
                url: 'https://linkedin.com/learning/react-js-essential-training'
            },
            {
                title: 'Strategic Thinking',
                description: 'Develop strategic thinking skills to analyze complex business problems and create innovative solutions.',
                provider: 'LinkedIn Learning',
                category: 'Leadership',
                skills: ['Strategic Planning', 'Problem Solving', 'Leadership'],
                duration: 4,
                level: 'Intermediate',
                rating: 4.2,
                ratingCount: 567,
                price: 29.99
            },
            
            // Udemy
            {
                title: 'Complete Web Development Bootcamp',
                description: 'Full-stack web development course covering HTML, CSS, JavaScript, Node.js, React, and databases.',
                provider: 'Udemy',
                category: 'Technical',
                skills: ['JavaScript', 'React', 'Node.js', 'Web Development'],
                duration: 65,
                level: 'Beginner',
                rating: 4.7,
                ratingCount: 45123,
                price: 84.99,
                url: 'https://udemy.com/course/the-complete-web-development-bootcamp'
            },
            {
                title: 'Public Speaking Masterclass',
                description: 'Overcome fear of public speaking and develop confidence to present effectively to any audience.',
                provider: 'Udemy',
                category: 'Communication',
                skills: ['Communication', 'Leadership', 'Presentation Skills'],
                duration: 8,
                level: 'Beginner',
                rating: 4.5,
                ratingCount: 3421,
                price: 54.99
            },
            
            // Pluralsight
            {
                title: 'Cloud Computing Fundamentals',
                description: 'Introduction to cloud computing concepts, services, and deployment models across major cloud platforms.',
                provider: 'Pluralsight',
                category: 'Technical',
                skills: ['Cloud Computing', 'DevOps', 'System Architecture'],
                duration: 15,
                level: 'Beginner',
                rating: 4.3,
                ratingCount: 1234,
                price: 35,
                url: 'https://pluralsight.com/courses/cloud-computing-fundamentals'
            }
        ];

        // Create sample courses
        for (const courseData of sampleCourses) {
            try {
                HRData.trainingService.createCourse(courseData);
            } catch (error) {
                console.error('Error creating sample course:', error);
            }
        }
    }

    loadCourses() {
        try {
            this.courses = HRData.trainingService.getAllCourses();
            this.filteredCourses = [...this.courses];
            this.updateResultsCount();
        } catch (error) {
            console.error('Error loading courses:', error);
            this.showError('Failed to load courses');
        }
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.applyFilters();
            });
        }

        // Filter selects
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.filters.category = e.target.value;
                this.applyFilters();
            });
        }

        const providerFilter = document.getElementById('providerFilter');
        if (providerFilter) {
            providerFilter.addEventListener('change', (e) => {
                this.filters.provider = e.target.value;
                this.applyFilters();
            });
        }

        const durationFilter = document.getElementById('durationFilter');
        if (durationFilter) {
            durationFilter.addEventListener('change', (e) => {
                this.filters.duration = e.target.value;
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

        // View toggle buttons
        const gridViewBtn = document.getElementById('gridViewBtn');
        const listViewBtn = document.getElementById('listViewBtn');
        
        if (gridViewBtn) {
            gridViewBtn.addEventListener('click', () => {
                this.setView('grid');
            });
        }
        
        if (listViewBtn) {
            listViewBtn.addEventListener('click', () => {
                this.setView('list');
            });
        }

        // AI suggestions button
        const suggestCourseBtn = document.getElementById('suggestCourseBtn');
        if (suggestCourseBtn) {
            suggestCourseBtn.addEventListener('click', () => {
                this.showAISuggestions();
            });
        }

        // Browse all button
        const browseAllBtn = document.getElementById('browseAllBtn');
        if (browseAllBtn) {
            browseAllBtn.addEventListener('click', () => {
                this.clearFilters();
            });
        }

        // Modal close events
        const modalClose = document.getElementById('modalClose');
        const modalOverlay = document.getElementById('modalOverlay');
        const modalCloseBtn = document.getElementById('modalCloseBtn');
        
        [modalClose, modalOverlay, modalCloseBtn].forEach(element => {
            if (element) {
                element.addEventListener('click', () => {
                    this.closeModal();
                });
            }
        });

        // Enroll button
        const enrollBtn = document.getElementById('enrollBtn');
        if (enrollBtn) {
            enrollBtn.addEventListener('click', () => {
                this.handleEnrollment();
            });
        }
    }

    applyFilters() {
        this.filteredCourses = this.courses.filter(course => {
            // Search filter
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                const matchesSearch = 
                    course.title.toLowerCase().includes(searchTerm) ||
                    course.description.toLowerCase().includes(searchTerm) ||
                    course.skills.some(skill => skill.toLowerCase().includes(searchTerm)) ||
                    course.provider.toLowerCase().includes(searchTerm);
                
                if (!matchesSearch) return false;
            }

            // Category filter
            if (this.filters.category && course.category !== this.filters.category) {
                return false;
            }

            // Provider filter
            if (this.filters.provider && course.provider !== this.filters.provider) {
                return false;
            }

            // Duration filter
            if (this.filters.duration) {
                const durationCategory = course.getDurationCategory();
                if (durationCategory !== this.filters.duration) {
                    return false;
                }
            }

            return true;
        });

        this.updateResultsCount();
        this.renderCourses();
    }

    clearFilters() {
        this.filters = {
            search: '',
            category: '',
            provider: '',
            duration: ''
        };

        // Reset form elements
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('providerFilter').value = '';
        document.getElementById('durationFilter').value = '';

        this.applyFilters();
    }

    setView(view) {
        this.currentView = view;
        
        // Update button states
        document.getElementById('gridViewBtn').classList.toggle('active', view === 'grid');
        document.getElementById('listViewBtn').classList.toggle('active', view === 'list');
        
        // Update grid class
        const coursesGrid = document.getElementById('coursesGrid');
        coursesGrid.classList.toggle('list-view', view === 'list');
        
        this.renderCourses();
    }

    updateResultsCount() {
        const resultsCount = document.getElementById('resultsCount');
        if (resultsCount) {
            const count = this.filteredCourses.length;
            resultsCount.textContent = `${count} course${count !== 1 ? 's' : ''} found`;
        }
    }

    renderCourses() {
        const coursesGrid = document.getElementById('coursesGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!coursesGrid) return;

        if (this.filteredCourses.length === 0) {
            coursesGrid.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        coursesGrid.style.display = 'grid';
        emptyState.style.display = 'none';

        coursesGrid.innerHTML = this.filteredCourses.map(course => 
            this.createCourseCard(course)
        ).join('');

        // Add click listeners to course cards
        coursesGrid.querySelectorAll('.course-card').forEach((card, index) => {
            card.addEventListener('click', () => {
                this.showCourseDetail(this.filteredCourses[index]);
            });
        });
    }

    createCourseCard(course) {
        const providerClass = `provider-${course.provider.toLowerCase().replace(/\s+/g, '-')}`;
        const isExternal = course.provider !== 'Internal';
        const priceDisplay = course.price === 0 ? 'Free' : `$${course.price}`;
        
        return `
            <div class="course-card" data-course-id="${course.id}">
                <div class="course-header">
                    <div class="course-provider">
                        <div class="provider-icon ${providerClass}"></div>
                        ${course.provider}
                    </div>
                </div>
                
                <h3 class="course-title">${course.title}</h3>
                <p class="course-description">${course.description}</p>
                
                <div class="course-meta">
                    <div class="meta-item">
                        <span>⏱️</span>
                        <span>${course.duration}h</span>
                    </div>
                    <div class="meta-item">
                        <span>📊</span>
                        <span>${course.level}</span>
                    </div>
                    <div class="meta-item">
                        <span>💰</span>
                        <span>${priceDisplay}</span>
                    </div>
                </div>
                
                <div class="course-skills">
                    ${course.skills.slice(0, 3).map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                    ${course.skills.length > 3 ? `<span class="skill-tag">+${course.skills.length - 3} more</span>` : ''}
                </div>
                
                <div class="course-footer">
                    <div class="course-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(course.rating))}${'☆'.repeat(5 - Math.floor(course.rating))}</span>
                        <span class="rating-count">${course.rating} (${course.ratingCount})</span>
                    </div>
                    
                    <div class="course-actions">
                        <button class="btn btn-small btn-primary" onclick="event.stopPropagation(); catalog.enrollInCourse('${course.id}')">
                            ${isExternal ? 'View Course' : 'Enroll'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    showCourseDetail(course) {
        const modal = document.getElementById('courseDetailModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');
        const enrollBtn = document.getElementById('enrollBtn');
        
        if (!modal || !modalTitle || !modalBody) return;

        modalTitle.textContent = course.title;
        
        const isExternal = course.provider !== 'Internal';
        const priceDisplay = course.price === 0 ? 'Free' : `$${course.price}`;
        
        modalBody.innerHTML = `
            <div class="course-detail-header">
                <div class="course-detail-image">
                    📚
                </div>
                <div class="course-detail-info">
                    <h3 class="course-detail-title">${course.title}</h3>
                    <div class="course-detail-provider">
                        <div class="provider-icon provider-${course.provider.toLowerCase().replace(/\s+/g, '-')}"></div>
                        ${course.provider}
                    </div>
                    <div class="course-rating">
                        <span class="rating-stars">${'★'.repeat(Math.floor(course.rating))}${'☆'.repeat(5 - Math.floor(course.rating))}</span>
                        <span>${course.rating} (${course.ratingCount} reviews)</span>
                    </div>
                </div>
            </div>
            
            <div class="course-detail-meta">
                <div class="detail-meta-item">
                    <span class="meta-value">${course.duration}h</span>
                    <span class="meta-label">Duration</span>
                </div>
                <div class="detail-meta-item">
                    <span class="meta-value">${course.level}</span>
                    <span class="meta-label">Level</span>
                </div>
                <div class="detail-meta-item">
                    <span class="meta-value">${priceDisplay}</span>
                    <span class="meta-label">Price</span>
                </div>
                <div class="detail-meta-item">
                    <span class="meta-value">${course.category}</span>
                    <span class="meta-label">Category</span>
                </div>
            </div>
            
            <div class="course-detail-description">
                <p>${course.description}</p>
            </div>
            
            <div class="course-detail-skills">
                <h4 class="skills-title">Skills You'll Learn</h4>
                <div class="course-skills">
                    ${course.skills.map(skill => 
                        `<span class="skill-tag">${skill}</span>`
                    ).join('')}
                </div>
            </div>
            
            ${course.outline && course.outline.length > 0 ? `
                <div class="course-outline">
                    <h4 class="outline-title">Course Outline</h4>
                    <ul class="outline-list">
                        ${course.outline.map(item => 
                            `<li class="outline-item">
                                <span class="outline-icon">✓</span>
                                ${item}
                            </li>`
                        ).join('')}
                    </ul>
                </div>
            ` : ''}
            
            ${course.learningOutcomes && course.learningOutcomes.length > 0 ? `
                <div class="course-outcomes">
                    <h4 class="outcomes-title">Learning Outcomes</h4>
                    <ul class="outline-list">
                        ${course.learningOutcomes.map(outcome => 
                            `<li class="outline-item">
                                <span class="outline-icon">🎯</span>
                                ${outcome}
                            </li>`
                        ).join('')}
                    </ul>
                </div>
            ` : ''}
        `;
        
        // Update enroll button
        enrollBtn.textContent = isExternal ? 'View Course' : 'Enroll Now';
        enrollBtn.setAttribute('data-course-id', course.id);
        
        modal.style.display = 'flex';
    }

    closeModal() {
        const modal = document.getElementById('courseDetailModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    handleEnrollment() {
        const enrollBtn = document.getElementById('enrollBtn');
        const courseId = enrollBtn.getAttribute('data-course-id');
        
        if (courseId) {
            this.enrollInCourse(courseId);
        }
    }

    enrollInCourse(courseId) {
        try {
            const course = HRData.trainingService.getCourseById(courseId);
            if (!course) {
                this.showError('Course not found');
                return;
            }

            if (course.provider === 'Internal') {
                // Enroll in internal course
                HRData.trainingService.enrollUser(this.currentUser.id, courseId);
                this.showSuccess(`Successfully enrolled in "${course.title}"`);
                this.closeModal();
            } else {
                // Redirect to external course
                if (course.url) {
                    window.open(course.url, '_blank');
                } else {
                    this.showInfo(`Please visit ${course.provider} to enroll in "${course.title}"`);
                }
            }
        } catch (error) {
            console.error('Error enrolling in course:', error);
            this.showError('Failed to enroll in course');
        }
    }

    showAISuggestions() {
        try {
            // Get user's skill gaps from recommendations
            const recommendations = HRData.recommendationService.getByEmployeeId(this.currentUser.id);
            
            if (recommendations.length === 0) {
                this.showInfo('No skill gaps identified. Complete a skill assessment to get personalized course recommendations.');
                return;
            }

            // Get skills that need improvement
            const skillGaps = [];
            recommendations.forEach(rec => {
                Object.entries(rec.skillGaps).forEach(([skill, gap]) => {
                    if (gap.priority === 'high' || gap.priority === 'medium') {
                        skillGaps.push(skill);
                    }
                });
            });

            if (skillGaps.length === 0) {
                this.showInfo('Great job! No critical skill gaps identified.');
                return;
            }

            // Find courses that teach these skills
            const suggestedCourses = this.courses.filter(course => 
                course.skills.some(skill => skillGaps.includes(skill))
            );

            if (suggestedCourses.length === 0) {
                this.showInfo('No courses found for your skill gaps. Consider exploring external training options.');
                return;
            }

            // Filter to show suggested courses
            this.filteredCourses = suggestedCourses;
            this.updateResultsCount();
            this.renderCourses();
            
            this.showSuccess(`Found ${suggestedCourses.length} courses recommended for your skill development!`);
            
        } catch (error) {
            console.error('Error getting AI suggestions:', error);
            this.showError('Failed to get course suggestions');
        }
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

// Initialize catalog when page loads
let catalog;
document.addEventListener('DOMContentLoaded', () => {
    catalog = new TrainingCatalog();
});

// Export for global access
window.catalog = catalog;