/*
     Project: Notes App
     Author: Yabsira Dejene
     GitHub: https://github.com/ELFAZ19
     LinkedIn: https://linkedin.com/in/yabsiradejene
     © 2025 Yabsira Dejene. All rights reserved.
*/

export function setupSearch() {
  const searchInput = document.getElementById("search-input");
  const mobileSearchInput = document.getElementById("mobile-search-input");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterProductsBySearch(searchTerm);
    });
  }

  if (mobileSearchInput) {
    mobileSearchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();
      filterProductsBySearch(searchTerm);
    });
  }
}

function filterProductsBySearch(term) {
  if (term.length === 0) {
    filteredProducts = [...products];
  } else {
    filteredProducts = products.filter(
      (product) =>
        product.name.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    );
  }
  filterProducts(); // This will apply all active filters including search
}
