document.addEventListener("DOMContentLoaded", () => {

  const notAdmin = document.getElementById("notAdmin");
  const adminContent = document.getElementById("adminContent");
  const totalUsersEl = document.getElementById("totalUsers");
  const totalMessagesEl = document.getElementById("totalMessages");
  const onlineUsersCountEl = document.getElementById("onlineUsersCount");
  const bannedListEl = document.getElementById("bannedList");
  const usersList = document.getElementById("usersList");
  const userCount = document.getElementById("userCount");

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

  // ===== LOAD BANNED USERS =====
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

  // ===== LOAD ONLINE USERS WITH BAN BUTTON =====
  function loadOnlineUsersSidebar(){
    if(!usersList || !userCount) return;

    db.collection("onlineUsers").onSnapshot(snapshot=>{
      usersList.innerHTML="";
      userCount.innerText = snapshot.size;

      snapshot.forEach(doc=>{
        const userEmail = doc.data().email;
        const userDiv = document.createElement("div");
        userDiv.style.display = "flex";
        userDiv.style.justifyContent = "space-between";
        userDiv.style.alignItems = "center";
        userDiv.style.marginBottom = "6px";

        const emailSpan = document.createElement("span");
        emailSpan.innerText = userEmail;

        const banBtn = document.createElement("button");
        banBtn.innerText = "Ban";
        banBtn.style.background = "#ff3333";
        banBtn.style.color = "white";
        banBtn.style.padding = "4px 8px";
        banBtn.style.borderRadius = "8px";
        banBtn.style.border = "none";
        banBtn.style.cursor = "pointer";
        banBtn.onclick = () => banUser(userEmail, doc.id);

        userDiv.appendChild(emailSpan);
        userDiv.appendChild(banBtn);
        usersList.appendChild(userDiv);
      });
    });
  }

  // ===== BAN USER FUNCTION =====
  async function banUser(email, uid){
    if(!confirm(`Are you sure you want to ban ${email}?`)) return;

    try{
      // Add to bannedUsers collection
      await db.collection("bannedUsers").doc(uid).set({email: email});
      // Remove from onlineUsers
      await db.collection("onlineUsers").doc(uid).delete();
      alert(`${email} has been banned successfully.`);
    }catch(err){
      console.error(err);
      alert("Error banning user: "+err.message);
    }
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
