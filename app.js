const firebaseConfig={
  apiKey:"AIzaSyArbnk6rVI_wRPQibYx1DRKUlEJr19JQ_w",
  authDomain:"class8-discord-acfcf.firebaseapp.com",
  projectId:"class8-discord-acfcf",
  storageBucket:"class8-discord-acfcf.appspot.com"
};

firebase.initializeApp(firebaseConfig);

const auth=firebase.auth();
const db=firebase.firestore();
const storage=firebase.storage();

let currentRoom="home";
let currentUserData=null;

/* ---------------- ROLE SYSTEM ---------------- */

const ADMIN_EMAIL="yourrealemail@gmail.com";

function assignRole(user){
  let role="student";
  if(user.email===ADMIN_EMAIL){
    role="admin";
  }

  db.collection("users").doc(user.uid).set({
    email:user.email,
    role:role,
    photo:""
  },{merge:true});
}

/* ---------------- REGISTER ---------------- */

function register(){
  auth.createUserWithEmailAndPassword(email.value,password.value)
  .then(cred=>{
    assignRole(cred.user);
  })
  .catch(e=>errorMsg.innerText=e.message);
}

function loginUser(){
  auth.signInWithEmailAndPassword(email.value,password.value)
  .catch(e=>errorMsg.innerText=e.message);
}

function logout(){
  auth.signOut();
}

/* ---------------- AUTH ---------------- */

auth.onAuthStateChanged(user=>{
  if(user){
    loginDiv.style.display="none";
    chatDiv.style.display="block";

    db.collection("users").doc(user.uid).get().then(doc=>{
      currentUserData=doc.data();
    });

    loadMessages();
    loadUsers();
    enableNotifications();

  }else{
    loginDiv.style.display="block";
    chatDiv.style.display="none";
  }
});

/* ---------------- ROOMS ---------------- */

function switchRoom(room){
  currentRoom=room;
  roomTitle.innerText=room.toUpperCase();
  loadMessages();
}

/* ---------------- MESSAGES ---------------- */

function sendMessage(){
  if(msgInput.value==="") return;

  db.collection("messages").add({
    email:auth.currentUser.email,
    text:msgInput.value,
    room:currentRoom,
    time:Date.now(),
    reactions:{}
  });

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
      div.className="msg";

      div.innerHTML="<strong>"+data.email+"</strong>: "+data.text;

      /* Emoji reaction */
      let react=document.createElement("button");
      react.innerText="😀";
      react.onclick=()=>addReaction(doc.id);
      div.appendChild(react);

      messages.appendChild(div);

      showPopup("New message from "+data.email);
    });
  });
}

function addReaction(id){
  db.collection("messages").doc(id).update({
    reactions:firebase.firestore.FieldValue.increment(1)
  });
}

/* ---------------- PRIVATE DM ---------------- */

function sendPrivateMessage(toUID,text){
  db.collection("privateMessages").add({
    from:auth.currentUser.uid,
    to:toUID,
    text:text,
    time:Date.now()
  });
}

/* ---------------- USERS LIST ---------------- */

function loadUsers(){
  db.collection("users").onSnapshot(snapshot=>{
    usersList.innerHTML="";
    snapshot.forEach(doc=>{
      let data=doc.data();
      let div=document.createElement("div");

      let roleBadge="";
      if(data.role==="admin") roleBadge="👑";
      if(data.role==="moderator") roleBadge="🛡";

      div.innerHTML=roleBadge+" "+data.email;

      div.onclick=()=>{
        let msg=prompt("Send private message:");
        if(msg) sendPrivateMessage(doc.id,msg);
      };

      usersList.appendChild(div);
    });
  });
}

/* ---------------- TYPING INDICATOR ---------------- */

msgInput.addEventListener("input",()=>{
  db.collection("typing").doc(auth.currentUser.uid).set({
    room:currentRoom,
    typing:true
  });
});

/* ---------------- FILE SHARING ---------------- */

function uploadFile(file){
  let ref=storage.ref("files/"+Date.now()+"_"+file.name);
  ref.put(file).then(()=>{
    ref.getDownloadURL().then(url=>{
      db.collection("messages").add({
        email:auth.currentUser.email,
        text:"📎 File: "+url,
        room:currentRoom,
        time:Date.now()
      });
    });
  });
}

/* ---------------- POPUP NOTIFICATIONS ---------------- */

function showPopup(text){
  popupNotif.innerText=text;
  popupNotif.style.display="block";
  setTimeout(()=>popupNotif.style.display="none",3000);
}

function enableNotifications(){
  if("Notification" in window){
    Notification.requestPermission();
  }
}
