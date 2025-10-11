/**
 * HR Talent Management System - Data Initializer
 * Utility to initialize sample data with different configurations
 */

class DataInitializer {
    constructor() {
        this.isInitialized = false;
    }

    // Initialize with basic sample data (original implementation)
    initializeBasicData() {
        if (window.HRData && window.HRData.sampleDataInitializer) {
            window.HRData.sampleDataInitializer.initializeSampleData();
            this.isInitialized = true;
            console.log('Basic sample data initialized');
            return true;
        }
        console.error('HRData module not loaded');
        return false;
    }

    // Initialize with enhanced comprehensive data
    initializeEnhancedData(userCount = 50) {
        if (window.HRData && window.HRData.enhancedSampleDataGenerator) {
            const success = window.HRData.enhancedSampleDataGenerator.generateAllSampleData(userCount);
            if (success) {
                this.isInitialized = true;
                console.log(`Enhanced sample data initialized with ${userCount} users`);
            }
            return success;
        }
        console.error('Enhanced sample data generator not loaded');
        return false;
    }

    // Reset all data and reinitialize
    resetAndReinitialize(enhanced = true, userCount = 50) {
        if (window.HRData && window.HRData.sampleDataInitializer) {
            window.HRData.sampleDataInitializer.resetAllData();
            
            if (enhanced) {
                return this.initializeEnhancedData(userCount);
            } else {
                return this.initializeBasicData();
            }
        }
        return false;
    }

    // Check if data exists
    hasData() {
        if (!window.HRData) return false;
        
        const users = window.HRData.userService.getAll();
        const roles = window.HRData.roleService.getAll();
        
        return users.length > 0 && roles.length > 0;
    }

    // Get data statistics
    getDataStats() {
        if (!window.HRData) return null;
        
        const users = window.HRData.userService.getAll();
        const roles = window.HRData.roleService.getAll();
        const recommendations = window.HRData.recommendationService.getAll();
        const trainingData = window.HRData.dataStore.getAll(window.HRData.STORAGE_KEYS.TRAINING_DATA);
        
        // Department distribution
        const departmentCounts = {};
        users.forEach(user => {
            departmentCounts[user.department] = (departmentCounts[user.department] || 0) + 1;
        });
        
        // Performance/Potential distribution for 9-box matrix
        const matrixDistribution = {};
        users.forEach(user => {
            const key = `${user.performance}-${user.potential}`;
            matrixDistribution[key] = (matrixDistribution[key] || 0) + 1;
        });
        
        // Role distribution
        const roleCounts = {};
        users.forEach(user => {
            roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
        });
        
        return {
            totalUsers: users.length,
            totalRoles: roles.length,
            totalRecommendations: recommendations.length,
            totalTrainingCourses: trainingData.length,
            departmentDistribution: departmentCounts,
            roleDistribution: roleCounts,
            matrixDistribution: matrixDistribution,
            hrAdmins: users.filter(u => u.role === 'hr').length,
            employees: users.filter(u => u.role === 'employee').length,
            highPerformers: users.filter(u => u.performance >= 4).length,
            highPotential: users.filter(u => u.potential >= 4).length,
            stars: users.filter(u => u.performance >= 4 && u.potential >= 4).length
        };
    }

    // Display data statistics in console
    displayStats() {
        const stats = this.getDataStats();
        if (!stats) {
            console.log('No data available');
            return;
        }
        
        console.log('=== HR Talent Management System - Data Statistics ===');
        console.log(`Total Users: ${stats.totalUsers}`);
        console.log(`Total Roles: ${stats.totalRoles}`);
        console.log(`Total Recommendations: ${stats.totalRecommendations}`);
        console.log(`Total Training Courses: ${stats.totalTrainingCourses}`);
        console.log('');
        
        console.log('Role Distribution:');
        Object.entries(stats.roleDistribution).forEach(([role, count]) => {
            console.log(`  ${role}: ${count}`);
        });
        console.log('');
        
        console.log('Department Distribution:');
        Object.entries(stats.departmentDistribution).forEach(([dept, count]) => {
            console.log(`  ${dept}: ${count}`);
        });
        console.log('');
        
        console.log('Performance Insights:');
        console.log(`  High Performers (4-5): ${stats.highPerformers}`);
        console.log(`  High Potential (4-5): ${stats.highPotential}`);
        console.log(`  Stars (High Perf & Potential): ${stats.stars}`);
        console.log('');
        
        console.log('9-Box Matrix Distribution:');
        for (let perf = 1; perf <= 5; perf++) {
            for (let pot = 1; pot <= 5; pot++) {
                const key = `${perf}-${pot}`;
                const count = stats.matrixDistribution[key] || 0;
                if (count > 0) {
                    console.log(`  Performance ${perf}, Potential ${pot}: ${count}`);
                }
            }
        }
    }

    // Auto-initialize based on current state
    autoInitialize() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.performAutoInit());
        } else {
            this.performAutoInit();
        }
    }

    performAutoInit() {
        // Check if modules are loaded
        if (!window.HRData) {
            console.log('Waiting for HRData module to load...');
            setTimeout(() => this.performAutoInit(), 100);
            return;
        }
        
        // Check if data already exists
        if (this.hasData()) {
            console.log('Sample data already exists');
            this.displayStats();
            return;
        }
        
        // Initialize with enhanced data by default
        console.log('No existing data found. Initializing enhanced sample data...');
        const success = this.initializeEnhancedData(50);
        
        if (success) {
            console.log('Sample data initialization completed!');
            this.displayStats();
        } else {
            console.log('Falling back to basic sample data...');
            this.initializeBasicData();
        }
    }

    // Utility methods for testing different scenarios
    createSmallDataset() {
        return this.resetAndReinitialize(true, 20);
    }

    createLargeDataset() {
        return this.resetAndReinitialize(true, 100);
    }

    createBasicDataset() {
        return this.resetAndReinitialize(false);
    }
}

// Initialize global instance
const dataInitializer = new DataInitializer();

// Auto-initialize when page loads
dataInitializer.autoInitialize();

// Add to global exports
window.HRData = window.HRData || {};
window.HRData.DataInitializer = DataInitializer;
window.HRData.dataInitializer = dataInitializer;

// Expose utility functions globally for easy testing
window.initHRData = {
    basic: () => dataInitializer.initializeBasicData(),
    enhanced: (count = 50) => dataInitializer.initializeEnhancedData(count),
    reset: (enhanced = true, count = 50) => dataInitializer.resetAndReinitialize(enhanced, count),
    stats: () => dataInitializer.displayStats(),
    small: () => dataInitializer.createSmallDataset(),
    large: () => dataInitializer.createLargeDataset()
};