import { filterProducts } from "./products.js";

let currentSearch = "";

export function setupSearch() {
  // Desktop search
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentSearch = e.target.value.trim().toLowerCase();
      filterProducts();
    });
  }

  // Mobile search
  const mobileSearchInput = document.getElementById("mobile-search-input");
  const mobileSearchBtn = document.getElementById("mobile-search-btn");

  if (mobileSearchInput && mobileSearchBtn) {
    mobileSearchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        currentSearch = mobileSearchInput.value.trim().toLowerCase();
        filterProducts();
      }
    });

    mobileSearchBtn.addEventListener("click", () => {
      currentSearch = mobileSearchInput.value.trim().toLowerCase();
      filterProducts();
    });
  }
}
