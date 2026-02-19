let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let username = localStorage.getItem("username");

// Prompt for username if not set
if (!username) {
    username = prompt("Enter your name:");
    localStorage.setItem("username", username);
}
document.getElementById("usernameDisplay").innerText = "Hi, " + username;

// Ask permission for notifications
if ('Notification' in window) {
    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add task function
function addTask() {
    let text = document.getElementById("taskInput").value.trim();
    let date = document.getElementById("dueDate").value;

    if (text === "") return;

    let dueTime = date ? new Date(date).getTime() : null;

    let newTask = { text: text, due: date, done: false, dueTime: dueTime, notified: false };
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

// Toggle task done
function toggleDone(index) {
    tasks[index].done = !tasks[index].done;
    saveTasks();
    showTasks();
    updateChart();
}

// Show tasks on page
function showTasks() {
    const container = document.getElementById("taskContainer");
    container.innerHTML = "";

    tasks.forEach((task, index) => {
        const card = document.createElement("div");
        card.className = "task-card";
        if (document.body.classList.contains("dark")) card.classList.add("dark");

        card.innerHTML = `
            <button class="delete-btn" onclick="deleteTask(${index})">X</button>
            <input type="checkbox" ${task.done ? "checked" : ""} onclick="toggleDone(${index})">
            <strong>${task.text}</strong>
            <small>Due: ${task.due || "No date"}</small>
        `;

        container.appendChild(card);
    });
}


// Notifications when task added
function notifyTask(task) {
    if (Notification.permission === 'granted') {
        new Notification("Homework Reminder!", {
            body: `Don't forget: ${task.text} (Due: ${task.due || "No date"})`,
            icon: "icon-192.png"
        });
    }
}

// Notifications for tasks that are due
function notifyDue(task) {
    if (Notification.permission === 'granted') {
        new Notification("Homework Due!", {
            body: `${task.text} is due today!`,
            icon: "icon-192.png"
        });
    }
}

// Check every minute for due tasks
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
}, 60000); // check every 60 seconds

// Dark mode toggle
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// Chart for progress stats
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
        options: {
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// Initialize app
showTasks();
updateChart();

