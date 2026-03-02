// YOUR FIREBASE CONFIG
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
const storage = firebase.storage();

const ADMIN_EMAIL = "techmaveric2511@gmail.com";

let currentRoom="home";

const bannedWords=["badword1","badword2"];

// REGISTER
function register(){
const email=email.value;
const pass=password.value;
auth.createUserWithEmailAndPassword(email,pass)
.then(user=>{
db.collection("users").doc(user.user.uid).set({
email:email,
role: email===ADMIN_EMAIL ? "admin":"student",
warnings:0
});
});
}

// LOGIN
function loginUser(){
auth.signInWithEmailAndPassword(email.value,password.value);
}

// AUTH
auth.onAuthStateChanged(user=>{
if(user){
loginDiv.style.display="none";
chatDiv.style.display="block";

db.collection("onlineUsers").doc(user.uid).set({
email:user.email
});

loadMessages();
loadUsers();
}
});

// SEND MESSAGE
function sendMessage(){
let msg=msgInput.value;

for(let word of bannedWords){
if(msg.includes(word)){
alert("Bad word detected!");
return;
}
}

db.collection("messages").add({
sender:auth.currentUser.email,
text:msg,
room:currentRoom,
time:Date.now()
});

msgInput.value="";
}

// LOAD MESSAGES
function loadMessages(){
db.collection("messages")
.where("room","==",currentRoom)
.orderBy("time")
.onSnapshot(snapshot=>{
messages.innerHTML="";
snapshot.forEach(doc=>{
let data=doc.data();
let div=document.createElement("div");
div.className="msg";

let time=new Date(data.time).toLocaleTimeString();

div.innerHTML="<b>"+data.sender+"</b> <small>"+time+"</small>: "+data.text;

messages.appendChild(div);
});
});
}

// USERS
function loadUsers(){
db.collection("onlineUsers").onSnapshot(snapshot=>{
usersList.innerHTML="";
userCount.innerText=snapshot.size;

snapshot.forEach(doc=>{
let div=document.createElement("div");
div.innerHTML=doc.data().email+" <span class='green-dot'></span>";
usersList.appendChild(div);
});
});
}

// THEME
function toggleTheme(){
document.body.classList.toggle("light");
}

// ADMIN PAGE
function goAdmin(){
if(auth.currentUser.email===ADMIN_EMAIL){
window.location="admin.html";
}
}
