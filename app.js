// =============================
// 🔥 FIREBASE CONFIG (YOURS)
// =============================

const firebaseConfig = {
  apiKey: "AIzaSyArbnk6rVI_wRPQibYx1DRKUlEJr19JQ_w",
  authDomain: "class8-discord-acfcf.firebaseapp.com",
  projectId: "class8-discord-acfcf",
  storageBucket: "class8-discord-acfcf.appspot.com",
  messagingSenderId: "1017298929493",
  appId: "1:1017298929493:web:15c30c79b46a020dbbd1dc",
  measurementId: "G-XEVRSZVM66"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// 🔥 YOUR ADMIN EMAIL
const ADMIN_EMAIL = "techmaveric2511@gmail.com";

let currentRoom = "home";


// =============================
// 🔐 REGISTER
// =============================
function register(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const file = document.getElementById("profilePic").files[0];

  auth.createUserWithEmailAndPassword(email, password)
  .then(userCredential => {

    if(file){
      const ref = storage.ref("profilePics/" + userCredential.user.uid);
      ref.put(file).then(()=>{
        ref.getDownloadURL().then(url=>{
          db.collection("users").doc(userCredential.user.uid).set({
            email: email,
            photo: url,
            warnings:0
          });
        });
      });
    } else {
      db.collection("users").doc(userCredential.user.uid).set({
        email: email,
        photo: "",
        warnings:0
      });
    }

  })
  .catch(error=>{
    document.getElementById("errorMsg").innerText = error.message;
  });
}


// =============================
// 🔑 LOGIN
// =============================
function loginUser(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
  .catch(error=>{
    document.getElementById("errorMsg").innerText = error.message;
  });
}


// =============================
// 🚪 LOGOUT
// =============================
function logout(){
  if(auth.currentUser){
    db.collection("onlineUsers").doc(auth.currentUser.uid).delete();
  }
  auth.signOut();
}


// =============================
// 👀 AUTH STATE
// =============================
auth.onAuthStateChanged(user=>{
  if(user){

    // 🔴 Check if banned
    db.collection("bannedUsers").doc(user.uid).get().then(doc=>{
      if(doc.exists){
        alert("You are banned.");
        auth.signOut();
        return;
      }
    });

    document.getElementById("loginDiv").style.display="none";
    document.getElementById("chatDiv").style.display="block";

    db.collection("onlineUsers").doc(user.uid).set({
      email:user.email
    });

    loadUsers();
    loadMessages();
  } else {
    document.getElementById("loginDiv").style.display="block";
    document.getElementById("chatDiv").style.display="none";
  }
});


// =============================
// 🔁 SWITCH ROOM
// =============================
function switchRoom(room){
  currentRoom = room;
  document.getElementById("roomTitle").innerText = room.toUpperCase();
  loadMessages();
}


// =============================
// 💬 LOAD MESSAGES
// =============================
function loadMessages(){
  db.collection("messages")
  .where("room","==",currentRoom)
  .orderBy("time")
  .onSnapshot(snapshot=>{
    const messagesDiv = document.getElementById("messages");
    messagesDiv.innerHTML="";

    snapshot.forEach(doc=>{
      const data = doc.data();

      let div = document.createElement("div");
      div.className="msg";

      div.innerHTML = "<b>"+data.sender+"</b>: "+(data.text || "");

      // 📷 Image preview
      if(data.fileUrl){
        if(data.fileType && data.fileType.startsWith("image")){
          div.innerHTML += "<br><img src='"+data.fileUrl+"' style='max-width:200px;border-radius:8px;'>";
        } else {
          div.innerHTML += "<br><a href='"+data.fileUrl+"' target='_blank'>📎 View File</a>";
        }
      }

      // 🔥 Admin delete
      if(auth.currentUser.email === ADMIN_EMAIL){
        let del = document.createElement("span");
        del.innerText="  [Delete]";
        del.style.color="red";
        del.style.cursor="pointer";
        del.onclick=()=> db.collection("messages").doc(doc.id).delete();
        div.appendChild(del);
      }

      messagesDiv.appendChild(div);
    });

    document.getElementById("notifSound").play();
  });
}


// =============================
// 📤 SEND MESSAGE
// =============================
function sendMessage(){
  const msg = document.getElementById("msgInput").value;
  if(msg==="") return;

  db.collection("messages").add({
    sender: auth.currentUser.email,
    text: msg,
    room: currentRoom,
    time: Date.now()
  });

  document.getElementById("msgInput").value="";
}


// =============================
// 📎 FILE UPLOAD
// =============================
function uploadFile(file){
  if(!file) return;

  const ref = storage.ref("chatFiles/" + Date.now()+"_"+file.name);

  ref.put(file).then(()=>{
    ref.getDownloadURL().then(url=>{
      db.collection("messages").add({
        sender: auth.currentUser.email,
        text:"",
        fileUrl:url,
        fileType:file.type,
        room:currentRoom,
        time:Date.now()
      });
    });
  });
}


// =============================
// 👥 LOAD USERS
// =============================
function loadUsers(){
  db.collection("onlineUsers").onSnapshot(snapshot=>{
    const usersDiv = document.getElementById("usersList");
    usersDiv.innerHTML="";

    snapshot.forEach(doc=>{
      const data = doc.data();
      let div = document.createElement("div");

      div.innerHTML = data.email + " <span class='green-dot'></span>";

      // 🛑 Admin right click warning system
      if(auth.currentUser.email === ADMIN_EMAIL){
        div.oncontextmenu = function(e){
          e.preventDefault();

          db.collection("users").doc(doc.id).get().then(userDoc=>{
            let warnings = userDoc.data().warnings + 1;

            db.collection("users").doc(doc.id).update({
              warnings:warnings
            });

            if(warnings >= 3){
              db.collection("bannedUsers").doc(doc.id).set({
                email:data.email
              });
              db.collection("onlineUsers").doc(doc.id).delete();
              alert("User permanently banned.");
            } else {
              alert("Warning "+warnings+"/3 given.");
            }
          });
        }
      }

      usersDiv.appendChild(div);
    });
  });
}
