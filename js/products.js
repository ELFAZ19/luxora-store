/*
     Project: Notes App
     Author: Yabsira Dejene
     GitHub: https://github.com/ELFAZ19
     LinkedIn: https://linkedin.com/in/yabsiradejene
     © 2025 Yabsira Dejene. All rights reserved.
*/

// Global variables
let products = [];
let filteredProducts = [];
let currentMaxPrice = 1000;
let currentCategory = "all";
let currentSort = "default";
let currentSearchTerm = "";

// DOM elements
const productsContainer = document.querySelector(".products-grid");
const priceRangeInput = document.getElementById("price-filter");
const sortFilter = document.getElementById("sort-filter");
const productsCountElement = document.getElementById("products-count");

// Load products from JSON file
export async function loadProducts() {
  try {
    const response = await fetch("./data/products.json");
    if (!response.ok) throw new Error("Network response was not ok");

    products = await response.json();
    filteredProducts = [...products];

    renderProducts();
    setupShopFilters();

    return products;
  } catch (error) {
    console.error("Error loading products:", error);
    showNotification(
      "Failed to load products. Please try again later.",
      "error"
    );
    return [];
  }
}

// Set up all shop filters
export function setupShopFilters() {
  // Price range filter
  if (priceRangeInput) {
    priceRangeInput.addEventListener("input", (e) => {
      currentMaxPrice = parseInt(e.target.value);
      updatePriceDisplay();
      filterProducts();
    });
  }

  // Category filter
  document.querySelectorAll(".filter-list a").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();

      // Update active class
      document
        .querySelectorAll(".filter-list a")
        .forEach((a) => a.classList.remove("active"));
      link.classList.add("active");

      currentCategory =
        new URL(link.href).searchParams.get("category") || "all";
      filterProducts();
    });
  });

  // Sort filter
  if (sortFilter) {
    sortFilter.addEventListener("change", (e) => {
      currentSort = e.target.value;
      filterProducts();
    });
  }

  // Apply/Reset buttons
  const applyFiltersBtn = document.querySelector(".apply-filters");
  const resetFiltersBtn = document.querySelector(".reset-filters");

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener("click", filterProducts);
  }

  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", resetFilters);
  }
}

// Main filtering function
export function filterProducts() {
  filteredProducts = products.filter((product) => {
    // Price filter
    const priceMatch = product.price <= currentMaxPrice;

    // Category filter
    const categoryMatch =
      currentCategory === "all" || product.category === currentCategory;

    // Search filter
    const searchMatch =
      currentSearchTerm === "" ||
      product.name.toLowerCase().includes(currentSearchTerm) ||
      product.description.toLowerCase().includes(currentSearchTerm);

    return priceMatch && categoryMatch && searchMatch;
  });

  applySorting();
  renderProducts();
}

// Apply sorting to filtered products
function applySorting() {
  switch (currentSort) {
    case "price-asc":
      filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "name-desc":
      filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
      break;
    case "rating":
      filteredProducts.sort((a, b) => b.rating - a.rating);
      break;
    default:
      // Default sorting (by ID or no sorting)
      break;
  }
}

// Reset all filters to default
function resetFilters() {
  currentMaxPrice = 1000;
  currentCategory = "all";
  currentSort = "default";
  currentSearchTerm = "";

  // Reset UI elements
  if (priceRangeInput) priceRangeInput.value = 1000;
  if (sortFilter) sortFilter.value = "default";

  document
    .querySelectorAll(".filter-list a")
    .forEach((a) => a.classList.remove("active"));
  document
    .querySelector('.filter-list a[href="shop.html?category=all"]')
    .classList.add("active");

  updatePriceDisplay();
  filterProducts();
}

// Update price display value
function updatePriceDisplay() {
  const priceValues = document.querySelectorAll(".price-values span");
  if (priceValues.length > 1) {
    priceValues[1].textContent = `$${currentMaxPrice}`;
  }
}

// Render products to the DOM
export function renderProducts() {
  if (!productsContainer) return;

  productsContainer.innerHTML =
    filteredProducts.length > 0
      ? ""
      : `
    <div class="no-products">
      <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem;"></i>
      <h3>No products found</h3>
      <p>Try adjusting your search or filters</p>
      <button class="btn-primary reset-filters">Reset Filters</button>
    </div>
  `;

  if (productsCountElement) {
    productsCountElement.textContent = `Showing ${
      filteredProducts.length
    } product${filteredProducts.length !== 1 ? "s" : ""}`;
  }

  filteredProducts.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="product-img">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        ${product.sale ? '<span class="sale-badge">Sale</span>' : ""}
        ${product.stock < 5 ? '<span class="stock-badge">Low Stock</span>' : ""}
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <div class="price">
          ${
            product.originalPrice
              ? `<span class="original-price">$${product.originalPrice.toFixed(
                  2
                )}</span>`
              : ""
          }
          <span class="current-price">$${product.price.toFixed(2)}</span>
        </div>
        <div class="rating">
          ${"★".repeat(Math.floor(product.rating))}${"☆".repeat(
      5 - Math.floor(product.rating)
    )}
          <span>(${product.reviews})</span>
        </div>
      </div>
      <div class="product-actions">
        <button class="btn-wishlist" data-id="${
          product.id
        }" aria-label="Add to wishlist">
          <i class="far fa-heart"></i>
        </button>
        <button class="btn-cart" data-id="${product.id}" ${
      product.stock <= 0 ? "disabled" : ""
    }>
          ${product.stock <= 0 ? "Out of Stock" : "Add to Cart"}
        </button>
      </div>
    `;
    productsContainer.appendChild(productCard);
  });

  // Add event listeners for new product cards
  setupProductInteractions();
}

// Set up interactions for product cards
function setupProductInteractions() {
  // Wishlist buttons
  document.querySelectorAll(".btn-wishlist").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = parseInt(button.dataset.id);
      toggleWishlist(productId);
      button.innerHTML = `<i class="${
        isInWishlist(productId) ? "fas" : "far"
      } fa-heart"></i>`;
    });
  });

  // Add to cart buttons
  document.querySelectorAll(".btn-cart:not(:disabled)").forEach((button) => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const productId = parseInt(button.dataset.id);
      addToCart(productId);
      showNotification(`${getProductName(productId)} added to cart`, "success");
    });
  });
}

// Helper functions
function isInWishlist(productId) {
  const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  return wishlist.includes(productId);
}

function toggleWishlist(productId) {
  let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
  if (wishlist.includes(productId)) {
    wishlist = wishlist.filter((id) => id !== productId);
  } else {
    wishlist.push(productId);
  }
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
  updateWishlistBadge();
}

function addToCart(productId) {
  // Implement your cart functionality here
  console.log(`Product ${productId} added to cart`);
}

function getProductName(productId) {
  const product = products.find((p) => p.id === productId);
  return product ? product.name : "Product";
}

function updateWishlistBadge() {
  const wishlistBadge = document.querySelector("#wishlist-btn .badge");
  if (wishlistBadge) {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    wishlistBadge.textContent = wishlist.length;
    wishlistBadge.style.display = wishlist.length > 0 ? "block" : "none";
  }
}

// Search functionality
export function filterProductsBySearch(term) {
  currentSearchTerm = term.toLowerCase();
  filterProducts();
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".products-grid")) {
    loadProducts();
  }
  updateWishlistBadge();
});
