const chatIcon = document.getElementById("chat-icon");
const chatWindow = document.getElementById("chat-window");
const chatClose = document.getElementById("chat-close");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");
const chatSend = document.getElementById("chat-send");
const chatUsers = document.querySelectorAll(".user");
const reqDiv = document.getElementById("requestorsDiv");
const donDiv = document.getElementById("donorsDiv");

let requestors = [];
let donors = [];

chatUsers.forEach((user) => {
  console.log("User:", user);
  user.addEventListener("click", () => {
    console.log("User clicked:", user);
    chatUsers.forEach((u) => {
      u.classList.remove("active-user");
    });
    user.classList.add("active-user");
    chatInput.focus();
  });
});

chatIcon.addEventListener("click", () => {
  chatWindow.style.display = "flex";
  chatIcon.style.display = "none";
});

// Close the chat window
chatClose.addEventListener("click", () => {
  chatWindow.style.display = "none";
  chatIcon.style.display = "flex";
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
  chatUsers.forEach((user) => {
    user.remove();
  });
  requestors.forEach((requestor) => {
    const username = requestor.requestorUsername;
    const user = document.createElement("div");
    user.classList.add("user");
    user.innerText = username;
    user.addEventListener("click", () => {
      chatUsers.forEach((u) => {
        u.classList.remove("active-user");
      });
      user.classList.add("active-user");
      chatInput.focus();
    });
    reqDiv.appendChild(user);
  });
  donors.forEach((donor) => {
    const username = donor.acceptorUsername;
    const user = document.createElement("div");
    user.classList.add("user");
    user.innerText = username;
    user.addEventListener("click", () => {
      chatUsers.forEach((u) => {
        u.classList.remove("active-user");
      });
      user.classList.add("active-user");
      chatInput.focus();
    });
    donDiv.appendChild(user);
  });
}
