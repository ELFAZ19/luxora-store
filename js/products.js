import { showNotification } from "./utils.js";

let products = [];
let filteredProducts = [];
let currentCategory = "all";
let currentSearch = "";
let currentPrice = 1000;
let currentSort = "default";
let currentView = "grid";

// Load products from JSON
export async function loadProducts() {
  try {
    const response = await fetch("../data/products.json");
    products = await response.json();
    filteredProducts = [...products];

    // Check URL for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get("category");

    if (categoryParam) {
      currentCategory = categoryParam;
      filterProducts();

      // Highlight the active category
      document.querySelectorAll(".filter-list a").forEach((link) => {
        if (link.getAttribute("href").includes(`category=${categoryParam}`)) {
          link.classList.add("active");
        }
      });
    } else {
      renderProducts();
    }
  } catch (error) {
    console.error("Error loading products:", error);
    const productsGrid = document.querySelector(".products-grid");
    if (productsGrid) {
      productsGrid.innerHTML =
        '<p class="error">Failed to load products. Please try again later.</p>';
    }
  }
}

// Render products to the grid
export function renderProducts() {
  const productsGrid = document.querySelector(".products-grid");
  if (!productsGrid) return;

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML =
      '<p class="no-products">No products match your criteria.</p>';
    return;
  }

  if (currentView === "grid") {
    productsGrid.classList.remove("list-view");
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
                        <button class="wishlist-btn">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  } else {
    productsGrid.classList.add("list-view");
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
                    <p class="product-description">${product.description}</p>
                    <div class="product-actions">
                        <button class="add-to-cart">Add to Cart</button>
                        <button class="wishlist-btn">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="quick-view-btn">Quick View</button>
                    </div>
                </div>
            </div>
        `
      )
      .join("");
  }

  // Update products count on shop page
  const productsCount = document.getElementById("products-count");
  if (productsCount) {
    productsCount.textContent = `Showing ${filteredProducts.length} products`;
  }

  // Add event listeners
  setupProductEventListeners();
}

function setupProductEventListeners() {
  // Add to cart buttons
  document.querySelectorAll(".add-to-cart").forEach((btn) => {
    btn.addEventListener("click", addToCart);
  });

  // Quick view buttons
  document.querySelectorAll(".quick-view-btn").forEach((btn) => {
    btn.addEventListener("click", showQuickView);
  });

  // Product card clicks
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

// Filter products
export function filterProducts() {
  filteredProducts = products.filter((product) => {
    const matchesSearch =
      currentSearch === "" ||
      product.name.toLowerCase().includes(currentSearch) ||
      product.description.toLowerCase().includes(currentSearch);
    const matchesCategory =
      currentCategory === "all" || product.category === currentCategory;
    const matchesPrice = product.price <= currentPrice;
    return matchesSearch && matchesCategory && matchesPrice;
  });

  sortProducts();
  renderProducts();
}

// Sort products
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
      break;
  }
}

// Quick view modal
function showQuickView(e) {
  const productId = parseInt(e.target.closest(".product-card").dataset.id);
  const product = products.find((p) => p.id === productId);

  if (!product) return;

  const modal = document.createElement("div");
  modal.className = "quick-view-modal";
  modal.innerHTML = `
        <div class="modal-content">
            <button class="close-modal"><i class="fas fa-times"></i></button>
            <div class="modal-body">
                <img src="${product.image}" alt="${
    product.name
  }" class="modal-img">
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
                        <button class="wishlist-btn">
                            <i class="fas fa-heart"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

  document.body.appendChild(modal);

  // Add event listeners
  modal.querySelector(".close-modal").addEventListener("click", () => {
    modal.remove();
  });

  modal.querySelector(".add-to-cart").addEventListener("click", () => {
    addToCartFromModal(product);
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
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

function addToCartFromModal(product) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  showNotification("Item added to cart!", "success");
}

function addToCart(e) {
  const productId = parseInt(e.target.closest(".product-card").dataset.id);
  const product = products.find((p) => p.id === productId);

  if (!product) return;

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingItem = cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  showNotification("Item added to cart!", "success");
}

function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Update cart badge
  const cartBadge = document.querySelector("#cart-btn .badge");
  if (cartBadge) {
    cartBadge.textContent = totalItems;
  }
}
