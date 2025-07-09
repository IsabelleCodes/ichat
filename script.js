const firebaseConfig = {
  apiKey: "AIzaSyCKwa3UVSC9vG8dmHd_Lo50jL9FnTx-WAY",
  authDomain: "naomichat-c6a83.firebaseapp.com",
  projectId: "naomichat-c6a83",
  storageBucket: "naomichat-c6a83.appspot.com",
  messagingSenderId: "555713745677",
  appId: "1:555713745677:web:81ee03a23c2545473d1644",
  measurementId: "G-6LLZL6KJ2H"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const chatBox = document.getElementById("chat-box");
const emailInput = document.getElementById("Name");
const passwordInput = document.getElementById("password");
const displayNameInput = document.getElementById("displayName");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("auth-status");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");

let currentUser = null;

// Sign up
signupBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const name = displayNameInput.value.trim();

  if (!email || !password || !name) {
    authStatus.textContent = "Please enter display name, email, and password.";
    return;
  }
  auth.createUserWithEmailAndPassword(email, password)
  .then((userCredential) => {
    return userCredential.user.updateProfile({
      displayName: name
    });
  })

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      return userCredential.user.updateProfile({
        displayName: name
      });
    })
    .then(() => {
      authStatus.textContent = "Sign up successful! Please log in.";
    })
    .catch(e => authStatus.textContent = e.message);
};

// Log in
loginBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (!email || !password) {
    authStatus.textContent = "Please enter email and password.";
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .catch(e => authStatus.textContent = e.message);
};

// Log out
logoutBtn.onclick = () => {
  auth.signOut();
};

// Auth state change
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    chatSection.style.display = "block";
    authStatus.textContent = `Logged in as ${user.displayName}`;
  } else {
    currentUser = null;
    authSection.style.display = "block";
    chatSection.style.display = "none";
    authStatus.textContent = "";
    chatBox.innerHTML = "";
  }
});

// Send message
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text || !currentUser) return;

  db.collection("messages").add({
    user: currentUser.displayName,
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = "";
};

// Listen for messages
db.collection("messages").orderBy("timestamp")
  .onSnapshot(snapshot => {
    chatBox.innerHTML = "";
    snapshot.forEach(doc => {
      const msg = doc.data();
      const div = document.createElement("div");
      const time = msg.timestamp ? msg.timestamp.toDate() : new Date();
      const timeString = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      div.textContent = `${msg.user} [${timeString}]: ${msg.text}`;
      div.className = (msg.user === (currentUser?.displayName || currentUser?.email)) ? "your-message" : "friend-message";

      if (msg.user === (currentUser?.displayName || currentUser?.email)) {
        const delBtn = document.createElement("button");
        delBtn.textContent = "🗑️";
        delBtn.onclick = () => {
          db.collection("messages").doc(doc.id).delete();
        };
        div.appendChild(delBtn);
      }

      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  });

// Emoji picker
emojiBtn.onclick = () => {
  const emoji = prompt("Enter an emoji:");
  if (emoji) {
    messageInput.value += emoji;
    messageInput.focus();
  }
};

