let donationRequestData;
let sentRequestData;
let acceptorDetails = [];

document.getElementById("donor-tab").classList.add("active");
document.getElementById("donor-content").classList.add("active");
document.getElementById("tab-underline").style.left = "0%";
const accept = document.getElementsByClassName("accept-btn");
let requestorMobile;

document.querySelector(".close-button").onclick = closeModal;
const modal = document.getElementById("customModal");

window.onclick = (event) => {
  if (event.target === modal) closeModal();
};

function closeModal() {
  document.getElementById("customModal").style.display = "none";
}

function confirmationPopup(oneline, secondline) {
  return new Promise((resolve) => {
    modal.style.display = "block";
    const modalContent = document.querySelector(".modal-content");
    modalContent.innerHTML = `
  <div class="modal-header">
        <h2 id="modalTitle">Confirmation</h2>
        <span class="close-button">&times;</span>
      </div>
      <div class="modal-body">
        <p id="modalMessage" style="font-weight:600;">${oneline}</p>
        <p id="modalMessage"></p>
        <p id="modalMessage">${secondline}</p>
      </div>
      <div id="modalButtons" class="modal-buttons">
        <button id="confirmButton">Confirm</button>
        <button id="cancelButton">Cancel</button>
      </div>
  `;
    document
      .querySelector(".close-button")
      .addEventListener("click", closeModal);

    const confirm = document.getElementById("confirmButton");
    const cancel = document.getElementById("cancelButton");
    confirm.addEventListener("click", () => {
      modal.style.display = "none";
      console.log("confirm clicked");
      resolve(true);
    });
    cancel.addEventListener("click", () => {
      modal.style.display = "none";
      resolve(false);
    });
  });
}

function showPopup(title, oneline, secondline) {
  modal.style.display = "block";
  const modalContent = document.querySelector(".modal-content");
  modalContent.innerHTML = `
<div class="modal-header">
      <h2 id="modalTitle">${title}</h2>
      <span class="close-button">&times;</span>
    </div>
    <div class="modal-body">
      <p id="modalMessage" style="font-weight:600;">${oneline}</p>
      <p id="modalMessage"></p>
      <p id="modalMessage">${secondline}</p>
    </div>
    <div id="modalButtons" class="modal-buttons">
        <button id="confirmButton" class="close-button">OK</button>
    </div>
`;
  document.querySelectorAll(".close-button").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
}

function switchTab(tab) {
  document
    .querySelectorAll(".tab")
    .forEach((tab) => tab.classList.remove("active"));
  document
    .querySelectorAll(".content-section")
    .forEach((section) => section.classList.remove("active"));

  if (tab === "donor") {
    document.getElementById("donor-tab").classList.add("active");
    document.getElementById("donor-content").classList.add("active");
    document.getElementById("tab-underline").style.left = "0%";
  } else {
    document.getElementById("requestor-tab").classList.add("active");
    document.getElementById("requestor-content").classList.add("active");
    document.getElementById("tab-underline").style.left = "50%";
  }
}

// function fetchDonationRequests() {
//   fetch("/api/donationrequests", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       donationRequestData = data;
//       updateDonationRequests(donationRequestData);
//     })
//     .catch((error) => {
//       console.error("Error fetching donation requests:", error.message);
//     });
// }

function fetchDonationRequests() {
  fetch("/api/donationrequests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log(response);
      // Save response status and parse JSON
      const status = response.status;
      return response.json().then((data) => ({ status, data }));
    })
    .then(({ status, data }) => {
      // Use the saved status to handle different cases
      if (status === 200) {
        console.log("Data: " + data);
        donationRequestData = data;
        updateDonationRequests(donationRequestData);
      } else if (status === 300) {
        console.log(data);
        const { isReserved, acceptedData } = data.data;
        updateAcceptedData(isReserved, acceptedData);
      } else {
        // Handle other status codes
        throw new Error(`Unexpected status code: ${status}`);
      }
    })
    .catch((e) => {
      console.log("error", e);
    });
}

function updateAcceptedData(request, request1) {
  console.log(request);
  requestorMobile = request1.requestorMobile;
  let date = new Date(request.DateRequested);
  console.log("in");
  let acceptedContent = document.getElementById("donor-content");
  acceptedContent.innerHTML = `
  <div class="request-card accepted" id=${request.hospitalPlaceId}>
            <div class = "request-details">
<h2>Accepted</h2>
                <h3>Location: ${request.hospitalName}</h3>
                <p>Blood Group: ${request.bloodGroup}</p>
                <p>Request Date: ${date.toLocaleDateString()}</p>
            </div>
               <div class = "request-actions" id=${request.requestorUsername}>
                  <button class="contact-btn" onclick ="contact()">Contact</button>
               </div> 
            </div>
  `;
}

function contact() {
  let oneline = "Contact Details";
  let secondline = `Mobile: ${requestorMobile}`;
  showPopup("Contact Details", oneline, secondline);
}

function updateDonationRequests(data) {
  let donorContent = document.getElementById("donor-content");
  donorContent.innerHTML = "<h2>Requests You Received</h2>";
  if (data.length === 0) {
    donorContent.innerHTML += "<p>No requests yet.</p>";
  } else {
    data.forEach((request) => {
      donorContent.innerHTML += `
            <div class="request-card" id=${request.hospitalPlaceId}>
            <div class = "request-details">
                <h3>Location: ${request.hospitalName}</h3>
                <p>Blood Group: ${request.bloodGroup}</p>
                <p>Request Date: ${request.dateRequested}</p>
            </div>
               <div class = "request-actions" id=${request.requestorUsername}>
                 <button class="accept-btn" onclick ="accepted(this)">Accept</button>
                <button class="decline-btn" onclick ="declined(this)">Decline</button>
               </div> 
            </div>
            `;
    });
  }
}

async function accepted(button) {
  let oneline = "Are you sure you want to accept this request?";
  let secondline =
    "Please note your contact details will be shared with the requestor and all the other requests will be declined automatically.";
  let confirm = await confirmationPopup(oneline, secondline);
  console.log(confirm);
  if (confirm) {
    let requestorUsername = button.parentElement.id;
    let hospitalPlaceId = button.parentElement.parentElement.id;
    fetch("/api/acceptrequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestorUsername, hospitalPlaceId }),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Accepted");
          fetchDonationRequests();
        } else {
          console.log("Error in accepting request");
        }
      })
      .catch((e) => {
        console.log("Error in accepting request: " + e);
      });
  } else {
    return;
  }
}

async function declined(button) {
  let oneline = "Are you sure you want to decline this request?";
  let secondline = "Please note this action cannot be undone.";
  let confirm = await confirmationPopup(oneline, secondline);
  if (confirm) {
    let requestorUsername = button.parentElement.id;
    let hospitalPlaceId = button.parentElement.parentElement.id;
    fetch("/api/declinerequest", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requestorUsername, hospitalPlaceId }),
    })
      .then((response) => {
        if (response.status === 200) {
          console.log("Declined");
          fetchDonationRequests();
        } else {
          console.log("Error in declining request");
        }
      })
      .catch((e) => {
        console.log("Error in declining request: " + e);
      });
  } else {
    return;
  }
}

function fetchSentRequests() {
  fetch("/api/sentrequests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      sentRequestData = data;
      console.log(sentRequestData);
      updateSentRequests(sentRequestData);
    });
}

function updateSentRequests(data) {
  console.log(data);
  let requestorContent = document.getElementById("requestor-content");
  requestorContent.innerHTML = "<h2>Requests You Sent</h2>";
  if (!data) {
    requestorContent.innerHTML += "<p>No requests sent yet.</p>";
  } else {
    data.forEach((request) => {
      requestorContent.innerHTML += `
            <div class="request-card">
            <div class = "request-details">
                <h3>Location: ${request.hospitalName}</h3>
                <p>Blood Group: ${request.bloodGroup}</p>
                <p>Request Date: ${request.dateRequested}</p>
                <p>Count of Donors: ${request.donorCount}</p>
                <p>Status: ${request.satisfied ? "Satisfied" : "Pending"}</p>
            </div>
               <div class = "request-actions" id=${request.hospitalPlaceId}>
                 <button class=${
                   request.satisfied ? "contact-btn" : "cancel-btn"
                 } onclick = "performButtonAction(this)">${
        request.satisfied ? "Contact" : "Cancel"
      }</button>
               </div> 
            </div>
            `;
    });
  }
  fetch("/api/satisfiedrequests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data }),
  })
    .then((response) => {
      console.log(response);
      if (response.status === 200) {
        return response.json();
        // console.log(data1);
        // acceptorDetails = data1;
        // console.log(acceptorDetails);
      } else if (response.status === 300) {
        console.log("No Satisfied requests");
      }
    })
    .then((data) => {
      if (data) {
        acceptorDetails = data;
        console.log(acceptorDetails);
      } else {
        console.log("No satisfied requests again");
      }
    })
    .catch((e) => {
      console.log("Error in updating satisfied requests: " + e);
    });
}

function contactDonor(button) {
  let requestPlaceId = button.parentElement.id;
  acceptorDetails.forEach((detail) => {
    if (detail.hospitalPlaceId === requestPlaceId) {
      let oneline = "Contact Details";
      let secondline = `Mobile: ${detail.acceptorMobile}`;
      showPopup("Contact Details", oneline, secondline);
    }
  });
}

function contactRequestor(button) {
  let requestPlaceId = button.parentElement.id;
  acceptorDetails.forEach((detail) => {
    if (detail.hospitalPlaceId === requestPlaceId) {
      let oneline = "Contact Details";
      let secondline = `Mobile: ${detail.requestorMobile}`;
      showPopup("Contact Details", oneline, secondline);
    }
  });
}

async function cancelRequest(button) {
  let requestPlaceId = button.parentElement.id;
  console.log(requestPlaceId);
  let oneline = "Are you sure you want to cancel this request?";
  let secondline = "Please note this action cannot be undone.";
  let confirm = await confirmationPopup(oneline, secondline);
  if (!confirm) {
    return;
  }
  fetch("/api/cancelrequests", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestPlaceId }),
  })
    .then((response) => {
      if (response.status === 200) {
        console.log("Request Cancelled");
        fetchSentRequests();
        fetchDonationRequests();
      } else {
        console.log("Error in cancelling request");
      }
    })
    .catch((e) => {
      console.log("Error in cancelling request: " + e);
    });
}

function performButtonAction(button) {
  if (button.classList.contains("contact-btn")) {
    contactRequestor(button);
  } else {
    cancelRequest(button);
  }
}

window.init = fetchDonationRequests();
window.init = fetchSentRequests();
