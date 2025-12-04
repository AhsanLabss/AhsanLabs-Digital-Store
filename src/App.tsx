import { useState, useEffect } from 'react';
import { getCart } from './utils/localStorage';
import { ThemeProvider } from './context/ThemeContext';
import { Header } from './components/Header';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { ComparisonModal } from './components/ComparisonModal';
import { CartModal } from './components/CartModal';
import { LandingPage } from './pages/LandingPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

type Page = 'landing' | 'products' | 'product-detail';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleProductClick = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentPage('product-detail');
    window.scrollTo(0, 0);
  };

  const handleViewProducts = () => {
    setCurrentPage('products');
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (currentPage === 'product-detail') {
      setCurrentPage('products');
    } else {
      setCurrentPage('landing');
    }
    window.scrollTo(0, 0);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen relative overflow-x-hidden">
        <div
          className="fixed w-6 h-6 rounded-full border-2 border-blue-500 pointer-events-none z-[100] transition-transform duration-100 ease-out hidden lg:block"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />

        <Header
          onCartClick={() => setShowCart(true)}
          onCompareClick={() => setShowComparison(true)}
        />

        {currentPage === 'landing' && (
          <LandingPage
            onProductClick={handleProductClick}
            onViewProducts={handleViewProducts}
          />
        )}

        {currentPage === 'products' && (
          <ProductsPage onProductClick={handleProductClick} />
        )}

        {currentPage === 'product-detail' && selectedProductId && (
          <ProductDetailPage
            productId={selectedProductId}
            onBack={handleBack}
          />
        )}

        <ComparisonModal
          isOpen={showComparison}
          onClose={() => setShowComparison(false)}
          onProductClick={handleProductClick}
        />

        <CartModal
          isOpen={showCart}
          onClose={() => setShowCart(false)}
        />

        <FloatingWhatsApp
          phoneNumber="923350"
          message="Hi! I'm interested in your digital products"
        />
      </div>
    </ThemeProvider>
  );
}

export default App;
