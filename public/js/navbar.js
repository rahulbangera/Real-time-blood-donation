document.addEventListener("DOMContentLoaded", () => {
  const menuBtn = document.querySelectorAll(".menu-btn");
  const sidebar = document.querySelector(".sidebar");

  // Toggle sidebar on button click
  menuBtn[0].addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
  menuBtn[1].addEventListener("click", () => {
    sidebar.classList.toggle("active");
  });
});
