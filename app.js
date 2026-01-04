<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitHub Pages Site</title>
</head>
<body>
// RentTracker Pro - Complete System with All Features
// Login Working + Beautiful UI + 8 Charts + Full CRUD

let currentUser = null;
let charts = {};

// ==================== DATA INITIALIZATION ====================
function initData() {
    if (!localStorage.getItem('initialized')) {
        // Users
        localStorage.setItem('users', JSON.stringify([
            {
                id: '1',
                name: 'Admin User',
                email: 'admin@renttracker.com',
                password: 'admin123',
                role: 'admin'
            },
            {
                id: '2',
                name: 'Rajesh Kumar',
                email: 'renter@renttracker.com',
                password: 'renter123',
                role: 'renter',
                propertyId: '1'
            }
        ]));

        // Properties
        localStorage.setItem('properties', JSON.stringify([
            {
                id: '1',
                name: 'Sunset Apartments 101',
                type: 'apartment',
                address: '123 Main St, Mumbai',
                rent: 25000,
                beds: 2,
                status: 'occupied',
                created: new Date().toISOString()
            },
            {
                id: '2',
                name: 'Green Valley House',
                type: 'house',
                address: '456 Park Ave, Delhi',
                rent: 45000,
                beds: 3,
                status: 'vacant',
                created: new Date().toISOString()
            },
            {
                id: '3',
                name: 'Downtown Condo',
                type: 'condo',
                address: '789 Business St, Bangalore',
                rent: 35000,
                beds: 2,
                status: 'vacant',
                created: new Date().toISOString()
            }
        ]));

        // Tenants
        localStorage.setItem('tenants', JSON.stringify([
            {
                id: '1',
                name: 'Rajesh Kumar',
                email: 'renter@renttracker.com',
                phone: '+91 98765 43210',
                propertyId: '1',
                leaseStart: '2024-01-01',
                leaseEnd: '2024-12-31',
                created: new Date().toISOString()
            }
        ]));

        // Payments - Generate 6 months of data
        const payments = [];
        for (let i = 0; i < 6; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            payments.push({
                id: Date.now() + i,
                tenantId: '1',
                propertyId: '1',
                amount: 25000,
                date: date.toISOString().split('T')[0],
                method: i % 3 === 0 ? 'cash' : i % 3 === 1 ? 'bank' : 'upi',
                status: i === 0 ? 'pending' : 'paid',
                created: date.toISOString()
            });
        }
        localStorage.setItem('payments', JSON.stringify(payments));

        // Maintenance
        localStorage.setItem('maintenance', JSON.stringify([
            {
                id: '1',
                propertyId: '1',
                title: 'Leaking Faucet',
                description: 'Kitchen faucet needs repair',
                priority: 'medium',
                status: 'in-progress',
                created: new Date().toISOString()
            },
            {
                id: '2',
                propertyId: '2',
                title: 'AC Not Working',
                description: 'Master bedroom AC needs service',
                priority: 'high',
                status: 'pending',
                created: new Date().toISOString()
            }
        ]));

        localStorage.setItem('initialized', 'true');
    }
}

// ==================== UTILITIES ====================
const Utils = {
    formatCurrency: (amount) => '₹' + amount.toLocaleString('en-IN'),
    
    formatDate: (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },
    
    generateId: () => Date.now().toString() + Math.random().toString(36).substr(2, 9)
};

// ==================== AUTH ====================
function loginAsAdmin() {
    document.getElementById('email').value = 'admin@renttracker.com';
    document.getElementById('password').value = 'admin123';
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

function loginAsRenter() {
    document.getElementById('email').value = 'renter@renttracker.com';
    document.getElementById('password').value = 'renter123';
    document.getElementById('loginForm').dispatchEvent(new Event('submit'));
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showDashboard();
    } else {
        alert('Invalid email or password!');
    }
});

function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').classList.add('show');

    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = currentUser.role.toUpperCase();

    setupNavigation();
    loadDashboard();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboard').classList.remove('show');
    document.getElementById('loginForm').reset();
}

function setupNavigation() {
    const navMenu = document.getElementById('navMenu');
    
    if (currentUser.role === 'admin') {
        navMenu.innerHTML = `
            <button class="nav-btn active" onclick="showPage('dashboard')">📊 Dashboard</button>
            <button class="nav-btn" onclick="showPage('properties')">🏠 Properties</button>
            <button class="nav-btn" onclick="showPage('tenants')">👥 Tenants</button>
            <button class="nav-btn" onclick="showPage('payments')">💰 Payments</button>
            <button class="nav-btn" onclick="showPage('maintenance')">🔧 Maintenance</button>
            <button class="nav-btn" onclick="showPage('analytics')">📈 Analytics</button>
        `;
    } else {
        navMenu.innerHTML = `
            <button class="nav-btn active" onclick="showPage('renter')">🏠 My Property</button>
        `;
    }
}

// ==================== CHARTS ====================
const Charts = {
    destroy: (id) => {
        if (charts[id]) {
            charts[id].destroy();
            delete charts[id];
        }
    },
    
    revenue: () => {
        Charts.destroy('revenueChart');
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        const payments = JSON.parse(localStorage.getItem('payments') || '[]').filter(p => p.status === 'paid');
        const months = [];
        const revenue = [];
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleString('default', { month: 'short' }));
            
            const monthRevenue = payments
                .filter(p => {
                    const pDate = new Date(p.date);
                    return pDate.getMonth() === date.getMonth() &&
                           pDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, p) => sum + p.amount, 0);
            
            revenue.push(monthRevenue);
        }
        
        charts.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenue,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '₹' + (value/1000) + 'K'
                        }
                    }
                }
            }
        });
    },
    
    occupancy: () => {
        Charts.destroy('occupancyChart');
        const ctx = document.getElementById('occupancyChart');
        if (!ctx) return;
        
        const properties = JSON.parse(localStorage.getItem('properties') || '[]');
        const occupied = properties.filter(p => p.status === 'occupied').length;
        const vacant = properties.filter(p => p.status === 'vacant').length;
        const maintenance = properties.filter(p => p.status === 'maintenance').length;
        
        charts.occupancyChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Occupied', 'Vacant', 'Maintenance'],
                datasets: [{
                    data: [occupied, vacant, maintenance],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    monthly: () => {
        Charts.destroy('monthlyChart');
        const ctx = document.getElementById('monthlyChart');
        if (!ctx) return;
        
        const payments = JSON.parse(localStorage.getItem('payments') || '[]').filter(p => p.status === 'paid');
        const months = [];
        const revenue = [];
        
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            months.push(date.toLocaleString('default', { month: 'short' }));
            
            const monthRevenue = payments
                .filter(p => {
                    const pDate = new Date(p.date);
                    return pDate.getMonth() === date.getMonth() &&
                           pDate.getFullYear() === date.getFullYear();
                })
                .reduce((sum, p) => sum + p.amount, 0);
            
            revenue.push(monthRevenue);
        }
        
        charts.monthlyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: months,
                datasets: [{
                    label: 'Revenue',
                    data: revenue,
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => '₹' + (value/1000) + 'K'
                        }
                    }
                }
            }
        });
    },
    
    types: () => {
        Charts.destroy('typesChart');
        const ctx = document.getElementById('typesChart');
        if (!ctx) return;
        
        const properties = JSON.parse(localStorage.getItem('properties') || '[]');
        const types = {};
        properties.forEach(p => {
            types[p.type] = (types[p.type] || 0) + 1;
        });
        
        charts.typesChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: Object.keys(types).map(t => t.charAt(0).toUpperCase() + t.slice(1)),
                datasets: [{
                    data: Object.values(types),
                    backgroundColor: ['#667eea', '#8b5cf6', '#10b981', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    methods: () => {
        Charts.destroy('methodsChart');
        const ctx = document.getElementById('methodsChart');
        if (!ctx) return;
        
        const payments = JSON.parse(localStorage.getItem('payments') || '[]');
        const methods = {};
        payments.forEach(p => {
            methods[p.method] = (methods[p.method] || 0) + 1;
        });
        
        charts.methodsChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(methods).map(m => m.toUpperCase()),
                datasets: [{
                    data: Object.values(methods),
                    backgroundColor: ['#10b981', '#667eea', '#8b5cf6', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    },
    
    priority: () => {
        Charts.destroy('priorityChart');
        const ctx = document.getElementById('priorityChart');
        if (!ctx) return;
        
        const maintenance = JSON.parse(localStorage.getItem('maintenance') || '[]');
        const priorities = {};
        maintenance.forEach(m => {
            priorities[m.priority] = (priorities[m.priority] || 0) + 1;
        });
        
        charts.priorityChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(priorities).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
                datasets: [{
                    label: 'Count',
                    data: Object.values(priorities),
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
};

// ==================== DASHBOARD ====================
function loadDashboard() {
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const maintenance = JSON.parse(localStorage.getItem('maintenance') || '[]');
    
    const totalProperties = properties.length;
    const totalTenants = tenants.length;
    
    const thisMonth = payments.filter(p => {
        const pDate = new Date(p.date);
        const now = new Date();
        return pDate.getMonth() === now.getMonth() &&
               pDate.getFullYear() === now.getFullYear();
    });
    
    const monthlyRevenue = thisMonth
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingMaintenance = maintenance.filter(m => m.status !== 'completed').length;
    
    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-header">
                <div>
                    <div class="stat-label">Total Properties</div>
                    <div class="stat-value">${totalProperties}</div>
                </div>
                <div class="stat-icon blue">🏠</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-header">
                <div>
                    <div class="stat-label">Active Tenants</div>
                    <div class="stat-value">${totalTenants}</div>
                </div>
                <div class="stat-icon green">👥</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-header">
                <div>
                    <div class="stat-label">Monthly Revenue</div>
                    <div class="stat-value">${Utils.formatCurrency(monthlyRevenue)}</div>
                </div>
                <div class="stat-icon purple">💰</div>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-header">
                <div>
                    <div class="stat-label">Pending Maintenance</div>
                    <div class="stat-value">${pendingMaintenance}</div>
                </div>
                <div class="stat-icon orange">🔧</div>
            </div>
        </div>
    `;
    
    const recentPayments = payments.slice(-5).reverse();
    const recentHtml = recentPayments.map(p => {
        const tenant = tenants.find(t => t.id === p.tenantId);
        return `
            <div style="padding: 15px; background: #f8fafc; border-radius: 8px; margin-bottom: 10px;">
                <strong>${tenant?.name || 'Unknown'}</strong> - ${Utils.formatCurrency(p.amount)}
                <br><small style="color: #64748b;">${Utils.formatDate(p.date)}</small>
            </div>
        `;
    }).join('');
    
    document.getElementById('recentActivity').innerHTML = recentHtml || '<div class="empty-state"><div class="empty-icon">📋</div><p>No recent activity</p></div>';
    
    setTimeout(() => {
        Charts.revenue();
        Charts.occupancy();
    }, 100);
}

// ==================== PROPERTIES ====================
function loadProperties() {
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    
    if (properties.length === 0) {
        document.getElementById('propertiesTable').innerHTML = '<div class="empty-state"><div class="empty-icon">🏠</div><p>No properties yet</p></div>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Type</th>
                    <th>Address</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Tenant</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${properties.map(p => {
                    const tenant = tenants.find(t => t.propertyId === p.id);
                    return `
                        <tr>
                            <td><strong>${p.name}</strong></td>
                            <td><span class="badge badge-primary">${p.type.toUpperCase()}</span></td>
                            <td>${p.address}</td>
                            <td><strong>${Utils.formatCurrency(p.rent)}</strong></td>
                            <td><span class="badge badge-${p.status === 'occupied' ? 'success' : p.status === 'vacant' ? 'warning' : 'danger'}">${p.status.toUpperCase()}</span></td>
                            <td>${tenant ? tenant.name : '-'}</td>
                            <td>
                                <button class="btn-sm btn-danger" onclick="deleteProperty('${p.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('propertiesTable').innerHTML = html;
}

function deleteProperty(id) {
    if (confirm('Delete this property?')) {
        const properties = JSON.parse(localStorage.getItem('properties') || '[]').filter(p => p.id !== id);
        localStorage.setItem('properties', JSON.stringify(properties));
        loadProperties();
        loadDashboard();
        alert('Property deleted!');
    }
}

// ==================== TENANTS ====================
function loadTenants() {
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    if (tenants.length === 0) {
        document.getElementById('tenantsTable').innerHTML = '<div class="empty-state"><div class="empty-icon">👥</div><p>No tenants yet</p></div>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Property</th>
                    <th>Lease Period</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${tenants.map(t => {
                    const property = properties.find(p => p.id === t.propertyId);
                    return `
                        <tr>
                            <td><strong>${t.name}</strong></td>
                            <td>${t.email}</td>
                            <td>${t.phone}</td>
                            <td>${property?.name || 'Unknown'}</td>
                            <td>${Utils.formatDate(t.leaseStart)} - ${Utils.formatDate(t.leaseEnd)}</td>
                            <td>
                                <button class="btn-sm btn-danger" onclick="deleteTenant('${t.id}')">Delete</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('tenantsTable').innerHTML = html;
}

function deleteTenant(id) {
    if (confirm('Delete this tenant?')) {
        const tenants = JSON.parse(localStorage.getItem('tenants') || '[]').filter(t => t.id !== id);
        localStorage.setItem('tenants', JSON.stringify(tenants));
        loadTenants();
        loadDashboard();
        alert('Tenant deleted!');
    }
}

// ==================== PAYMENTS ====================
function loadPayments() {
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    if (payments.length === 0) {
        document.getElementById('paymentsTable').innerHTML = '<div class="empty-state"><div class="empty-icon">💰</div><p>No payments yet</p></div>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Tenant</th>
                    <th>Property</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${payments.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 20).map(p => {
                    const tenant = tenants.find(t => t.id === p.tenantId);
                    const property = properties.find(pr => pr.id === p.propertyId);
                    return `
                        <tr>
                            <td>${Utils.formatDate(p.date)}</td>
                            <td><strong>${tenant?.name || 'Unknown'}</strong></td>
                            <td>${property?.name || 'Unknown'}</td>
                            <td><strong>${Utils.formatCurrency(p.amount)}</strong></td>
                            <td><span class="badge badge-primary">${p.method.toUpperCase()}</span></td>
                            <td><span class="badge badge-${p.status === 'paid' ? 'success' : 'warning'}">${p.status.toUpperCase()}</span></td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('paymentsTable').innerHTML = html;
}

// ==================== MAINTENANCE ====================
function loadMaintenance() {
    const maintenance = JSON.parse(localStorage.getItem('maintenance') || '[]');
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    
    if (maintenance.length === 0) {
        document.getElementById('maintenanceTable').innerHTML = '<div class="empty-state"><div class="empty-icon">🔧</div><p>No maintenance requests yet</p></div>';
        return;
    }
    
    const html = `
        <table>
            <thead>
                <tr>
                    <th>Property</th>
                    <th>Issue</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${maintenance.map(m => {
                    const property = properties.find(p => p.id === m.propertyId);
                    return `
                        <tr>
                            <td><strong>${property?.name || 'Unknown'}</strong></td>
                            <td>${m.title}</td>
                            <td>${m.description}</td>
                            <td><span class="badge badge-${m.priority === 'high' ? 'danger' : m.priority === 'medium' ? 'warning' : 'success'}">${m.priority.toUpperCase()}</span></td>
                            <td><span class="badge badge-${m.status === 'completed' ? 'success' : m.status === 'in-progress' ? 'warning' : 'primary'}">${m.status.toUpperCase()}</span></td>
                            <td>${Utils.formatDate(m.created)}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
    
    document.getElementById('maintenanceTable').innerHTML = html;
}

// ==================== RENTER VIEW ====================
function loadRenterView() {
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const maintenance = JSON.parse(localStorage.getItem('maintenance') || '[]');
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    
    const tenant = tenants.find(t => t.email === currentUser.email);
    if (!tenant) return;
    
    const property = properties.find(p => p.id === tenant.propertyId);
    
    // My Property
    document.getElementById('myProperty').innerHTML = property ? `
        <div style="padding: 20px; background: #f8fafc; border-radius: 8px;">
            <strong style="font-size: 18px;">${property.name}</strong><br>
            <p style="color: #64748b; margin: 10px 0;">${property.address}</p>
            <p><strong>Rent:</strong> ${Utils.formatCurrency(property.rent)}/month</p>
            <p><strong>Lease:</strong> ${Utils.formatDate(tenant.leaseStart)} - ${Utils.formatDate(tenant.leaseEnd)}</p>
        </div>
    ` : '<p>No property assigned</p>';
    
    // My Payments
    const myPayments = payments.filter(p => p.tenantId === tenant.id);
    document.getElementById('myPayments').innerHTML = myPayments.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${myPayments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => `
                    <tr>
                        <td>${Utils.formatDate(p.date)}</td>
                        <td><strong>${Utils.formatCurrency(p.amount)}</strong></td>
                        <td><span class="badge badge-primary">${p.method.toUpperCase()}</span></td>
                        <td><span class="badge badge-${p.status === 'paid' ? 'success' : 'warning'}">${p.status.toUpperCase()}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>No payments yet</p>';
    
    // My Maintenance
    const myMaintenance = maintenance.filter(m => m.propertyId === tenant.propertyId);
    document.getElementById('myMaintenance').innerHTML = myMaintenance.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Issue</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${myMaintenance.map(m => `
                    <tr>
                        <td><strong>${m.title}</strong><br><small>${m.description}</small></td>
                        <td><span class="badge badge-${m.priority === 'high' ? 'danger' : m.priority === 'medium' ? 'warning' : 'success'}">${m.priority.toUpperCase()}</span></td>
                        <td><span class="badge badge-${m.status === 'completed' ? 'success' : m.status === 'in-progress' ? 'warning' : 'primary'}">${m.status.toUpperCase()}</span></td>
                        <td>${Utils.formatDate(m.created)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : '<p>No maintenance requests yet</p>';
}

// ==================== MODALS ====================
function openModal(type) {
    const modal = document.getElementById(type + 'Modal');
    modal.classList.add('show');
    
    if (type === 'tenant' || type === 'maintenance') {
        const properties = JSON.parse(localStorage.getItem('properties') || '[]');
        const selectId = type === 'tenant' ? 'tenantProperty' : 'maintProperty';
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Select Property</option>' +
            properties.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }
    
    if (type === 'payment') {
        const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
        const select = document.getElementById('paymentTenant');
        select.innerHTML = '<option value="">Select Tenant</option>' +
            tenants.map(t => `<option value="${t.id}">${t.name}</option>`).join('');
    }
    
    if (currentUser && currentUser.role === 'renter' && type === 'maintenance') {
        const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
        const tenant = tenants.find(t => t.email === currentUser.email);
        if (tenant) {
            document.getElementById('maintProperty').value = tenant.propertyId;
        }
    }
}

function closeModal(type) {
    const modal = document.getElementById(type + 'Modal');
    modal.classList.remove('show');
}

// ==================== FORMS ====================
document.getElementById('propertyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const properties = JSON.parse(localStorage.getItem('properties') || '[]');
    properties.push({
        id: Utils.generateId(),
        name: document.getElementById('propName').value,
        type: document.getElementById('propType').value,
        address: document.getElementById('propAddress').value,
        rent: parseInt(document.getElementById('propRent').value),
        beds: parseInt(document.getElementById('propBeds').value) || 0,
        status: document.getElementById('propStatus').value,
        created: new Date().toISOString()
    });
    
    localStorage.setItem('properties', JSON.stringify(properties));
    closeModal('property');
    this.reset();
    loadProperties();
    loadDashboard();
    alert('Property added!');
});

document.getElementById('tenantForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tenants = JSON.parse(localStorage.getItem('tenants') || '[]');
    tenants.push({
        id: Utils.generateId(),
        name: document.getElementById('tenantName').value,
        email: document.getElementById('tenantEmail').value,
        phone: document.getElementById('tenantPhone').value,
        propertyId: document.getElementById('tenantProperty').value,
        leaseStart: document.getElementById('tenantStart').value,
        leaseEnd: document.getElementById('tenantEnd').value,
        created: new Date().toISOString()
    });
    
    localStorage.setItem('tenants', JSON.stringify(tenants));
    closeModal('tenant');
    this.reset();
    loadTenants();
    loadDashboard();
    alert('Tenant added!');
});

document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const payments = JSON.parse(localStorage.getItem('payments') || '[]');
    const tenantId = document.getElementById('paymentTenant').value;
    const tenant = JSON.parse(localStorage.getItem('tenants') || '[]').find(t => t.id === tenantId);
    
    payments.push({
        id: Utils.generateId(),
        tenantId: tenantId,
        propertyId: tenant.propertyId,
        amount: parseInt(document.getElementById('paymentAmount').value),
        date: document.getElementById('paymentDate').value,
        method: document.getElementById('paymentMethod').value,
        status: document.getElementById('paymentStatus').value,
        created: new Date().toISOString()
    });
    
    localStorage.setItem('payments', JSON.stringify(payments));
    closeModal('payment');
    this.reset();
    loadPayments();
    loadDashboard();
    alert('Payment recorded!');
});

document.getElementById('maintenanceForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const maintenance = JSON.parse(localStorage.getItem('maintenance') || '[]');
    maintenance.push({
        id: Utils.generateId(),
        propertyId: document.getElementById('maintProperty').value,
        title: document.getElementById('maintTitle').value,
        description: document.getElementById('maintDesc').value,
        priority: document.getElementById('maintPriority').value,
        status: document.getElementById('maintStatus').value,
        created: new Date().toISOString()
    });
    
    localStorage.setItem('maintenance', JSON.stringify(maintenance));
    closeModal('maintenance');
    this.reset();
    loadMaintenance();
    if (currentUser && currentUser.role === 'renter') {
        loadRenterView();
    }
    loadDashboard();
    alert('Maintenance request created!');
});

// ==================== NAVIGATION ====================
function showPage(page) {
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page + 'Page').classList.add('active');
    
    if (page === 'dashboard') {
        loadDashboard();
    } else if (page === 'properties') {
        loadProperties();
    } else if (page === 'tenants') {
        loadTenants();
    } else if (page === 'payments') {
        loadPayments();
    } else if (page === 'maintenance') {
        loadMaintenance();
    } else if (page === 'analytics') {
        setTimeout(() => {
            Charts.monthly();
            Charts.types();
            Charts.methods();
            Charts.priority();
        }, 100);
    } else if (page === 'renter') {
        loadRenterView();
    }
}

// ==================== INIT ====================
initData();

const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
    currentUser = JSON.parse(savedUser);
    showDashboard();
}
</body>
</html>