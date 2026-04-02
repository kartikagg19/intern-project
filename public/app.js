const API_URL = '/api';

// DOM Elements
const authView = document.getElementById('auth-view');
const dashView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');

let token = localStorage.getItem('token');
let user = JSON.parse(localStorage.getItem('user') || 'null');

// Initialize
if (token && user) {
  showDashboard();
}

// Event Listeners
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.textContent = '';
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    token = data.token;
    user = data.user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    showDashboard();
  } catch (err) {
    loginError.textContent = err.message || 'Login failed';
  }
});

logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  token = null;
  user = null;
  dashView.style.display = 'none';
  authView.style.display = 'flex';
});

function showDashboard() {
  authView.style.display = 'none';
  dashView.style.display = 'block';
  document.getElementById('user-info').textContent = `${user.email} (${user.role})`;
  
  loadDashboardData();
}

async function fetchWithAuth(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (res.status === 401 || res.status === 403) {
    logoutBtn.click();
    throw new Error('Unauthorized');
  }
  return res.json();
}

async function loadDashboardData() {
  try {
    // 1. Fetch Summary
    const summary = await fetchWithAuth('/dashboard/summary');
    document.getElementById('stat-income').textContent = `$${summary.income.toLocaleString()}`;
    document.getElementById('stat-expense').textContent = `$${summary.expense.toLocaleString()}`;
    document.getElementById('stat-balance').textContent = `$${summary.balance.toLocaleString()}`;

    // 2. Fetch Recent Transactions
    const recordsObj = await fetchWithAuth('/records?limit=6');
    const records = recordsObj.data; // paginated structure
    const txList = document.getElementById('transaction-list');
    txList.innerHTML = '';
    
    records.forEach(r => {
      const el = document.createElement('div');
      el.className = 'tx-item';
      const isIncome = r.type === 'INCOME';
      const dateStr = new Date(r.date).toLocaleDateString();
      el.innerHTML = `
        <div class="tx-icon ${isIncome ? 'income-bg' : 'expense-bg'}">
          <span class="material-icons">${isIncome ? 'arrow_upward' : 'arrow_downward'}</span>
        </div>
        <div class="tx-details">
          <h4>${r.category}</h4>
          <span>${dateStr}</span>
        </div>
        <div class="tx-amount ${isIncome ? 'pos' : 'neg'}">
          ${isIncome ? '+' : '-'}$${r.amount.toLocaleString()}
        </div>
      `;
      txList.appendChild(el);
    });

    // 3. Fetch Category Breakdown
    const categories = await fetchWithAuth('/dashboard/category-totals');
    const catList = document.getElementById('category-list');
    catList.innerHTML = '';
    
    // Calculate total for percentage
    const totalVol = categories.reduce((s, c) => s + c.total, 0);

    categories.forEach(c => {
      const el = document.createElement('div');
      el.className = 'cat-item';
      const pct = Math.round((c.total / totalVol) * 100) || 0;
      el.innerHTML = `
        <div class="cat-header">
          <span>${c.category} <small>(${c.type})</small></span>
          <strong>$${c.total.toLocaleString()}</strong>
        </div>
        <div class="progress-bg">
          <div class="progress-bar ${c.type === 'INCOME' ? 'bg-success' : 'bg-danger'}" style="width: ${pct}%"></div>
        </div>
      `;
      catList.appendChild(el);
    });
    
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  }
}
