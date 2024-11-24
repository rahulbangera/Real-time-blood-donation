const signupForm = document.querySelector(".signupForm");
const popupContainer = document.querySelector(".popupContainer");
const outsidePopup = document.querySelector(".formContainer");
const body = document.querySelector("body");
const loader = document.querySelector(".loading-overlay");

function showErrorPopup(message) {
  // Get the popup element
  const popup = document.getElementById("error-popup");

  // Update the message
  document.getElementById("popup-message").textContent = message;

  // Show the popup
  popup.classList.add("show");

  // Hide the popup after 3 seconds
  setTimeout(() => {
    popup.classList.remove("show");
  }, 6000);
}

signupForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  const formObject = Object.fromEntries(formData.entries());

  console.log(formObject);

  const { name, userName, email, password, mbNumber, bdGroup } = formObject;

  if (name && userName && email && password && mbNumber && bdGroup) {
    loader.style.display = "flex";
    fetch("/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formObject),
    })
      .then((res) => {
        if (res.status === 200) {
          loader.style.display = "none";
          window.location.href = "/login";
        } else if (res.status === 300){
          loader.style.display = "none";
          showErrorPopup("Username already exists, please try another one");
        }
        else if(res.status === 301){
          loader.style.display = "none";
          showErrorPopup("Email already exists, please try another one");
        }
        else if(res.status === 302){
          loader.style.display = "none";
          showErrorPopup("Mobile number already exists, please try another one");
        }
        else{
          loader.style.display = "none";
          showErrorPopup("Something went wrong. Please try again later");
        }
      })
      .catch((err) => {
        loader.style.display = "none";
        showErrorPopup("Something went wrong. Please try again later");
      });
  } else {
    alert("Please fill all the fields");
  }
  localStorage.setItem("email", document.querySelector(".email").value);
});
