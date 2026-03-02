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

// ===== ROOM DETECTION =====
let currentRoom = document.body.dataset.room || "home";

// ===== ELEMENTS =====
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");

// ===== AUTH STATE =====
auth.onAuthStateChanged(user => {
  if (!user) {
    // redirect to login page if not logged in
    window.location = "index.html";
    return;
  }

  loadMessages();
  loadUsers();
});

// ===== SEND MESSAGE =====
function sendMessage() {
  if (!msgInput || msgInput.value.trim() === "") return;

  db.collection("messages").add({
    sender: auth.currentUser.email,
    text: msgInput.value,
    room: currentRoom,
    time: Date.now()
  });

  document.getElementById("notifSound")?.play();
  msgInput.value = "";
}

// ===== LOAD MESSAGES =====
function loadMessages() {
  if (!messages) return;

  db.collection("messages")
    .where("room", "==", currentRoom)
    .orderBy("time")
    .onSnapshot(snapshot => {
      messages.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.className = "msg " + (data.sender === auth.currentUser.email ? "self" : "other");
        div.innerHTML = `<b>${data.sender}</b><br>${data.text}`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
      });
    });
}

// ===== LOAD ONLINE USERS =====
function loadUsers() {
  const usersList = document.getElementById("usersList");
  const userCount = document.getElementById("userCount");
  if (!usersList || !userCount) return;

  db.collection("onlineUsers").onSnapshot(snapshot => {
    usersList.innerHTML = "";
    userCount.innerText = snapshot.size;
    snapshot.forEach(doc => {
      const div = document.createElement("div");
      div.innerHTML = doc.data().email + "<span class='green-dot'></span>";
      usersList.appendChild(div);
    });
  });
}
