# TODO: Implement Pagination on ProductsPage

## Steps to Complete:
- [x] Modify the filtering useEffect to set displayedProducts to the first visibleCount items from filteredProducts
- [x] Add a new useEffect to update displayedProducts when visibleCount changes
- [x] Reset visibleCount to 8 whenever filters (category or search) change
- [x] Update the product grid to render displayedProducts instead of filteredProducts
- [x] Add a "Load More" button below the product grid if there are more products to load
- [x] Implement the button click handler to increment visibleCount by 8
- [x] Test the pagination functionality and ensure filtering works correctly with pagination
