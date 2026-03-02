// 🔥 SAME FIREBASE CONFIG
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

// 🔐 Check if admin
auth.onAuthStateChanged(user=>{
  if(!user){
    window.location = "index.html";
    return;
  }

  if(user.email !== ADMIN_EMAIL){
    document.getElementById("notAdmin").innerText =
      "Access Denied. Admin Only.";
    return;
  }

  document.getElementById("adminContent").style.display="block";

  loadStats();
  loadBannedUsers();
});

// 📊 Load Statistics
function loadStats(){

  db.collection("users").get().then(snapshot=>{
    document.getElementById("totalUsers").innerText = snapshot.size;
  });

  db.collection("messages").get().then(snapshot=>{
    document.getElementById("totalMessages").innerText = snapshot.size;
  });

  db.collection("onlineUsers").onSnapshot(snapshot=>{
    document.getElementById("onlineUsersCount").innerText = snapshot.size;
  });
}

// 🚫 Load Banned Users
function loadBannedUsers(){
  db.collection("bannedUsers").onSnapshot(snapshot=>{
    const bannedDiv = document.getElementById("bannedList");
    bannedDiv.innerHTML = "";

    snapshot.forEach(doc=>{
      const div = document.createElement("div");
      div.innerHTML = doc.data().email;
      bannedDiv.appendChild(div);
    });
  });
}
