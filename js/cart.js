/*
     Project: Notes App
     Author: Yabsira Dejene
     GitHub: https://github.com/ELFAZ19
     LinkedIn: https://linkedin.com/in/yabsiradejene
     © 2025 Yabsira Dejene. All rights reserved.
*/

import { showNotification } from "./utils.js";

export function setupCart() {
  updateCartUI();

  // Cart button
  const cartBtn = document.getElementById("cart-btn");
  const cartSidebar = document.querySelector(".cart-sidebar");
  const closeCart = document.getElementById("close-cart");

  if (cartBtn && cartSidebar) {
    cartBtn.addEventListener("click", () => {
      cartSidebar.classList.add("open");
      renderCartItems();
    });
  }

  if (closeCart && cartSidebar) {
    closeCart.addEventListener("click", () => {
      cartSidebar.classList.remove("open");
    });
  }

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (
      cartSidebar &&
      cartSidebar.classList.contains("open") &&
      !e.target.closest(".cart-sidebar") &&
      !e.target.closest("#cart-btn")
    ) {
      cartSidebar.classList.remove("open");
    }
  });
}

function renderCartItems() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItemsContainer = document.querySelector(".cart-items");
  const cartTotal = document.querySelector(".cart-total span");

  if (!cartItemsContainer || !cartTotal) return;

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

    // Add event listeners
    setupCartItemEventListeners();
  }
}

function setupCartItemEventListeners() {
  // Quantity minus
  document.querySelectorAll(".quantity-btn.minus").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
      updateCartItemQuantity(itemId, -1);
    });
  });

  // Quantity plus
  document.querySelectorAll(".quantity-btn.plus").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
      updateCartItemQuantity(itemId, 1);
    });
  });

  // Quantity input
  document.querySelectorAll(".quantity-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
      const newQuantity = parseInt(e.target.value) || 1;
      setCartItemQuantity(itemId, newQuantity);
    });
  });

  // Remove item
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const itemId = parseInt(e.target.closest(".cart-item").dataset.id);
      removeCartItem(itemId);
    });
  });
}

function updateCartItemQuantity(itemId, change) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((item) => item.id === itemId);

  if (item) {
    item.quantity += change;

    if (item.quantity < 1) {
      item.quantity = 1;
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    renderCartItems();
  }
}

function setCartItemQuantity(itemId, quantity) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const item = cart.find((item) => item.id === itemId);

  if (item) {
    item.quantity = Math.max(1, quantity);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
    renderCartItems();
  }
}

function removeCartItem(itemId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart = cart.filter((item) => item.id !== itemId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();
  renderCartItems();
  showNotification("Item removed from cart", "info");
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

// Utility to update cart icon badge
export function updateCartBadge() {
  const cartBtn = document.getElementById("cart-btn");
  if (!cartBtn) return;
  const badge = cartBtn.querySelector(".badge");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  badge.textContent = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
}

// Listen for cart changes from anywhere
window.addEventListener("storage", (e) => {
  if (e.key === "cart") updateCartBadge();
});

// Call on load
updateCartBadge();

export function renderCartSidebar() {
  const sidebar = document.querySelector(".cart-sidebar");
  const itemsContainer = sidebar?.querySelector(".cart-items");
  const totalContainer = sidebar?.querySelector(".cart-total span");
  if (!sidebar || !itemsContainer) return;
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  itemsContainer.innerHTML = "";
  let total = 0;
  cart.forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
      <img src="assets/images/products/${item.image}" class="cart-item-img" alt="${item.name}">
      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-qty">Qty: ${item.qty}</div>
        <div class="cart-item-qty">Price: $${item.price}</div>
      </div>
      <button class="cart-item-remove" title="Remove">&times;</button>
    `;
    itemDiv.querySelector(".cart-item-remove").onclick = () => {
      cart = cart.filter((c) => c.id !== item.id);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartSidebar();
      updateCartBadge();
    };
    itemsContainer.appendChild(itemDiv);
    total += item.price * item.qty;
  });
  if (totalContainer) totalContainer.textContent = `$${total.toFixed(2)}`;
}

// Update cart sidebar on cart change
window.addEventListener("storage", (e) => {
  if (e.key === "cart") renderCartSidebar();
});

// Call on load
renderCartSidebar();
