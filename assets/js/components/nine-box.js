/**
 * Nine-Box Matrix Component
 * Interactive 9-box matrix visualization for performance vs potential assessment
 */

class NineBoxMatrix {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            width: 500,
            height: 500,
            padding: 60,
            showLabels: true,
            showGrid: true,
            allowDrag: true,
            showTooltips: true,
            colorScheme: 'default',
            onEmployeeClick: null,
            onPositionChange: null,
            ...options
        };
        
        this.employees = [];
        this.selectedEmployee = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        
        this.init();
    }

    init() {
        if (!this.container) {
            console.error('Nine-box matrix container not found');
            return;
        }
        
        this.createMatrixStructure();
        this.attachEventListeners();
        
        console.log('Nine-box matrix initialized');
    }

    createMatrixStructure() {
        this.container.innerHTML = `
            <div class="nine-box-container">
                <div class="matrix-labels">
                    <div class="y-axis-label">
                        <span class="axis-title">Potential</span>
                        <div class="axis-scale">
                            <span class="scale-high">High</span>
                            <span class="scale-medium">Medium</span>
                            <span class="scale-low">Low</span>
                        </div>
                    </div>
                </div>
                
                <div class="matrix-content">
                    <div class="matrix-grid" id="matrixGrid">
                        ${this.generateMatrixCells()}
                    </div>
                    
                    <div class="x-axis-label">
                        <span class="axis-title">Performance</span>
                        <div class="axis-scale">
                            <span class="scale-low">Low</span>
                            <span class="scale-medium">Medium</span>
                            <span class="scale-high">High</span>
                        </div>
                    </div>
                </div>
                
                <div class="matrix-legend">
                    <div class="legend-item">
                        <div class="legend-color star"></div>
                        <span>Star Performers</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color high-potential"></div>
                        <span>High Potential</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color solid-performer"></div>
                        <span>Solid Performers</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color question-mark"></div>
                        <span>Question Marks</span>
                    </div>
                    <div class="legend-item">
                        <div class="legend-color underperformer"></div>
                        <span>Underperformers</span>
                    </div>
                </div>
            </div>
            
            <div class="employee-tooltip" id="employeeTooltip" style="display: none;">
                <div class="tooltip-content">
                    <div class="tooltip-header">
                        <div class="employee-avatar"></div>
                        <div class="employee-info">
                            <div class="employee-name"></div>
                            <div class="employee-position"></div>
                        </div>
                    </div>
                    <div class="tooltip-body">
                        <div class="tooltip-metrics">
                            <div class="metric">
                                <span class="metric-label">Performance:</span>
                                <span class="metric-value performance"></span>
                            </div>
                            <div class="metric">
                                <span class="metric-label">Potential:</span>
                                <span class="metric-value potential"></span>
                            </div>
                        </div>
                        <div class="tooltip-actions">
                            <button class="tooltip-btn" data-action="view-profile">View Profile</button>
                            <button class="tooltip-btn" data-action="view-idp">View IDP</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.matrixGrid = document.getElementById('matrixGrid');
        this.tooltip = document.getElementById('employeeTooltip');
    }

    generateMatrixCells() {
        const cells = [];
        const cellLabels = [
            ['Future Star', 'Star Performer', 'Current Star'],
            ['High Potential', 'Key Player', 'Consistent Star'],
            ['Rough Diamond', 'Solid Performer', 'Trusted Professional']
        ];
        
        const cellClasses = [
            ['future-star', 'star-performer', 'current-star'],
            ['high-potential', 'key-player', 'consistent-star'],
            ['rough-diamond', 'solid-performer', 'trusted-professional']
        ];
        
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const potential = 3 - row; // 3 = high, 2 = medium, 1 = low
                const performance = col + 1; // 1 = low, 2 = medium, 3 = high
                
                cells.push(`
                    <div class="matrix-cell ${cellClasses[row][col]}" 
                         data-performance="${performance}" 
                         data-potential="${potential}"
                         data-row="${row}" 
                         data-col="${col}">
                        <div class="cell-label">${cellLabels[row][col]}</div>
                        <div class="cell-employees" id="cell-${row}-${col}">
                            <!-- Employees will be positioned here -->
                        </div>
                    </div>
                `);
            }
        }
        
        return cells.join('');
    }

    render(employees = []) {
        this.employees = employees;
        this.clearEmployees();
        this.positionEmployees();
    }

    clearEmployees() {
        const employeeElements = this.container.querySelectorAll('.employee-dot');
        employeeElements.forEach(el => el.remove());
    }

    positionEmployees() {
        this.employees.forEach(employee => {
            this.createEmployeeDot(employee);
        });
    }

    createEmployeeDot(employee) {
        const dot = document.createElement('div');
        dot.className = 'employee-dot';
        dot.setAttribute('data-employee-id', employee.id);
        dot.innerHTML = `
            <div class="dot-avatar">${this.getEmployeeInitials(employee.name)}</div>
            <div class="dot-name">${employee.name}</div>
        `;
        
        // Position the dot in the correct cell
        const cell = this.getCellForEmployee(employee);
        if (cell) {
            const cellEmployees = cell.querySelector('.cell-employees');
            cellEmployees.appendChild(dot);
            
            // Add random positioning within cell to avoid overlap
            this.randomizePositionInCell(dot, cellEmployees);
        }
        
        // Add event listeners
        this.attachEmployeeDotListeners(dot, employee);
    }

    getCellForEmployee(employee) {
        // Map performance and potential scores (1-5) to matrix positions (1-3)
        const performance = Math.min(3, Math.max(1, Math.ceil(employee.performance * 3 / 5)));
        const potential = Math.min(3, Math.max(1, Math.ceil(employee.potential * 3 / 5)));
        
        const row = 3 - potential; // Invert for display (high potential at top)
        const col = performance - 1;
        
        return this.container.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    }

    randomizePositionInCell(dot, cellContainer) {
        // Add slight random offset to prevent exact overlap
        const maxOffset = 20;
        const offsetX = (Math.random() - 0.5) * maxOffset;
        const offsetY = (Math.random() - 0.5) * maxOffset;
        
        dot.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    }

    attachEmployeeDotListeners(dot, employee) {
        // Click handler
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleEmployeeClick(employee, dot);
        });
        
        // Hover handlers for tooltip
        dot.addEventListener('mouseenter', (e) => {
            if (!this.isDragging) {
                this.showTooltip(employee, e);
            }
        });
        
        dot.addEventListener('mouseleave', () => {
            if (!this.isDragging) {
                this.hideTooltip();
            }
        });
        
        // Drag handlers (if enabled)
        if (this.options.allowDrag) {
            dot.addEventListener('mousedown', (e) => {
                this.startDrag(employee, dot, e);
            });
        }
    }

    handleEmployeeClick(employee, dot) {
        // Highlight selected employee
        this.container.querySelectorAll('.employee-dot').forEach(d => {
            d.classList.remove('selected');
        });
        dot.classList.add('selected');
        
        this.selectedEmployee = employee;
        
        // Call callback if provided
        if (this.options.onEmployeeClick) {
            this.options.onEmployeeClick(employee);
        }
        
        console.log('Employee clicked:', employee.name);
    }

    startDrag(employee, dot, e) {
        e.preventDefault();
        this.isDragging = true;
        this.selectedEmployee = employee;
        
        const rect = dot.getBoundingClientRect();
        this.dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
        
        dot.classList.add('dragging');
        this.hideTooltip();
        
        // Add global mouse event listeners
        document.addEventListener('mousemove', this.handleDragMove.bind(this));
        document.addEventListener('mouseup', this.handleDragEnd.bind(this));
    }

    handleDragMove(e) {
        if (!this.isDragging || !this.selectedEmployee) return;
        
        const dot = this.container.querySelector(`[data-employee-id="${this.selectedEmployee.id}"]`);
        if (!dot) return;
        
        // Update dot position
        const containerRect = this.matrixGrid.getBoundingClientRect();
        const x = e.clientX - containerRect.left - this.dragOffset.x;
        const y = e.clientY - containerRect.top - this.dragOffset.y;
        
        dot.style.position = 'absolute';
        dot.style.left = `${x}px`;
        dot.style.top = `${y}px`;
        dot.style.zIndex = '1000';
        
        // Highlight target cell
        this.highlightTargetCell(e);
    }

    handleDragEnd(e) {
        if (!this.isDragging || !this.selectedEmployee) return;
        
        const dot = this.container.querySelector(`[data-employee-id="${this.selectedEmployee.id}"]`);
        if (!dot) return;
        
        // Find target cell
        const targetCell = this.getTargetCell(e);
        
        if (targetCell) {
            // Move employee to new cell
            this.moveEmployeeToCell(this.selectedEmployee, dot, targetCell);
        } else {
            // Return to original position
            this.returnEmployeeToOriginalPosition(dot);
        }
        
        // Clean up
        dot.classList.remove('dragging');
        dot.style.position = '';
        dot.style.left = '';
        dot.style.top = '';
        dot.style.zIndex = '';
        
        this.clearCellHighlights();
        this.isDragging = false;
        
        // Remove global event listeners
        document.removeEventListener('mousemove', this.handleDragMove.bind(this));
        document.removeEventListener('mouseup', this.handleDragEnd.bind(this));
    }

    getTargetCell(e) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        return elements.find(el => el.classList.contains('matrix-cell'));
    }

    moveEmployeeToCell(employee, dot, targetCell) {
        const performance = parseInt(targetCell.getAttribute('data-performance'));
        const potential = parseInt(targetCell.getAttribute('data-potential'));
        
        // Update employee data
        const newPosition = {
            performance: performance * 5 / 3, // Convert back to 1-5 scale
            potential: potential * 5 / 3
        };
        
        // Move dot to new cell
        const cellEmployees = targetCell.querySelector('.cell-employees');
        cellEmployees.appendChild(dot);
        this.randomizePositionInCell(dot, cellEmployees);
        
        // Call callback if provided
        if (this.options.onPositionChange) {
            this.options.onPositionChange(employee, newPosition);
        }
        
        console.log(`Moved ${employee.name} to Performance: ${performance}, Potential: ${potential}`);
    }

    returnEmployeeToOriginalPosition(dot) {
        // Return dot to its original cell
        const employee = this.employees.find(emp => emp.id === dot.getAttribute('data-employee-id'));
        if (employee) {
            const originalCell = this.getCellForEmployee(employee);
            if (originalCell) {
                const cellEmployees = originalCell.querySelector('.cell-employees');
                cellEmployees.appendChild(dot);
                this.randomizePositionInCell(dot, cellEmployees);
            }
        }
    }

    highlightTargetCell(e) {
        this.clearCellHighlights();
        const targetCell = this.getTargetCell(e);
        if (targetCell) {
            targetCell.classList.add('drop-target');
        }
    }

    clearCellHighlights() {
        this.container.querySelectorAll('.matrix-cell').forEach(cell => {
            cell.classList.remove('drop-target');
        });
    }

    showTooltip(employee, e) {
        if (!this.options.showTooltips || !this.tooltip) return;
        
        // Update tooltip content
        const avatar = this.tooltip.querySelector('.employee-avatar');
        const name = this.tooltip.querySelector('.employee-name');
        const position = this.tooltip.querySelector('.employee-position');
        const performance = this.tooltip.querySelector('.metric-value.performance');
        const potential = this.tooltip.querySelector('.metric-value.potential');
        
        avatar.textContent = this.getEmployeeInitials(employee.name);
        name.textContent = employee.name;
        position.textContent = `${employee.position} - ${employee.department}`;
        performance.textContent = `${employee.performance}/5`;
        potential.textContent = `${employee.potential}/5`;
        
        // Position tooltip
        const containerRect = this.container.getBoundingClientRect();
        const x = e.clientX - containerRect.left + 10;
        const y = e.clientY - containerRect.top - 10;
        
        this.tooltip.style.left = `${x}px`;
        this.tooltip.style.top = `${y}px`;
        this.tooltip.style.display = 'block';
        
        // Add tooltip action listeners
        this.attachTooltipListeners(employee);
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.display = 'none';
        }
    }

    attachTooltipListeners(employee) {
        const tooltipBtns = this.tooltip.querySelectorAll('.tooltip-btn');
        tooltipBtns.forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const action = btn.getAttribute('data-action');
                this.handleTooltipAction(action, employee);
                this.hideTooltip();
            };
        });
    }

    handleTooltipAction(action, employee) {
        switch (action) {
            case 'view-profile':
                window.location.href = `/pages/profile/view.html?id=${employee.id}`;
                break;
            case 'view-idp':
                window.location.href = `/pages/recommendations/idp.html?id=${employee.id}`;
                break;
            default:
                console.log(`Tooltip action: ${action} for employee: ${employee.name}`);
        }
    }

    attachEventListeners() {
        // Hide tooltip when clicking outside
        document.addEventListener('click', () => {
            this.hideTooltip();
        });
        
        // Prevent tooltip from hiding when clicking inside it
        if (this.tooltip) {
            this.tooltip.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        }
    }

    getEmployeeInitials(name) {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }

    // Public methods for external control
    selectEmployee(employeeId) {
        const dot = this.container.querySelector(`[data-employee-id="${employeeId}"]`);
        if (dot) {
            const employee = this.employees.find(emp => emp.id === employeeId);
            if (employee) {
                this.handleEmployeeClick(employee, dot);
            }
        }
    }

    highlightEmployee(employeeId, highlight = true) {
        const dot = this.container.querySelector(`[data-employee-id="${employeeId}"]`);
        if (dot) {
            if (highlight) {
                dot.classList.add('highlighted');
            } else {
                dot.classList.remove('highlighted');
            }
        }
    }

    getEmployeePosition(employeeId) {
        const employee = this.employees.find(emp => emp.id === employeeId);
        if (employee) {
            return {
                performance: employee.performance,
                potential: employee.potential
            };
        }
        return null;
    }

    // Method to export matrix data
    exportData() {
        return this.employees.map(employee => ({
            id: employee.id,
            name: employee.name,
            position: employee.position,
            department: employee.department,
            performance: employee.performance,
            potential: employee.potential,
            matrixPosition: this.getMatrixPosition(employee)
        }));
    }

    getMatrixPosition(employee) {
        const performance = Math.min(3, Math.max(1, Math.ceil(employee.performance * 3 / 5)));
        const potential = Math.min(3, Math.max(1, Math.ceil(employee.potential * 3 / 5)));
        
        const positions = {
            '3-3': 'Current Star',
            '3-2': 'Star Performer', 
            '3-1': 'Future Star',
            '2-3': 'Consistent Star',
            '2-2': 'Key Player',
            '2-1': 'High Potential',
            '1-3': 'Trusted Professional',
            '1-2': 'Solid Performer',
            '1-1': 'Rough Diamond'
        };
        
        return positions[`${potential}-${performance}`] || 'Unknown';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NineBoxMatrix;
}

// Make available globally
window.NineBoxMatrix = NineBoxMatrix;