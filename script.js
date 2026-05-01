document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');
    const emptyState = document.getElementById('emptyState');

    // Load tasks from local storage
    let tasks = JSON.parse(localStorage.getItem('catStarTodoTasks')) || [];

    // Initialize
    renderTasks();

    // Event Listeners
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    function saveTasks() {
        localStorage.setItem('catStarTodoTasks', JSON.stringify(tasks));
        updateEmptyState();
    }

    function updateEmptyState() {
        if (tasks.length === 0) {
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
        }
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        // Sort tasks: Important uncompleted first, then uncompleted, then completed
        const sortedTasks = [...tasks].sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            if (a.important && !b.important) return -1;
            if (!a.important && b.important) return 1;
            return b.id - a.id; // Newest first for same category
        });

        sortedTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} ${task.important ? 'important' : ''}`;
            li.dataset.id = task.id;

            li.innerHTML = `
                <div class="task-checkbox-label" onclick="toggleComplete(${task.id})">
                    <i class="fa-solid fa-paw"></i>
                </div>
                <span class="task-text">${escapeHTML(task.text)}</span>
                <div class="task-actions">
                    <button class="btn-icon btn-star ${task.important ? 'active' : ''}" onclick="toggleImportant(${task.id})" aria-label="Important">
                        <i class="fa-solid fa-star"></i>
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteTask(${task.id})" aria-label="Delete">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });
        
        updateEmptyState();
    }

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false,
            important: false
        };

        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        taskInput.value = '';
        taskInput.focus();
    }

    window.toggleComplete = function(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    };

    window.toggleImportant = function(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, important: !task.important };
            }
            return task;
        });
        saveTasks();
        renderTasks();
    };

    window.deleteTask = function(id) {
        // Find element to add popOut animation before removing
        const li = document.querySelector(`li[data-id="${id}"]`);
        if (li) {
            li.style.animation = 'popOut 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
            setTimeout(() => {
                tasks = tasks.filter(task => task.id !== id);
                saveTasks();
                renderTasks();
            }, 300);
        } else {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks();
        }
    };

    // Utility to prevent XSS
    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag])
        );
    }
});
