// Global variables
let token = localStorage.getItem('token');
let currentUser = null;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const expenseManagement = document.getElementById('expenseManagement');
const authButtons = document.getElementById('authButtons');
const userInfo = document.getElementById('userInfo');
const usernameDisplay = document.getElementById('username');
const expensesList = document.getElementById('expensesList');

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    if (token) {
        showExpenseManagement();
    }
});

// Auth Form Display Functions
function showLoginForm() {
    loginForm.classList.remove('d-none');
    registerForm.classList.add('d-none');
}

function showRegisterForm() {
    registerForm.classList.remove('d-none');
    loginForm.classList.add('d-none');
}

function hideAuthForms() {
    loginForm.classList.add('d-none');
    registerForm.classList.add('d-none');
}

// Auth Functions
async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
        const response = await fetch('/api/auth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        token = data.access_token;
        localStorage.setItem('token', token);
        currentUser = username;
        usernameDisplay.textContent = username;
        
        hideAuthForms();
        showExpenseManagement();
        loadExpenses();
    } catch (error) {
        alert('Login failed. Please check your credentials.');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const email = document.getElementById('registerEmail').value;
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, username, password }),
        });

        if (!response.ok) {
            throw new Error('Registration failed');
        }

        alert('Registration successful! Please login.');
        showLoginForm();
    } catch (error) {
        alert('Registration failed. Please try again.');
    }
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    authButtons.classList.remove('d-none');
    userInfo.classList.add('d-none');
    expenseManagement.classList.add('d-none');
}

// Expense Management Functions
function showExpenseManagement() {
    authButtons.classList.add('d-none');
    userInfo.classList.remove('d-none');
    expenseManagement.classList.remove('d-none');
}

async function loadExpenses() {
    try {
        const response = await fetch('/api/expenses/', {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load expenses');
        }

        const expenses = await response.json();
        displayExpenses(expenses);
    } catch (error) {
        alert('Failed to load expenses. Please try again.');
    }
}

function displayExpenses(expenses) {
    expensesList.innerHTML = '';
    expenses.forEach(expense => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(expense.date).toLocaleDateString()}</td>
            <td>${expense.title}</td>
            <td>${expense.category}</td>
            <td>$${expense.amount.toFixed(2)}</td>
            <td>${expense.description || ''}</td>
            <td class="action-buttons">
                <button class="btn btn-sm btn-outline-primary" onclick="editExpense(${expense.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteExpense(${expense.id})">Delete</button>
            </td>
        `;
        expensesList.appendChild(row);
    });
}

async function handleAddExpense(event) {
    event.preventDefault();
    const title = document.getElementById('expenseTitle').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;
    const description = document.getElementById('expenseDescription').value;

    const expenseData = {
        title,
        amount,
        category,
        date,
        description,
    };

    console.log('Sending expense data:', expenseData);

    try {
        const response = await fetch('/api/expenses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(expenseData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(errorData.detail || 'Failed to add expense');
        }

        const result = await response.json();
        console.log('Success:', result);
        event.target.reset();
        loadExpenses();
    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Failed to add expense. Please try again.');
    }
}

async function deleteExpense(id) {
    if (!confirm('Are you sure you want to delete this expense?')) {
        return;
    }

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to delete expense');
        }

        loadExpenses();
    } catch (error) {
        alert('Failed to delete expense. Please try again.');
    }
}

async function editExpense(id) {
    try {
        const response = await fetch(`/api/expenses/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to load expense');
        }

        const expense = await response.json();
        populateEditForm(expense);
    } catch (error) {
        alert('Failed to load expense details. Please try again.');
    }
}

function populateEditForm(expense) {
    document.getElementById('expenseTitle').value = expense.title;
    document.getElementById('expenseAmount').value = expense.amount;
    document.getElementById('expenseCategory').value = expense.category;
    document.getElementById('expenseDate').value = expense.date.split('T')[0];
    document.getElementById('expenseDescription').value = expense.description || '';

    // Change form submit handler to update instead of create
    const form = document.querySelector('#expenseManagement form');
    form.onsubmit = async (event) => {
        event.preventDefault();
        await updateExpense(expense.id, event);
    };
}

async function updateExpense(id, event) {
    const title = document.getElementById('expenseTitle').value;
    const amount = parseFloat(document.getElementById('expenseAmount').value);
    const category = document.getElementById('expenseCategory').value;
    const date = document.getElementById('expenseDate').value;
    const description = document.getElementById('expenseDescription').value;

    try {
        const response = await fetch(`/api/expenses/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
                title,
                amount,
                category,
                date,
                description,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update expense');
        }

        event.target.reset();
        // Reset form submit handler to create
        const form = document.querySelector('#expenseManagement form');
        form.onsubmit = handleAddExpense;
        loadExpenses();
    } catch (error) {
        alert('Failed to update expense. Please try again.');
    }
} 