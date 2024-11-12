let donationRequestData;
let sentRequestData;

document.getElementById("donor-tab").classList.add("active");
document.getElementById("donor-content").classList.add("active");
document.getElementById("tab-underline").style.left = "0%";

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

fetch("/api/donationrequests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    donationRequestData = data;
    updateDonationRequests(donationRequestData);
  });

function updateDonationRequests(data) {
  let donorContent = document.getElementById("donor-content");
  donorContent.innerHTML = "<h2>Requests You Received</h2>";
  if (data.length === 0) {
    donorContent.innerHTML += "<p>No requests yet.</p>";
  } else {
    data.forEach((request) => {
      donorContent.innerHTML += `
            <div class="request-card">
            <div class = "request-details">
                <h3>Location: ${request.hospitalName}</h3>
                <p>Blood Group: ${request.bloodGroup}</p>
                <p>Request Date: ${request.dateRequested}</p>
            </div>
               <div class = "request-actions" id=${request.requestorUsername}>
                 <button class="accept-btn">Accept</button>
                <button class="decline-btn">Decline</button>
               </div> 
            </div>
            `;
    });
  }
}

fetch("/api/sentrequests", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then((response) => response.json())
  .then((data) => {
    sentRequestData = data;
    updateSentRequests(sentRequestData);
  });

function updateSentRequests(data) {
  let requestorContent = document.getElementById("requestor-content");
  requestorContent.innerHTML = "<h2>Requests You Sent</h2>";
  if (data.length === 0) {
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
               <div class = "request-actions" id=${request._id}>
                 <button class=${
                   request.satisfied ? "contact-btn" : "cancel-btn"
                 } onclick = "performButtonAction(this)">Cancel</button>
               </div> 
            </div>
            `;
    });
  }
}
