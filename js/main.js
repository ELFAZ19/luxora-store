import {
  loadTheme,
  toggleTheme,
  setupMobileMenu,
  showNotification,
} from "./utils.js";
import { loadProducts, filterProducts, renderProducts } from "./products.js";
import { setupSearch } from "./search.js";
import { setupCart } from "./cart.js";

// Initialize the app
function init() {
  loadTheme();
  setupMobileMenu();
  setupSearch();
  setupCart();

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Load products if on a page that needs them
  if (
    document.querySelector(".products-grid") ||
    document.querySelector(".featured-products")
  ) {
    loadProducts();
  }

  // Newsletter form
  const newsletterForm = document.getElementById("newsletter-submit");
  if (newsletterForm) {
    newsletterForm.addEventListener("click", (e) => {
      e.preventDefault();
      const email = document.getElementById("newsletter-email").value;
      if (email) {
        showNotification("Thank you for subscribing!", "success");
        document.getElementById("newsletter-email").value = "";
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
