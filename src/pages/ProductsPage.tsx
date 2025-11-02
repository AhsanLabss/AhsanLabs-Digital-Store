import { useEffect, useState } from 'react';
import { Product } from '../types/product';
import { Rating } from '../components/Rating';
import { Filter, GitCompare, Search, X, Home, Package } from 'lucide-react';
import { addToComparison, getComparisonList } from '../utils/localStorage';

interface ProductsPageProps {
  onProductClick: (productId: string) => void;
}

export const ProductsPage = ({ onProductClick }: ProductsPageProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [comparisonList, setComparisonList] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [visibleCount, setVisibleCount] = useState<number>(8);

  useEffect(() => {
    fetch('/products.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
      });

    setComparisonList(getComparisonList());

    const handleComparisonUpdate = (e: CustomEvent) => {
      setComparisonList(e.detail === 0 ? [] : getComparisonList());
    };

    window.addEventListener('comparisonUpdated', handleComparisonUpdate as EventListener);

    return () => {
      window.removeEventListener('comparisonUpdated', handleComparisonUpdate as EventListener);
    };
  }, []);

  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setVisibleCount(8); // Reset visible count when filters change
  }, [selectedCategory, searchQuery, products]);

  useEffect(() => {
    setDisplayedProducts(filteredProducts.slice(0, visibleCount));
  }, [filteredProducts, visibleCount]);

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const handleAddToComparison = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentList = getComparisonList();
    let updatedList: string[];

    if (currentList.includes(productId)) {
      updatedList = currentList.filter((id) => id !== productId);
    } else {
      if (currentList.length >= 4) return;
      updatedList = [...currentList, productId];
    }

    localStorage.setItem('digital_store_comparison', JSON.stringify(updatedList));
    setComparisonList(updatedList);
    window.dispatchEvent(new CustomEvent('comparisonUpdated', { detail: updatedList.length }));
  };

  const handleClearSearch = () => setSearchQuery('');

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 8);
  };

  return (
    /* FULL-PAGE GRADIENT + ANIMATED BLOBS */
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 text-slate-900 dark:text-slate-100 overflow-hidden">

      {/* Animated Gradient Blobs – Full Page */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* === HERO HEADER === */}
      <section className="relative pt-24 pb-12 px-4 z-10">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
            >
              <Home size={20} />
              <span>Home</span>
            </button>
            <span className="text-slate-400">/</span>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">All Products</span>
          </div>

          {/* Title */}
          <div className="text-center mb-10">
            <h1 className="text-5xl sm:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              All Products
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Explore our complete collection of premium digital tools
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-600 transition-colors" size={22} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all outline-none text-lg shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X size={22} />
                </button>
              )}
            </div>
          </div>

          {/* Sticky Filter Bar */}
          <div className="sticky top-20 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 py-4 -mx-4 px-4 mb-8 shadow-md">
            <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Filter size={20} />
                  <span className="font-semibold">Filter by:</span>
                </div>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              {/* Comparison Counter */}
              <div className="flex items-center gap-2">
                <GitCompare size={20} className="text-slate-600 dark:text-slate-400" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {comparisonList.length > 0 ? (
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-xs font-bold">
                      {comparisonList.length}
                    </span>
                  ) : (
                    '0 items'
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* === PRODUCT GRID === */}
      <section className="relative px-4 pb-24 z-10">
        <div className="max-w-7xl mx-auto">
          {displayedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {displayedProducts.map((product) => {
                  const isInComparison = comparisonList.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => onProductClick(product.id)}
                      className="group bg-white dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-700 dark:to-slate-800">
                        <img
                          src={product.image || '/images/placeholder.png'}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-6xl font-bold text-slate-300 dark:text-slate-600 hidden">
                          {product.name[0]}
                        </div>

                        {/* Comparison Button */}
                        <button
                          onClick={(e) => handleAddToComparison(product.id, e)}
                          disabled={!isInComparison && comparisonList.length >= 4}
                          className={`absolute top-4 left-4 p-2.5 rounded-xl transition-all shadow-lg ${
                            isInComparison
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                              : 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
                          } ${!isInComparison && comparisonList.length >= 4 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={isInComparison ? 'Remove from comparison' : 'Add to comparison'}
                        >
                          <GitCompare size={18} />
                        </button>

                        {/* Discount Badge */}
                        {product.originalPrice > product.price && (
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg animate-pulse">
                            SAVE {Math.round((1 - product.price / product.originalPrice) * 100)}%
                          </div>
                        )}
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-xs font-bold">
                          {product.category}
                        </div>

                        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {product.name}
                        </h3>

                        <div className="flex items-center gap-2">
                          <Rating rating={product.rating} size={16} readonly />
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {product.reviews} reviews
                          </span>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between pt-2">
                          <div>
                            <span className="text-2xl font-bold">PKR {product.price.toLocaleString()}</span>
                            {product.originalPrice > product.price && (
                              <span className="text-sm text-slate-500 line-through ml-2">
                                PKR {product.originalPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          <Package className="text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" size={20} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Load More Button */}
              {filteredProducts.length > displayedProducts.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={handleLoadMore}
                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Load More Products
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="text-center py-24">
              <div className="max-w-md mx-auto">
                <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                  <Package size={48} className="text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-700 dark:text-slate-300">
                  {searchQuery ? `No results for "${searchQuery}"` : 'No products in this category'}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new additions!'}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};