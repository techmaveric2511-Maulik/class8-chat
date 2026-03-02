// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyArbnk6rVI_wRPQibYx1DRKUlEJr19JQ_w",
  authDomain: "class8-discord-acfcf.firebaseapp.com",
  projectId: "class8-discord-acfcf",
  storageBucket: "class8-discord-acfcf.appspot.com",
  messagingSenderId: "1017298929493",
  appId: "1:1017298929493:web:15c30c79b46a020dbbd1dc"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let currentRoom = "home";

// ===== AUTH FUNCTIONS =====
function register() {
  auth.createUserWithEmailAndPassword(email.value, password.value);
}

function loginUser() {
  auth.signInWithEmailAndPassword(email.value, password.value);
}

function logout() {
  auth.signOut();
}

auth.onAuthStateChanged(user => {
  if (user) {
    loginDiv.style.display = "none";
    chatDiv.style.display = "block";

    db.collection("onlineUsers").doc(user.uid).set({
      email: user.email
    });

    loadUsers();
    loadMessages();
  }
});

// ===== CHAT ROOM FUNCTIONS =====
function switchRoom(room) {
  currentRoom = room;
  roomTitle.innerText = room.toUpperCase();
  loadMessages();
}

function sendMessage() {
  if (msgInput.value === "") return;

  db.collection("messages").add({
    sender: auth.currentUser.email,
    text: msgInput.value,
    room: currentRoom,
    time: Date.now()
  });

  document.getElementById("notifSound").play();
  msgInput.value = "";
}

function loadMessages() {
  db.collection("messages")
    .where("room", "==", currentRoom)
    .orderBy("time")
    .onSnapshot(snapshot => {
      messages.innerHTML = "";
      snapshot.forEach(doc => {
        let data = doc.data();
        let div = document.createElement("div");
        div.className = "msg " + (data.sender === auth.currentUser.email ? "self" : "other");
        div.innerHTML = "<b>" + data.sender + "</b><br>" + data.text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
      });
    });
}

function loadUsers() {
  db.collection("onlineUsers").onSnapshot(snapshot => {
    usersList.innerHTML = "";
    userCount.innerText = snapshot.size;

    snapshot.forEach(doc => {
      let div = document.createElement("div");
      div.innerHTML = doc.data().email + "<span class='green-dot'></span>";
      usersList.appendChild(div);
    });
  });
}

// ===== UTILITY =====
function addEmoji(emoji) {
  msgInput.value += emoji;
}

// ===== PRIVATE DM =====
function openDM() {
  let user = prompt("Enter email to DM:");
  if (!user) return;
  currentRoom = "DM_" + auth.currentUser.email + "_" + user;
  roomTitle.innerText = "DM with " + user;
  loadMessages();
}

// ===== VOICE RECORDING (Placeholder) =====
function recordVoice() {
  alert("Voice feature coming next upgrade 😈");
}

// ===== STARFIELD ANIMATION =====
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let stars = [];
for (let i = 0; i < 200; i++) {
  stars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, size: Math.random() * 2 });
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
    s.y += 0.5;
    if (s.y > canvas.height) s.y = 0;
  });
  requestAnimationFrame(animateStars);
}
animateStars();
