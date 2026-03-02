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

// ===== ELEMENTS =====
const messages = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const usersList = document.getElementById("usersList");
const userCount = document.getElementById("userCount");
const notifSound = document.getElementById("notifSound");

// ===== CURRENT ROOM =====
let currentRoom = document.body.dataset.room || "home";

// ===== AUTH STATE & BANNED CHECK =====
auth.onAuthStateChanged(async user => {
  if (!user) {
    window.location = "index.html"; // redirect if not logged in
    return;
  }

  // Check if banned
  const bannedDoc = await db.collection("bannedUsers").doc(user.uid).get();
  if (bannedDoc.exists) {
    alert("You are banned from this chat!");
    auth.signOut();
    return;
  }

  // Add to online users
  db.collection("onlineUsers").doc(user.uid).set({ email: user.email });

  // Load messages & online users
  loadMessages();
  loadUsers();
});

// ===== SEND MESSAGE =====
function sendMessage() {
  if (!msgInput || msgInput.value.trim() === "") return;

  const user = auth.currentUser;
  if (!user) return;

  // Check if banned before sending
  db.collection("bannedUsers").doc(user.uid).get().then(doc => {
    if (doc.exists) {
      alert("You are banned and cannot send messages.");
      msgInput.value = "";
      return;
    }

    db.collection("messages").add({
      sender: user.email,
      text: msgInput.value,
      room: currentRoom,
      time: Date.now()
    });

    notifSound?.play();
    msgInput.value = "";
  });
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

// ===== ADD EMOJI =====
function addEmoji(emoji) {
  if (msgInput) msgInput.value += emoji;
}

// ===== PRIVATE DM =====
function openDM() {
  let userEmail = prompt("Enter email to DM:");
  if (!userEmail) return;

  currentRoom = "DM_" + auth.currentUser.email + "_" + userEmail;
  const roomTitle = document.getElementById("roomTitle");
  if (roomTitle) roomTitle.innerText = "DM with " + userEmail;

  loadMessages();
}

// ===== VOICE RECORDING (placeholder) =====
function recordVoice() {
  alert("Voice feature coming next upgrade 😈");
}

// ===== ROOM SWITCHING (for index.html sidebar) =====
function switchRoom(room) {
  currentRoom = room;
  const roomTitle = document.getElementById("roomTitle");
  if (roomTitle) roomTitle.innerText = room.toUpperCase();
  loadMessages()====
function logout() {
  const user = auth.currentUser;
  if (user) {
    db.collection("onlineUsers").doc(user.uid).delete();
    auth.signOut();
    window.location = "index.html";
  }
}

// ===== STARFIELD ANIMATION (optional for index.html) =====
const canvas = document.getElementById("stars");
if (canvas) {
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
}
