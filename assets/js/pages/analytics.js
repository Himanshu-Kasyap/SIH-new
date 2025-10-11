/**
 * Analytics Dashboard - Data aggregation and visualization
 * Handles employee progress reports and skill gap analytics
 */
class AnalyticsDashboard {
    constructor() {
        this.currentUser = null;
        this.filters = {
            department: '',
            timeRange: 90,
            role: ''
        };
        this.data = {
            users: [],
            roles: [],
            recommendations: []
        };
        this.charts = {};
        this.init();
    }

    init() {
        this.currentUser = this.getCurrentUser();
        if (!this.currentUser || this.currentUser.role !== 'hr') {
            window.location.href = '/pages/auth/login.html';
            return;
        }

        this.loadData();
        this.setupEventListeners();
        this.initializeFilters();
        this.renderDashboard();
    }

    getCurrentUser() {
        const userData = localStorage.getItem('hr_current_user');
        return userData ? JSON.parse(userData) : null;
    }

    loadData() {
        try {
            this.data.users = window.HRData.userService.getAll();
            this.data.roles = window.HRData.roleService.getAll();
            this.data.recommendations = window.HRData.recommendationService.getAll();
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError('Failed to load analytics data');
        }
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('departmentFilter').addEventListener('change', (e) => {
            this.filters.department = e.target.value;
            this.applyFilters();
        });

        document.getElementById('timeRangeFilter').addEventListener('change', (e) => {
            this.filters.timeRange = parseInt(e.target.value);
            this.applyFilters();
        });

        document.getElementById('roleFilter').addEventListener('change', (e) => {
            this.filters.role = e.target.value;
            this.applyFilters();
        });

        // Action buttons
        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.refreshData();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportReport();
        });

        // Search functionality
        document.getElementById('progressSearch').addEventListener('input', (e) => {
            this.filterProgressTable(e.target.value);
        });

        // Chart controls
        document.querySelectorAll('.chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const container = e.target.closest('.chart-container');
                const view = e.target.dataset.view;
                this.switchChartView(container, view);
            });
        });

        // Skill category filter
        document.getElementById('skillCategoryFilter').addEventListener('change', (e) => {
            this.filterSkillGaps(e.target.value);
        });

        // Succession planning controls
        document.getElementById('exportSuccessionBtn').addEventListener('click', () => {
            this.exportSuccessionReport();
        });

        document.getElementById('effectivenessTimeRange').addEventListener('change', (e) => {
            this.updateEffectivenessMetrics(parseInt(e.target.value));
        });

        // Succession insights controls
        document.querySelectorAll('.insights-controls .chart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                this.switchSuccessionView(view);
            });
        });
    }

    initializeFilters() {
        // Populate department filter
        const departments = [...new Set(this.data.users.map(user => user.department))];
        const departmentFilter = document.getElementById('departmentFilter');
        
        departments.forEach(dept => {
            if (dept) {
                const option = document.createElement('option');
                option.value = dept;
                option.textContent = dept;
                departmentFilter.appendChild(option);
            }
        });
    }

    renderDashboard() {
        this.showLoading(true);
        
        setTimeout(() => {
            this.renderMetrics();
            this.renderProgressChart();
            this.renderSkillGapChart();
            this.renderProgressTable();
            this.renderSkillGapsList();
            this.renderSuccessionReadiness();
            this.renderEffectivenessMetrics();
            this.renderSuccessionInsights();
            this.showLoading(false);
        }, 1000);
    }

    renderMetrics() {
        const filteredUsers = this.getFilteredUsers();
        const activeRecommendations = this.data.recommendations.filter(rec => 
            rec.status === 'in_progress' || rec.status === 'accepted'
        );

        // Total Employees
        document.getElementById('totalEmployees').textContent = filteredUsers.length;
        document.getElementById('employeeChange').textContent = '+5.2%';
        document.getElementById('employeeChange').className = 'metric-change positive';

        // Active IDPs
        document.getElementById('activeIDPs').textContent = activeRecommendations.length;
        document.getElementById('idpChange').textContent = '+12.3%';
        document.getElementById('idpChange').className = 'metric-change positive';

        // Skill Gaps
        const totalSkillGaps = this.calculateTotalSkillGaps(filteredUsers);
        document.getElementById('skillGaps').textContent = totalSkillGaps;
        document.getElementById('skillGapChange').textContent = '-8.1%';
        document.getElementById('skillGapChange').className = 'metric-change negative';

        // Training Completion Rate
        const completionRate = this.calculateCompletionRate(filteredUsers);
        document.getElementById('completionRate').textContent = `${completionRate}%`;
        document.getElementById('completionChange').textContent = '+3.7%';
        document.getElementById('completionChange').className = 'metric-change positive';
    }

    renderProgressChart() {
        const chartContainer = document.getElementById('progressChart');
        const filteredUsers = this.getFilteredUsers();
        
        // Group by department
        const departmentData = this.groupUsersByDepartment(filteredUsers);
        
        chartContainer.innerHTML = this.generateProgressChartHTML(departmentData);
    }

    renderSkillGapChart() {
        const chartContainer = document.getElementById('skillGapChart');
        const skillGaps = this.analyzeSkillGaps();
        
        chartContainer.innerHTML = this.generateSkillGapChartHTML(skillGaps);
    }

    renderProgressTable() {
        const tableBody = document.getElementById('progressTableBody');
        const filteredUsers = this.getFilteredUsers().filter(user => user.role === 'employee');
        
        tableBody.innerHTML = filteredUsers.map(user => {
            const userRecommendations = this.data.recommendations.filter(rec => rec.employeeId === user.id);
            const idpProgress = this.calculateIDPProgress(user, userRecommendations);
            const skillsCompleted = this.calculateSkillsCompleted(user);
            
            return `
                <tr>
                    <td>
                        <div class="employee-info">
                            <div class="employee-avatar">${this.getUserInitials(user.name)}</div>
                            <div class="employee-details">
                                <div class="employee-name">${user.name}</div>
                                <div class="employee-position">${user.position}</div>
                            </div>
                        </div>
                    </td>
                    <td>${user.department}</td>
                    <td>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${idpProgress}%"></div>
                            <span class="progress-text">${idpProgress}%</span>
                        </div>
                    </td>
                    <td>${skillsCompleted}</td>
                    <td>
                        <div class="performance-badge performance-${user.performance}">
                            ${user.performance}/5
                        </div>
                    </td>
                    <td>
                        <div class="potential-badge potential-${user.potential}">
                            ${user.potential}/5
                        </div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewEmployeeDetails('${user.id}')">
                            View Details
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    renderSkillGapsList() {
        const container = document.getElementById('skillGapsList');
        const skillGaps = this.analyzeOrganizationalSkillGaps();
        
        container.innerHTML = skillGaps.map(gap => `
            <div class="skill-gap-item">
                <div class="skill-gap-header">
                    <h4 class="skill-name">${gap.skill}</h4>
                    <div class="gap-severity gap-${gap.severity}">
                        ${gap.severity.toUpperCase()}
                    </div>
                </div>
                <div class="skill-gap-details">
                    <div class="gap-stats">
                        <span class="stat-item">
                            <strong>${gap.affectedEmployees}</strong> employees affected
                        </span>
                        <span class="stat-item">
                            Average gap: <strong>${gap.averageGap.toFixed(1)}</strong> levels
                        </span>
                    </div>
                    <div class="gap-departments">
                        Most affected: ${gap.topDepartments.join(', ')}
                    </div>
                </div>
                <div class="skill-gap-actions">
                    <button class="btn btn-sm btn-secondary" onclick="viewSkillDetails('${gap.skill}')">
                        View Details
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="createTrainingPlan('${gap.skill}')">
                        Create Training Plan
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Data processing methods
    getFilteredUsers() {
        return this.data.users.filter(user => {
            if (this.filters.department && user.department !== this.filters.department) {
                return false;
            }
            if (this.filters.role && !user.position.toLowerCase().includes(this.filters.role.toLowerCase())) {
                return false;
            }
            return true;
        });
    }

    groupUsersByDepartment(users) {
        const departments = {};
        users.forEach(user => {
            if (!departments[user.department]) {
                departments[user.department] = {
                    name: user.department,
                    total: 0,
                    highPerformers: 0,
                    highPotential: 0,
                    activeIDPs: 0
                };
            }
            
            departments[user.department].total++;
            if (user.performance >= 4) departments[user.department].highPerformers++;
            if (user.potential >= 4) departments[user.department].highPotential++;
            
            const hasActiveIDP = this.data.recommendations.some(rec => 
                rec.employeeId === user.id && (rec.status === 'in_progress' || rec.status === 'accepted')
            );
            if (hasActiveIDP) departments[user.department].activeIDPs++;
        });
        
        return Object.values(departments);
    }

    calculateTotalSkillGaps(users) {
        let totalGaps = 0;
        users.forEach(user => {
            const userRecommendations = this.data.recommendations.filter(rec => rec.employeeId === user.id);
            userRecommendations.forEach(rec => {
                totalGaps += Object.keys(rec.skillGaps || {}).length;
            });
        });
        return totalGaps;
    }

    calculateCompletionRate(users) {
        const employeesWithIDPs = users.filter(user => 
            this.data.recommendations.some(rec => rec.employeeId === user.id)
        );
        
        if (employeesWithIDPs.length === 0) return 0;
        
        const completedIDPs = employeesWithIDPs.filter(user => {
            const userRecs = this.data.recommendations.filter(rec => rec.employeeId === user.id);
            return userRecs.some(rec => rec.status === 'completed');
        });
        
        return Math.round((completedIDPs.length / employeesWithIDPs.length) * 100);
    }

    calculateIDPProgress(user, recommendations) {
        if (recommendations.length === 0) return 0;
        
        const totalTasks = recommendations.reduce((sum, rec) => sum + (rec.learningPath?.length || 0), 0);
        if (totalTasks === 0) return 0;
        
        // Simulate progress based on user performance and time
        const baseProgress = (user.performance / 5) * 100;
        const randomVariation = (Math.random() - 0.5) * 20;
        return Math.max(0, Math.min(100, Math.round(baseProgress + randomVariation)));
    }

    calculateSkillsCompleted(user) {
        const verifiedSkills = Object.values(user.skills || {}).filter(skill => skill.verified);
        return verifiedSkills.length;
    }

    analyzeSkillGaps() {
        const skillGaps = {};
        
        this.data.recommendations.forEach(rec => {
            Object.entries(rec.skillGaps || {}).forEach(([skill, gap]) => {
                if (!skillGaps[skill]) {
                    skillGaps[skill] = {
                        skill,
                        totalGap: 0,
                        count: 0,
                        highPriority: 0
                    };
                }
                
                skillGaps[skill].totalGap += (gap.requiredLevel - gap.currentLevel);
                skillGaps[skill].count++;
                if (gap.priority === 'high') skillGaps[skill].highPriority++;
            });
        });
        
        return Object.values(skillGaps)
            .map(gap => ({
                ...gap,
                averageGap: gap.totalGap / gap.count,
                severity: gap.highPriority / gap.count > 0.5 ? 'high' : 
                         gap.averageGap > 2 ? 'medium' : 'low'
            }))
            .sort((a, b) => b.averageGap - a.averageGap)
            .slice(0, 10);
    }

    analyzeOrganizationalSkillGaps() {
        const skillAnalysis = {};
        
        this.data.recommendations.forEach(rec => {
            const user = this.data.users.find(u => u.id === rec.employeeId);
            if (!user) return;
            
            Object.entries(rec.skillGaps || {}).forEach(([skill, gap]) => {
                if (!skillAnalysis[skill]) {
                    skillAnalysis[skill] = {
                        skill,
                        affectedEmployees: new Set(),
                        totalGap: 0,
                        departments: {}
                    };
                }
                
                skillAnalysis[skill].affectedEmployees.add(user.id);
                skillAnalysis[skill].totalGap += (gap.requiredLevel - gap.currentLevel);
                
                if (!skillAnalysis[skill].departments[user.department]) {
                    skillAnalysis[skill].departments[user.department] = 0;
                }
                skillAnalysis[skill].departments[user.department]++;
            });
        });
        
        return Object.values(skillAnalysis)
            .map(analysis => ({
                skill: analysis.skill,
                affectedEmployees: analysis.affectedEmployees.size,
                averageGap: analysis.totalGap / analysis.affectedEmployees.size,
                severity: analysis.averageGap > 2.5 ? 'high' : 
                         analysis.averageGap > 1.5 ? 'medium' : 'low',
                topDepartments: Object.entries(analysis.departments)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([dept]) => dept)
            }))
            .sort((a, b) => b.averageGap - a.averageGap);
    }

    // Chart generation methods
    generateProgressChartHTML(departmentData) {
        const maxValue = Math.max(...departmentData.map(d => d.total));
        
        return `
            <div class="bar-chart">
                ${departmentData.map(dept => `
                    <div class="chart-bar-group">
                        <div class="chart-label">${dept.name}</div>
                        <div class="chart-bars">
                            <div class="chart-bar">
                                <div class="bar-fill" style="width: ${(dept.total / maxValue) * 100}%">
                                    <span class="bar-value">${dept.total}</span>
                                </div>
                                <span class="bar-label">Total</span>
                            </div>
                            <div class="chart-bar">
                                <div class="bar-fill bar-success" style="width: ${(dept.highPerformers / maxValue) * 100}%">
                                    <span class="bar-value">${dept.highPerformers}</span>
                                </div>
                                <span class="bar-label">High Performers</span>
                            </div>
                            <div class="chart-bar">
                                <div class="bar-fill bar-warning" style="width: ${(dept.activeIDPs / maxValue) * 100}%">
                                    <span class="bar-value">${dept.activeIDPs}</span>
                                </div>
                                <span class="bar-label">Active IDPs</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateSkillGapChartHTML(skillGaps) {
        return `
            <div class="skill-gap-chart">
                ${skillGaps.map(gap => `
                    <div class="skill-gap-bar">
                        <div class="skill-label">${gap.skill}</div>
                        <div class="gap-bar">
                            <div class="gap-fill gap-${gap.severity}" style="width: ${(gap.averageGap / 5) * 100}%">
                                <span class="gap-value">${gap.averageGap.toFixed(1)}</span>
                            </div>
                        </div>
                        <div class="affected-count">${gap.count} employees</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Utility methods
    getUserInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    applyFilters() {
        this.renderDashboard();
    }

    refreshData() {
        this.showLoading(true);
        this.loadData();
        setTimeout(() => {
            this.renderDashboard();
        }, 500);
    }

    filterProgressTable(searchTerm) {
        const rows = document.querySelectorAll('#progressTableBody tr');
        const term = searchTerm.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(term) ? '' : 'none';
        });
    }

    switchChartView(container, view) {
        // Update active button
        container.querySelectorAll('.chart-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update chart content based on view
        const chartContent = container.querySelector('.chart-content');
        // Implementation would depend on specific chart view requirements
    }

    filterSkillGaps(category) {
        // Implementation for filtering skill gaps by category
        this.renderSkillGapsList();
    }

    exportReport() {
        const reportData = {
            generatedAt: new Date().toISOString(),
            filters: this.filters,
            metrics: {
                totalEmployees: this.getFilteredUsers().length,
                activeIDPs: this.data.recommendations.filter(rec => 
                    rec.status === 'in_progress' || rec.status === 'accepted'
                ).length,
                skillGaps: this.calculateTotalSkillGaps(this.getFilteredUsers()),
                completionRate: this.calculateCompletionRate(this.getFilteredUsers())
            },
            employeeProgress: this.getFilteredUsers().map(user => ({
                name: user.name,
                department: user.department,
                position: user.position,
                performance: user.performance,
                potential: user.potential,
                idpProgress: this.calculateIDPProgress(user, 
                    this.data.recommendations.filter(rec => rec.employeeId === user.id)
                )
            })),
            skillGaps: this.analyzeOrganizationalSkillGaps()
        };
        
        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Report exported successfully');
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper notification system
        alert('Error: ' + message);
    }

    showSuccess(message) {
        // Simple success display - could be enhanced with a proper notification system
        alert('Success: ' + message);
    }

    // Succession Planning Methods
    renderSuccessionReadiness() {
        const container = document.getElementById('successionReadiness');
        const readinessData = this.analyzeSuccessionReadiness();
        
        container.innerHTML = readinessData.map(role => `
            <div class="readiness-item">
                <div class="role-info">
                    <h4 class="role-title">${role.title}</h4>
                    <div class="role-department">${role.department}</div>
                    <div class="role-level">${role.level} Level</div>
                </div>
                <div class="readiness-status">
                    <div class="readiness-indicator readiness-${role.readiness}">
                        ${this.getReadinessLabel(role.readiness)}
                    </div>
                    <div class="successor-count">${role.successors.length} potential successors</div>
                </div>
                <div class="successor-list">
                    ${role.successors.slice(0, 3).map(successor => `
                        <div class="successor-item">
                            <div class="successor-avatar">${this.getUserInitials(successor.name)}</div>
                            <div class="successor-info">
                                <div class="successor-name">${successor.name}</div>
                                <div class="successor-readiness">${successor.readiness}</div>
                            </div>
                        </div>
                    `).join('')}
                    ${role.successors.length > 3 ? `<div class="more-successors">+${role.successors.length - 3} more</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    renderEffectivenessMetrics() {
        const container = document.getElementById('effectivenessMetrics');
        const effectiveness = this.calculateAIEffectiveness();
        
        container.innerHTML = `
            <div class="effectiveness-grid">
                <div class="effectiveness-metric">
                    <div class="metric-icon">🎯</div>
                    <div class="metric-content">
                        <div class="metric-value">${effectiveness.accuracy}%</div>
                        <div class="metric-label">Recommendation Accuracy</div>
                        <div class="metric-description">Based on completed IDPs</div>
                    </div>
                </div>
                
                <div class="effectiveness-metric">
                    <div class="metric-icon">⚡</div>
                    <div class="metric-content">
                        <div class="metric-value">${effectiveness.adoptionRate}%</div>
                        <div class="metric-label">Adoption Rate</div>
                        <div class="metric-description">Employees accepting recommendations</div>
                    </div>
                </div>
                
                <div class="effectiveness-metric">
                    <div class="metric-icon">📈</div>
                    <div class="metric-content">
                        <div class="metric-value">${effectiveness.improvementRate}%</div>
                        <div class="metric-label">Skill Improvement</div>
                        <div class="metric-description">Average skill level increase</div>
                    </div>
                </div>
                
                <div class="effectiveness-metric">
                    <div class="metric-icon">⏱️</div>
                    <div class="metric-content">
                        <div class="metric-value">${effectiveness.timeToCompletion}</div>
                        <div class="metric-label">Avg. Completion Time</div>
                        <div class="metric-description">Months to complete IDP</div>
                    </div>
                </div>
            </div>
            
            <div class="effectiveness-trends">
                <h4>Effectiveness Trends</h4>
                <div class="trend-chart">
                    ${this.generateEffectivenessTrendChart(effectiveness.trends)}
                </div>
            </div>
        `;
    }

    renderSuccessionInsights() {
        const container = document.getElementById('successionInsights');
        this.renderMatrixView(container);
    }

    renderMatrixView(container) {
        const matrixData = this.generateNineBoxMatrix();
        
        container.innerHTML = `
            <div class="nine-box-matrix">
                <div class="matrix-labels">
                    <div class="y-axis-label">Potential</div>
                    <div class="x-axis-label">Performance</div>
                </div>
                <div class="matrix-grid">
                    ${matrixData.map((row, rowIndex) => 
                        row.map((cell, colIndex) => `
                            <div class="matrix-cell cell-${rowIndex}-${colIndex}" 
                                 data-performance="${colIndex + 1}" 
                                 data-potential="${3 - rowIndex}">
                                <div class="cell-label">${cell.label}</div>
                                <div class="cell-employees">
                                    ${cell.employees.map(emp => `
                                        <div class="matrix-employee" title="${emp.name} - ${emp.position}">
                                            <div class="employee-dot">${this.getUserInitials(emp.name)}</div>
                                        </div>
                                    `).join('')}
                                </div>
                                <div class="cell-count">${cell.employees.length} employees</div>
                            </div>
                        `).join('')
                    ).join('')}
                </div>
            </div>
        `;
    }

    renderPipelineView(container) {
        const pipelineData = this.generateTalentPipeline();
        
        container.innerHTML = `
            <div class="talent-pipeline">
                ${pipelineData.map(level => `
                    <div class="pipeline-level">
                        <div class="level-header">
                            <h4 class="level-title">${level.title}</h4>
                            <div class="level-count">${level.employees.length} employees</div>
                        </div>
                        <div class="level-employees">
                            ${level.employees.map(emp => `
                                <div class="pipeline-employee">
                                    <div class="employee-avatar">${this.getUserInitials(emp.name)}</div>
                                    <div class="employee-info">
                                        <div class="employee-name">${emp.name}</div>
                                        <div class="employee-department">${emp.department}</div>
                                        <div class="readiness-time">${emp.readinessTime}</div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRiskView(container) {
        const riskData = this.analyzeSuccessionRisk();
        
        container.innerHTML = `
            <div class="risk-analysis">
                <div class="risk-summary">
                    <div class="risk-metric high-risk">
                        <div class="risk-value">${riskData.highRisk}</div>
                        <div class="risk-label">High Risk Roles</div>
                    </div>
                    <div class="risk-metric medium-risk">
                        <div class="risk-value">${riskData.mediumRisk}</div>
                        <div class="risk-label">Medium Risk Roles</div>
                    </div>
                    <div class="risk-metric low-risk">
                        <div class="risk-value">${riskData.lowRisk}</div>
                        <div class="risk-label">Low Risk Roles</div>
                    </div>
                </div>
                
                <div class="risk-details">
                    <h4>High Risk Positions</h4>
                    <div class="risk-list">
                        ${riskData.highRiskRoles.map(role => `
                            <div class="risk-item">
                                <div class="risk-role">
                                    <h5>${role.title}</h5>
                                    <div class="risk-department">${role.department}</div>
                                </div>
                                <div class="risk-factors">
                                    ${role.riskFactors.map(factor => `
                                        <span class="risk-factor">${factor}</span>
                                    `).join('')}
                                </div>
                                <div class="risk-actions">
                                    <button class="btn btn-sm btn-primary">Create Action Plan</button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Data analysis methods for succession planning
    analyzeSuccessionReadiness() {
        const roles = this.data.roles;
        const users = this.data.users.filter(user => user.role === 'employee');
        
        return roles.map(role => {
            const successors = this.findPotentialSuccessors(role, users);
            const readiness = this.calculateRoleReadiness(successors);
            
            return {
                ...role,
                readiness,
                successors: successors.map(successor => ({
                    ...successor,
                    readiness: this.calculateSuccessorReadiness(successor, role)
                }))
            };
        });
    }

    findPotentialSuccessors(role, users) {
        return users
            .filter(user => user.department === role.department)
            .filter(user => user.performance >= 3 || user.potential >= 3)
            .sort((a, b) => (b.performance + b.potential) - (a.performance + a.potential))
            .slice(0, 5);
    }

    calculateRoleReadiness(successors) {
        if (successors.length === 0) return 'none';
        
        const readyNow = successors.filter(s => s.performance >= 4 && s.potential >= 4);
        if (readyNow.length > 0) return 'ready';
        
        const developing = successors.filter(s => s.performance >= 3 && s.potential >= 4);
        if (developing.length > 0) return 'developing';
        
        return 'future';
    }

    calculateSuccessorReadiness(successor, role) {
        const performanceGap = Math.max(0, 4 - successor.performance);
        const potentialGap = Math.max(0, 4 - successor.potential);
        
        if (performanceGap === 0 && potentialGap === 0) return 'Ready Now';
        if (performanceGap <= 1 && potentialGap <= 1) return '6-12 months';
        if (performanceGap <= 2 && potentialGap <= 2) return '1-2 years';
        return '2+ years';
    }

    calculateAIEffectiveness() {
        const recommendations = this.data.recommendations;
        const completedRecs = recommendations.filter(rec => rec.status === 'completed');
        const acceptedRecs = recommendations.filter(rec => 
            rec.status === 'accepted' || rec.status === 'in_progress' || rec.status === 'completed'
        );
        
        return {
            accuracy: Math.round((completedRecs.length / Math.max(1, acceptedRecs.length)) * 100),
            adoptionRate: Math.round((acceptedRecs.length / Math.max(1, recommendations.length)) * 100),
            improvementRate: Math.round(75 + Math.random() * 20), // Simulated
            timeToCompletion: Math.round(8 + Math.random() * 6), // Simulated months
            trends: this.generateEffectivenessTrends()
        };
    }

    generateEffectivenessTrends() {
        // Simulate trend data for the last 6 months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return months.map(month => ({
            month,
            accuracy: Math.round(70 + Math.random() * 25),
            adoption: Math.round(60 + Math.random() * 30)
        }));
    }

    generateEffectivenessTrendChart(trends) {
        const maxValue = 100;
        
        return `
            <div class="trend-chart-container">
                <div class="trend-lines">
                    ${trends.map((point, index) => `
                        <div class="trend-point" style="left: ${(index / (trends.length - 1)) * 100}%">
                            <div class="accuracy-point" style="bottom: ${point.accuracy}%"></div>
                            <div class="adoption-point" style="bottom: ${point.adoption}%"></div>
                            <div class="trend-label">${point.month}</div>
                        </div>
                    `).join('')}
                </div>
                <div class="trend-legend">
                    <span class="legend-item accuracy">Accuracy</span>
                    <span class="legend-item adoption">Adoption</span>
                </div>
            </div>
        `;
    }

    generateNineBoxMatrix() {
        const users = this.data.users.filter(user => user.role === 'employee');
        const matrix = [
            [{ label: 'Star', employees: [] }, { label: 'High Potential', employees: [] }, { label: 'Top Performer', employees: [] }],
            [{ label: 'High Professional', employees: [] }, { label: 'Core Player', employees: [] }, { label: 'High Performer', employees: [] }],
            [{ label: 'New/Inexperienced', employees: [] }, { label: 'Inconsistent Player', employees: [] }, { label: 'Solid Performer', employees: [] }]
        ];
        
        users.forEach(user => {
            const perfIndex = Math.min(2, Math.max(0, user.performance - 3));
            const potIndex = Math.min(2, Math.max(0, 2 - (user.potential - 3)));
            matrix[potIndex][perfIndex].employees.push(user);
        });
        
        return matrix;
    }

    generateTalentPipeline() {
        const users = this.data.users.filter(user => user.role === 'employee');
        
        return [
            {
                title: 'Ready Now',
                employees: users.filter(u => u.performance >= 4 && u.potential >= 4)
                    .map(u => ({ ...u, readinessTime: 'Ready' }))
            },
            {
                title: 'Ready in 1-2 Years',
                employees: users.filter(u => u.performance >= 3 && u.potential >= 4 && !(u.performance >= 4 && u.potential >= 4))
                    .map(u => ({ ...u, readinessTime: '1-2 years' }))
            },
            {
                title: 'Future Potential',
                employees: users.filter(u => u.potential >= 3 && u.performance < 3)
                    .map(u => ({ ...u, readinessTime: '2+ years' }))
            }
        ];
    }

    analyzeSuccessionRisk() {
        const roles = this.data.roles;
        const readinessData = this.analyzeSuccessionReadiness();
        
        const highRiskRoles = readinessData.filter(role => role.readiness === 'none' || role.successors.length === 0);
        const mediumRiskRoles = readinessData.filter(role => role.readiness === 'future' && role.successors.length <= 2);
        const lowRiskRoles = readinessData.filter(role => role.readiness === 'ready' || role.readiness === 'developing');
        
        return {
            highRisk: highRiskRoles.length,
            mediumRisk: mediumRiskRoles.length,
            lowRisk: lowRiskRoles.length,
            highRiskRoles: highRiskRoles.map(role => ({
                ...role,
                riskFactors: this.identifyRiskFactors(role)
            }))
        };
    }

    identifyRiskFactors(role) {
        const factors = [];
        
        if (role.successors.length === 0) factors.push('No identified successors');
        if (role.successors.length < 2) factors.push('Limited succession depth');
        if (role.successors.every(s => s.performance < 4)) factors.push('Low successor performance');
        if (role.level === 'Manager' || role.level === 'Senior') factors.push('Critical leadership role');
        
        return factors;
    }

    getReadinessLabel(readiness) {
        const labels = {
            ready: 'Ready Now',
            developing: '1-2 Years',
            future: '2+ Years',
            none: 'No Successor'
        };
        return labels[readiness] || readiness;
    }

    switchSuccessionView(view) {
        const container = document.getElementById('successionInsights');
        const buttons = document.querySelectorAll('.insights-controls .chart-btn');
        
        // Update active button
        buttons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Render appropriate view
        switch (view) {
            case 'matrix':
                this.renderMatrixView(container);
                break;
            case 'pipeline':
                this.renderPipelineView(container);
                break;
            case 'risk':
                this.renderRiskView(container);
                break;
        }
    }

    updateEffectivenessMetrics(timeRange) {
        // Update effectiveness metrics based on time range
        this.renderEffectivenessMetrics();
    }

    exportSuccessionReport() {
        const successionData = {
            generatedAt: new Date().toISOString(),
            readiness: this.analyzeSuccessionReadiness(),
            effectiveness: this.calculateAIEffectiveness(),
            riskAnalysis: this.analyzeSuccessionRisk(),
            talentPipeline: this.generateTalentPipeline()
        };
        
        const blob = new Blob([JSON.stringify(successionData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `succession-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showSuccess('Succession planning report exported successfully');
    }
}

// Global functions for button actions
window.viewEmployeeDetails = function(userId) {
    window.location.href = `/pages/profile/view.html?id=${userId}`;
};

window.viewSkillDetails = function(skill) {
    // Implementation for viewing skill details
    console.log('Viewing details for skill:', skill);
};

window.createTrainingPlan = function(skill) {
    // Implementation for creating training plan
    console.log('Creating training plan for skill:', skill);
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsDashboard = new AnalyticsDashboard();
});