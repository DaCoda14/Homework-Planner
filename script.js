let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let username = localStorage.getItem("username");

// Ask for username if not set
if (!username) {
    username = prompt("Enter your name:");
    localStorage.setItem("username", username);
}
document.getElementById("usernameDisplay").innerText = "Hi, " + username;

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

// Add a new task
function addTask() {
    const text = document.getElementById("taskInput").value.trim();
    const subjectSelect = document.getElementById("subject");
    const color = subjectSelect.options[subjectSelect.selectedIndex].dataset.color;
    const prioritySelect = document.getElementById("priority");
    const priority = prioritySelect.value;

    if (!text) return;

    const task = { text, color, priority };
    tasks.push(task);
    document.getElementById("taskInput").value = "";
    saveTasks();
    showTasks();
}

// Delete a task
function deleteTask(index) {
    tasks.splice(index, 1);
    saveTasks();
    showTasks();
}

// Double-tap detection (mobile) and double-click (desktop)
function addDoubleTapListener(element, callback) {
    let lastTap = 0;
    element.addEventListener('touchend', () => {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 300 && tapLength > 0) {
            callback();
        }
        lastTap = currentTime;
    });
    element.addEventListener('dblclick', callback);
}

// Show all tasks
function showTasks() {
    const container = document.getElementById("taskContainer");
    container.innerHTML = "";

    tasks.forEach((task, index) => {
        const card = document.createElement("div");
        card.className = "task-card";
        card.style.background = task.color;
        card.draggable = true;

        const priorityIcon = task.priority === "high" ? "⚠️ " : "";
        card.innerHTML = `
            <button class="delete-btn" onclick="deleteTask(${index})">X</button>
            <strong>${priorityIcon}${task.text}</strong>
        `;
        container.appendChild(card);

        // Double-tap / double-click to edit
        const textEl = card.querySelector("strong");
        addDoubleTapListener(textEl, () => {
            const newText = prompt("Edit task:", task.text);
            if (newText !== null && newText.trim() !== "") {
                task.text = newText.trim();
                saveTasks();
                showTasks();
            }
        });

        // Drag & drop
        card.addEventListener("dragstart", e => {
            e.dataTransfer.setData("text/plain", index);
            card.style.opacity = "0.5";
            card.classList.add("dragging"); // scale-up effect
        });
        card.addEventListener("dragend", e => {
            card.style.opacity = "1";
            card.classList.remove("dragging");
        });
        card.addEventListener("dragover", e => e.preventDefault());
        card.addEventListener("drop", e => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
            const toIndex = index;
            if (fromIndex === toIndex) return;
            const moved = tasks.splice(fromIndex, 1)[0];
            tasks.splice(toIndex, 0, moved);
            saveTasks();
            showTasks();
        });
    });
}

// Toggle dark mode
function toggleDarkMode() {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkMode", document.body.classList.contains("dark"));
}
if (localStorage.getItem("darkMode") === "true") {
    document.body.classList.add("dark");
}

// Initialize tasks display
showTasks();
