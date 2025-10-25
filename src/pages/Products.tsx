
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Droplet, Leaf, Apple, Egg, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { apiService } from "@/lib/api";
import { ProductCardSkeleton } from "@/components/ui/product-skeleton";

// Product categories with their respective icons
const categoryIcons: Record<string, JSX.Element> = {
  "honey": <Droplet className="w-6 h-6 text-amber-500" />,
  "sheep": <Leaf className="w-6 h-6 text-gray-600" />,
  "fruits": <Apple className="w-6 h-6 text-red-500" />,
  "poultry": <Egg className="w-6 h-6 text-yellow-500" />
};

// Function to get card styling based on category and price
const getCardStyling = (category: string, price: number) => {
  const baseClasses = "flex flex-col overflow-hidden hover:shadow-lg transition-all duration-300";
  
  // Price-based styling
  let priceClass = "";
  if (price < 1000) {
    priceClass = "border-green-200 bg-gradient-to-br from-green-50 to-white";
  } else if (price < 5000) {
    priceClass = "border-blue-200 bg-gradient-to-br from-blue-50 to-white";
  } else if (price < 10000) {
    priceClass = "border-purple-200 bg-gradient-to-br from-purple-50 to-white";
  } else if (price < 50000) {
    priceClass = "border-orange-200 bg-gradient-to-br from-orange-50 to-white";
  } else {
    priceClass = "border-red-200 bg-gradient-to-br from-red-50 to-white";
  }
  
  // Category-based styling
  let categoryClass = "";
  switch (category?.toLowerCase()) {
    case 'honey':
      categoryClass = "hover:shadow-amber-200/50";
      break;
    case 'dorper sheep':
    case 'sheep':
      categoryClass = "hover:shadow-gray-200/50";
      break;
    case 'fruits':
      categoryClass = "hover:shadow-red-200/50";
      break;
    case 'poultry':
      categoryClass = "hover:shadow-yellow-200/50";
      break;
    default:
      categoryClass = "hover:shadow-gray-200/50";
  }
  
  return `${baseClasses} ${priceClass} ${categoryClass}`;
};

// Function to get price tag styling
const getPriceTagStyling = (price: number) => {
  if (price < 1000) {
    return "bg-green-100 text-green-800 border-green-300";
  } else if (price < 5000) {
    return "bg-blue-100 text-blue-800 border-blue-300";
  } else if (price < 10000) {
    return "bg-purple-100 text-purple-800 border-purple-300";
  } else if (price < 50000) {
    return "bg-orange-100 text-orange-800 border-orange-300";
  } else {
    return "bg-red-100 text-red-800 border-red-300";
  }
};

// Product interface
interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  category?: string;
  image_url?: string;
  stock: number;
}

// Function to fetch products from backend API
const fetchProducts = async (): Promise<Product[]> => {
  const result = await apiService.getProducts();
  if (result.error) throw new Error(result.error);
  const payload: any = result.data;
  const list = payload?.data || payload || [];
  // Assign categories based on name for icon display
  return (list as any[]).map((product: any) => {
    const base: Product = {
      id: product.id || product._id || product._id?.toString?.(),
      name: product.name,
      price: Number(product.price || 0),
      description: product.description || '',
      image_url: product.image_url || product.image || '',
      stock: Number(product.stock ?? 10),
      category: product.category || undefined,
    };
    let category = base.category || 'poultry';
    const lower = (base.name || '').toLowerCase();
    if (lower.includes('honey')) category = 'honey';
    else if (lower.includes('sheep') || lower.includes('dorper')) category = 'sheep';
    else if (lower.includes('fruit') || lower.includes('apple') || lower.includes('peach')) category = 'fruits';
    return { ...base, category };
  });
};

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const itemsPerPage = 8;
  const queryClient = useQueryClient();
  
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // For MongoDB, we'll use periodic refetching instead of real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }, 30000); // Refetch every 30 seconds

    return () => clearInterval(interval);
  }, [queryClient]);
  
  // Apply all filters and sorting
  const filteredProducts = products.filter(product => {
    // Search filter
    const matchesSearch = searchTerm === '' || 
      (product.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    
    // Price filter
    let matchesPrice = true;
    if (priceRange) {
      const [min, max] = priceRange.split('-').map(p => parseInt(p));
      matchesPrice = product.price >= min && (max ? product.price <= max : true);
    }
    
    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
    // Sorting logic
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      case 'category-asc':
        return (a.category || '').localeCompare(b.category || '');
      case 'category-desc':
        return (b.category || '').localeCompare(a.category || '');
      case 'stock-asc':
        return a.stock - b.stock;
      case 'stock-desc':
        return b.stock - a.stock;
      default:
        return 0;
    }
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, priceRange, sortBy]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category === "all" ? "" : category);
  };

  const handlePriceRangeChange = (range: string) => {
    setPriceRange(range === "any" ? "" : range);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setPriceRange('');
    setSortBy('name-asc');
  };
  
  return (
    <div className="min-h-screen flex flex-col pb-[60px] md:pb-0">
      <Navigation />
      <main className="flex-1 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">Our Farm Products</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our selection of premium farm products, grown and raised with care and sustainable practices.
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="honey">Honey Products</SelectItem>
                    <SelectItem value="sheep">Dorper Sheep</SelectItem>
                    <SelectItem value="fruits">Fresh Fruits</SelectItem>
                    <SelectItem value="poultry">Poultry Products</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={priceRange} onValueChange={handlePriceRangeChange}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Price Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Price</SelectItem>
                    <SelectItem value="0-1000">Under KSh 1,000</SelectItem>
                    <SelectItem value="1000-5000">KSh 1,000 - KSh 5,000</SelectItem>
                    <SelectItem value="5000-10000">KSh 5,000 - KSh 10,000</SelectItem>
                    <SelectItem value="10000-50000">KSh 10,000 - KSh 50,000</SelectItem>
                    <SelectItem value="50000-">Over KSh 50,000</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                    <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                    <SelectItem value="category-desc">Category (Z-A)</SelectItem>
                    <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                    <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                onClick={clearFilters} 
                className="md:w-auto"
                disabled={!searchTerm && !selectedCategory && !priceRange && sortBy === 'name-asc'}
              >
                Clear Filters
              </Button>
            </div>

            {/* Active filters */}
            {(selectedCategory || priceRange || sortBy !== 'name-asc') && (
              <div className="flex flex-wrap gap-2 mt-4 items-center">
                <span className="text-sm text-gray-500">Active filters:</span>
                {selectedCategory && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {selectedCategory === 'all' ? 'All Categories' : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    <button onClick={() => setSelectedCategory('')} className="ml-1 text-gray-400 hover:text-gray-600">
                      ×
                    </button>
                  </Badge>
                )}
                {priceRange && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {priceRange === 'any' && 'Any Price'}
                    {priceRange === '0-1000' && 'Under KSh 1,000'}
                    {priceRange === '1000-5000' && 'KSh 1,000 - KSh 5,000'}
                    {priceRange === '5000-10000' && 'KSh 5,000 - KSh 10,000'}
                    {priceRange === '10000-50000' && 'KSh 10,000 - KSh 50,000'}
                    {priceRange === '50000-' && 'Over KSh 50,000'}
                    <button onClick={() => setPriceRange('')} className="ml-1 text-gray-400 hover:text-gray-600">
                      ×
                    </button>
                  </Badge>
                )}
                {sortBy !== 'name-asc' && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    {sortBy === 'name-asc' && 'Name (A-Z)'}
                    {sortBy === 'name-desc' && 'Name (Z-A)'}
                    {sortBy === 'price-asc' && 'Price (Low to High)'}
                    {sortBy === 'price-desc' && 'Price (High to Low)'}
                    {sortBy === 'category-asc' && 'Category (A-Z)'}
                    {sortBy === 'category-desc' && 'Category (Z-A)'}
                    {sortBy === 'stock-asc' && 'Stock (Low to High)'}
                    {sortBy === 'stock-desc' && 'Stock (High to Low)'}
                    <button onClick={() => setSortBy('name-asc')} className="ml-1 text-gray-400 hover:text-gray-600">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
          
          {/* Product listings */}
          {isLoading ? (
            <>
              <p className="mb-4 text-sm text-gray-500">Loading products...</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array(8).fill(0).map((_, index) => (
                  <ProductCardSkeleton key={index} />
                ))}
              </div>
            </>
          ) : isError ? (
            <div className="text-center text-red-500 py-12">
              <p className="text-xl">Failed to load products. Please try again later.</p>
            </div>
          ) : currentProducts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-xl text-gray-600">No products found matching your criteria.</p>
              <Button onClick={clearFilters} className="mt-4 bg-green-600 hover:bg-green-700">
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <p className="mb-4 text-sm text-gray-500">Showing {currentProducts.length} of {filteredProducts.length} products</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <Card key={product.id} className={getCardStyling(product.category || '', product.price)}>
                    <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100">
                      <img 
                        src={product.image_url || `https://placehold.co/400x300?text=${encodeURIComponent(product.name)}`} 
                        alt={product.name} 
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute top-4 left-4 bg-white rounded-full p-2 shadow-md">
                        {categoryIcons[product.category || "poultry"]}
                      </div>
                      {/* Price tag */}
                      <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold border ${getPriceTagStyling(product.price)}`}>
                        KSh {product.price.toLocaleString()}
                      </div>
                    </Link>
                    <CardHeader className="pb-2">
                      <Link to={`/products/${product.id}`}>
                        <CardTitle className="text-lg hover:text-green-700 transition-colors">{product.name}</CardTitle>
                      </Link>
                      {/* Category badge */}
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {product.category || 'General'}
                        </Badge>
                        {product.stock < 10 && (
                          <Badge variant="destructive" className="text-xs">
                            Low Stock
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="pb-0 flex-grow">
                      <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        {product.stock} {product.stock === 1 ? 'unit' : 'units'} available
                      </div>
                    </CardContent>
                    <CardFooter className="pt-4">
                      <Link to={`/products/${product.id}`} className="w-full">
                        <Button className="w-full bg-green-600 hover:bg-green-700 transition-colors">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          View Product
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </>
          )}
          
          {/* Pagination */}
          {!isLoading && !isError && filteredProducts.length > itemsPerPage && (
            <Pagination className="my-8">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i} className="hidden sm:inline-block">
                    <PaginationLink 
                      isActive={currentPage === i + 1} 
                      onClick={() => handlePageChange(i + 1)}
                      className="cursor-pointer"
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Products;
