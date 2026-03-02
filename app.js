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

let currentRoom="home";

function register(){
auth.createUserWithEmailAndPassword(email.value,password.value);
}

function loginUser(){
auth.signInWithEmailAndPassword(email.value,password.value);
}

function logout(){
auth.signOut();
}

auth.onAuthStateChanged(user=>{
if(user){
loginDiv.style.display="none";
chatDiv.style.display="block";

db.collection("onlineUsers").doc(user.uid).set({
email:user.email
});

loadUsers();
loadMessages();
}
});

function switchRoom(room){
currentRoom=room;
roomTitle.innerText=room.toUpperCase();
loadMessages();
}

function sendMessage(){
if(msgInput.value==="") return;

db.collection("messages").add({
sender:auth.currentUser.email,
text:msgInput.value,
room:currentRoom,
time:Date.now()
});

document.getElementById("notifSound").play();
msgInput.value="";
}

function loadMessages(){
db.collection("messages")
.where("room","==",currentRoom)
.orderBy("time")
.onSnapshot(snapshot=>{
messages.innerHTML="";
snapshot.forEach(doc=>{
let data=doc.data();
let div=document.createElement("div");

div.className="msg "+
(data.sender===auth.currentUser.email?"self":"other");

div.innerHTML="<b>"+data.sender+"</b><br>"+data.text;

messages.appendChild(div);
messages.scrollTop=messages.scrollHeight;
});
});
}

function loadUsers(){
db.collection("onlineUsers").onSnapshot(snapshot=>{
usersList.innerHTML="";
userCount.innerText=snapshot.size;

snapshot.forEach(doc=>{
let div=document.createElement("div");
div.innerHTML=doc.data().email+
"<span class='green-dot'></span>";
usersList.appendChild(div);
});
});
}
