// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCKwa3UVSC9vG8dmHd_Lo50jL9FnTx-WAY",
  authDomain: "naomichat-c6a83.firebaseapp.com",
  projectId: "naomichat-c6a83",
  storageBucket: "naomichat-c6a83.appspot.com",
  messagingSenderId: "555713745677",
  appId: "1:555713745677:web:81ee03a23c2545473d1644",
  measurementId: "G-6LLZL6KJ2H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Send a message
function sendMessage(username, message) {
  if (message.trim() === "") return;

  db.collection("messages").add({
    user: username,
    text: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  document.getElementById("messageInput").value = "";
}

// Delete a message by ID
function deleteMessage(id) {
  db.collection("messages").doc(id).delete().then(() => {
    console.log("Message deleted");
  }).catch((error) => {
    console.error("Delete failed: ", error);
  });
}

// Display messages in real-time
db.collection("messages").orderBy("timestamp").onSnapshot((snapshot) => {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = "";

  snapshot.forEach((doc) => {
    const msg = doc.data();
    const div = document.createElement("div");

    // Get current username
    const currentUser = document.getElementById("usernameInput").value || "Anonymous";

    // Set message class
    div.className = msg.user === currentUser ? "your-message" : "friend-message";
    div.textContent = `${msg.user}: ${msg.text}`;

    // Add delete button if it's your message
    if (msg.user === currentUser) {
      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.style.marginLeft = "10px";
      delBtn.onclick = () => deleteMessage(doc.id);
      div.appendChild(delBtn);
    }

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
});
