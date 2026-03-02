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
let userProfileURL="";

function register(){
  auth.createUserWithEmailAndPassword(email.value,password.value)
  .then(cred=>{
    let file=profilePic.files[0];
    if(file){
      let ref=storage.ref("profiles/"+cred.user.uid);
      ref.put(file).then(()=>{
        ref.getDownloadURL().then(url=>{
          userProfileURL=url;
          db.collection("users").doc(cred.user.uid).set({
            email:cred.user.email,
            photo:url
          });
        });
      });
    }
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

auth.onAuthStateChanged(user=>{
  if(user){
    loginDiv.style.display="none";
    chatDiv.style.display="block";

    db.collection("onlineUsers").doc(user.uid).set({
      email:user.email
    });

    loadMessages();
    loadUsers();
  }else{
    loginDiv.style.display="block";
    chatDiv.style.display="none";
  }
});

function switchRoom(room){
  currentRoom=room;
  document.getElementById("roomTitle").innerText=room.toUpperCase();
  loadMessages();
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

      let img=document.createElement("img");
      img.src=data.photo || "https://i.imgur.com/6VBx3io.png";

      div.innerHTML="<strong>"+data.email+"</strong>: "+data.text;
      div.prepend(img);

      messages.appendChild(div);
    });
  });
}

function loadUsers(){
  db.collection("onlineUsers").onSnapshot(snapshot=>{
    usersList.innerHTML="";
    snapshot.forEach(doc=>{
      let div=document.createElement("div");
      div.innerHTML=doc.data().email+" <span class='green-dot'></span>";
      usersList.appendChild(div);
    });
  });
}

function sendMessage(){
  if(msgInput.value==="") return;

  db.collection("messages").add({
    email:auth.currentUser.email,
    text:msgInput.value,
    room:currentRoom,
    photo:userProfileURL,
    time:Date.now()
  });

  msgInput.value="";
}
