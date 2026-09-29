const API_URL = 'http://localhost:3000/api/expenses';
let allExpenses = []; 

const alertContainer = document.getElementById('alert-container');
const spinner = document.getElementById('loading-spinner');
const table = document.getElementById('expense-table');
const tableBody = document.getElementById('table-body');
const addForm = document.getElementById('add-form');
const editForm = document.getElementById('edit-form');
const filterCategory = document.getElementById('filter-category');
const exportBtn = document.getElementById('btn-export');

const editModal = new bootstrap.Modal(document.getElementById('editModal'));

function showAlert(message) {
    alertContainer.textContent = message;
    alertContainer.classList.remove('d-none');
    window.scrollTo(0, 0);
}

function hideAlert() {
    alertContainer.classList.add('d-none');
}

async function fetchExpenses() {
    hideAlert();
    spinner.classList.remove('d-none');
    table.classList.add('d-none');

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to connect to the server.');
        
        allExpenses = await response.json();
        
        updateSummaryCards(allExpenses);
        renderTable();
        
        spinner.classList.add('d-none');
        table.classList.remove('d-none');
    } catch (error) {
        console.error("THE REAL ERROR IS:", error);
        spinner.classList.add('d-none');
        showAlert("Cannot reach the server. Make sure your backend is running.");
    }
}

function updateSummaryCards(expenses) {
    const total = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    const highest = expenses.length > 0 ? Math.max(...expenses.map(exp => Number(exp.amount))) : 0;

    document.getElementById('summary-total').textContent = `$${total.toFixed(2)}`;
    document.getElementById('summary-count').textContent = expenses.length;
    document.getElementById('summary-highest').textContent = `$${highest.toFixed(2)}`;
}

// Render Table with Filtering
function renderTable() {
    tableBody.innerHTML = '';
    const filter = filterCategory.value;

    const filteredExpenses = filter === 'All' 
        ? allExpenses 
        : allExpenses.filter(exp => exp.category === filter);

    const badgeColors = {
        'Food': 'bg-success',
        'Transport': 'bg-primary',
        'Bills': 'bg-warning text-dark',
        'Entertainment': 'bg-info',
        'Other': 'bg-secondary'
    };

    filteredExpenses.forEach(expense => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${expense.title}</td>
            <td>${Number(expense.amount).toFixed(2)}</td>
            <td><span class="badge ${badgeColors[expense.category]}">${expense.category}</span></td>
            <td>${expense.date.split('T')[0]}</td>
        `;

        const actionTd = document.createElement('td');
        
        // Use Flexbox to guarantee right-alignment and spacing
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'd-flex justify-content-end gap-2';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-sm btn-outline-secondary';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => openEditModal(expense);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-sm btn-outline-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteExpense(expense.id);

        buttonContainer.append(editBtn, deleteBtn);
        actionTd.appendChild(buttonContainer);
        tr.appendChild(actionTd);
        tableBody.appendChild(tr);
    });
}

addForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const newExpense = {
        title: document.getElementById('add-title').value.trim(),
        amount: Number(document.getElementById('add-amount').value),
        category: document.getElementById('add-category').value,
        date: document.getElementById('add-date').value
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExpense)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Validation failed');
        }

        addForm.reset();
        await fetchExpenses();
    } catch (error) {
        showAlert(`Error adding expense: ${error.message}`);
    }
});

async function deleteExpense(id) {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    hideAlert();

    try {
        const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        
        if (!response.ok) throw new Error('Failed to delete.');
        
        await fetchExpenses();
    } catch (error) {
        showAlert(`Error deleting expense: ${error.message}`);
    }
}

function openEditModal(expense) {
    document.getElementById('edit-id').value = expense.id;
    document.getElementById('edit-title').value = expense.title;
    document.getElementById('edit-amount').value = expense.amount;
    document.getElementById('edit-category').value = expense.category;
    document.getElementById('edit-date').value = expense.date;
    
    editModal.show();
}

editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const id = document.getElementById('edit-id').value;
    const updatedExpense = {
        title: document.getElementById('edit-title').value.trim(),
        amount: Number(document.getElementById('edit-amount').value),
        category: document.getElementById('edit-category').value,
        date: document.getElementById('edit-date').value
    };

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedExpense)
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Update failed');
        }

        editModal.hide();
        await fetchExpenses();
    } catch (error) {
        showAlert(`Error updating expense: ${error.message}`);
    }
});

exportBtn.addEventListener('click', () => {
    if (allExpenses.length === 0) {
        showAlert("No expenses to export.");
        return;
    }

    let csvContent = "ID,Title,Amount,Category,Date\n";

    allExpenses.forEach(exp => {
        const safeTitle = `"${exp.title.replace(/"/g, '""')}"`;
        csvContent += `${exp.id},${safeTitle},${exp.amount},${exp.category},${exp.date}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "expense_tracker.csv");
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
});

filterCategory.addEventListener('change', renderTable);

// Initial Load
fetchExpenses();