// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyCKwa3UVSC9vG8dmHd_Lo50jL9FnTx-WAY",
  authDomain: "naomichat-c6a83.firebaseapp.com",
  projectId: "naomichat-c6a83",
  storageBucket: "naomichat-c6a83.appspot.com",
  messagingSenderId: "555713745677",
  appId: "1:555713745677:web:81ee03a23c2545473d1644"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const chatBox = document.getElementById("chat-box");
const chatList = document.getElementById("chat-list");
const newRoomName = document.getElementById("newRoomName");
const createRoomBtn = document.getElementById("createRoomBtn");

const displayNameInput = document.getElementById("displayName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("auth-status");

const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");

let currentUser = null;
let currentRoom = null;

// Sign up
signupBtn.onclick = () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  const name = displayNameInput.value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCred => userCred.user.updateProfile({ displayName: name }))
    .then(() => authStatus.textContent = "Sign-up successful! Log in.")
    .catch(e => authStatus.textContent = e.message);
};

// Log in
loginBtn.onclick = () => {
  auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value)
    .catch(e => authStatus.textContent = e.message);
};

// Log out
logoutBtn.onclick = () => auth.signOut();

// Auth state
auth.onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    authSection.style.display = "none";
    chatSection.style.display = "flex";
    loadChatRooms();
  } else {
    currentUser = null;
    authSection.style.display = "block";
    chatSection.style.display = "none";
  }
});

// Load chat rooms
function loadChatRooms() {
  db.collection("chatrooms").onSnapshot(snapshot => {
    chatList.innerHTML = "";
    snapshot.forEach(doc => {
      const li = document.createElement("li");
      li.textContent = doc.id;
      li.onclick = () => {
        currentRoom = doc.id;
        loadMessages();
      };
      chatList.appendChild(li);
    });
  });
}

// Create chat room
createRoomBtn.onclick = () => {
  const name = newRoomName.value.trim();
  if (!name) return;
  db.collection("chatrooms").doc(name).set({ created: firebase.firestore.FieldValue.serverTimestamp() });
  newRoomName.value = "";
};

// Send message
sendBtn.onclick = () => {
  const text = messageInput.value.trim();
  if (!text || !currentRoom || !currentUser) return;

  db.collection("chatrooms").doc(currentRoom).collection("messages").add({
    user: currentUser.displayName,
    text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = "";
};

// Load messages
function loadMessages() {
  db.collection("chatrooms").doc(currentRoom).collection("messages")
    .orderBy("timestamp")
    .onSnapshot(snapshot => {
      chatBox.innerHTML = "";
      snapshot.forEach(doc => {
        const msg = doc.data();
        const time = msg.timestamp?.toDate().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) || "";
        const div = document.createElement("div");
        div.textContent = `${msg.user} [${time}]: ${msg.text}`;
        div.className = msg.user === currentUser.displayName ? "your-message" : "friend-message";
        chatBox.appendChild(div);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    });
}

// Emoji picker
emojiBtn.onclick = () => {
  const emoji = prompt("Pick an emoji:");
  if (emoji) {
    messageInput.value += emoji;
    messageInput.focus();
  }
};

