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

// ===== WAIT FOR DOM =====
document.addEventListener("DOMContentLoaded", () => {

  const notAdmin = document.getElementById("notAdmin");
  const adminContent = document.getElementById("adminContent");
  const totalUsersEl = document.getElementById("totalUsers");
  const totalMessagesEl = document.getElementById("totalMessages");
  const onlineUsersCountEl = document.getElementById("onlineUsersCount");
  const bannedListEl = document.getElementById("bannedList");

  // ===== AUTH CHECK =====
  auth.onAuthStateChanged(user => {
    if(!user){
      window.location="index.html";
      return;
    }

    if(user.email !== ADMIN_EMAIL){
      notAdmin.innerText = "Access Denied. Admin Only.";
      return;
    }

    adminContent.style.display = "flex";

    loadStats();
    loadBannedUsers();
    loadOnlineUsersSidebar();
  });

  // ===== LOAD STATS =====
  function loadStats(){
    db.collection("users").get().then(snapshot=>{
      totalUsersEl.innerText = snapshot.size;
    });

    db.collection("messages").get().then(snapshot=>{
      totalMessagesEl.innerText = snapshot.size;
    });

    db.collection("onlineUsers").onSnapshot(snapshot=>{
      onlineUsersCountEl.innerText = snapshot.size;
    });
  }

  // ===== BANNED USERS =====
  function loadBannedUsers(){
    db.collection("bannedUsers").onSnapshot(snapshot=>{
      bannedListEl.innerHTML="";
      snapshot.forEach(doc=>{
        const div = document.createElement("div");
        div.innerText = doc.data().email;
        bannedListEl.appendChild(div);
      });
    });
  }

  // ===== ONLINE USERS IN SIDEBAR =====
  function loadOnlineUsersSidebar(){
    const usersList = document.getElementById("usersList");
    const userCount = document.getElementById("userCount");
    if(!usersList || !userCount) return;

    db.collection("onlineUsers").onSnapshot(snapshot=>{
      usersList.innerHTML="";
      userCount.innerText = snapshot.size;
      snapshot.forEach(doc=>{
        const div = document.createElement("div");
        div.innerHTML = doc.data().email + "<span class='green-dot'></span>";
        usersList.appendChild(div);
      });
    });
  }

  // ===== LOGOUT =====
  window.logout = function(){
    if(auth.currentUser){
      db.collection("onlineUsers").doc(auth.currentUser.uid).delete();
      auth.signOut();
      window.location="index.html";
    }
  }

});
