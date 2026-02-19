let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

showTasks();

function addTask() {
    let input = document.getElementById("taskInput");
    let taskText = input.value;

    if(taskText === "") return;

    tasks.push(taskText);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    input.value = "";
    showTasks();
}

function showTasks() {
    let list = document.getElementById("taskList");
    list.innerHTML = "";

    for(let i = 0; i < tasks.length; i++) {
        list.innerHTML += "<li>" + tasks[i] + "</li>";
    }
}

