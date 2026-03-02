const firebaseConfig={
  apiKey:"AIzaSyArbnk6rVI_wRPQibYx1DRKUlEJr19JQ_w",
  authDomain:"class8-discord-acfcf.firebaseapp.com",
  projectId:"class8-discord-acfcf",
  storageBucket:"class8-discord-acfcf.appspot.com"
};

firebase.initializeApp(firebaseConfig);

const auth=firebase.auth();
const db=firebase.firestore();

let currentRoom="home";
let currentUserRole="student";
const ADMIN_EMAIL="yourrealemail@gmail.com";

/* AUTH */
auth.onAuthStateChanged(user=>{
  if(user){
    assignRole(user);
    loadMessages();
    loadUsers();
  }else{
    window.location.reload();
  }
});

function assignRole(user){
  if(user.email===ADMIN_EMAIL){
    currentUserRole="admin";
  }
}

/* ROOM SWITCH */
function switchRoom(room){
  currentRoom=room;
  roomTitle.innerText=room.toUpperCase();
  loadMessages();
}

/* SEND MESSAGE */
function sendMessage(){
  if(msgInput.value==="") return;

  db.collection("messages").add({
    text:msgInput.value,
    email:auth.currentUser.email,
    room:currentRoom,
    time:Date.now(),
    seen:false
  });

  msgInput.value="";
}

/* LOAD MESSAGES */
function loadMessages(){
  db.collection("messages")
  .where("room","==",currentRoom)
  .orderBy("time")
  .onSnapshot(snapshot=>{
    messages.innerHTML="";
    snapshot.forEach(doc=>{
      let data=doc.data();
      let div=document.createElement("div");
      div.className="message";

      let content=document.createElement("div");
      content.className="message-content";
      content.innerHTML="<strong>"+data.email+"</strong><br>"+data.text;

      /* EDIT */
      if(data.email===auth.currentUser.email){
        let editBtn=document.createElement("button");
        editBtn.innerText="Edit";
        editBtn.onclick=()=>{
          let newText=prompt("Edit message:",data.text);
          if(newText){
            db.collection("messages").doc(doc.id).update({text:newText});
          }
        };
        content.appendChild(editBtn);
      }

      /* DELETE (ADMIN OR OWNER) */
      if(currentUserRole==="admin" || data.email===auth.currentUser.email){
        let delBtn=document.createElement("button");
        delBtn.innerText="Delete";
        delBtn.onclick=()=>{
          db.collection("messages").doc(doc.id).delete();
        };
        content.appendChild(delBtn);
      }

      div.appendChild(content);
      messages.appendChild(div);
    });
  });
}

/* USERS LIST */
function loadUsers(){
  db.collection("messages").onSnapshot(snapshot=>{
    let users=new Set();
    snapshot.forEach(doc=>users.add(doc.data().email));

    usersList.innerHTML="";
    users.forEach(email=>{
      let div=document.createElement("div");
      div.innerText=email;
      if(email===ADMIN_EMAIL){
        div.className="role-admin";
      }
      usersList.appendChild(div);
    });
  });
}

function logout(){
  auth.signOut();
}
