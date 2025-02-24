// Theme Management
const themeToggleBtn = document.getElementById('themeToggleBtn');
const currentTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.toggle('light', currentTheme === 'light');

function updateThemeButton() {
  themeToggleBtn.textContent = document.body.classList.contains('light') 
    ? 'Switch to Dark' 
    : 'Switch to Light';
}
updateThemeButton();

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
  localStorage.setItem('theme', document.body.classList.contains('light') ? 'light' : 'dark');
  updateThemeButton();
});

// Task Manager
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'today';

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function formatDate(date) {
    return new Date(date).toISOString().split('T')[0];
}

function getDateStrings() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    return {
        today: formatDate(today),
        tomorrow: formatDate(tomorrow)
    };
}

function renderTasks() {
    const { today, tomorrow } = getDateStrings();
    const taskGrid = document.getElementById('taskGrid');
    taskGrid.innerHTML = '<div class="grid-header">Date</div><div class="grid-header">Task</div><div class="grid-header">Priority</div><div class="grid-header">Status</div><div class="grid-header">Actions</div>';

    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'today') return task.date === today;
        if (currentFilter === 'tomorrow') return task.date === tomorrow;
        return true;
    }).sort((a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (a.date === b.date) return a.priority.localeCompare(b.priority);
        return (a.date > b.date) ? 1 : -1;
    });

    filteredTasks.forEach((task) => {
        const originalIndex = tasks.indexOf(task); // Get original index
        const { date, description, priority, done } = task;
        const dateObj = new Date(date);
        const isToday = date === today;
        const isTomorrow = date === tomorrow;

        const rowClasses = [];
        if (isToday) rowClasses.push('today-highlight');
        if (isTomorrow) rowClasses.push('tomorrow-highlight');

        // Create cells
        const cells = [
            { label: 'Date', value: date || 'No date' },
            { label: 'Task', value: description },
            { label: 'Priority', value: priority },
            { label: 'Status', value: done ? '✓' : '✗' },
            { label: 'Actions', value: 'Delete' }
        ];

        cells.forEach((cell, cellIndex) => {
            const div = document.createElement('div');
            div.className = `grid-cell ${rowClasses.join(' ')}`;
            div.setAttribute('data-label', cell.label);

            if (cellIndex === 0) {
                div.textContent = dateObj.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                });
            } else if (cellIndex === 1) {
                div.addEventListener('click', () => editTask(originalIndex)); // Use original index
                div.textContent = description;
                div.style.cursor = 'pointer';
            } else if (cellIndex === 2) {
                const priorityDot = document.createElement('span');
                priorityDot.className = `priority-indicator priority-${priority.toLowerCase()}`;
                div.appendChild(priorityDot);
                div.appendChild(document.createTextNode(priority));
            } else if (cellIndex === 3) {
                const toggle = document.createElement('span');
                toggle.className = 'toggle-icon';
                toggle.textContent = done ? '✓' : '✗';
                toggle.style.color = done ? '#2ecc71' : '#e74c3c';
                toggle.onclick = () => toggleStatus(originalIndex); // Use original index
                div.appendChild(toggle);
            } else if (cellIndex === 4) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.textContent = 'Delete';
                deleteBtn.onclick = () => deleteTask(originalIndex); // Use original index
                div.appendChild(deleteBtn);
            }

            taskGrid.appendChild(div);
        });
    });
}

function addTask(description, date, priority) {
  if (!description.trim()) return;
  tasks.push({
    description: description.trim(),
    date,
    priority,
    done: false
  });
  saveTasks();
  renderTasks();
}

function toggleStatus(index) {
  tasks[index].done = !tasks[index].done;
  saveTasks();
  renderTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  renderTasks();
}

function editTask(index) {
  const cell = document.querySelectorAll(`[data-label="Task"]`)[index];
  const input = document.createElement('input');
  input.className = 'editable-input';
  input.value = tasks[index].description;
  cell.innerHTML = '';
  cell.appendChild(input);
  input.focus();

  input.addEventListener('blur', () => {
    tasks[index].description = input.value.trim();
    saveTasks();
    renderTasks();
  });

  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') input.blur();
  });
}

// Event Listeners
document.getElementById('addTaskBtn').addEventListener('click', () => {
  const taskInput = document.getElementById('taskInput');
  const dateInput = document.getElementById('taskDateInput');
  const prioritySelect = document.getElementById('prioritySelect');
  addTask(taskInput.value, dateInput.value, prioritySelect.value);
  taskInput.value = '';
  dateInput.value = '';
});

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

document.getElementById('clearCompletedBtn').addEventListener('click', () => {
  tasks = tasks.filter(task => !task.done);
  saveTasks();
  renderTasks();
});

// Initial Render
renderTasks();
