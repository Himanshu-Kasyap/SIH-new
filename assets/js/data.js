/**
 * HR Talent Management System - Data Management Module
 * Handles data models, local storage operations, and validation
 */

// Storage keys for local storage
const STORAGE_KEYS = {
    USERS: 'hr_users',
    ROLES: 'hr_roles',
    RECOMMENDATIONS: 'hr_recommendations',
    TRAINING_DATA: 'hr_training',
    CURRENT_USER: 'hr_current_user',
    ACHIEVEMENTS: 'hr_achievements'
};

// Data Models
class User {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.name = data.name || '';
        this.email = data.email || '';
        this.role = data.role || 'employee'; // 'hr', 'admin', 'employee'
        this.department = data.department || '';
        this.position = data.position || '';
        this.experience = data.experience || 0;
        this.education = data.education || [];
        this.skills = data.skills || {};
        this.performance = data.performance || 3; // 1-5 scale
        this.potential = data.potential || 3; // 1-5 scale
        this.achievements = data.achievements || [];
        this.idp = data.idp || null;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validate() {
        const errors = [];
        
        if (!this.name || this.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        if (!this.email || !this.isValidEmail(this.email)) {
            errors.push('Valid email is required');
        }
        
        if (!['hr', 'admin', 'employee'].includes(this.role)) {
            errors.push('Role must be hr, admin, or employee');
        }
        
        if (this.performance < 1 || this.performance > 5) {
            errors.push('Performance must be between 1 and 5');
        }
        
        if (this.potential < 1 || this.potential > 5) {
            errors.push('Potential must be between 1 and 5');
        }
        
        return errors;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    updateSkill(skillName, level, verified = false) {
        this.skills[skillName] = {
            level: Math.max(1, Math.min(5, level)),
            verified: verified,
            lastUpdated: new Date().toISOString()
        };
        this.updatedAt = new Date().toISOString();
    }

    addAchievement(achievement) {
        this.achievements.push({
            id: this.generateId(),
            ...achievement,
            createdAt: new Date().toISOString()
        });
        this.updatedAt = new Date().toISOString();
    }
}

class Role {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.department = data.department || '';
        this.level = data.level || '';
        this.requiredSkills = data.requiredSkills || {};
        this.experience = data.experience || 0;
        this.education = data.education || [];
        this.competencies = data.competencies || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'role_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim().length < 2) {
            errors.push('Title must be at least 2 characters long');
        }
        
        if (!this.department || this.department.trim().length < 2) {
            errors.push('Department must be at least 2 characters long');
        }
        
        if (this.experience < 0) {
            errors.push('Experience cannot be negative');
        }
        
        return errors;
    }

    addRequiredSkill(skillName, minimumLevel, weight = 1, critical = false) {
        this.requiredSkills[skillName] = {
            minimumLevel: Math.max(1, Math.min(5, minimumLevel)),
            weight: Math.max(0, weight),
            critical: critical
        };
        this.updatedAt = new Date().toISOString();
    }
}

class Recommendation {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.employeeId = data.employeeId || '';
        this.targetRole = data.targetRole || '';
        this.skillGaps = data.skillGaps || {};
        this.learningPath = data.learningPath || [];
        this.timeline = data.timeline || 12; // months
        this.confidence = data.confidence || 0.5; // 0-1 scale
        this.status = data.status || 'pending'; // 'pending', 'accepted', 'in_progress', 'completed'
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validate() {
        const errors = [];
        
        if (!this.employeeId) {
            errors.push('Employee ID is required');
        }
        
        if (!this.targetRole) {
            errors.push('Target role is required');
        }
        
        if (this.timeline < 1 || this.timeline > 60) {
            errors.push('Timeline must be between 1 and 60 months');
        }
        
        if (this.confidence < 0 || this.confidence > 1) {
            errors.push('Confidence must be between 0 and 1');
        }
        
        return errors;
    }

    addSkillGap(skillName, currentLevel, requiredLevel, priority = 'medium') {
        this.skillGaps[skillName] = {
            currentLevel: Math.max(0, Math.min(5, currentLevel)),
            requiredLevel: Math.max(1, Math.min(5, requiredLevel)),
            priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium'
        };
        this.updatedAt = new Date().toISOString();
    }

    addLearningItem(item) {
        this.learningPath.push({
            id: this.generateId(),
            ...item,
            createdAt: new Date().toISOString()
        });
        this.updatedAt = new Date().toISOString();
    }
}
// 
Local Storage Wrapper with CRUD Operations
class DataStore {
    constructor() {
        this.initializeStorage();
    }

    // Initialize storage with empty arrays if not exists
    initializeStorage() {
        Object.values(STORAGE_KEYS).forEach(key => {
            if (!localStorage.getItem(key)) {
                localStorage.setItem(key, JSON.stringify([]));
            }
        });
    }

    // Generic CRUD operations
    create(storageKey, item) {
        try {
            const items = this.getAll(storageKey);
            items.push(item);
            localStorage.setItem(storageKey, JSON.stringify(items));
            return item;
        } catch (error) {
            console.error('Error creating item:', error);
            throw new Error('Failed to create item');
        }
    }

    getAll(storageKey) {
        try {
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting all items:', error);
            return [];
        }
    }

    getById(storageKey, id) {
        try {
            const items = this.getAll(storageKey);
            return items.find(item => item.id === id) || null;
        } catch (error) {
            console.error('Error getting item by ID:', error);
            return null;
        }
    }

    update(storageKey, id, updatedItem) {
        try {
            const items = this.getAll(storageKey);
            const index = items.findIndex(item => item.id === id);
            
            if (index === -1) {
                throw new Error('Item not found');
            }
            
            updatedItem.updatedAt = new Date().toISOString();
            items[index] = updatedItem;
            localStorage.setItem(storageKey, JSON.stringify(items));
            return updatedItem;
        } catch (error) {
            console.error('Error updating item:', error);
            throw new Error('Failed to update item');
        }
    }

    delete(storageKey, id) {
        try {
            const items = this.getAll(storageKey);
            const filteredItems = items.filter(item => item.id !== id);
            
            if (items.length === filteredItems.length) {
                throw new Error('Item not found');
            }
            
            localStorage.setItem(storageKey, JSON.stringify(filteredItems));
            return true;
        } catch (error) {
            console.error('Error deleting item:', error);
            throw new Error('Failed to delete item');
        }
    }

    // Search and filter operations
    search(storageKey, searchTerm, fields = []) {
        try {
            const items = this.getAll(storageKey);
            const term = searchTerm.toLowerCase();
            
            return items.filter(item => {
                if (fields.length === 0) {
                    // Search all string fields
                    return Object.values(item).some(value => 
                        typeof value === 'string' && value.toLowerCase().includes(term)
                    );
                } else {
                    // Search specific fields
                    return fields.some(field => 
                        item[field] && typeof item[field] === 'string' && 
                        item[field].toLowerCase().includes(term)
                    );
                }
            });
        } catch (error) {
            console.error('Error searching items:', error);
            return [];
        }
    }

    filter(storageKey, filterFn) {
        try {
            const items = this.getAll(storageKey);
            return items.filter(filterFn);
        } catch (error) {
            console.error('Error filtering items:', error);
            return [];
        }
    }

    // Bulk operations
    bulkCreate(storageKey, items) {
        try {
            const existingItems = this.getAll(storageKey);
            const allItems = [...existingItems, ...items];
            localStorage.setItem(storageKey, JSON.stringify(allItems));
            return items;
        } catch (error) {
            console.error('Error bulk creating items:', error);
            throw new Error('Failed to bulk create items');
        }
    }

    clear(storageKey) {
        try {
            localStorage.setItem(storageKey, JSON.stringify([]));
            return true;
        } catch (error) {
            console.error('Error clearing storage:', error);
            throw new Error('Failed to clear storage');
        }
    }

    // Current user session management
    setCurrentUser(user) {
        try {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
            return user;
        } catch (error) {
            console.error('Error setting current user:', error);
            throw new Error('Failed to set current user');
        }
    }

    getCurrentUser() {
        try {
            const userData = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    clearCurrentUser() {
        try {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
            return true;
        } catch (error) {
            console.error('Error clearing current user:', error);
            return false;
        }
    }
}

// Data Access Layer - Specific methods for each model
class UserService {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.storageKey = STORAGE_KEYS.USERS;
    }

    create(userData) {
        const user = new User(userData);
        const errors = user.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        // Check for duplicate email
        const existingUser = this.findByEmail(user.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        
        return this.dataStore.create(this.storageKey, user);
    }

    getAll() {
        return this.dataStore.getAll(this.storageKey).map(userData => new User(userData));
    }

    getById(id) {
        const userData = this.dataStore.getById(this.storageKey, id);
        return userData ? new User(userData) : null;
    }

    findByEmail(email) {
        const users = this.dataStore.getAll(this.storageKey);
        const userData = users.find(user => user.email === email);
        return userData ? new User(userData) : null;
    }

    update(id, userData) {
        const user = new User(userData);
        const errors = user.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.update(this.storageKey, id, user);
    }

    delete(id) {
        return this.dataStore.delete(this.storageKey, id);
    }

    searchByName(searchTerm) {
        return this.dataStore.search(this.storageKey, searchTerm, ['name']);
    }

    getByDepartment(department) {
        return this.dataStore.filter(this.storageKey, user => user.department === department);
    }

    getByRole(role) {
        return this.dataStore.filter(this.storageKey, user => user.role === role);
    }
}

class RoleService {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.storageKey = STORAGE_KEYS.ROLES;
    }

    create(roleData) {
        const role = new Role(roleData);
        const errors = role.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.create(this.storageKey, role);
    }

    getAll() {
        return this.dataStore.getAll(this.storageKey).map(roleData => new Role(roleData));
    }

    getById(id) {
        const roleData = this.dataStore.getById(this.storageKey, id);
        return roleData ? new Role(roleData) : null;
    }

    update(id, roleData) {
        const role = new Role(roleData);
        const errors = role.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.update(this.storageKey, id, role);
    }

    delete(id) {
        return this.dataStore.delete(this.storageKey, id);
    }

    getByDepartment(department) {
        return this.dataStore.filter(this.storageKey, role => role.department === department);
    }

    searchByTitle(searchTerm) {
        return this.dataStore.search(this.storageKey, searchTerm, ['title']);
    }
}

class RecommendationService {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.storageKey = STORAGE_KEYS.RECOMMENDATIONS;
    }

    create(recommendationData) {
        const recommendation = new Recommendation(recommendationData);
        const errors = recommendation.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.create(this.storageKey, recommendation);
    }

    getAll() {
        return this.dataStore.getAll(this.storageKey).map(recData => new Recommendation(recData));
    }

    getById(id) {
        const recData = this.dataStore.getById(this.storageKey, id);
        return recData ? new Recommendation(recData) : null;
    }

    getByEmployeeId(employeeId) {
        return this.dataStore.filter(this.storageKey, rec => rec.employeeId === employeeId);
    }

    update(id, recommendationData) {
        const recommendation = new Recommendation(recommendationData);
        const errors = recommendation.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.update(this.storageKey, id, recommendation);
    }

    delete(id) {
        return this.dataStore.delete(this.storageKey, id);
    }

    getByStatus(status) {
        return this.dataStore.filter(this.storageKey, rec => rec.status === status);
    }
}

// Initialize global data services
const dataStore = new DataStore();
const userService = new UserService(dataStore);
const roleService = new RoleService(dataStore);
const recommendationService = new RecommendationService(dataStore);

// Export for use in other modules
window.HRData = {
    User,
    Role,
    Recommendation,
    DataStore,
    UserService,
    RoleService,
    RecommendationService,
    dataStore,
    userService,
    roleService,
    recommendationService,
    STORAGE_KEYS
};// 
Data Validation Utilities
class DataValidator {
    static validateUser(userData) {
        const user = new User(userData);
        return user.validate();
    }

    static validateRole(roleData) {
        const role = new Role(roleData);
        return role.validate();
    }

    static validateRecommendation(recommendationData) {
        const recommendation = new Recommendation(recommendationData);
        return recommendation.validate();
    }

    static validateSkillLevel(level) {
        return Number.isInteger(level) && level >= 1 && level <= 5;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validatePassword(password) {
        // Basic password validation - at least 8 characters
        return password && password.length >= 8;
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.trim().replace(/[<>]/g, '');
    }
}

// Sample Data Initialization
class SampleDataInitializer {
    constructor() {
        this.skills = [
            'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'MongoDB',
            'Leadership', 'Project Management', 'Communication', 'Problem Solving',
            'Data Analysis', 'Machine Learning', 'DevOps', 'Cloud Computing',
            'UI/UX Design', 'Agile Methodology', 'Strategic Planning', 'Team Building',
            'Customer Service', 'Sales', 'Marketing', 'Finance', 'HR Management'
        ];

        this.departments = [
            'Engineering', 'Product', 'Design', 'Marketing', 'Sales', 
            'Human Resources', 'Finance', 'Operations', 'Customer Success'
        ];

        this.positions = {
            'Engineering': ['Junior Developer', 'Senior Developer', 'Tech Lead', 'Engineering Manager', 'CTO'],
            'Product': ['Product Analyst', 'Product Manager', 'Senior Product Manager', 'VP Product'],
            'Design': ['UI Designer', 'UX Designer', 'Senior Designer', 'Design Lead'],
            'Marketing': ['Marketing Coordinator', 'Marketing Manager', 'Senior Marketing Manager', 'CMO'],
            'Sales': ['Sales Representative', 'Account Manager', 'Sales Manager', 'VP Sales'],
            'Human Resources': ['HR Coordinator', 'HR Manager', 'Senior HR Manager', 'CHRO'],
            'Finance': ['Financial Analyst', 'Finance Manager', 'Senior Finance Manager', 'CFO'],
            'Operations': ['Operations Coordinator', 'Operations Manager', 'VP Operations'],
            'Customer Success': ['Customer Success Rep', 'Customer Success Manager', 'VP Customer Success']
        };
    }

    initializeSampleData() {
        // Check if data already exists
        if (userService.getAll().length > 0) {
            console.log('Sample data already exists');
            return;
        }

        console.log('Initializing sample data...');

        try {
            // Create sample roles first
            this.createSampleRoles();
            
            // Create sample users
            this.createSampleUsers();
            
            // Create sample recommendations
            this.createSampleRecommendations();
            
            console.log('Sample data initialized successfully');
        } catch (error) {
            console.error('Error initializing sample data:', error);
        }
    }

    createSampleRoles() {
        const sampleRoles = [
            {
                title: 'Senior Software Engineer',
                department: 'Engineering',
                level: 'Senior',
                experience: 5,
                education: ['Bachelor\'s in Computer Science'],
                competencies: ['Technical Leadership', 'Code Review', 'Mentoring'],
                requiredSkills: {
                    'JavaScript': { minimumLevel: 4, weight: 1, critical: true },
                    'React': { minimumLevel: 4, weight: 1, critical: true },
                    'Node.js': { minimumLevel: 3, weight: 0.8, critical: false },
                    'Leadership': { minimumLevel: 3, weight: 0.7, critical: false },
                    'Problem Solving': { minimumLevel: 4, weight: 1, critical: true }
                }
            },
            {
                title: 'Product Manager',
                department: 'Product',
                level: 'Mid',
                experience: 3,
                education: ['Bachelor\'s in Business or related field'],
                competencies: ['Product Strategy', 'User Research', 'Data Analysis'],
                requiredSkills: {
                    'Strategic Planning': { minimumLevel: 4, weight: 1, critical: true },
                    'Data Analysis': { minimumLevel: 3, weight: 0.8, critical: true },
                    'Communication': { minimumLevel: 4, weight: 1, critical: true },
                    'Leadership': { minimumLevel: 3, weight: 0.7, critical: false },
                    'Project Management': { minimumLevel: 4, weight: 0.9, critical: true }
                }
            },
            {
                title: 'UX Designer',
                department: 'Design',
                level: 'Mid',
                experience: 3,
                education: ['Bachelor\'s in Design or related field'],
                competencies: ['User Research', 'Prototyping', 'Design Systems'],
                requiredSkills: {
                    'UI/UX Design': { minimumLevel: 4, weight: 1, critical: true },
                    'Problem Solving': { minimumLevel: 4, weight: 0.9, critical: true },
                    'Communication': { minimumLevel: 3, weight: 0.8, critical: false },
                    'Data Analysis': { minimumLevel: 2, weight: 0.5, critical: false }
                }
            },
            {
                title: 'Engineering Manager',
                department: 'Engineering',
                level: 'Manager',
                experience: 7,
                education: ['Bachelor\'s in Computer Science', 'MBA preferred'],
                competencies: ['Team Leadership', 'Technical Strategy', 'Performance Management'],
                requiredSkills: {
                    'Leadership': { minimumLevel: 4, weight: 1, critical: true },
                    'Team Building': { minimumLevel: 4, weight: 1, critical: true },
                    'JavaScript': { minimumLevel: 3, weight: 0.7, critical: false },
                    'Project Management': { minimumLevel: 4, weight: 0.9, critical: true },
                    'Strategic Planning': { minimumLevel: 3, weight: 0.8, critical: true }
                }
            }
        ];

        sampleRoles.forEach(roleData => {
            roleService.create(roleData);
        });
    }

    createSampleUsers() {
        const sampleUsers = [
            // HR Admin
            {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@company.com',
                role: 'hr',
                department: 'Human Resources',
                position: 'HR Manager',
                experience: 8,
                education: ['MBA in Human Resources', 'Bachelor\'s in Psychology'],
                performance: 4,
                potential: 4,
                skills: {
                    'HR Management': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                    'Leadership': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Communication': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                    'Strategic Planning': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Data Analysis': { level: 3, verified: false, lastUpdated: new Date().toISOString() }
                }
            },
            // Software Engineers
            {
                name: 'Alex Chen',
                email: 'alex.chen@company.com',
                role: 'employee',
                department: 'Engineering',
                position: 'Senior Developer',
                experience: 6,
                education: ['Bachelor\'s in Computer Science'],
                performance: 4,
                potential: 5,
                skills: {
                    'JavaScript': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                    'React': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Node.js': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Python': { level: 3, verified: false, lastUpdated: new Date().toISOString() },
                    'Leadership': { level: 2, verified: false, lastUpdated: new Date().toISOString() },
                    'Problem Solving': { level: 5, verified: true, lastUpdated: new Date().toISOString() }
                }
            },
            {
                name: 'Maria Rodriguez',
                email: 'maria.rodriguez@company.com',
                role: 'employee',
                department: 'Engineering',
                position: 'Junior Developer',
                experience: 2,
                education: ['Bachelor\'s in Computer Science'],
                performance: 3,
                potential: 4,
                skills: {
                    'JavaScript': { level: 3, verified: true, lastUpdated: new Date().toISOString() },
                    'React': { level: 2, verified: false, lastUpdated: new Date().toISOString() },
                    'HTML/CSS': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Problem Solving': { level: 3, verified: true, lastUpdated: new Date().toISOString() },
                    'Communication': { level: 4, verified: true, lastUpdated: new Date().toISOString() }
                }
            },
            // Product Team
            {
                name: 'David Kim',
                email: 'david.kim@company.com',
                role: 'employee',
                department: 'Product',
                position: 'Product Manager',
                experience: 4,
                education: ['MBA', 'Bachelor\'s in Engineering'],
                performance: 4,
                potential: 3,
                skills: {
                    'Strategic Planning': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Data Analysis': { level: 3, verified: true, lastUpdated: new Date().toISOString() },
                    'Communication': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                    'Leadership': { level: 3, verified: false, lastUpdated: new Date().toISOString() },
                    'Project Management': { level: 4, verified: true, lastUpdated: new Date().toISOString() }
                }
            },
            // Design Team
            {
                name: 'Emily Zhang',
                email: 'emily.zhang@company.com',
                role: 'employee',
                department: 'Design',
                position: 'UX Designer',
                experience: 3,
                education: ['Bachelor\'s in Design'],
                performance: 5,
                potential: 4,
                skills: {
                    'UI/UX Design': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Problem Solving': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Communication': { level: 3, verified: true, lastUpdated: new Date().toISOString() },
                    'Data Analysis': { level: 2, verified: false, lastUpdated: new Date().toISOString() }
                }
            },
            // More diverse employees for 9-box matrix
            {
                name: 'James Wilson',
                email: 'james.wilson@company.com',
                role: 'employee',
                department: 'Engineering',
                position: 'Tech Lead',
                experience: 8,
                education: ['Master\'s in Computer Science'],
                performance: 5,
                potential: 3,
                skills: {
                    'JavaScript': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                    'Leadership': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Team Building': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Strategic Planning': { level: 3, verified: false, lastUpdated: new Date().toISOString() }
                }
            },
            {
                name: 'Lisa Thompson',
                email: 'lisa.thompson@company.com',
                role: 'employee',
                department: 'Marketing',
                position: 'Marketing Manager',
                experience: 5,
                education: ['Bachelor\'s in Marketing'],
                performance: 2,
                potential: 2,
                skills: {
                    'Marketing': { level: 3, verified: true, lastUpdated: new Date().toISOString() },
                    'Communication': { level: 3, verified: true, lastUpdated: new Date().toISOString() },
                    'Data Analysis': { level: 2, verified: false, lastUpdated: new Date().toISOString() }
                }
            },
            {
                name: 'Michael Brown',
                email: 'michael.brown@company.com',
                role: 'employee',
                department: 'Sales',
                position: 'Account Manager',
                experience: 3,
                education: ['Bachelor\'s in Business'],
                performance: 3,
                potential: 5,
                skills: {
                    'Sales': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Communication': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                    'Customer Service': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                    'Leadership': { level: 2, verified: false, lastUpdated: new Date().toISOString() }
                }
            }
        ];

        sampleUsers.forEach(userData => {
            const user = userService.create(userData);
            // Add some sample achievements
            if (user.performance >= 4) {
                user.addAchievement({
                    title: 'Completed Advanced Training',
                    description: 'Successfully completed advanced professional development course',
                    type: 'training',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
                });
            }
        });
    }

    createSampleRecommendations() {
        const users = userService.getAll();
        const roles = roleService.getAll();

        // Create recommendations for employees who could be promoted
        const alexChen = users.find(u => u.email === 'alex.chen@company.com');
        const engineeringManagerRole = roles.find(r => r.title === 'Engineering Manager');

        if (alexChen && engineeringManagerRole) {
            const recommendation = recommendationService.create({
                employeeId: alexChen.id,
                targetRole: engineeringManagerRole.title,
                timeline: 18,
                confidence: 0.8,
                status: 'pending'
            });

            // Add skill gaps
            recommendation.addSkillGap('Leadership', 2, 4, 'high');
            recommendation.addSkillGap('Team Building', 1, 4, 'high');
            recommendation.addSkillGap('Strategic Planning', 2, 3, 'medium');

            // Add learning path
            recommendation.addLearningItem({
                type: 'course',
                title: 'Leadership Fundamentals',
                provider: 'Internal Training',
                duration: '2 weeks',
                priority: 'high',
                skills: ['Leadership'],
                status: 'recommended'
            });

            recommendation.addLearningItem({
                type: 'mentorship',
                title: 'Shadow Engineering Manager',
                provider: 'Internal',
                duration: '3 months',
                priority: 'high',
                skills: ['Leadership', 'Team Building'],
                status: 'recommended'
            });

            recommendationService.update(recommendation.id, recommendation);
        }

        // Create recommendation for Maria Rodriguez
        const mariaRodriguez = users.find(u => u.email === 'maria.rodriguez@company.com');
        const seniorEngineerRole = roles.find(r => r.title === 'Senior Software Engineer');

        if (mariaRodriguez && seniorEngineerRole) {
            const recommendation = recommendationService.create({
                employeeId: mariaRodriguez.id,
                targetRole: seniorEngineerRole.title,
                timeline: 12,
                confidence: 0.7,
                status: 'accepted'
            });

            recommendation.addSkillGap('JavaScript', 3, 4, 'high');
            recommendation.addSkillGap('React', 2, 4, 'high');
            recommendation.addSkillGap('Node.js', 1, 3, 'medium');
            recommendation.addSkillGap('Leadership', 1, 3, 'medium');

            recommendation.addLearningItem({
                type: 'course',
                title: 'Advanced JavaScript Patterns',
                provider: 'Coursera',
                duration: '6 weeks',
                priority: 'high',
                skills: ['JavaScript'],
                status: 'in_progress'
            });

            recommendationService.update(recommendation.id, recommendation);
        }
    }

    // Method to reset all data (useful for testing)
    resetAllData() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        dataStore.initializeStorage();
        console.log('All data has been reset');
    }
}

// Initialize sample data when the module loads
const sampleDataInitializer = new SampleDataInitializer();

// Auto-initialize sample data if none exists
document.addEventListener('DOMContentLoaded', () => {
    sampleDataInitializer.initializeSampleData();
});

// Add to global exports
window.HRData.DataValidator = DataValidator;
window.HRData.SampleDataInitializer = SampleDataInitializer;
window.HRData.sampleDataInitializer = sampleDataInitializer;
// Cou
rse/Training Data Model
class Course {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.title = data.title || '';
        this.description = data.description || '';
        this.provider = data.provider || 'Internal'; // 'Internal', 'Coursera', 'LinkedIn Learning', etc.
        this.category = data.category || '';
        this.skills = data.skills || []; // Array of skills this course teaches
        this.duration = data.duration || 0; // Duration in hours
        this.level = data.level || 'Beginner'; // 'Beginner', 'Intermediate', 'Advanced'
        this.rating = data.rating || 0; // 0-5 rating
        this.ratingCount = data.ratingCount || 0;
        this.price = data.price || 0;
        this.currency = data.currency || 'USD';
        this.url = data.url || '';
        this.imageUrl = data.imageUrl || '';
        this.outline = data.outline || []; // Array of course modules/topics
        this.prerequisites = data.prerequisites || [];
        this.learningOutcomes = data.learningOutcomes || [];
        this.isActive = data.isActive !== undefined ? data.isActive : true;
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'course_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validate() {
        const errors = [];
        
        if (!this.title || this.title.trim().length < 2) {
            errors.push('Title must be at least 2 characters long');
        }
        
        if (!this.description || this.description.trim().length < 10) {
            errors.push('Description must be at least 10 characters long');
        }
        
        if (this.duration < 0) {
            errors.push('Duration cannot be negative');
        }
        
        if (this.rating < 0 || this.rating > 5) {
            errors.push('Rating must be between 0 and 5');
        }
        
        if (!['Beginner', 'Intermediate', 'Advanced'].includes(this.level)) {
            errors.push('Level must be Beginner, Intermediate, or Advanced');
        }
        
        return errors;
    }

    getDurationCategory() {
        if (this.duration < 5) return 'short';
        if (this.duration <= 20) return 'medium';
        return 'long';
    }

    addSkill(skillName) {
        if (!this.skills.includes(skillName)) {
            this.skills.push(skillName);
            this.updatedAt = new Date().toISOString();
        }
    }

    removeSkill(skillName) {
        const index = this.skills.indexOf(skillName);
        if (index > -1) {
            this.skills.splice(index, 1);
            this.updatedAt = new Date().toISOString();
        }
    }
}

// User Progress Tracking Model
class UserProgress {
    constructor(data = {}) {
        this.id = data.id || this.generateId();
        this.userId = data.userId || '';
        this.courseId = data.courseId || '';
        this.status = data.status || 'not_started'; // 'not_started', 'in_progress', 'completed', 'dropped'
        this.progress = data.progress || 0; // 0-100 percentage
        this.startedAt = data.startedAt || null;
        this.completedAt = data.completedAt || null;
        this.lastAccessedAt = data.lastAccessedAt || null;
        this.timeSpent = data.timeSpent || 0; // Time spent in minutes
        this.certificateUrl = data.certificateUrl || '';
        this.rating = data.rating || 0; // User's rating of the course
        this.feedback = data.feedback || '';
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    generateId() {
        return 'progress_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    validate() {
        const errors = [];
        
        if (!this.userId) {
            errors.push('User ID is required');
        }
        
        if (!this.courseId) {
            errors.push('Course ID is required');
        }
        
        if (!['not_started', 'in_progress', 'completed', 'dropped'].includes(this.status)) {
            errors.push('Status must be not_started, in_progress, completed, or dropped');
        }
        
        if (this.progress < 0 || this.progress > 100) {
            errors.push('Progress must be between 0 and 100');
        }
        
        if (this.rating < 0 || this.rating > 5) {
            errors.push('Rating must be between 0 and 5');
        }
        
        return errors;
    }

    start() {
        this.status = 'in_progress';
        this.startedAt = new Date().toISOString();
        this.lastAccessedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    updateProgress(percentage) {
        this.progress = Math.max(0, Math.min(100, percentage));
        this.lastAccessedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
        
        if (this.progress === 100 && this.status !== 'completed') {
            this.complete();
        }
    }

    complete() {
        this.status = 'completed';
        this.progress = 100;
        this.completedAt = new Date().toISOString();
        this.lastAccessedAt = new Date().toISOString();
        this.updatedAt = new Date().toISOString();
    }

    drop() {
        this.status = 'dropped';
        this.updatedAt = new Date().toISOString();
    }
}

// Training Service for managing courses and progress
class TrainingService {
    constructor(dataStore) {
        this.dataStore = dataStore;
        this.courseStorageKey = STORAGE_KEYS.TRAINING_DATA;
        this.progressStorageKey = 'hr_user_progress';
        
        // Initialize progress storage if it doesn't exist
        if (!localStorage.getItem(this.progressStorageKey)) {
            localStorage.setItem(this.progressStorageKey, JSON.stringify([]));
        }
    }

    // Course management
    createCourse(courseData) {
        const course = new Course(courseData);
        const errors = course.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.create(this.courseStorageKey, course);
    }

    getAllCourses() {
        return this.dataStore.getAll(this.courseStorageKey).map(courseData => new Course(courseData));
    }

    getCourseById(id) {
        const courseData = this.dataStore.getById(this.courseStorageKey, id);
        return courseData ? new Course(courseData) : null;
    }

    updateCourse(id, courseData) {
        const course = new Course(courseData);
        const errors = course.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.update(this.courseStorageKey, id, course);
    }

    deleteCourse(id) {
        return this.dataStore.delete(this.courseStorageKey, id);
    }

    searchCourses(searchTerm) {
        return this.dataStore.search(this.courseStorageKey, searchTerm, ['title', 'description', 'category']);
    }

    getCoursesByCategory(category) {
        return this.dataStore.filter(this.courseStorageKey, course => course.category === category);
    }

    getCoursesByProvider(provider) {
        return this.dataStore.filter(this.courseStorageKey, course => course.provider === provider);
    }

    getCoursesBySkill(skillName) {
        return this.dataStore.filter(this.courseStorageKey, course => 
            course.skills.includes(skillName)
        );
    }

    getCoursesByDuration(durationCategory) {
        return this.dataStore.filter(this.courseStorageKey, course => {
            const courseDurationCategory = new Course(course).getDurationCategory();
            return courseDurationCategory === durationCategory;
        });
    }

    // Progress management
    createProgress(progressData) {
        const progress = new UserProgress(progressData);
        const errors = progress.validate();
        
        if (errors.length > 0) {
            throw new Error('Validation failed: ' + errors.join(', '));
        }
        
        return this.dataStore.create(this.progressStorageKey, progress);
    }

    getUserProgress(userId) {
        return this.dataStore.filter(this.progressStorageKey, progress => progress.userId === userId)
            .map(progressData => new UserProgress(progressData));
    }

    getCourseProgress(userId, courseId) {
        const progressData = this.dataStore.filter(this.progressStorageKey, progress => 
            progress.userId === userId && progress.courseId === courseId
        )[0];
        return progressData ? new UserProgress(progressData) : null;
    }

    updateProgress(userId, courseId, progressPercentage) {
        let progress = this.getCourseProgress(userId, courseId);
        
        if (!progress) {
            // Create new progress record
            progress = new UserProgress({
                userId: userId,
                courseId: courseId
            });
            progress.start();
            this.dataStore.create(this.progressStorageKey, progress);
        }
        
        progress.updateProgress(progressPercentage);
        return this.dataStore.update(this.progressStorageKey, progress.id, progress);
    }

    enrollUser(userId, courseId) {
        let progress = this.getCourseProgress(userId, courseId);
        
        if (!progress) {
            progress = new UserProgress({
                userId: userId,
                courseId: courseId
            });
            progress.start();
            return this.dataStore.create(this.progressStorageKey, progress);
        }
        
        return progress;
    }

    completeUserCourse(userId, courseId, rating = 0, feedback = '') {
        let progress = this.getCourseProgress(userId, courseId);
        
        if (!progress) {
            throw new Error('No progress record found for this user and course');
        }
        
        progress.complete();
        progress.rating = rating;
        progress.feedback = feedback;
        
        return this.dataStore.update(this.progressStorageKey, progress.id, progress);
    }

    getCompletedCourses(userId) {
        return this.getUserProgress(userId).filter(progress => progress.status === 'completed');
    }

    getInProgressCourses(userId) {
        return this.getUserProgress(userId).filter(progress => progress.status === 'in_progress');
    }

    // Analytics and reporting
    getCourseAnalytics(courseId) {
        const allProgress = this.dataStore.getAll(this.progressStorageKey);
        const courseProgress = allProgress.filter(progress => progress.courseId === courseId);
        
        const totalEnrollments = courseProgress.length;
        const completions = courseProgress.filter(progress => progress.status === 'completed').length;
        const inProgress = courseProgress.filter(progress => progress.status === 'in_progress').length;
        const dropped = courseProgress.filter(progress => progress.status === 'dropped').length;
        
        const completionRate = totalEnrollments > 0 ? (completions / totalEnrollments) * 100 : 0;
        const averageRating = courseProgress
            .filter(progress => progress.rating > 0)
            .reduce((sum, progress) => sum + progress.rating, 0) / 
            courseProgress.filter(progress => progress.rating > 0).length || 0;
        
        return {
            totalEnrollments,
            completions,
            inProgress,
            dropped,
            completionRate,
            averageRating
        };
    }

    getUserAnalytics(userId) {
        const userProgress = this.getUserProgress(userId);
        
        const totalCourses = userProgress.length;
        const completedCourses = userProgress.filter(progress => progress.status === 'completed').length;
        const inProgressCourses = userProgress.filter(progress => progress.status === 'in_progress').length;
        const totalTimeSpent = userProgress.reduce((sum, progress) => sum + progress.timeSpent, 0);
        
        return {
            totalCourses,
            completedCourses,
            inProgressCourses,
            totalTimeSpent,
            completionRate: totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0
        };
    }
}

// Add training service to global exports
const trainingService = new TrainingService(dataStore);

// Update global exports
window.HRData = {
    ...window.HRData,
    Course,
    UserProgress,
    TrainingService,
    trainingService
};