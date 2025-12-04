import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Product } from '../types/product';
import { Rating } from './Rating';
import { getComparisonList, removeFromComparison, clearComparison } from '../utils/localStorage';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductClick: (productId: string) => void;
}

export const ComparisonModal = ({ isOpen, onClose, onProductClick }: ComparisonModalProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [comparisonList, setComparisonList] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      const list = getComparisonList();
      setComparisonList(list);

      fetch('/products.json')
        .then((res) => res.json())
        .then((data: Product[]) => {
          setProducts(data.filter((p) => list.includes(p.id)));
        });
    }
  }, [isOpen]);

  const handleRemove = (productId: string) => {
    removeFromComparison(productId);
    const updatedList = getComparisonList();
    setComparisonList(updatedList);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    window.dispatchEvent(new CustomEvent('comparisonUpdated', { detail: updatedList.length }));
  };

  const handleClearAll = () => {
    clearComparison();
    setComparisonList([]);
    setProducts([]);
    window.dispatchEvent(new CustomEvent('comparisonUpdated', { detail: 0 }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 overflow-auto sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-6xl max-h-[90vh] overflow-auto border border-gray-200 dark:border-gray-800 animate-modal-in">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Compare Products</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Compare up to 4 products side by side</p>
          </div>
          <div className="flex items-center gap-2">
            {products.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-xs sm:text-sm font-medium"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X size={20} className="sm:size-24 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {products.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-2">No products to compare</p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                Add products to comparison from the products page
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] sm:min-w-full">
                <thead>
                  <tr>
                    <th className="text-left p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 font-semibold text-gray-900 dark:text-white text-sm sm:text-base">
                      Feature
                    </th>
                    {products.map((product) => (
                      <th
                        key={product.id}
                        className="p-2 sm:p-4 bg-gray-50 dark:bg-gray-800 min-w-[150px] sm:min-w-[250px] relative"
                      >
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="absolute top-1 sm:top-2 right-1 sm:right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <X size={14} className="sm:size-16" />
                        </button>
                        <div className="h-20 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-3xl sm:text-5xl font-bold mb-2 sm:mb-3">
                          {product.name[0]}
                        </div>
                        <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white mb-1 sm:mb-2">{product.name}</h3>
                        <button
                          onClick={() => {
                            onProductClick(product.id);
                            onClose();
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:underline text-xs sm:text-sm"
                        >
                          View Details
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-2 sm:p-4 font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Category</td>
                    {products.map((product) => (
                      <td key={product.id} className="p-2 sm:p-4 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                        {product.category}
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-2 sm:p-4 font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Price</td>
                    {products.map((product) => (
                      <td key={product.id} className="p-2 sm:p-4">
                        <div className="flex items-baseline gap-1 sm:gap-2">
                          <span className="text-base sm:text-xl font-bold text-gray-900 dark:text-white">
                            $ {product.price}
                          </span>
                          {product.originalPrice > product.price && (
                            <span className="text-xs sm:text-sm text-gray-500 line-through">
                              $ {product.originalPrice}
                            </span>
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-2 sm:p-4 font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Rating</td>
                    {products.map((product) => (
                      <td key={product.id} className="p-2 sm:p-4">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <Rating rating={product.rating} size={14} className="sm:size-16" readonly />
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            ({product.reviews})
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <td className="p-2 sm:p-4 font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Features</td>
                    {products.map((product) => (
                      <td key={product.id} className="p-2 sm:p-4">
                        <ul className="space-y-1 sm:space-y-2">
                          {product.features.slice(0, 5).map((feature, index) => (
                            <li key={index} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                              • {feature}
                            </li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>

                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td className="p-2 sm:p-4 font-semibold text-sm sm:text-base text-gray-900 dark:text-white">Availability</td>
                    {products.map((product) => (
                      <td key={product.id} className="p-2 sm:p-4">
                        <span
                          className={`inline-block px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                            product.inStock
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {product.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};