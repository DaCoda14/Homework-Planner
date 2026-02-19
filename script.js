// FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyAjpXwX1gjSbjqqsEyOyzrEZs0PitdzJyw",
  authDomain: "homework-planner-67833.firebaseapp.com",
  projectId: "homework-planner-67833",
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();


// REGISTER
function register(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.createUserWithEmailAndPassword(email,password)
    .catch(error => {
        document.getElementById("error").innerText = error.message;
    });
}

// LOGIN
function login(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email,password)
    .catch(error => {
        document.getElementById("error").innerText = error.message;
    });
}

// LOGOUT
function logout(){
    auth.signOut();
}

// AUTH STATE LISTENER
auth.onAuthStateChanged(user=>{
    if(user){
        document.getElementById("login-screen").style.display="none";
        document.getElementById("app").style.display="block";
        loadTasks();
    }else{
        document.getElementById("login-screen").style.display="flex";
        document.getElementById("app").style.display="none";
    }
});

// ADD TASK
function addTask(){
    const text = document.getElementById("taskInput").value;
    const subject = document.getElementById("subject").value;
    const due = document.getElementById("dueDay").value;

    if(!text) return;

    db.collection("tasks").add({
        uid: auth.currentUser.uid,
        text: text,
        subject: subject,
        due: due
    });

    document.getElementById("taskInput").value="";
}

// LOAD TASKS
function loadTasks(){
    db.collection("tasks")
    .where("uid","==",auth.currentUser.uid)
    .onSnapshot(snapshot=>{
        const board = document.getElementById("board");
        board.innerHTML="";

        snapshot.forEach(doc=>{
            const task = doc.data();

            const note = document.createElement("div");
            note.className = "note " + task.subject.toLowerCase();

            note.innerHTML = `
                ${task.text}<br>
                <small>Due: ${task.due}</small>
            `;

            board.appendChild(note);
        });
    });
}


