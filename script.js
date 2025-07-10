// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCKwa3UVSC9vG8dmHd_Lo50jL9FnTx-WAY",
  authDomain: "naomichat-c6a83.firebaseapp.com",
  projectId: "naomichat-c6a83",
  storageBucket: "naomichat-c6a83.appspot.com",
  messagingSenderId: "555713745677",
  appId: "1:555713745677:web:81ee03a23c2545473d1644"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// UI Elements
const authSection = document.getElementById("auth-section");
const chatSection = document.getElementById("chat-section");
const chatBox = document.getElementById("chat-box");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const displayNameInput = document.getElementById("displayName");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authStatus = document.getElementById("auth-status");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const emojiBtn = document.getElementById("emojiBtn");
const profilePicInput = document.getElementById("profilePicInput");

let currentUser = null;

// Sign Up
signupBtn.onclick = async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const name = displayNameInput.value.trim();
  const file = profilePicInput.files[0];

  if (!email || !password || !name) {
    authStatus.textContent = "Please enter display name, email, and password.";
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    let photoURL = "";

    if (file) {
      const picRef = storage.ref(`profilePics/${userCredential.user.uid}/${file.name}`);
      await picRef.put(file);
      photoURL = await picRef.getDownloadURL();
    }

    await userCredential.user.updateProfile({
      displayName: name,
      photoURL: photoURL
    });

    authStatus.textContent = "Sign up successful! Please log in.";
  } catch (e) {
    authStatus.textContent = e.message;
  }
};

// Log In
loginBtn.onclick = () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  auth.signInWithEmailAndPassword(email, password).catch(e => {
    authStatus.textContent = e.message;
  });
};

// Log Out
logoutBtn.onclick = () => {
  auth.signOut();
};

// Auth State Changed
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
    photoURL: currentUser.photoURL || "",
    text: text,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  messageInput.value = "";
};

// Listen for messages
db.collection("messages").orderBy("timestamp").onSnapshot(snapshot => {
  chatBox.innerHTML = "";
  snapshot.forEach(doc => {
    const msg = doc.data();
    const time = msg.timestamp ? msg.timestamp.toDate() : new Date();
    const timeStr = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const div = document.createElement("div");
    div.className = msg.user === currentUser?.displayName ? "your-message" : "friend-message";

    const avatar = document.createElement("img");
    avatar.src = msg.photoURL || "https://via.placeholder.com/30";
    avatar.className = "avatar";

    const textSpan = document.createElement("span");
    textSpan.textContent = `${msg.user} [${timeStr}]: ${msg.text}`;

    div.appendChild(avatar);
    div.appendChild(textSpan);

    // Add delete button
    if (msg.user === currentUser?.displayName) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.onclick = () => db.collection("messages").doc(doc.id).delete();
      div.appendChild(delBtn);
    }

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});

// Emoji Picker
emojiBtn.onclick = () => {
  const emoji = prompt("Enter an emoji:");
  if (emoji) {
    messageInput.value += emoji;
    messageInput.focus();
  }
};
