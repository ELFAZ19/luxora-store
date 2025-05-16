// DOM Elements
const productsGrid = document.querySelector(".products-grid");
const searchInput = document.getElementById("search-input");
const categoryButtons = document.querySelectorAll(".category-btn");
const priceRange = document.getElementById("price-range");
const priceValue = document.getElementById("price-value");
const sortBy = document.getElementById("sort-by");
const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.querySelector(".cart-sidebar");
const closeCart = document.getElementById("close-cart");
const cartItemsContainer = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total span");
const wishlistBtn = document.getElementById("wishlist-btn");
const wishlistSidebar = document.querySelector(".wishlist-sidebar");
const closeWishlist = document.getElementById("close-wishlist");
const wishlistItemsContainer = document.querySelector(".wishlist-items");
const themeToggle = document.getElementById("theme-toggle");
const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const navLinks = document.querySelector(".nav-links");
const mobileSearch = document.querySelector(".mobile-search");
const searchBtn = document.getElementById("search-btn");

// State
let products = [];
let filteredProducts = [];
let cart = [];
let wishlist = [];
let currentCategory = "all";
let currentSearch = "";
let currentPrice = 1000;
let currentSort = "default";

// Initialize the app
function init() {
  loadProducts();
  loadCart();
  loadWishlist();
  loadTheme();
  setupEventListeners();
  renderSkeletons();
}

// Load products from JSON
async function loadProducts() {
  try {
    const response = await fetch("./data/products.json");
    products = await response.json();
    filteredProducts = [...products];
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    productsGrid.innerHTML =
      '<p class="error">Failed to load products. Please try again later.</p>';
  }
}

// Render loading skeletons
function renderSkeletons() {
  let skeletons = "";
  for (let i = 0; i < 8; i++) {
    skeletons += `
            <div class="skeleton-card">
                <div class="skeleton-img"></div>
                <div class="skeleton-info">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-price"></div>
                    <div class="skeleton-actions">
                        <div class="skeleton-btn"></div>
                        <div class="skeleton-icon"></div>
                    </div>
                </div>
            </div>
        `;
  }
  productsGrid.innerHTML = skeletons;
}

// Render products to the grid
function renderProducts() {
  if (filteredProducts.length === 0) {
    productsGrid.innerHTML =
      '<p class="no-products">No products match your criteria.</p>';
    return;
  }

  productsGrid.innerHTML = filteredProducts
    .map(
      (product) => `
        <div class="product-card" data-id="${product.id}">
            ${
              product.stock < 10
                ? `<span class="product-badge">Low Stock</span>`
                : ""
            }
            ${product.sale ? `<span class="product-badge">Sale</span>` : ""}
            <img src="${product.image}" alt="${
        product.name
      }" class="product-img">
            <button class="quick-view-btn">Quick View</button>
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-price">
                    ${
                      product.sale
                        ? `<span class="product-price old">$${product.originalPrice.toFixed(
                            2
                          )}</span>`
                        : ""
                    }
                    $${product.price.toFixed(2)}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart">Add to Cart</button>
                    <button class="wishlist-btn ${
                      wishlist.includes(product.id) ? "active" : ""
                    }">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Add event listeners to the newly rendered buttons
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", addToCart);
  });

  document.querySelectorAll(".wishlist-btn").forEach((btn) => {
    btn.addEventListener("click", toggleWishlist);
  });

  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", showQuickView);
  });

  document.querySelectorAll(".product-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (
        !e.target.closest(".add-to-cart") &&
        !e.target.closest(".wishlist-btn") &&
        !e.target.closest(".quick-view-btn")
      ) {
        showQuickView(e);
      }
    });
  });
}

// Filter products based on search, category, and price
function filterProducts() {
  filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(currentSearch.toLowerCase());
    const matchesCategory =
      currentCategory === "all" || product.category === currentCategory;
    const matchesPrice = product.price <= currentPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  sortProducts();
  renderProducts();
}

// Sort products based on current sort option
function sortProducts() {
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
      // Default sorting (maybe by ID or no sorting)
      break;
  }
}

// Cart functions
function addToCart(e) {
  const productId = parseInt(e.target.closest(".product-card").dataset.id);
  const product = products.find((p) => p.id === productId);

  const existingItem = cart.find((item) => item.id === productId);
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart();
  updateCartUI();
  showCartNotification();
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateCartItemQuantity(productId, newQuantity) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = Math.max(1, newQuantity);
    saveCart();
    updateCartUI();
  }
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("cart");
  cart = savedCart ? JSON.parse(savedCart) : [];
  updateCartUI();
}

function updateCartUI() {
  // Update cart badge
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#cart-btn .badge").textContent = totalItems;

  // Update cart sidebar
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <p>Your cart is empty</p>
                <button class="btn-primary">Continue Shopping</button>
            </div>
        `;
    cartTotal.textContent = "$0.00";
  } else {
    cartItemsContainer.innerHTML = cart
      .map(
        (item) => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${
          item.name
        }" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                    <div class="cart-item-actions">
                        <button class="quantity-btn minus">-</button>
                        <input type="number" class="quantity-input" value="${
                          item.quantity
                        }" min="1">
                        <button class="quantity-btn plus">+</button>
                        <button class="remove-item"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");

    // Calculate total
    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    cartTotal.textContent = `$${total.toFixed(2)}`;

    // Add event listeners to quantity buttons
    document.querySelectorAll(".quantity-btn.minus").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
        const item = cart.find((item) => item.id === itemId);
        if (item) {
          updateCartItemQuantity(itemId, item.quantity - 1);
        }
      });
    });

    document.querySelectorAll(".quantity-btn.plus").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
        const item = cart.find((item) => item.id === itemId);
        if (item) {
          updateCartItemQuantity(itemId, item.quantity + 1);
        }
      });
    });

    document.querySelectorAll(".quantity-input").forEach((input) => {
      input.addEventListener("change", (e) => {
        const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
        const newQuantity = parseInt(e.target.value) || 1;
        updateCartItemQuantity(itemId, newQuantity);
      });
    });

    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
        removeFromCart(itemId);
      });
    });
  }
}

function showCartNotification() {
  const notification = document.createElement("div");
  notification.className = "notification";
  notification.textContent = "Item added to cart!";
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

// Wishlist functions
function toggleWishlist(e) {
  const productId = parseInt(e.target.closest(".product-card").dataset.id);
  const index = wishlist.indexOf(productId);

  if (index === -1) {
    wishlist.push(productId);
  } else {
    wishlist.splice(index, 1);
  }

  saveWishlist();
  updateWishlistUI();

  // Update the heart icon
  e.target.classList.toggle("active");
}

function saveWishlist() {
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
}

function loadWishlist() {
  const savedWishlist = localStorage.getItem("wishlist");
  wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
  updateWishlistUI();
}

function updateWishlistUI() {
  // Update wishlist badge
  document.querySelector("#wishlist-btn .badge").textContent = wishlist.length;

  // Update wishlist sidebar
  if (wishlist.length === 0) {
    wishlistItemsContainer.innerHTML = `
            <div class="empty-wishlist">
                <p>Your wishlist is empty</p>
                <button class="btn-primary">Browse Products</button>
            </div>
        `;
  } else {
    wishlistItemsContainer.innerHTML = wishlist
      .map((id) => {
        const product = products.find((p) => p.id === id);
        if (!product) return "";
        return `
                <div class="wishlist-item" data-id="${product.id}">
                    <img src="${product.image}" alt="${
          product.name
        }" class="wishlist-item-img">
                    <div class="wishlist-item-details">
                        <h4 class="wishlist-item-title">${product.name}</h4>
                        <p class="wishlist-item-price">$${product.price.toFixed(
                          2
                        )}</p>
                        <button class="add-to-cart">Add to Cart</button>
                        <button class="remove-item"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `;
      })
      .join("");

    // Add event listeners
    document.querySelectorAll(".wishlist-item .add-to-cart").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = parseInt(
          e.target.closest(".wishlist-item").dataset.id
        );
        const product = products.find((p) => p.id === productId);

        const existingItem = cart.find((item) => item.id === productId);
        if (existingItem) {
          existingItem.quantity += 1;
        } else {
          cart.push({
            ...product,
            quantity: 1,
          });
        }

        saveCart();
        updateCartUI();
        showCartNotification();
      });
    });

    document.querySelectorAll(".wishlist-item .remove-item").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = parseInt(
          e.target.closest(".wishlist-item").dataset.id
        );
        const index = wishlist.indexOf(productId);
        if (index !== -1) {
          wishlist.splice(index, 1);
          saveWishlist();
          updateWishlistUI();

          // Also update the heart icon in the products grid
          const productCard = document.querySelector(
            `.product-card[data-id="${productId}"] .wishlist-btn`
          );
          if (productCard) {
            productCard.classList.remove("active");
          }
        }
      });
    });
  }
}

// Quick View Modal
function showQuickView(e) {
  const productId = parseInt(e.target.closest(".product-card").dataset.id);
  const product = products.find((p) => p.id === productId);

  if (!product) return;

  const modal = document.querySelector(".quick-view-modal");
  const modalBody = document.querySelector(".modal-body");

  modalBody.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="modal-img">
        <div class="modal-details">
            <h2 class="modal-title">${product.name}</h2>
            <div class="modal-price">
                ${
                  product.sale
                    ? `<span class="product-price old">$${product.originalPrice.toFixed(
                        2
                      )}</span>`
                    : ""
                }
                $${product.price.toFixed(2)}
            </div>
            <div class="modal-rating">
                ${renderRatingStars(product.rating)}
                <span>${product.reviews} reviews</span>
            </div>
            <p class="modal-description">${product.description}</p>
            <div class="modal-stock">${
              product.stock > 0
                ? `${product.stock} items in stock`
                : "Out of stock"
            }</div>
            <div class="modal-actions">
                <button class="btn-primary add-to-cart">Add to Cart</button>
                <button class="wishlist-btn ${
                  wishlist.includes(product.id) ? "active" : ""
                }">
                    <i class="fas fa-heart"></i>
                </button>
            </div>
        </div>
    `;

  // Add event listeners to modal buttons
  modal.querySelector(".add-to-cart").addEventListener("click", () => {
    const existingItem = cart.find((item) => item.id === product.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        ...product,
        quantity: 1,
      });
    }

    saveCart();
    updateCartUI();
    showCartNotification();
  });

  modal.querySelector(".wishlist-btn").addEventListener("click", () => {
    const index = wishlist.indexOf(product.id);
    if (index === -1) {
      wishlist.push(product.id);
    } else {
      wishlist.splice(index, 1);
    }

    saveWishlist();
    updateWishlistUI();
    modal.querySelector(".wishlist-btn").classList.toggle("active");

    // Also update the heart icon in the products grid
    const productCard = document.querySelector(
      `.product-card[data-id="${product.id}"] .wishlist-btn`
    );
    if (productCard) {
      productCard.classList.toggle("active");
    }
  });

  modal.classList.add("open");
}

function renderRatingStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  let stars = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }

  return `<div class="stars">${stars}</div>`;
}

// Theme functions
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateThemeIcon();
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeIcon();
}

function updateThemeIcon() {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  themeToggle.innerHTML =
    currentTheme === "light"
      ? '<i class="fas fa-moon"></i>'
      : '<i class="fas fa-sun"></i>';
}

// Setup event listeners
function setupEventListeners() {
  // Search
  searchInput.addEventListener("input", (e) => {
    currentSearch = e.target.value;
    filterProducts();
  });

  // Category filter
  categoryButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      categoryButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category;
      filterProducts();
    });
  });

  // Price filter
  priceRange.addEventListener("input", (e) => {
    currentPrice = parseInt(e.target.value);
    priceValue.textContent = `$0 - $${currentPrice}`;
    filterProducts();
  });

  // Sort
  sortBy.addEventListener("change", (e) => {
    currentSort = e.target.value;
    filterProducts();
  });

  // Cart
  cartBtn.addEventListener("click", () => {
    cartSidebar.classList.add("open");
  });

  closeCart.addEventListener("click", () => {
    cartSidebar.classList.remove("open");
  });

  // Wishlist
  wishlistBtn.addEventListener("click", () => {
    wishlistSidebar.classList.add("open");
  });

  closeWishlist.addEventListener("click", () => {
    wishlistSidebar.classList.remove("open");
  });

  // Theme toggle
  themeToggle.addEventListener("click", toggleTheme);

  // Mobile menu
  mobileMenuBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
    mobileSearch.classList.toggle("show");
  });

  // Search button (mobile)
  searchBtn.addEventListener("click", () => {
    mobileSearch.classList.toggle("show");
  });

  // Close modals when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target === document.querySelector(".quick-view-modal")) {
      document.querySelector(".quick-view-modal").classList.remove("open");
    }
  });

  // Close cart/wishlist when clicking outside (if they're open)
  document.addEventListener("click", (e) => {
    if (
      cartSidebar.classList.contains("open") &&
      !e.target.closest(".cart-sidebar") &&
      !e.target.closest("#cart-btn")
    ) {
      cartSidebar.classList.remove("open");
    }

    if (
      wishlistSidebar.classList.contains("open") &&
      !e.target.closest(".wishlist-sidebar") &&
      !e.target.closest("#wishlist-btn")
    ) {
      wishlistSidebar.classList.remove("open");
    }
  });
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init);
