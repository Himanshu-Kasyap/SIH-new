// Feedback Page JavaScript

class FeedbackManager {
    constructor() {
        this.feedback = [];
        this.currentUser = null;
        
        this.init();
    }

    init() {
        this.loadCurrentUser();
        this.loadFeedback();
        this.setupEventListeners();
        this.renderMyFeedback();
        this.renderRecentImprovements();
    }

    loadCurrentUser() {
        const userData = localStorage.getItem('hr_current_user');
        this.currentUser = userData ? JSON.parse(userData) : { id: 'demo-user', name: 'Demo User' };
    }

    loadFeedback() {
        const storedFeedback = localStorage.getItem('hr_feedback');
        this.feedback = storedFeedback ? JSON.parse(storedFeedback) : this.getDefaultFeedback();
    }

    getDefaultFeedback() {
        return [
            {
                id: 'feedback-1',
                userId: 'demo-user',
                userName: 'Demo User',
                type: 'improvement',
                category: 'dashboard',
                title: 'Add more visual charts to dashboard',
                description: 'The dashboard would benefit from more visual representations of data, such as pie charts for skill distribution and progress bars for IDP completion.',
                priority: 'medium',
                rating: 4,
                status: 'implemented',
                anonymous: false,
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'feedback-2',
                userId: 'demo-user',
                userName: 'Demo User',
                type: 'bug',
                category: 'skills',
                title: 'Skill rating not saving properly',
                description: 'When I update my skill ratings and navigate away from the page, sometimes the changes are not saved. This happens intermittently.',
                priority: 'high',
                rating: 3,
                status: 'in-review',
                anonymous: false,
                createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
    }

    setupEventListeners() {
        // Feedback form submission
        const feedbackForm = document.getElementById('feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitFeedback();
            });
        }

        // Rating stars
        const ratingInputs = document.querySelectorAll('.rating-input input[type="radio"]');
        ratingInputs.forEach(input => {
            input.addEventListener('change', () => {
                this.updateRatingDisplay();
            });
        });
    }

    updateRatingDisplay() {
        // Visual feedback for rating selection is handled by CSS
        // This method can be extended for additional rating functionality
    }

    submitFeedback() {
        const form = document.getElementById('feedback-form');
        const formData = new FormData(form);
        
        const feedbackData = {
            id: 'feedback-' + Date.now(),
            userId: this.currentUser.id,
            userName: formData.get('anonymous') ? 'Anonymous' : this.currentUser.name,
            type: formData.get('type'),
            category: formData.get('category'),
            title: formData.get('title'),
            description: formData.get('description'),
            priority: formData.get('priority'),
            rating: parseInt(formData.get('rating')) || 3,
            status: 'pending',
            anonymous: formData.get('anonymous') === 'on',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.feedback.push(feedbackData);
        this.saveFeedback();
        this.renderMyFeedback();
        
        // Reset form
        form.reset();
        document.getElementById('star3').checked = true; // Reset to 3 stars
        
        this.showNotification('Feedback submitted successfully! Thank you for your input.', 'success');
    }

    renderMyFeedback() {
        const container = document.getElementById('my-feedback-list');
        if (!container) return;

        const userFeedback = this.feedback.filter(f => f.userId === this.currentUser.id);
        
        if (userFeedback.length === 0) {
            container.innerHTML = `
                <div class="no-feedback">
                    <p>You haven't submitted any feedback yet. Use the form above to share your thoughts!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = userFeedback
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .map(feedback => `
                <div class="feedback-item">
                    <div class="feedback-item-header">
                        <h3 class="feedback-item-title">${feedback.title}</h3>
                    </div>
                    <div class="feedback-item-meta">
                        <span class="feedback-item-type ${feedback.type}">${feedback.type}</span>
                        <span class="feedback-item-priority ${feedback.priority}">${feedback.priority}</span>
                        <span class="feedback-category">${feedback.category}</span>
                    </div>
                    <div class="feedback-item-description">
                        ${feedback.description}
                    </div>
                    <div class="feedback-item-status">
                        <span class="feedback-status ${feedback.status}">${feedback.status.replace('-', ' ')}</span>
                        <span class="feedback-date">${new Date(feedback.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
    }

    renderRecentImprovements() {
        const container = document.getElementById('recent-improvements');
        if (!container) return;

        const implementedFeedback = this.feedback
            .filter(f => f.status === 'implemented')
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 3);

        if (implementedFeedback.length === 0) {
            container.innerHTML = '<p>No recent improvements to display.</p>';
            return;
        }

        container.innerHTML = implementedFeedback.map(feedback => `
            <div class="improvement-item">
                <div class="title">${feedback.title}</div>
                <div class="date">Implemented ${new Date(feedback.updatedAt).toLocaleDateString()}</div>
            </div>
        `).join('');
    }

    saveFeedback() {
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
            transition: 'transform 0.3s ease',
            maxWidth: '400px'
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

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize feedback manager when page loads
let feedbackManager;
document.addEventListener('DOMContentLoaded', () => {
    feedbackManager = new FeedbackManager();
});