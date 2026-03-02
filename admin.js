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

const ADMIN_EMAIL = "techmaveric2511@gmail.com";

// ===== LOGIN FUNCTION =====
function loginAdmin() {
  const email = document.getElementById("adminEmail").value;
  const password = document.getElementById("adminPassword").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      if (auth.currentUser.email !== ADMIN_EMAIL) {
        document.getElementById("loginError").innerText = "Access Denied. Admin Only.";
        auth.signOut();
        return;
      }

      document.getElementById("loginDiv").style.display = "none";
      document.getElementById("adminContent").style.display = "block";

      loadStats();
      loadOnlineUsers();
      loadAllMessages();
    })
    .catch(err => {
      document.getElementById("loginError").innerText = err.message;
    });
}

// ===== LOAD STATS =====
function loadStats() {
  db.collection("users").get().then(snap => {
    document.getElementById("totalUsers").innerText = snap.size;
  });
  db.collection("messages").get().then(snap => {
    document.getElementById("totalMessages").innerText = snap.size;
  });
  db.collection("onlineUsers").onSnapshot(snap => {
    document.getElementById("onlineUsersCount").innerText = snap.size;
  });
}

// ===== LOAD ONLINE USERS =====
function loadOnlineUsers() {
  db.collection("onlineUsers").onSnapshot(snap => {
    const div = document.getElementById("onlineUsersList");
    div.innerHTML = "";
    snap.forEach(doc => {
      const d = document.createElement("div");
      d.innerText = doc.data().email;
      div.appendChild(d);
    });
  });
}

// ===== LOAD ALL MESSAGES =====
function loadAllMessages() {
  db.collection("messages").orderBy("time").onSnapshot(snap => {
    const div = document.getElementById("allMessages");
    div.innerHTML = "";
    snap.forEach(doc => {
      const data = doc.data();
      const m = document.createElement("div");
      m.innerHTML = `<b>${data.sender}</b> [${data.room}]: ${data.text}`;
      div.appendChild(m);
      div.scrollTop = div.scrollHeight;
    });
  });
}

// ===== BAN USER =====
function banUser() {
  const email = document.getElementById("banEmail").value;
  if (!email) return alert("Enter email to ban");

  // Find user by email in users collection
  db.collection("users").where("email", "==", email).get().then(snap => {
    if (snap.empty) return alert("User not found");

    snap.forEach(doc => {
      db.collection("bannedUsers").doc(doc.id).set({ email });
      alert(`User ${email} banned successfully`);
    });
  });
}

// ===== LOGOUT =====
function logoutAdmin() {
  auth.signOut().then(() => location.reload());
}
