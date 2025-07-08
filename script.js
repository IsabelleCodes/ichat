// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKwa3UVSC9vG8dmHd_Lo50jL9FnTx-WAY",
  authDomain: "naomichat-c6a83.firebaseapp.com",
  projectId: "naomichat-c6a83",
  storageBucket: "naomichat-c6a83.firebasestorage.app",
  messagingSenderId: "555713745677",
  appId: "1:555713745677:web:81ee03a23c2545473d1644",
  measurementId: "G-6LLZL6KJ2H"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to your Firestore database
const db = firebase.firestore();

// Function to send a message
function sendMessage(username, message) {
  db.collection('messages').add({
    user: username,
    text: message,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log("Message sent!");
  }).catch((error) => {
    console.error("Error sending message: ", error);
  });
}

// Function to listen for new messages in real-time
function listenForMessages(callback) {
  db.collection('messages').orderBy('timestamp')
    .onSnapshot((snapshot) => {
      const messages = [];
      snapshot.forEach((doc) => {
        messages.push(doc.data());
      });
      callback(messages);
    });
}
// Show messages on the page
listenForMessages((messages) => {
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML = ""; // Clear current messages

  messages.forEach((msg) => {
    const div = document.createElement("div");
    div.className = msg.user === "Isabelle" ? "your-message" : "friend-message";
    div.textContent = `${msg.user}: ${msg.text}`;
    chatBox.appendChild(div);
  });

  // Scroll to bottom after message appears
  chatBox.scrollTop = chatBox.scrollHeight;
});

