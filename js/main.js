import {
  loadTheme,
  toggleTheme,
  setupMobileMenu,
  showNotification,
} from "./utils.js";
import { loadProducts, setupShopFilters } from "./products.js";
import { setupSearch } from "./search.js";
import { setupCart, updateCartBadge } from "./cart.js";

// Initialize the app
async function init() {
  loadTheme();
  setupMobileMenu();
  setupSearch();
  setupCart();
  setupSearch();
  updateCartBadge();

  // Theme toggle
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  // Load products if on a page that needs them
  if (document.querySelector(".shop-main")) {
    await loadProducts();
    setupShopFilters();
  } else if (document.querySelector(".featured-products")) {
    await loadProducts();
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
