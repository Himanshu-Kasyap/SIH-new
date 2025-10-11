/**
 * HR Talent Management System - Enhanced Sample Data Generator
 * Generates realistic sample data with varied profiles, skills, and 9-box matrix positions
 */

class EnhancedSampleDataGenerator {
    constructor() {
        this.firstNames = [
            'Alex', 'Sarah', 'Michael', 'Emily', 'David', 'Maria', 'James', 'Lisa',
            'Robert', 'Jennifer', 'William', 'Jessica', 'John', 'Ashley', 'Daniel',
            'Amanda', 'Matthew', 'Stephanie', 'Christopher', 'Nicole', 'Anthony',
            'Elizabeth', 'Mark', 'Helen', 'Donald', 'Michelle', 'Steven', 'Kimberly',
            'Andrew', 'Donna', 'Joshua', 'Carol', 'Kenneth', 'Ruth', 'Paul', 'Sharon'
        ];

        this.lastNames = [
            'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
            'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
            'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
            'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark',
            'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
            'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green'
        ];

        this.skillCategories = {
            technical: [
                'JavaScript', 'Python', 'Java', 'C++', 'React', 'Angular', 'Vue.js',
                'Node.js', 'Express.js', 'Django', 'Spring Boot', 'SQL', 'MongoDB',
                'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Azure',
                'Google Cloud', 'DevOps', 'CI/CD', 'Git', 'Linux', 'Machine Learning',
                'Data Science', 'Artificial Intelligence', 'Blockchain', 'Cybersecurity'
            ],
            soft: [
                'Leadership', 'Communication', 'Problem Solving', 'Critical Thinking',
                'Team Building', 'Project Management', 'Time Management', 'Adaptability',
                'Creativity', 'Emotional Intelligence', 'Conflict Resolution',
                'Negotiation', 'Public Speaking', 'Mentoring', 'Decision Making'
            ],
            business: [
                'Strategic Planning', 'Business Analysis', 'Market Research',
                'Financial Analysis', 'Sales', 'Marketing', 'Customer Service',
                'Operations Management', 'Supply Chain', 'Quality Assurance',
                'Risk Management', 'Compliance', 'Vendor Management', 'Budgeting'
            ],
            design: [
                'UI/UX Design', 'Graphic Design', 'Web Design', 'Mobile Design',
                'Prototyping', 'Wireframing', 'User Research', 'Design Systems',
                'Adobe Creative Suite', 'Figma', 'Sketch', 'InVision', 'Usability Testing'
            ]
        };

        this.departments = [
            'Engineering', 'Product', 'Design', 'Marketing', 'Sales',
            'Human Resources', 'Finance', 'Operations', 'Customer Success',
            'Data Science', 'Security', 'Legal', 'Business Development'
        ];

        this.positionHierarchy = {
            'Engineering': [
                { title: 'Intern Software Engineer', level: 1, experience: 0 },
                { title: 'Junior Software Engineer', level: 2, experience: 1 },
                { title: 'Software Engineer', level: 3, experience: 3 },
                { title: 'Senior Software Engineer', level: 4, experience: 5 },
                { title: 'Staff Software Engineer', level: 5, experience: 8 },
                { title: 'Principal Software Engineer', level: 6, experience: 10 },
                { title: 'Engineering Manager', level: 5, experience: 7 },
                { title: 'Senior Engineering Manager', level: 6, experience: 10 },
                { title: 'Director of Engineering', level: 7, experience: 12 },
                { title: 'VP of Engineering', level: 8, experience: 15 },
                { title: 'CTO', level: 9, experience: 18 }
            ],
            'Product': [
                { title: 'Product Analyst', level: 2, experience: 1 },
                { title: 'Associate Product Manager', level: 3, experience: 2 },
                { title: 'Product Manager', level: 4, experience: 4 },
                { title: 'Senior Product Manager', level: 5, experience: 6 },
                { title: 'Principal Product Manager', level: 6, experience: 9 },
                { title: 'Director of Product', level: 7, experience: 11 },
                { title: 'VP of Product', level: 8, experience: 14 },
                { title: 'CPO', level: 9, experience: 17 }
            ],
            'Design': [
                { title: 'Junior Designer', level: 2, experience: 1 },
                { title: 'UI/UX Designer', level: 3, experience: 3 },
                { title: 'Senior Designer', level: 4, experience: 5 },
                { title: 'Lead Designer', level: 5, experience: 7 },
                { title: 'Design Manager', level: 6, experience: 9 },
                { title: 'Director of Design', level: 7, experience: 12 },
                { title: 'VP of Design', level: 8, experience: 15 }
            ],
            'Marketing': [
                { title: 'Marketing Coordinator', level: 2, experience: 1 },
                { title: 'Marketing Specialist', level: 3, experience: 2 },
                { title: 'Marketing Manager', level: 4, experience: 4 },
                { title: 'Senior Marketing Manager', level: 5, experience: 6 },
                { title: 'Marketing Director', level: 6, experience: 9 },
                { title: 'VP of Marketing', level: 7, experience: 12 },
                { title: 'CMO', level: 8, experience: 15 }
            ],
            'Sales': [
                { title: 'Sales Development Rep', level: 2, experience: 0 },
                { title: 'Account Executive', level: 3, experience: 2 },
                { title: 'Senior Account Executive', level: 4, experience: 4 },
                { title: 'Account Manager', level: 4, experience: 5 },
                { title: 'Sales Manager', level: 5, experience: 7 },
                { title: 'Regional Sales Director', level: 6, experience: 10 },
                { title: 'VP of Sales', level: 7, experience: 13 }
            ],
            'Human Resources': [
                { title: 'HR Coordinator', level: 2, experience: 1 },
                { title: 'HR Generalist', level: 3, experience: 3 },
                { title: 'HR Manager', level: 4, experience: 5 },
                { title: 'Senior HR Manager', level: 5, experience: 7 },
                { title: 'HR Director', level: 6, experience: 10 },
                { title: 'VP of HR', level: 7, experience: 13 },
                { title: 'CHRO', level: 8, experience: 16 }
            ]
        };

        this.educationLevels = [
            'High School Diploma',
            'Associate Degree',
            'Bachelor\'s Degree',
            'Master\'s Degree',
            'MBA',
            'PhD',
            'Professional Certification'
        ];

        this.trainingCourses = [
            {
                title: 'Leadership Fundamentals',
                provider: 'Internal Training',
                duration: '2 weeks',
                skills: ['Leadership', 'Team Building'],
                type: 'leadership'
            },
            {
                title: 'Advanced JavaScript Development',
                provider: 'Coursera',
                duration: '6 weeks',
                skills: ['JavaScript', 'Problem Solving'],
                type: 'technical'
            },
            {
                title: 'Product Management Essentials',
                provider: 'Udemy',
                duration: '4 weeks',
                skills: ['Strategic Planning', 'Project Management'],
                type: 'business'
            },
            {
                title: 'UX Design Principles',
                provider: 'LinkedIn Learning',
                duration: '3 weeks',
                skills: ['UI/UX Design', 'User Research'],
                type: 'design'
            },
            {
                title: 'Data Analysis with Python',
                provider: 'edX',
                duration: '8 weeks',
                skills: ['Python', 'Data Science', 'Data Analysis'],
                type: 'technical'
            },
            {
                title: 'Effective Communication',
                provider: 'Internal Training',
                duration: '1 week',
                skills: ['Communication', 'Public Speaking'],
                type: 'soft'
            },
            {
                title: 'Agile Project Management',
                provider: 'Scrum Alliance',
                duration: '2 weeks',
                skills: ['Project Management', 'Agile Methodology'],
                type: 'business'
            },
            {
                title: 'Cloud Computing Fundamentals',
                provider: 'AWS Training',
                duration: '5 weeks',
                skills: ['AWS', 'Cloud Computing', 'DevOps'],
                type: 'technical'
            }
        ];

        this.achievementTypes = [
            'training_completion',
            'certification',
            'project_success',
            'award',
            'promotion',
            'mentorship',
            'conference_speaking',
            'publication'
        ];
    }

    generateRandomName() {
        const firstName = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
        const lastName = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
        return `${firstName} ${lastName}`;
    }

    generateEmail(name) {
        return `${name.toLowerCase().replace(' ', '.')}@company.com`;
    }

    generateSkillsForDepartment(department, positionLevel, experience) {
        const skills = {};
        const allSkills = [...this.skillCategories.technical, ...this.skillCategories.soft, 
                          ...this.skillCategories.business, ...this.skillCategories.design];
        
        // Determine relevant skill categories based on department
        let relevantSkills = [...this.skillCategories.soft]; // Everyone gets soft skills
        
        switch (department) {
            case 'Engineering':
                relevantSkills = [...relevantSkills, ...this.skillCategories.technical];
                break;
            case 'Product':
                relevantSkills = [...relevantSkills, ...this.skillCategories.business, 
                                ...this.skillCategories.technical.slice(0, 5)];
                break;
            case 'Design':
                relevantSkills = [...relevantSkills, ...this.skillCategories.design];
                break;
            case 'Marketing':
            case 'Sales':
                relevantSkills = [...relevantSkills, ...this.skillCategories.business];
                break;
            default:
                relevantSkills = [...relevantSkills, ...this.skillCategories.business];
        }

        // Generate 5-12 skills per person
        const numSkills = Math.floor(Math.random() * 8) + 5;
        const selectedSkills = this.shuffleArray(relevantSkills).slice(0, numSkills);

        selectedSkills.forEach(skill => {
            // Skill level influenced by experience and position level
            const baseLevel = Math.min(5, Math.max(1, Math.floor(experience / 2) + positionLevel - 2));
            const variation = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            const level = Math.max(1, Math.min(5, baseLevel + variation));
            
            skills[skill] = {
                level: level,
                verified: Math.random() > 0.3, // 70% chance of being verified
                lastUpdated: this.getRandomPastDate(365) // Within last year
            };
        });

        return skills;
    }

    generatePerformanceAndPotential() {
        // Generate realistic distribution for 9-box matrix
        const distributions = [
            { performance: 1, potential: 1, weight: 5 },   // Low/Low
            { performance: 1, potential: 2, weight: 8 },   // Low/Medium
            { performance: 1, potential: 3, weight: 5 },   // Low/High
            { performance: 2, potential: 1, weight: 8 },   // Medium/Low
            { performance: 2, potential: 2, weight: 20 },  // Medium/Medium (most common)
            { performance: 2, potential: 3, weight: 12 },  // Medium/High
            { performance: 3, potential: 1, weight: 5 },   // High/Low
            { performance: 3, potential: 2, weight: 12 },  // High/Medium
            { performance: 3, potential: 3, weight: 8 }    // High/High (stars)
        ];

        // Convert to 1-5 scale and select based on weights
        const totalWeight = distributions.reduce((sum, d) => sum + d.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const dist of distributions) {
            random -= dist.weight;
            if (random <= 0) {
                return {
                    performance: dist.performance + Math.floor(Math.random() * 2), // 1-2, 3-4, or 5
                    potential: dist.potential + Math.floor(Math.random() * 2)
                };
            }
        }
        
        return { performance: 3, potential: 3 }; // fallback
    }

    generateAchievements(experience, performance) {
        const achievements = [];
        const numAchievements = Math.floor(experience / 2) + (performance > 3 ? 2 : 0);
        
        for (let i = 0; i < numAchievements; i++) {
            const type = this.achievementTypes[Math.floor(Math.random() * this.achievementTypes.length)];
            const achievement = this.generateAchievementByType(type);
            achievement.date = this.getRandomPastDate(experience * 365);
            achievements.push(achievement);
        }
        
        return achievements;
    }

    generateAchievementByType(type) {
        const achievements = {
            training_completion: {
                title: 'Completed Professional Development Course',
                description: 'Successfully completed advanced training program',
                type: 'training'
            },
            certification: {
                title: 'Professional Certification Earned',
                description: 'Obtained industry-recognized certification',
                type: 'certification'
            },
            project_success: {
                title: 'Project Excellence Award',
                description: 'Led successful project delivery ahead of schedule',
                type: 'project'
            },
            award: {
                title: 'Employee of the Month',
                description: 'Recognized for outstanding performance and dedication',
                type: 'recognition'
            },
            promotion: {
                title: 'Career Advancement',
                description: 'Promoted to higher position based on performance',
                type: 'promotion'
            },
            mentorship: {
                title: 'Mentorship Program Completion',
                description: 'Successfully mentored junior team members',
                type: 'mentorship'
            },
            conference_speaking: {
                title: 'Conference Speaker',
                description: 'Presented at industry conference',
                type: 'speaking'
            },
            publication: {
                title: 'Technical Publication',
                description: 'Published article or research paper',
                type: 'publication'
            }
        };

        return achievements[type] || achievements.training_completion;
    }

    getRandomPastDate(maxDaysAgo) {
        const daysAgo = Math.floor(Math.random() * maxDaysAgo);
        return new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    generateEducation(positionLevel) {
        const education = [];
        
        // Higher positions more likely to have advanced degrees
        if (positionLevel >= 6) {
            education.push('Master\'s Degree');
            if (Math.random() > 0.7) education.push('MBA');
        } else if (positionLevel >= 4) {
            education.push('Bachelor\'s Degree');
            if (Math.random() > 0.6) education.push('Master\'s Degree');
        } else {
            education.push('Bachelor\'s Degree');
        }
        
        // Add certifications
        if (Math.random() > 0.5) {
            education.push('Professional Certification');
        }
        
        return education;
    }

    generateComprehensiveUserData(count = 50) {
        const users = [];
        
        // Ensure we have at least one HR admin
        users.push(this.generateHRAdmin());
        
        // Generate diverse employee population
        for (let i = 1; i < count; i++) {
            const department = this.departments[Math.floor(Math.random() * this.departments.length)];
            const positions = this.positionHierarchy[department] || this.positionHierarchy['Engineering'];
            const position = positions[Math.floor(Math.random() * positions.length)];
            
            const name = this.generateRandomName();
            const performanceAndPotential = this.generatePerformanceAndPotential();
            const experience = position.experience + Math.floor(Math.random() * 3);
            
            const userData = {
                name: name,
                email: this.generateEmail(name),
                role: 'employee',
                department: department,
                position: position.title,
                experience: experience,
                education: this.generateEducation(position.level),
                performance: performanceAndPotential.performance,
                potential: performanceAndPotential.potential,
                skills: this.generateSkillsForDepartment(department, position.level, experience),
                achievements: this.generateAchievements(experience, performanceAndPotential.performance)
            };
            
            users.push(userData);
        }
        
        return users;
    }

    generateHRAdmin() {
        return {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@company.com',
            role: 'hr',
            department: 'Human Resources',
            position: 'HR Director',
            experience: 12,
            education: ['MBA in Human Resources', 'Bachelor\'s in Psychology'],
            performance: 4,
            potential: 4,
            skills: {
                'HR Management': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                'Leadership': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                'Communication': { level: 5, verified: true, lastUpdated: new Date().toISOString() },
                'Strategic Planning': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                'Data Analysis': { level: 3, verified: true, lastUpdated: new Date().toISOString() },
                'Team Building': { level: 4, verified: true, lastUpdated: new Date().toISOString() },
                'Project Management': { level: 4, verified: true, lastUpdated: new Date().toISOString() }
            },
            achievements: [
                {
                    title: 'HR Excellence Award',
                    description: 'Recognized for outstanding HR leadership',
                    type: 'recognition',
                    date: this.getRandomPastDate(365)
                },
                {
                    title: 'SHRM Certification',
                    description: 'Obtained Senior Professional in Human Resources certification',
                    type: 'certification',
                    date: this.getRandomPastDate(730)
                }
            ]
        };
    }

    generateComprehensiveRoleData() {
        const roles = [];
        
        Object.entries(this.positionHierarchy).forEach(([department, positions]) => {
            positions.forEach(position => {
                const roleData = {
                    title: position.title,
                    department: department,
                    level: this.getLevelName(position.level),
                    experience: position.experience,
                    education: this.generateEducation(position.level),
                    competencies: this.generateCompetenciesForRole(department, position.level),
                    requiredSkills: this.generateRequiredSkillsForRole(department, position.level)
                };
                
                roles.push(roleData);
            });
        });
        
        return roles;
    }

    getLevelName(level) {
        const levelNames = {
            1: 'Entry',
            2: 'Junior',
            3: 'Mid',
            4: 'Senior',
            5: 'Lead',
            6: 'Principal',
            7: 'Director',
            8: 'VP',
            9: 'C-Level'
        };
        return levelNames[level] || 'Mid';
    }

    generateCompetenciesForRole(department, level) {
        const baseCompetencies = ['Problem Solving', 'Communication'];
        
        if (level >= 5) {
            baseCompetencies.push('Leadership', 'Strategic Thinking');
        }
        
        if (level >= 7) {
            baseCompetencies.push('Executive Presence', 'Business Acumen');
        }
        
        // Add department-specific competencies
        switch (department) {
            case 'Engineering':
                baseCompetencies.push('Technical Excellence', 'System Design');
                if (level >= 5) baseCompetencies.push('Technical Leadership');
                break;
            case 'Product':
                baseCompetencies.push('Product Strategy', 'User Focus', 'Data-Driven Decision Making');
                break;
            case 'Design':
                baseCompetencies.push('Design Thinking', 'User Experience', 'Visual Communication');
                break;
            case 'Marketing':
                baseCompetencies.push('Brand Management', 'Market Analysis', 'Creative Thinking');
                break;
            case 'Sales':
                baseCompetencies.push('Relationship Building', 'Negotiation', 'Results Orientation');
                break;
        }
        
        return baseCompetencies;
    }

    generateRequiredSkillsForRole(department, level) {
        const requiredSkills = {};
        
        // Base soft skills for all roles
        requiredSkills['Communication'] = { minimumLevel: Math.min(level, 4), weight: 1, critical: true };
        requiredSkills['Problem Solving'] = { minimumLevel: Math.min(level, 4), weight: 0.9, critical: true };
        
        if (level >= 5) {
            requiredSkills['Leadership'] = { minimumLevel: Math.min(level - 1, 4), weight: 1, critical: true };
            requiredSkills['Team Building'] = { minimumLevel: Math.min(level - 2, 3), weight: 0.8, critical: false };
        }
        
        if (level >= 6) {
            requiredSkills['Strategic Planning'] = { minimumLevel: Math.min(level - 2, 4), weight: 0.9, critical: true };
        }
        
        // Department-specific skills
        switch (department) {
            case 'Engineering':
                requiredSkills['JavaScript'] = { minimumLevel: Math.min(level, 4), weight: 1, critical: true };
                if (level >= 3) requiredSkills['React'] = { minimumLevel: Math.min(level - 1, 4), weight: 0.8, critical: false };
                if (level >= 4) requiredSkills['Node.js'] = { minimumLevel: Math.min(level - 2, 3), weight: 0.7, critical: false };
                break;
            case 'Product':
                requiredSkills['Strategic Planning'] = { minimumLevel: Math.min(level, 4), weight: 1, critical: true };
                requiredSkills['Data Analysis'] = { minimumLevel: Math.min(level - 1, 3), weight: 0.8, critical: true };
                requiredSkills['Project Management'] = { minimumLevel: Math.min(level, 4), weight: 0.9, critical: true };
                break;
            case 'Design':
                requiredSkills['UI/UX Design'] = { minimumLevel: Math.min(level, 4), weight: 1, critical: true };
                requiredSkills['Prototyping'] = { minimumLevel: Math.min(level - 1, 3), weight: 0.7, critical: false };
                break;
            case 'Marketing':
                requiredSkills['Marketing'] = { minimumLevel: Math.min(level, 4), weight: 1, critical: true };
                requiredSkills['Data Analysis'] = { minimumLevel: Math.min(level - 1, 3), weight: 0.8, critical: false };
                break;
            case 'Sales':
                requiredSkills['Sales'] = { minimumLevel: Math.min(level, 4), weight: 1, critical: true };
                requiredSkills['Customer Service'] = { minimumLevel: Math.min(level, 4), weight: 0.9, critical: true };
                break;
        }
        
        return requiredSkills;
    }

    generateTrainingData() {
        return this.trainingCourses.map(course => ({
            ...course,
            id: 'training_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            category: course.type,
            level: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)],
            rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
            enrollments: Math.floor(Math.random() * 500) + 50,
            createdAt: this.getRandomPastDate(730)
        }));
    }

    // Main method to generate all sample data
    generateAllSampleData(userCount = 50) {
        console.log('Generating comprehensive sample data...');
        
        try {
            // Clear existing data
            window.HRData.sampleDataInitializer.resetAllData();
            
            // Generate and create roles
            const roles = this.generateComprehensiveRoleData();
            roles.forEach(roleData => {
                window.HRData.roleService.create(roleData);
            });
            console.log(`Created ${roles.length} roles`);
            
            // Generate and create users
            const users = this.generateComprehensiveUserData(userCount);
            users.forEach(userData => {
                const user = window.HRData.userService.create(userData);
                // Add achievements to the user
                userData.achievements.forEach(achievement => {
                    user.addAchievement(achievement);
                });
            });
            console.log(`Created ${users.length} users`);
            
            // Generate training data
            const trainingData = this.generateTrainingData();
            window.HRData.dataStore.bulkCreate(window.HRData.STORAGE_KEYS.TRAINING_DATA, trainingData);
            console.log(`Created ${trainingData.length} training courses`);
            
            // Generate recommendations for high-potential employees
            this.generateIntelligentRecommendations();
            
            console.log('Sample data generation completed successfully!');
            return true;
            
        } catch (error) {
            console.error('Error generating sample data:', error);
            return false;
        }
    }

    generateIntelligentRecommendations() {
        const users = window.HRData.userService.getAll();
        const roles = window.HRData.roleService.getAll();
        
        // Find high-potential employees (potential >= 4 or performance >= 4)
        const highPotentialUsers = users.filter(user => 
            user.potential >= 4 || user.performance >= 4
        );
        
        highPotentialUsers.forEach(user => {
            // Find potential next roles in their department
            const departmentRoles = roles.filter(role => 
                role.department === user.department
            );
            
            // Find roles that are a step up from current position
            const currentPositionLevel = this.getPositionLevel(user.position, user.department);
            const nextLevelRoles = departmentRoles.filter(role => {
                const roleLevel = this.getPositionLevel(role.title, role.department);
                return roleLevel > currentPositionLevel && roleLevel <= currentPositionLevel + 2;
            });
            
            if (nextLevelRoles.length > 0) {
                const targetRole = nextLevelRoles[Math.floor(Math.random() * nextLevelRoles.length)];
                this.createRecommendationForUser(user, targetRole);
            }
        });
    }

    getPositionLevel(positionTitle, department) {
        const positions = this.positionHierarchy[department] || this.positionHierarchy['Engineering'];
        const position = positions.find(p => p.title === positionTitle);
        return position ? position.level : 3; // default to mid-level
    }

    createRecommendationForUser(user, targetRole) {
        const skillGaps = {};
        const learningPath = [];
        
        // Analyze skill gaps
        Object.entries(targetRole.requiredSkills).forEach(([skillName, requirement]) => {
            const userSkill = user.skills[skillName];
            const currentLevel = userSkill ? userSkill.level : 0;
            
            if (currentLevel < requirement.minimumLevel) {
                skillGaps[skillName] = {
                    currentLevel: currentLevel,
                    requiredLevel: requirement.minimumLevel,
                    priority: requirement.critical ? 'high' : 'medium'
                };
                
                // Add relevant training
                const relevantTraining = this.trainingCourses.find(course => 
                    course.skills.includes(skillName)
                );
                
                if (relevantTraining) {
                    learningPath.push({
                        type: 'course',
                        title: relevantTraining.title,
                        provider: relevantTraining.provider,
                        duration: relevantTraining.duration,
                        priority: requirement.critical ? 'high' : 'medium',
                        skills: [skillName],
                        status: 'recommended'
                    });
                }
            }
        });
        
        if (Object.keys(skillGaps).length > 0) {
            const recommendation = {
                employeeId: user.id,
                targetRole: targetRole.title,
                skillGaps: skillGaps,
                learningPath: learningPath,
                timeline: Math.max(6, Object.keys(skillGaps).length * 2), // 2 months per skill gap, min 6 months
                confidence: Math.max(0.3, 1 - (Object.keys(skillGaps).length * 0.1)), // Lower confidence with more gaps
                status: Math.random() > 0.7 ? 'accepted' : 'pending'
            };
            
            window.HRData.recommendationService.create(recommendation);
        }
    }
}

// Initialize and export
const enhancedSampleDataGenerator = new EnhancedSampleDataGenerator();

// Add to global exports
window.HRData.EnhancedSampleDataGenerator = EnhancedSampleDataGenerator;
window.HRData.enhancedSampleDataGenerator = enhancedSampleDataGenerator;