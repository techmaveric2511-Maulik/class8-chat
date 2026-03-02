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

// ===== WAIT FOR DOM =====
document.addEventListener("DOMContentLoaded", () => {

  const messagesEl = document.getElementById("messages");
  const msgInput = document.getElementById("msgInput");
  const usersList = document.getElementById("usersList");
  const userCount = document.getElementById("userCount");
  const roomTitle = document.getElementById("roomTitle");

  if(!messagesEl || !msgInput) return; // Non-chat pages

  // ===== CURRENT ROOM =====
  let currentRoom = document.body.dataset.room || "home";
  if(roomTitle) roomTitle.innerText = currentRoom.toUpperCase();

  // ===== AUTH =====
  auth.onAuthStateChanged(user => {
    if(!user){
      window.location = "index.html";
      return;
    }

    // Add user to online
    db.collection("onlineUsers").doc(user.uid).set({email:user.email});
    // Remove on disconnect
    window.addEventListener('beforeunload', ()=> db.collection("onlineUsers").doc(user.uid).delete());

    loadUsers();
    loadMessages();
  });

  // ===== SEND MESSAGE =====
  window.sendMessage = function(){
    const msg = msgInput.value.trim();
    if(!msg) return;

    db.collection("messages").add({
      sender: auth.currentUser.email,
      text: msg,
      room: currentRoom,
      time: Date.now()
    });

    document.getElementById("notifSound")?.play();
    msgInput.value = "";
  }

  // ===== LOAD MESSAGES =====
  function loadMessages(){
    db.collection("messages")
      .where("room","==",currentRoom)
      .orderBy("time")
      .onSnapshot(snapshot=>{
        messagesEl.innerHTML="";
        snapshot.forEach(doc=>{
          let data = doc.data();
          let div = document.createElement("div");
          div.className = "msg " + (data.sender===auth.currentUser.email?"self":"other");
          div.innerHTML = `<b>${data.sender}</b><br>${data.text}`;
          messagesEl.appendChild(div);
          messagesEl.scrollTop = messagesEl.scrollHeight;
        });
      });
  }

  // ===== ONLINE USERS =====
  function loadUsers(){
    db.collection("onlineUsers").onSnapshot(snapshot=>{
      if(!usersList || !userCount) return;
      usersList.innerHTML="";
      userCount.innerText = snapshot.size;
      snapshot.forEach(doc=>{
        const div = document.createElement("div");
        div.innerHTML = doc.data().email + "<span class='green-dot'></span>";
        usersList.appendChild(div);
      });
    });
  }

  // ===== SWITCH ROOM =====
  window.switchRoom = function(room){
    currentRoom = room;
    if(roomTitle) roomTitle.innerText = room.toUpperCase();
    loadMessages();
  }

  // ===== EMOJI & VOICE =====
  window.addEmoji = function(emoji){ msgInput.value += emoji; }
  window.recordVoice = function(){ alert("Voice coming soon 😎"); }

  // ===== PRIVATE DM =====
  window.openDM = function(){
    let user = prompt("Enter email to DM:");
    if(!user) return;
    currentRoom = "DM_" + [auth.currentUser.email,user].sort().join("_");
    if(roomTitle) roomTitle.innerText = "DM with " + user;
    loadMessages();
  }

  // ===== LOGOUT =====
  window.logout = function(){
    db.collection("onlineUsers").doc(auth.currentUser.uid).delete();
    auth.signOut();
    window.location="index.html";
  }

  // ===== STARFIELD (if exists) =====
  const canvas = document.getElementById("stars");
  if(canvas){
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let stars = [];
    for(let i=0;i<200;i++) stars.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,size:Math.random()*2});

    function animateStars(){
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle="white";
      stars.forEach(s=>{
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
        ctx.fill();
        s.y+=0.5;
        if(s.y>canvas.height) s.y=0;
      });
      requestAnimationFrame(animateStars);
    }
    animateStars();
  }

});
