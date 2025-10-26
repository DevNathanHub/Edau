import React, { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Filter, Edit, Trash2, Package, DollarSign, Hash, Share2 } from "lucide-react";

const ProductManagement: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({
    name: "",
    price: 0,
    stock: 0,
    category: undefined,
    unit: "",
    availability: true,
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getProducts() as { data?: any; error?: string };
      
      if (res.error) {
        setError(res.error);
        setProducts([]);
        setFilteredProducts([]);
        return;
      }
      
      // Handle different response structures
      let productsArr = [];
      if (res.data && Array.isArray(res.data)) {
        productsArr = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        productsArr = res.data.data;
      } else if (res.data && typeof res.data === 'object' && res.data.data) {
        productsArr = Array.isArray(res.data.data) ? res.data.data : [];
      }
      
      // Ensure we have an array and log for debugging
      const safeProductsArr = Array.isArray(productsArr) ? productsArr : [];
      console.log('Admin ProductManagement: Fetched products:', safeProductsArr.length, 'items');
      console.log('Admin ProductManagement: Raw response:', res);
      
      setProducts(safeProductsArr as Product[]);
      setFilteredProducts(safeProductsArr as Product[]);
    } catch (error) {
      console.error('Admin ProductManagement: Error fetching products:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch products');
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      console.log('ProductManagement: Fetching categories');
      const res = await apiService.getCategories() as { data?: any; error?: string };
      console.log('ProductManagement: Categories API response:', res);
      
      let categoriesArr = [];
      if (res.data && Array.isArray(res.data)) {
        categoriesArr = res.data;
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        categoriesArr = res.data.data;
      } else if (res.data && typeof res.data === 'object' && res.data.data) {
        categoriesArr = Array.isArray(res.data.data) ? res.data.data : [];
      }
      
      console.log('ProductManagement: Categories array:', categoriesArr);
      
      // If no categories from API, use default categories
      if (!categoriesArr || categoriesArr.length === 0) {
        categoriesArr = [
          { id: 'honey', name: 'Honey' },
          { id: 'sheep', name: 'Dorper Sheep' },
          { id: 'fruits', name: 'Fruits' },
          { id: 'poultry', name: 'Poultry' }
        ];
        console.log('ProductManagement: Using default categories:', categoriesArr);
      }
      
      setCategories(Array.isArray(categoriesArr) ? categoriesArr : []);
    } catch (error) {
      console.error('ProductManagement: Error fetching categories:', error);
      // Use default categories on error
      const defaultCategories = [
        { id: 'honey', name: 'Honey' },
        { id: 'sheep', name: 'Dorper Sheep' },
        { id: 'fruits', name: 'Fruits' },
        { id: 'poultry', name: 'Poultry' }
      ];
      setCategories(defaultCategories);
      console.log('ProductManagement: Using default categories due to error:', defaultCategories);
    }
  };

  useEffect(() => {
    console.log('ProductManagement: Filtering effect triggered', { filterCategory, searchTerm, productsLength: products.length });
    let filtered = products;

    // Filter by category
    if (filterCategory !== "all") {
      console.log('ProductManagement: Filtering by category:', filterCategory);
      filtered = filtered.filter(p => {
        const matches = p.category === filterCategory;
        console.log('ProductManagement: Category match check:', { productCategory: p.category, filterCategory, matches });
        return matches;
      });
    }

    // Search by name or tags
    if (searchTerm) {
      console.log('ProductManagement: Filtering by search term:', searchTerm);
      filtered = filtered.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.tags || []).some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    console.log('ProductManagement: Filtered products count:', filtered.length);
    setFilteredProducts(filtered);
  }, [filterCategory, searchTerm, products]);

  const handleOpenModal = (product?: Product) => {
    setEditProduct(product || null);
    setForm(product ? { ...product } : {
      name: "",
      price: 0,
      stock: 0,
      category: categories.length > 0 ? (categories[0].name as Product['category']) : "Honey" as Product['category'],
      unit: "",
      availability: true,
      tags: [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditProduct(null);
    setForm({
      name: "",
      price: 0,
      stock: 0,
      category: categories.length > 0 ? (categories[0].name as Product['category']) : "Honey" as Product['category'],
      unit: "",
      availability: true,
      tags: [],
    });
    setTagInput("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else if (name === "price" || name === "stock") {
      setForm({ ...form, [name]: parseFloat(value) || 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !form.tags?.includes(tagInput.trim())) {
      setForm({ ...form, tags: [...(form.tags || []), tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setForm({ ...form, tags: form.tags?.filter(t => t !== tag) });
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    if (editProduct) {
      // Update
      const res = await apiService.updateProduct(editProduct._id as string, form);
      if (res.error) setError(res.error);
    } else {
      // Create
      const res = await apiService.createProduct(form);
      if (res.error) setError(res.error);
    }
    await fetchProducts();
    handleCloseModal();
    setLoading(false);
  };

  const handleDelete = async (id?: string) => {
    if (!id) {
      setError("Product ID is missing");
      return;
    }

    // Use a more modern confirmation dialog
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?\n\nThis action cannot be undone."
    );

    if (!confirmed) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await apiService.deleteProduct(id);
      if (res.error) {
        setError(res.error);
        console.error("Delete product error:", res.error);
      } else {
        // Success - refresh the products list
        await fetchProducts();
        setSuccess("Product deleted successfully");
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(""), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete product";
      setError(errorMessage);
      console.error("Delete product exception:", error);
    } finally {
      setLoading(false);
    }
  };

  const shareOnWhatsApp = (product: Product) => {
    const productUrl = `${window.location.origin}/products/${product._id}`;
    const message = `Check out this amazing product from Edau Farm!\n\n🏭 *${product.name}*\n📦 Category: ${product.category}\n💰 Price: KSh ${product.price.toLocaleString()}\n📊 Stock: ${product.stock} ${product.unit}\n\n${product.description ? `📝 ${product.description}\n\n` : ''}🔗 View Product: ${productUrl}\n\nOrder now from Edau Farm! 🌾`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getCategoryColor = (category: string) => {
    const cat = category?.toLowerCase() || '';
    switch (cat) {
      case 'honey': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'dorper sheep': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'fruits': return 'bg-red-100 text-red-800 border-red-200';
      case 'poultry': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriceColor = (price: number) => {
    if (price < 1000) return 'text-green-600';
    if (price < 5000) return 'text-blue-600';
    if (price < 10000) return 'text-purple-600';
    if (price < 50000) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-shadow">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your farm products - Honey, Sheep, Fruits, and Poultry</p>
        </div>
        <Button
          className="gradient-primary hover-lift shadow-lg"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="hover-lift">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id || cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredProducts.length} products
            </Badge>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-600">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Products Masonry Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading products...</p>
        </div>
      ) : (
        <>
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredProducts && filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => {
                console.log('ProductManagement: Rendering product:', product);
                return (
                  <Card key={product._id || product.id || `product-${index}`} className="break-inside-avoid hover-lift mb-6">
                    <div className="relative">
                      <img
                        src={product.image_url || product.imageURL?.[0] || `https://placehold.co/300x200?text=${encodeURIComponent(product.name || 'Product')}`}
                        alt={product.name || 'Product'}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => shareOnWhatsApp(product)}
                          title="Share on WhatsApp"
                        >
                          <Share2 className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                          onClick={() => handleOpenModal(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 w-8 p-0"
                          onClick={() => handleDelete(product._id || product.id)}
                          disabled={loading}
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-lg leading-tight">{product.name || 'Unnamed Product'}</CardTitle>
                        <Badge className={`text-xs ${getCategoryColor(product.category || '')}`}>
                          {product.category || 'Uncategorized'}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {product.description || 'No description available'}
                      </CardDescription>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          <DollarSign className={`w-4 h-4 ${getPriceColor(product.price || 0)}`} />
                          <span className={`text-xl font-bold ${getPriceColor(product.price || 0)}`}>
                            KSh {(product.price || 0).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Package className="w-4 h-4" />
                          <span>{product.stock || 0} {product.unit || 'units'}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.tags && product.tags.length > 0 ? (
                          <>
                            {product.tags.slice(0, 3).map((tag, tagIndex) => (
                              <Badge key={tagIndex} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {product.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{product.tags.length - 3}
                              </Badge>
                            )}
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs text-gray-400">
                            No tags
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>SKU: {product.sku || 'N/A'}</span>
                        <span className={(product.availability !== false) ? 'text-green-600' : 'text-red-600'}>
                          {(product.availability !== false) ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="col-span-full">
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-4">
                      {filteredProducts && filteredProducts.length === 0 && products.length > 0 
                        ? "No products match your current filters. Try adjusting your search or filter criteria." 
                        : "No products available. Add your first product to get started."}
                    </p>
                    {filteredProducts && filteredProducts.length === 0 && products.length > 0 && (
                      <Button onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}>
                        Clear Filters
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </>
      )}

      {/* Glassmorphism Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="glassmorphism max-w-2xl max-h-[90vh] overflow-y-auto border-0 shadow-2xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              {editProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {editProduct ? "Update product details" : "Add a new product to your farm inventory"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
              <Input
                name="name"
                value={form.name || ""}
                onChange={handleChange}
                placeholder="e.g., Edau Pure Honey"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
              <Select
                value={form.category || ""}
                onValueChange={(value) => setForm({ ...form, category: value as Product['category'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id || cat.name} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit *</label>
              <Input
                name="unit"
                value={form.unit || ""}
                onChange={handleChange}
                placeholder="e.g., kg, liter, crate, box"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price (KSh) *</label>
              <Input
                name="price"
                type="number"
                step="0.01"
                value={form.price || 0}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
              <Input
                name="stock"
                type="number"
                value={form.stock || 0}
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                value={form.description || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Product description..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">SKU (optional)</label>
              <Input
                name="sku"
                value={form.sku || ""}
                onChange={handleChange}
                placeholder="e.g., HONEY-001"
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Image URL (optional)</label>
              <Input
                name="image_url"
                value={form.image_url || ""}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <div className="flex gap-2 mb-3">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag..."
                  className="flex-1"
                />
                <Button type="button" onClick={handleAddTag} variant="outline">Add</Button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {form.tags?.map(tag => (
                  <Badge key={tag} className="bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer" onClick={() => handleRemoveTag(tag)}>
                    {tag} ×
                  </Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="availability"
                  checked={form.availability !== false}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Product Available for Sale</span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-6 border-t">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            </DialogClose>
            <Button
              className="gradient-primary hover-lift"
              onClick={handleSave}
              disabled={loading}
            >
              {editProduct ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductManagement;