// --- Firebase config ---
const firebaseConfig = {
  apiKey: "AIzaSyAjpXwX1gjSbjqqsEyOyzrEZs0PitdzJyw",
  authDomain: "homework-planner-67833.firebaseapp.com",
  projectId: "homework-planner-67833",
  storageBucket: "homework-planner-67833.firebasestorage.app",
  messagingSenderId: "232685955399",
  appId: "1:232685955399:web:6fb675b79b7cd87ec04462",
  measurementId: "G-LSNP65LMFN"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let tasks = [];

// --- Login/Register ---
function registerUser(email, password){
  auth.createUserWithEmailAndPassword(email,password)
    .then(userCredential => {
      alert("Registered!");
      showPlanner(userCredential.user.email);
      saveTasks();
    })
    .catch(err=>alert(err.message));
}

function loginUser(email, password){
  auth.signInWithEmailAndPassword(email,password)
    .then(userCredential=>{
      alert("Logged in!");
      showPlanner(userCredential.user.email);
      loadTasks();
    })
    .catch(err=>alert(err.message));
}

// Show planner page
function showPlanner(email){
  document.getElementById("loginPage").style.display="none";
  document.getElementById("plannerPage").style.display="block";
  document.getElementById("usernameDisplay").innerText = "Hi, "+email;
}

// --- Load tasks from Firestore ---
function loadTasks(){
  const uid = auth.currentUser.uid;
  db.collection("users").doc(uid).get().then(doc=>{
    if(doc.exists){
      tasks = doc.data().tasks || [];
    } else {
      tasks=[];
      db.collection("users").doc(uid).set({tasks:[]});
    }
    showTasks();
  });
}

// --- Save tasks to Firestore ---
function saveTasks(){
  const uid = auth.currentUser.uid;
  db.collection("users").doc(uid).set({tasks});
}

// --- Add task ---
function addTask(){
  const text = document.getElementById("taskInput").value.trim();
  if(!text) return;
  const subject = document.getElementById("subject");
  const color = subject.options[subject.selectedIndex].dataset.color;
  const priority = document.getElementById("priority").value;
  const due = document.getElementById("dueDate").value;
  const task = {text,color,priority,dueDate:due?new Date(due).toDateString():null};
  tasks.push(task);
  document.getElementById("taskInput").value="";
  document.getElementById("dueDate").value="";
  saveTasks();
  showTasks();
}

// --- Delete task ---
function deleteTask(i){
  tasks.splice(i,1);
  saveTasks();
  showTasks();
}

// --- Double tap edit ---
function addDoubleTapListener(el,callback){
  let lastTap=0;
  el.addEventListener("touchend",()=>{
    const now=new Date().getTime();
    if(now-lastTap<300 && now-lastTap>0) callback();
    lastTap=now;
  });
  el.addEventListener("dblclick",callback);
}

// --- Day of week ---
function getDayOfWeek(dateStr){
  if(!dateStr) return "No due";
  return new Date(dateStr).toLocaleDateString(undefined,{weekday:"long"});
}

// --- Show tasks ---
function showTasks(){
  const container=document.getElementById("taskContainer");
  container.innerHTML="";
  tasks.forEach((task,index)=>{
    const card=document.createElement("div");
    card.className="task-card";
    card.style.background=task.color;
    card.draggable=true;
    const icon=task.priority==="high"?"⚠️ ":"";
    const due=getDayOfWeek(task.dueDate);
    card.innerHTML=`<button class="delete-btn" onclick="deleteTask(${index})">X</button>
                    <strong>${icon}${task.text}</strong>
                    <small>Due: ${due}</small>`;
    container.appendChild(card);

    const textEl=card.querySelector("strong");
    addDoubleTapListener(textEl,()=>{
      const newText=prompt("Edit task:",task.text);
      if(newText && newText.trim()!==""){task.text=newText.trim();saveTasks();showTasks();}
    });

    // Drag & drop
    card.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",index);card.style.opacity="0.5";card.classList.add("dragging");});
    card.addEventListener("dragend",e=>{card.style.opacity="1";card.classList.remove("dragging");});
    card.addEventListener("dragover",e=>e.preventDefault());
    card.addEventListener("drop",e=>{
      e.preventDefault();
      const from=parseInt(e.dataTransfer.getData("text/plain"));
      if(from===index) return;
      const moved=tasks.splice(from,1)[0];
      tasks.splice(index,0,moved);
      saveTasks();
      showTasks();
    });
  });
}

// --- Dark mode ---
function toggleDarkMode(){document.body.classList.toggle("dark");}
if(localStorage.getItem("darkMode")==="true") document.body.classList.add("dark");


