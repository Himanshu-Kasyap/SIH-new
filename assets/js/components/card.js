/**
 * Card Component
 * Reusable card component for metrics display with icons, values, and trend indicators
 */
class Card {
    constructor(options = {}) {
        this.options = {
            type: 'metric', // 'metric', 'info', 'action'
            icon: '',
            title: '',
            value: '',
            subtitle: '',
            trend: null, // { value: number, direction: 'up'|'down', label: string }
            color: 'primary', // 'primary', 'success', 'warning', 'danger'
            clickable: false,
            onClick: null,
            className: '',
            ...options
        };
    }

    render() {
        const cardElement = document.createElement('div');
        cardElement.className = this.getCardClasses();
        cardElement.innerHTML = this.generateCardHTML();
        
        if (this.options.clickable && this.options.onClick) {
            cardElement.style.cursor = 'pointer';
            cardElement.addEventListener('click', this.options.onClick);
        }
        
        return cardElement;
    }

    getCardClasses() {
        const baseClasses = ['card'];
        
        if (this.options.type === 'metric') {
            baseClasses.push('metric-card');
        }
        
        if (this.options.clickable) {
            baseClasses.push('card-clickable');
        }
        
        if (this.options.className) {
            baseClasses.push(this.options.className);
        }
        
        return baseClasses.join(' ');
    }

    generateCardHTML() {
        switch (this.options.type) {
            case 'metric':
                return this.generateMetricCardHTML();
            case 'info':
                return this.generateInfoCardHTML();
            case 'action':
                return this.generateActionCardHTML();
            default:
                return this.generateMetricCardHTML();
        }
    }

    generateMetricCardHTML() {
        const { icon, title, value, subtitle, trend, color } = this.options;
        
        return `
            <div class="metric-card-content">
                ${icon ? `<div class="metric-icon ${color}">${this.getIcon(icon)}</div>` : ''}
                <div class="metric-value">${value}</div>
                <div class="metric-label">${title}</div>
                ${subtitle ? `<div class="metric-subtitle">${subtitle}</div>` : ''}
                ${trend ? this.generateTrendHTML(trend) : ''}
            </div>
        `;
    }

    generateInfoCardHTML() {
        const { icon, title, subtitle } = this.options;
        
        return `
            <div class="card-header">
                ${icon ? `<div class="card-icon">${this.getIcon(icon)}</div>` : ''}
                <div class="card-header-content">
                    <h3 class="card-title">${title}</h3>
                    ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
                </div>
            </div>
            <div class="card-content">
                <div class="card-body" id="card-body-${this.generateId()}">
                    <!-- Content will be added dynamically -->
                </div>
            </div>
        `;
    }

    generateActionCardHTML() {
        const { icon, title, subtitle } = this.options;
        
        return `
            <div class="card-header">
                ${icon ? `<div class="card-icon ${this.options.color}">${this.getIcon(icon)}</div>` : ''}
                <div class="card-header-content">
                    <h3 class="card-title">${title}</h3>
                    ${subtitle ? `<p class="card-subtitle">${subtitle}</p>` : ''}
                </div>
            </div>
            <div class="card-content">
                <div class="card-actions" id="card-actions-${this.generateId()}">
                    <!-- Actions will be added dynamically -->
                </div>
            </div>
        `;
    }

    generateTrendHTML(trend) {
        const trendClass = trend.direction === 'up' ? 'positive' : 'negative';
        const trendIcon = trend.direction === 'up' ? '↗️' : '↘️';
        
        return `
            <div class="metric-trend ${trendClass}">
                <span class="trend-icon">${trendIcon}</span>
                <span class="trend-value">${trend.value}</span>
                <span class="trend-label">${trend.label}</span>
            </div>
        `;
    }

    getIcon(iconName) {
        const icons = {
            // Dashboard icons
            users: '👥',
            user: '👤',
            'user-check': '✅',
            'user-plus': '➕',
            'user-x': '❌',
            
            // Metrics icons
            'trending-up': '📈',
            'trending-down': '📉',
            target: '🎯',
            award: '🏆',
            star: '⭐',
            'star-half': '⭐',
            
            // Status icons
            check: '✅',
            'check-circle': '✅',
            'x-circle': '❌',
            'alert-circle': '⚠️',
            'info-circle': 'ℹ️',
            
            // Business icons
            briefcase: '💼',
            'clipboard-list': '📋',
            'clipboard-check': '✅',
            book: '📚',
            'book-open': '📖',
            graduation: '🎓',
            
            // Analytics icons
            'bar-chart': '📊',
            'pie-chart': '📊',
            'line-chart': '📈',
            activity: '📊',
            
            // Time icons
            clock: '🕐',
            calendar: '📅',
            'calendar-check': '✅',
            
            // Action icons
            plus: '➕',
            minus: '➖',
            edit: '✏️',
            trash: '🗑️',
            settings: '⚙️',
            
            // Navigation icons
            home: '🏠',
            dashboard: '📊',
            search: '🔍',
            filter: '🔽',
            
            // Communication icons
            message: '💬',
            bell: '🔔',
            mail: '📧'
        };
        
        return icons[iconName] || '•';
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    // Method to update card content
    update(newOptions) {
        this.options = { ...this.options, ...newOptions };
        return this.render();
    }

    // Method to add content to info cards
    setContent(content) {
        const cardBody = document.getElementById(`card-body-${this.generateId()}`);
        if (cardBody) {
            cardBody.innerHTML = content;
        }
    }

    // Method to add actions to action cards
    addAction(action) {
        const cardActions = document.getElementById(`card-actions-${this.generateId()}`);
        if (cardActions) {
            const actionElement = document.createElement('button');
            actionElement.className = `btn btn-${action.type || 'primary'} btn-sm`;
            actionElement.innerHTML = `${action.icon ? this.getIcon(action.icon) : ''} ${action.label}`;
            actionElement.addEventListener('click', action.onClick);
            cardActions.appendChild(actionElement);
        }
    }
}

/**
 * CardGrid Component
 * Manages a grid of cards with responsive layout
 */
class CardGrid {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            columns: 'auto', // 'auto', number, or object with breakpoints
            gap: 'md', // 'sm', 'md', 'lg'
            className: '',
            ...options
        };
        this.cards = [];
        this.init();
    }

    init() {
        if (!this.container) return;
        
        this.container.className = this.getGridClasses();
    }

    getGridClasses() {
        const baseClasses = ['card-grid'];
        
        if (typeof this.options.columns === 'number') {
            baseClasses.push(`grid-cols-${this.options.columns}`);
        } else if (this.options.columns === 'auto') {
            baseClasses.push('grid-cols-auto');
        }
        
        baseClasses.push(`gap-${this.options.gap}`);
        
        if (this.options.className) {
            baseClasses.push(this.options.className);
        }
        
        return baseClasses.join(' ');
    }

    addCard(cardOptions) {
        const card = new Card(cardOptions);
        const cardElement = card.render();
        
        this.container.appendChild(cardElement);
        this.cards.push({ card, element: cardElement });
        
        return card;
    }

    removeCard(index) {
        if (this.cards[index]) {
            this.cards[index].element.remove();
            this.cards.splice(index, 1);
        }
    }

    clear() {
        this.container.innerHTML = '';
        this.cards = [];
    }

    updateCard(index, newOptions) {
        if (this.cards[index]) {
            const updatedCard = this.cards[index].card.update(newOptions);
            this.container.replaceChild(updatedCard, this.cards[index].element);
            this.cards[index].element = updatedCard;
        }
    }

    // Method to create common dashboard cards
    createMetricCards(metrics) {
        metrics.forEach(metric => {
            this.addCard({
                type: 'metric',
                ...metric
            });
        });
    }
}

// Utility functions for common card patterns
const CardUtils = {
    createEmployeeMetricCard: (count, label, trend = null) => {
        return new Card({
            type: 'metric',
            icon: 'users',
            title: label,
            value: count.toString(),
            color: 'primary',
            trend: trend
        });
    },

    createPerformanceCard: (score, label) => {
        const color = score >= 4 ? 'success' : score >= 3 ? 'warning' : 'danger';
        return new Card({
            type: 'metric',
            icon: 'star',
            title: label,
            value: `${score}/5`,
            color: color
        });
    },

    createProgressCard: (percentage, label) => {
        const color = percentage >= 80 ? 'success' : percentage >= 50 ? 'warning' : 'danger';
        return new Card({
            type: 'metric',
            icon: 'trending-up',
            title: label,
            value: `${percentage}%`,
            color: color
        });
    },

    createActionCard: (title, subtitle, actions) => {
        const card = new Card({
            type: 'action',
            title: title,
            subtitle: subtitle,
            icon: 'clipboard-list'
        });
        
        actions.forEach(action => card.addAction(action));
        return card;
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Card, CardGrid, CardUtils };
}

// Make available globally
window.Card = Card;
window.CardGrid = CardGrid;
window.CardUtils = CardUtils;