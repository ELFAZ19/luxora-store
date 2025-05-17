/*
     Project: Notes App
     Author: Yabsira Dejene
     GitHub: https://github.com/ELFAZ19
     LinkedIn: https://linkedin.com/in/yabsiradejene
     © 2025 Yabsira Dejene. All rights reserved.
*/

// Theme functionality
export function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon();
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    themeToggle.innerHTML =
      currentTheme === "light"
        ? '<i class="fas fa-moon"></i>'
        : '<i class="fas fa-sun"></i>';
  }
}

// Mobile menu functionality
export function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  const mobileSearch = document.querySelector(".mobile-search");

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinks.classList.toggle("show");
      if (mobileSearch) mobileSearch.classList.remove("show");
    });
  }

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      navLinks &&
      navLinks.classList.contains("show") &&
      !e.target.closest(".nav-links") &&
      !e.target.closest("#mobile-menu-btn")
    ) {
      navLinks.classList.remove("show");
    }
  });

  // Close mobile menu when clicking a link
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      if (navLinks) navLinks.classList.remove("show");
    });
  });
}

// Notification system
export function showNotification(message, type = "success") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 2000);
}
