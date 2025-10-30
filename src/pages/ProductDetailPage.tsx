import { useEffect, useState } from 'react';
import { Product, Coupon, CartItem } from '../types/product';
import { Rating } from '../components/Rating';
import { CountdownTimer } from '../components/CountdownTimer';
import { ShareButtons } from '../components/ShareButtons';
import { Modal } from '../components/Modal';
import { ScratchCard } from '../components/ScratchCard';
import { Confetti } from '../components/Confetti';
import { ArrowLeft, Check, Copy, Eye, Sparkles } from 'lucide-react';
import { getRating, saveRating, addToCart, getCart } from '../utils/localStorage';

interface ProductDetailPageProps {
  productId: string;
  onBack: () => void;
}

const COUPONS: Coupon[] = [
  { code: 'AHSANLABSMEGA', discount: 15, type: 'percentage' },
  { code: 'WELCOME10', discount: 10, type: 'percentage' },
  { code: 'MEGA30', discount: 30, type: 'percentage' },
];

export const ProductDetailPage = ({ productId, onBack }: ProductDetailPageProps) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [finalPrice, setFinalPrice] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [showScratchCard, setShowScratchCard] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [downloadLink, setDownloadLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [discountMessage, setDiscountMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setError('');
    fetch('/products.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch products');
        return res.json();
      })
      .then((data: Product[]) => {
        const found = data.find((p) => p.id === productId);
        if (found) {
          setProduct(found);
          setFinalPrice(found.price);
          setUserRating(getRating(productId));
        } else {
          setError(`Product with ID ${productId} not found`);
        }
      })
      .catch((error) => {
        console.error('Error fetching products:', error);
        setError('Failed to load product data. Please try again later.');
      });
  }, [productId]);

  const applyCoupon = (coupon: Coupon) => {
    if (appliedCoupon) return;

    setAppliedCoupon(coupon);
    const discount = (product!.price * coupon.discount) / 100;
    const newFinalPrice = product!.price - discount;
    setFinalPrice(newFinalPrice);

    setCouponCode(coupon.code);

    if (coupon.discount === 100) {
      setDownloadLink(`${product!.productlink}`);
      setDiscountMessage(`Congratulations! You've unlocked 100% OFF! Your download link is ready.`);
    } else {
      setDownloadLink('');
      setDiscountMessage(`Success! ${coupon.discount}% OFF applied. Final price: PKR ${newFinalPrice.toFixed(2)}`);
    }

    setShowConfetti(true);
  };

  const handleScratchComplete = () => {
    if (!product?.is_scratch || !product.scratch_coupon || !product.scratch_disc) return;

    const scratchCoupon: Coupon = {
      code: product.scratch_coupon,
      discount: product.scratch_disc,
      type: 'percentage',
    };

    applyCoupon(scratchCoupon);

    setTimeout(() => {
      setShowScratchCard(false);
    }, 1500);
  };

  const handleManualApply = () => {
    setCouponError('');
    if (appliedCoupon) {
      setCouponError('Coupon already applied');
      return;
    }

    const input = couponCode.trim().toLowerCase();
    let coupon = COUPONS.find((c) => c.code.toLowerCase() === input);

    if (!coupon && product?.specialcode?.toLowerCase() === input && product.specialdisc) {
      coupon = { code: product.specialcode, discount: product.specialdisc, type: 'percentage' };
    }

    if (!coupon) {
      setCouponError('Invalid coupon code');
      return;
    }

    applyCoupon(coupon);
  };

  const copyDownloadLink = () => {
    navigator.clipboard.writeText(downloadLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRate = (rating: number) => {
    setUserRating(rating);
    saveRating(productId, rating);
  };

  const handleAddToCart = () => {
    if (!product) return;

    const cartItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: finalPrice,
      image: product.image,
      quantity: 1,
    };

    addToCart(cartItem);
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: getCart().length }));
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 px-4">
        <p className="text-red-500 text-lg text-center font-medium">{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isFree = appliedCoupon?.discount === 100;

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-indigo-50/30 to-white dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-900 text-slate-900 dark:text-slate-100">

        <section className="relative pt-20 pb-12 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/5 dark:via-purple-500/5 dark:to-pink-500/5" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />

          <div className="max-w-7xl mx-auto relative z-10">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium mb-6"
            >
              <ArrowLeft size={20} />
              <span>Back to Products</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {/* IMAGE + PREVIEW */}
              <div className="space-y-6">
                <div
                  className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 cursor-pointer group shadow-xl"
                  onClick={() => setShowPreview(true)}
                >
                  <img
                    src={product.image || '/images/placeholder.png'}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="flex items-center gap-2 text-white opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                      <Eye size={24} />
                      <span>Click to Preview</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="text-indigo-600 dark:text-indigo-400" size={22} />
                    Key Features
                  </h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="text-emerald-500 flex-shrink-0 mt-0.5" size={20} />
                        <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* STICKY PURCHASE CARD */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl p-6 lg:p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
                  <div className="inline-block bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-1.5 rounded-full text-xs font-bold mb-4">
                    {product.category}
                  </div>

                  <h1 className="text-3xl lg:text-4xl font-extrabold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    {product.name}
                  </h1>

                  <div className="flex items-center gap-3 mb-4">
                    <Rating rating={product.rating} size={20} readonly />
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {product.reviews} reviews
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                    {product.description}
                  </p>

                  <CountdownTimer endDate={product.offerEndsAt} />

                  {/* PRICE CARD */}
                  <div className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 mb-6 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="text-4xl font-bold">
                        {isFree ? 'FREE' : `PKR ${appliedCoupon ? finalPrice.toFixed(2) : product.price.toLocaleString()}`}
                      </span>
                      {product.originalPrice > product.price && !isFree && (
                        <span className="text-lg text-slate-500 line-through">
                          PKR {product.originalPrice.toLocaleString()}
                        </span>
                      )}
                      {appliedCoupon && !isFree && (
                        <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                          {appliedCoupon.discount}% OFF
                        </span>
                      )}
                    </div>

                    {discountMessage && (
                      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{discountMessage}</p>
                      </div>
                    )}

                    {/* COUPON INPUT */}
                    {!appliedCoupon && (
                      <div className="space-y-3 mt-4">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            placeholder="Got a coupon? Enter here..."
                            disabled={!!appliedCoupon}
                            className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm disabled:opacity-60"
                          />
                          <button
                            onClick={handleManualApply}
                            disabled={!!appliedCoupon}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-md disabled:opacity-50"
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-red-500 text-sm">{couponError}</p>}

                        {product.is_scratch && !appliedCoupon && (
                          <button
                            onClick={() => setShowScratchCard(true)}
                            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-md flex items-center justify-center gap-2"
                          >
                            <Sparkles size={18} />
                            Scratch & Win Discount!
                          </button>
                        )}
                      </div>
                    )}

                    {/* DOWNLOAD LINK (100% OFF) */}
                    {isFree && downloadLink && (
                      <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl border border-green-200 dark:border-green-800">
                        <p className="text-lg font-bold text-green-800 dark:text-green-300 mb-3 text-center">
                          Your Download Link (100% OFF!)
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={downloadLink}
                            readOnly
                            className="flex-1 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl text-sm font-mono"
                          />
                          <button
                            onClick={copyDownloadLink}
                            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-all hover:scale-105 shadow-md flex items-center gap-2"
                          >
                            {copied ? <Check size={18} /> : <Copy size={18} />}
                            {copied ? 'Copied!' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-3 mb-6">
                    {/* Only show Add to Cart if not free */}
                    {!isFree && (
                      <button
                        onClick={handleAddToCart}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
                      >
                        <ShoppingCart size={24} />
                        Add to Cart
                      </button>
                    )}

                    {/* Only show Buy Now if not free and no download link */}
                    {!isFree && !downloadLink && (
                      <button
                        onClick={() => {
                          const message = `Hi! I want to buy ${product.name} (Price: PKR ${finalPrice.toFixed(2)})`;
                          window.open(`https://wa.me/923343926359?text=${encodeURIComponent(message)}`, '_blank');
                        }}
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg"
                      >
                        <MessageCircle size={24} />
                        Buy Now
                      </button>
                    )}
                  </div>

                  {/* RATING */}
                  <div className="mb-6">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Rate this product:</p>
                    <Rating rating={userRating} size={28} onRate={handleRate} />
                  </div>

                  <ShareButtons url={window.location.href} title={product.name} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* SCRATCH MODAL */}
      <Modal isOpen={showScratchCard} onClose={() => setShowScratchCard(false)} title="Scratch to Win!">
        <div className="flex flex-col items-center p-6">
          <p className="text-center mb-6 text-slate-600 dark:text-slate-400">
            Scratch to reveal your secret discount!
          </p>
          <ScratchCard
            discount={product.scratch_disc}
            onComplete={handleScratchComplete}
          />
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Discount applies automatically!
          </p>
        </div>
      </Modal>

      {/* PREVIEW MODAL */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Product Preview">
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600">
          <img
            src={product.image || '/images/placeholder.png'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <p className="text-white text-6xl font-bold">{product.name[0]}</p>
          </div>
        </div>
        <p className="mt-4 text-center text-slate-600 dark:text-slate-400">
          This is a preview of <span className="font-semibold">{product.name}</span>
        </p>
      </Modal>
    </>
  );
};