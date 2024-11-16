const chatIcon = document.getElementById("chat-icon");
const chatWindow = document.getElementById("chat-window");
const chatClose = document.getElementById("chat-close");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatSend = document.getElementById("chat-send");
const reqDiv = document.getElementById("requestorsDiv");
const donDiv = document.getElementById("donorsDiv");
const commentIcon = document.querySelector(".fa-comments");

let requestors = [];
let donors = [];

let myUsername = "";
let toUsername = "";

fetch("/api/myUserName", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
}).then((response) => {
  console.log("Response:", response);
  response.json().then((data) => {
    myUsername = data.username;
    console.log("My username:", myUsername);
  });
});

chatIcon.addEventListener("click", () => {
  chatWindow.style.display = "flex";
  setTimeout(() => chatWindow.classList.add("open"), 0);
  chatIcon.style.display = "none";
});

// Close the chat window
chatClose.addEventListener("click", () => {
  closeChat();
});

function closeChat() {
  setTimeout(() => chatWindow.classList.remove("open"), 0);
  chatWindow.style.display = "none";
  chatIcon.style.display = "flex";
}

window.addEventListener("click", (event) => {
  if (
    !chatWindow.contains(event.target) &&
    event.target !== chatIcon &&
    event.target !== commentIcon
  ) {
    closeChat();
  }
});

// Send a message
// chatSend.addEventListener("click", sendMessage);

// chatInput.addEventListener("keypress", (event) => {
//   if (event.key === "Enter") {
//     sendMessage();
//   }
// });

fetch("/api/chatUsers", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
}).then((response) => {
  console.log("Response:", response);
  response.json().then((data) => {
    requestors = data.requestors;
    donors = data.donors;
    updateChatUsers();
  });
});

function updateChatUsers() {
  const currUsers = document.querySelectorAll(".user");
  currUsers.forEach((user) => {
    user.remove();
  });
  requestors.forEach((requestor) => {
    const username = requestor.requestorUsername;
    const user = document.createElement("div");
    user.classList.add("user");
    user.id = requestor.requestorUsername;
    user.innerText = username;
    user.addEventListener("click", (e) => {
      updateChatWindow(e.target.id);
      changeChatWindow();
      console.log("User clicked:", e);
      removeActiveUsers();
      user.classList.add("active-user");
      chatInput.focus();
    });
    reqDiv.appendChild(user);
  });
  donors.forEach((donor) => {
    const username = donor.acceptorUsername;
    const user = document.createElement("div");
    user.classList.add("user");
    user.id = donor.acceptorUsername;
    user.innerText = username;
    user.addEventListener("click", (e) => {
      updateChatWindow(e.target.id);
      changeChatWindow();
      console.log("User clicked:", e);
      removeActiveUsers();
      user.classList.add("active-user");
      chatInput.focus();
    });
    donDiv.appendChild(user);
  });
}

function removeActiveUsers() {
  const chatUsers = document.querySelectorAll(".user");
  chatUsers.forEach((user) => {
    user.classList.remove("active-user");
  });
}

function updateChatWindow(username) {
  chatMessages.innerHTML = "";
  //   fetch(`/api/chatMessages/${username}`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }).then((response) => {
  //     response.json().then((data) => {
  //       data.forEach((message) => {
  //         const messageDiv = document.createElement("div");
  //         messageDiv.classList.add("message");
  //         messageDiv.innerText = message.message;
  //         chatMessages.appendChild(messageDiv);
  //       });
  //     });
  //   });
  toUsername = username;
}

chatSend.addEventListener("click", () => {
  let val = chatInput.value;
  if (val === "") {
    return;
  }
  chatInput.value = "";
  window.sendMessage(myUsername, toUsername, val);
});

chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    let val = chatInput.value;
    if (val === "") {
      return;
    }
    chatInput.value = "";
    window.sendMessage(myUsername, toUsername, val);
  }
});

function changeChatWindow() {
  chatMessages.innerHTML = "";
  let roomId = [myUsername, toUsername].sort().join(":");
  console.log("Room ID: ", roomId);

  window.getMessages(roomId, (messages) => {
    chatMessages.innerHTML = "";
    messages.forEach((message) => {
      const messageDiv = document.createElement("div");
      messageDiv.classList.add("message");
      messageDiv.classList.add(
        message.from === myUsername ? "sent" : "received"
      );
      messageDiv.innerText = message.message;
      chatMessages.appendChild(messageDiv);
    });
  });
  //   fetch(`/api/chatMessages/${username}`, {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   }).then((response) => {
  //     response.json().then((data) => {
  //       data.forEach((message) => {
  //         const messageDiv = document.createElement("div");
  //         messageDiv.classList.add("message");
  //         messageDiv.innerText = message.message;
  //         chatMessages.appendChild(messageDiv);
  //       });
  //     });
  //   });
}
