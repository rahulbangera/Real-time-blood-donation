const signupForm = document.querySelector(".signupForm");
const popupContainer = document.querySelector(".popupContainer");
const outsidePopup = document.querySelector(".formContainer");
const body = document.querySelector("body");

signupForm.addEventListener("submit", (e) => {
  outsidePopup.style.display = "none";
  popupContainer.style.display = "flex";
window.scrollTo(0, 0);
  body.style.overflow = "hidden";
  localStorage.setItem("email", document.querySelector(".email").value);
});
