import { useEffect, useState } from 'react';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Product, CartItem } from '../types/product';
import { getCart, removeFromCart, saveCart } from '../utils/localStorage';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartModal = ({ isOpen, onClose }: CartModalProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (isOpen) {
      const cart = getCart();
      setCartItems(cart);

      fetch('/products.json')
        .then((res) => res.json())
        .then((data: Product[]) => {
          setProducts(data);
        });
    }
  }, [isOpen]);

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      const updatedCart = getCart();
      setCartItems(updatedCart);
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart.length }));
      return;
    }

    const updatedCart = cartItems.map(item =>
      item.productId === productId
        ? { ...item, quantity: newQuantity }
        : item
    );
    saveCart(updatedCart);
    setCartItems(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart.length }));
  };

  const removeItem = (productId: string) => {
    removeFromCart(productId);
    const updatedCart = getCart();
    setCartItems(updatedCart);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: updatedCart.length }));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => {
      const product = getProductById(item.productId);
      if (!product) return total;
      const price = item.discountedPrice || product.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;

    let message = 'Hi! I want to buy the following items:\n\n';
    cartItems.forEach(item => {
      const product = getProductById(item.productId);
      if (product) {
        const price = item.discountedPrice || product.price;
        message += `${product.name} (x${item.quantity}) - PKR ${(price * item.quantity).toFixed(2)}\n`;
        if (item.appliedCoupon) {
          message += `  Applied coupon: ${item.appliedCoupon}\n`;
        }
      }
    });
    message += `\nTotal: $ ${getTotalPrice().toFixed(2)}`;

    const whatsappNumber = '923343926359';
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-auto border border-gray-200 dark:border-gray-800 animate-modal-in">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 sm:p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <ShoppingBag size={20} className="text-blue-600 sm:size-24" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Shopping Cart</h2>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400 sm:size-24" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {cartItems.length === 0 ? (
            <div className="text-center py-12 sm:py-20">
              <ShoppingBag size={36} className="text-gray-400 mx-auto mb-4 sm:size-48" />
              <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 mb-2">Your cart is empty</p>
              <p className="text-xs sm:text-sm text-gray-400 dark:text-gray-500">
                Add some products to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => {
                const product = getProductById(item.productId);
                if (!product) return null;

                const price = item.discountedPrice || product.price;
                const itemTotal = price * item.quantity;

                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg sm:text-xl font-bold hidden">
                      {product.name[0]}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400"> $ {price.toFixed(2)} each</p>
                      {item.appliedCoupon && (
                        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400">Coupon: {item.appliedCoupon}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Minus size={14} className="sm:size-16" />
                      </button>
                      <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <Plus size={14} className="sm:size-16" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">PKR {itemTotal.toFixed(2)}</p>
                    </div>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1 sm:p-2 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded transition-colors"
                    >
                      <X size={14} className="sm:size-16" />
                    </button>
                  </div>
                );
              })}

              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 sm:pt-4 mt-4 sm:mt-6">
                <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">PKR {getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-lg mt-4 sm:mt-6"
              >
                <ShoppingBag size={20} className="sm:size-24" />
                Checkout on WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};