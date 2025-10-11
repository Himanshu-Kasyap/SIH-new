/**
 * Navigation Component
 * Handles role-based navigation menu generation and user profile dropdown
 */
class Navigation {
    constructor() {
        this.currentUser = null;
        this.menuItems = {
            hr: [
                { label: 'Dashboard', href: '/pages/dashboard/hr.html', icon: 'dashboard' },
                { label: '9-Box Matrix', href: '/pages/matrix/nine-box.html', icon: 'grid' },
                { label: 'Employee Profiles', href: '/pages/profile/view.html', icon: 'users' },
                { label: 'Role Library', href: '/pages/roles/library.html', icon: 'briefcase' },
                { label: 'Analytics', href: '/pages/reports/analytics.html', icon: 'chart' },
                { label: 'Feedback', href: '/pages/feedback.html', icon: 'message' },
                { label: 'Settings', href: '/pages/admin/settings.html', icon: 'settings' }
            ],
            employee: [
                { label: 'Dashboard', href: '/pages/dashboard/employee.html', icon: 'dashboard' },
                { label: 'My Profile', href: '/pages/profile/view.html', icon: 'user' },
                { label: 'Skills Assessment', href: '/pages/profile/skills.html', icon: 'star' },
                { label: 'Recommendations', href: '/pages/recommendations/overview.html', icon: 'lightbulb' },
                { label: 'Learning Catalog', href: '/pages/learning/catalog.html', icon: 'book' },
                { label: 'My Progress', href: '/pages/learning/progress.html', icon: 'trending-up' },
                { label: 'Feedback', href: '/pages/feedback.html', icon: 'message' }
            ]
        };
        this.init();
    }

    init() {
        this.currentUser = this.getCurrentUser();
        this.render();
        this.attachEventListeners();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('hr_current_user');
        return userData ? JSON.parse(userData) : null;
    }

    render() {
        const navContainer = document.getElementById('navigation');
        if (!navContainer) return;

        navContainer.innerHTML = this.generateNavigationHTML();
    }

    generateNavigationHTML() {
        if (!this.currentUser) {
            return this.generateGuestNavigation();
        }

        const userMenuItems = this.menuItems[this.currentUser.role] || [];
        
        return `
            <nav class="nav-container">
                <div class="nav-brand">
                    <a href="/index.html" class="brand-link">
                        <span class="brand-icon">🎯</span>
                        <span class="brand-text">TalentHub</span>
                    </a>
                </div>
                
                <div class="nav-menu" id="navMenu">
                    <ul class="nav-list">
                        ${userMenuItems.map(item => `
                            <li class="nav-item">
                                <a href="${item.href}" class="nav-link" data-page="${item.label}">
                                    <span class="nav-icon">${this.getIcon(item.icon)}</span>
                                    <span class="nav-text">${item.label}</span>
                                </a>
                            </li>
                        `).join('')}
                    </ul>
                </div>

                <div class="nav-user">
                    <div class="notification-bell" id="notificationBell">
                        <span class="bell-icon">🔔</span>
                        <span class="notification-badge" id="notificationBadge">0</span>
                    </div>
                    
                    <div class="user-profile" id="userProfile">
                        <div class="user-avatar">
                            ${this.getUserInitials(this.currentUser.name)}
                        </div>
                        <span class="user-name">${this.currentUser.name}</span>
                        <span class="dropdown-arrow">▼</span>
                    </div>
                    
                    <div class="user-dropdown" id="userDropdown">
                        <div class="dropdown-header">
                            <div class="user-info">
                                <div class="user-name">${this.currentUser.name}</div>
                                <div class="user-role">${this.formatRole(this.currentUser.role)}</div>
                                <div class="user-email">${this.currentUser.email}</div>
                            </div>
                        </div>
                        <div class="dropdown-divider"></div>
                        <ul class="dropdown-menu">
                            <li><a href="/pages/profile/view.html" class="dropdown-link">
                                <span class="dropdown-icon">👤</span>View Profile
                            </a></li>
                            <li><a href="/pages/profile/edit.html" class="dropdown-link">
                                <span class="dropdown-icon">✏️</span>Edit Profile
                            </a></li>
                            <li><a href="#" class="dropdown-link" id="logoutBtn">
                                <span class="dropdown-icon">🚪</span>Logout
                            </a></li>
                        </ul>
                    </div>
                </div>

                <div class="nav-toggle" id="navToggle">
                    <span class="toggle-bar"></span>
                    <span class="toggle-bar"></span>
                    <span class="toggle-bar"></span>
                </div>
            </nav>
        `;
    }

    generateGuestNavigation() {
        return `
            <nav class="nav-container">
                <div class="nav-brand">
                    <a href="/index.html" class="brand-link">
                        <span class="brand-icon">🎯</span>
                        <span class="brand-text">TalentHub</span>
                    </a>
                </div>
                
                <div class="nav-actions">
                    <a href="/pages/auth/login.html" class="nav-btn nav-btn-primary">Login</a>
                </div>
            </nav>
        `;
    }

    getIcon(iconName) {
        const icons = {
            dashboard: '📊',
            grid: '⚏',
            users: '👥',
            user: '👤',
            briefcase: '💼',
            chart: '📈',
            settings: '⚙️',
            star: '⭐',
            lightbulb: '💡',
            book: '📚',
            'trending-up': '📈',
            message: '💬'
        };
        return icons[iconName] || '•';
    }

    getUserInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    formatRole(role) {
        const roleMap = {
            hr: 'HR Administrator',
            admin: 'System Administrator',
            employee: 'Employee'
        };
        return roleMap[role] || role;
    }

    attachEventListeners() {
        // Mobile menu toggle
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('nav-menu-open');
                navToggle.classList.toggle('nav-toggle-active');
            });
        }

        // User profile dropdown
        const userProfile = document.getElementById('userProfile');
        const userDropdown = document.getElementById('userDropdown');
        
        if (userProfile && userDropdown) {
            userProfile.addEventListener('click', (e) => {
                e.stopPropagation();
                userDropdown.classList.toggle('dropdown-open');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!userProfile.contains(e.target)) {
                    userDropdown.classList.remove('dropdown-open');
                }
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Active page highlighting
        this.highlightActivePage();
    }

    highlightActivePage() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('nav-link-active');
            }
        });
    }

    logout() {
        // Clear user session
        localStorage.removeItem('hr_current_user');
        
        // Redirect to login page
        window.location.href = '/pages/auth/login.html';
    }

    // Method to update navigation when user data changes
    refresh() {
        this.currentUser = this.getCurrentUser();
        this.render();
        this.attachEventListeners();
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.navigation = new Navigation();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Navigation;
}