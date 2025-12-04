import { useState, useEffect } from 'react';
import { Product } from '../types/product';

const API_URL = 'http://localhost:5000/api/products';

function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedProduct, setEditedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProducts = async (updatedProducts: Product[]) => {
    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProducts),
      });
      if (response.ok) {
        setProducts(updatedProducts);
        alert('Products updated successfully!');
      } else {
        alert('Error updating products');
      }
    } catch (error) {
      console.error('Error saving products:', error);
      alert('Error saving products');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setEditedProduct({ ...product });
  };

  const handleSaveEdit = () => {
    if (!editedProduct) return;
    const updatedProducts = products.map(p =>
      p.id === editedProduct.id ? editedProduct : p
    );
    saveProducts(updatedProducts);
    setEditingId(null);
    setEditedProduct(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditedProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updatedProducts = products.filter(p => p.id !== id);
      saveProducts(updatedProducts);
    }
  };

  const handleAddNew = () => {
    const newId = (products.length + 1).toString();
    const newProduct: Product = {
      id: newId,
      name: '',
      description: '',
      price: 0,
      originalPrice: 0,
      image: '',
      category: '',
      rating: 0,
      reviews: 0,
      features: [],
      offerEndsAt: '',
      inStock: true,
      whatsappNumber: '',
      whatsappMessage: '',
      productlink: '',
      is_scratch: false,
      scratch_disc: 0,
    };
    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    setEditingId(newId);
    setEditedProduct({ ...newProduct });
  };

  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset all products to default (empty array)?')) {
      saveProducts([]);
    }
  };

  const handleFieldChange = (field: keyof Product, value: any) => {
    if (!editedProduct) return;
    setEditedProduct({ ...editedProduct, [field]: value });
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Product Admin Panel</h1>

      <div className="mb-4 flex gap-4">
        <button
          onClick={handleAddNew}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Add New Product
        </button>
        <button
          onClick={handleResetToDefault}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Reset to Default
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Price</th>
              <th className="border border-gray-300 p-2">Original Price</th>
              <th className="border border-gray-300 p-2">Category</th>
              <th className="border border-gray-300 p-2">In Stock</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 p-2">{product.id}</td>
                <td className="border border-gray-300 p-2">
                  {editingId === product.id ? (
                    <input
                      type="text"
                      value={editedProduct?.name || ''}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    product.name
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedProduct?.price || 0}
                      onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    `$ ${product.price.toFixed(2)}`
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedProduct?.originalPrice || 0}
                      onChange={(e) => handleFieldChange('originalPrice', parseFloat(e.target.value))}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    `PKR ${product.originalPrice.toFixed(2)}`
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editingId === product.id ? (
                    <input
                      type="text"
                      value={editedProduct?.category || ''}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      className="w-full p-1 border rounded"
                    />
                  ) : (
                    product.category
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editingId === product.id ? (
                    <input
                      type="checkbox"
                      checked={editedProduct?.inStock || false}
                      onChange={(e) => handleFieldChange('inStock', e.target.checked)}
                    />
                  ) : (
                    product.inStock ? 'Yes' : 'No'
                  )}
                </td>
                <td className="border border-gray-300 p-2">
                  {editingId === product.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveEdit}
                        disabled={saving}
                        className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                      >
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:bg-yellow-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingId && editedProduct && (
        <div className="mt-8 p-4 border rounded bg-gray-50">
          <h2 className="text-xl font-bold mb-4">Edit Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={editedProduct.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full p-2 border rounded"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price</label>
              <input
                type="number"
                step="0.01"
                value={editedProduct.price}
                onChange={(e) => handleFieldChange('price', parseFloat(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Original Price</label>
              <input
                type="number"
                step="0.01"
                value={editedProduct.originalPrice}
                onChange={(e) => handleFieldChange('originalPrice', parseFloat(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <input
                type="text"
                value={editedProduct.image}
                onChange={(e) => handleFieldChange('image', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating</label>
              <input
                type="number"
                step="0.1"
                value={editedProduct.rating}
                onChange={(e) => handleFieldChange('rating', parseFloat(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Reviews</label>
              <input
                type="number"
                value={editedProduct.reviews}
                onChange={(e) => handleFieldChange('reviews', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Offer Ends At</label>
              <input
                type="datetime-local"
                value={editedProduct.offerEndsAt ? new Date(editedProduct.offerEndsAt).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleFieldChange('offerEndsAt', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={editedProduct.whatsappNumber}
                onChange={(e) => handleFieldChange('whatsappNumber', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">WhatsApp Message</label>
              <input
                type="text"
                value={editedProduct.whatsappMessage}
                onChange={(e) => handleFieldChange('whatsappMessage', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Product Link</label>
              <input
                type="text"
                value={editedProduct.productlink}
                onChange={(e) => handleFieldChange('productlink', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Is Scratch</label>
              <input
                type="checkbox"
                checked={editedProduct.is_scratch}
                onChange={(e) => handleFieldChange('is_scratch', e.target.checked)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scratch Discount</label>
              <input
                type="number"
                value={editedProduct.scratch_disc}
                onChange={(e) => handleFieldChange('scratch_disc', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Special Code</label>
              <input
                type="text"
                value={editedProduct.specialcode || ''}
                onChange={(e) => handleFieldChange('specialcode', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Special Discount</label>
              <input
                type="number"
                value={editedProduct.specialdisc || 0}
                onChange={(e) => handleFieldChange('specialdisc', parseInt(e.target.value))}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Scratch Coupon</label>
              <input
                type="text"
                value={editedProduct.scratch_coupon || ''}
                onChange={(e) => handleFieldChange('scratch_coupon', e.target.value)}
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Features (comma-separated)</label>
              <textarea
                value={editedProduct.features.join(', ')}
                onChange={(e) => handleFieldChange('features', e.target.value.split(',').map(s => s.trim()))}
                className="w-full p-2 border rounded"
                rows={2}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
