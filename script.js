let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let username = localStorage.getItem("username");
let grid; // Muuri grid instance

if (!username) {
    username = prompt("Enter your name:");
    localStorage.setItem("username", username);
}
document.getElementById("usernameDisplay").innerText = "Hi, " + username;

// Request notification permission
if ('Notification' in window) {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

// Save tasks
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add task
function addTask() {
    let text = document.getElementById("taskInput").value.trim();
    let date = document.getElementById("dueDate").value;
    let subjectSelect = document.getElementById("subject");
    let subject = subjectSelect.value;
    let color = subjectSelect.options[subjectSelect.selectedIndex].dataset.color;
    let prioritySelect = document.getElementById("priority");
    let priority = prioritySelect.value;

    if (text === "") return;

    let dueTime = date ? new Date(date).getTime() : null;

    let newTask = { text, due: date, done: false, dueTime, notified: false, subject, color, priority };
    tasks.push(newTask);

    document.getElementById("taskInput").value = "";
    document.getElementById("dueDate").value = "";

    saveTasks();
    showTasks();
    updateChart();
    notifyTask(newTask);
}

// Delete task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    showTasks();
    updateChart();
}

// Toggle done
function toggleDone(index) {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    showTasks();
    updateChart();
}

// Show tasks as sticky notes
function showTasks(filteredTasks) {
    const displayTasks = filteredTasks || tasks;
    const container = document.getElementById("taskContainer");
    container.innerHTML = "";

    displayTasks.forEach((task, index) => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.style.background = task.color;
        if (document.body.classList.contains("dark")) card.classList.add("dark");

        let priorityIcon = task.priority === "high" ? "⚠️ " : "";

        card.innerHTML = `
            <button class="delete-btn" onclick="deleteTask(${index})">X</button>
            <input type="checkbox" ${task.done ? "checked" : ""} onclick="toggleDone(${index})">
            <strong>${priorityIcon}${task.text}</strong>
            <small>Due: ${task.due || "No date"}</small>
        `;
        container.appendChild(card);

        // DOUBLE-CLICK TO EDIT
        const taskText = card.querySelector("strong");
        taskText.addEventListener("dblclick", () => {
            const newText = prompt("Edit task:", task.text);
            if (newText !== null && newText.trim() !== "") {
                task.text = newText.trim();
                saveTasks();
                showTasks();
                updateChart();
            }
        });
    });

    // Initialize Muuri grid if not already done
    if (!grid) {
        grid = new Muuri('.grid', { dragEnabled: true, layoutOnInit: true, dragSort: true });
        grid.on('dragEnd', savePositions);
    } else {
        grid.refreshItems().layout();
    }

    // Restore saved order if it exists
    const savedOrder = JSON.parse(localStorage.getItem('taskOrder') || '[]');
    if (savedOrder.length) {
        const items = grid.getItems();
        savedOrder.forEach((oldIndex, newIndex) => {
            if (items[oldIndex]) grid.move(items[oldIndex], newIndex);
        });
        grid.layout(true);
    }
}

// Save sticky note positions
function savePositions() {
    const order = grid.getItems().map(item => {
        return Array.from(document.getElementById('taskContainer').children).indexOf(item.getElement());
    });
    localStorage.setItem('taskOrder', JSON.stringify(order));
}

// Notifications
function notifyTask(task) {
    if (Notification.permission === 'granted') {
        new Notification("Homework Reminder!", {
            body: `Don't forget: ${task.text} (Due: ${task.due || "No date"})`,
            icon: "icon-192.png"
        });
    }
}

function notifyDue(task) {
    if (Notification.permission === 'granted') {
        new Notification("Homework Due!", {
            body: `${task.text} is due today!`,
            icon: "icon-192.png"
        });
    }
}

// Check due tasks every minute
setInterval(() => {
    const now = Date.now();
    tasks.forEach(task => {
        if (task.done || !task.dueTime) return;
        if (!task.notified && now >= task.dueTime) {
            notifyDue(task);
            task.notified = true;
            saveTasks();
        }
    });
}, 60000);

// Dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// Sorting & filtering
function sortTasksByDue() {
    tasks.sort((a,b) => {
        if(!a.due) return 1;
        if(!b.due) return -1;
        return new Date(a.due) - new Date(b.due);
    });
    showTasks();
}

function filterIncomplete() {
    showTasks(tasks.filter(t => !t.done));
}

function showAllTasks() {
    showTasks();
}

// Progress chart
function updateChart() {
    const completed = tasks.filter(t => t.done).length;
    const remaining = tasks.length - completed;
    const ctx = document.getElementById('progressChart').getContext('2d');

    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'Remaining'],
            datasets: [{
                data: [completed, remaining],
                backgroundColor: ['#4e73df', '#1cc88a']
            }]
        },
        options: { plugins: { legend: { position: 'bottom' } } }
    });
}

// Initialize
showTasks();
updateChart();
