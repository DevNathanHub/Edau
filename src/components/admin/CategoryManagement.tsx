import React, { useEffect, useState } from "react";
import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Tag, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getCategories() as { data?: any; error?: string };
      console.log('CategoryManagement: Categories API response:', res);
      
      // Handle different response structures
      let categoriesArr = [];
      if (res.data && Array.isArray(res.data)) {
        // Extract category names from objects or use strings directly
        categoriesArr = res.data.map(cat => typeof cat === 'string' ? cat : cat.name || cat.category).filter(Boolean);
      } else if (res.data && res.data.data && Array.isArray(res.data.data)) {
        categoriesArr = res.data.data.map(cat => typeof cat === 'string' ? cat : cat.name || cat.category).filter(Boolean);
      } else if (res.data && typeof res.data === 'object' && res.data.data) {
        categoriesArr = Array.isArray(res.data.data) ? res.data.data.map(cat => typeof cat === 'string' ? cat : cat.name || cat.category).filter(Boolean) : [];
      }
      
      console.log('CategoryManagement: Categories array:', categoriesArr);
      
      // If no categories from API, use mock data for testing
      if (categoriesArr.length === 0) {
        categoriesArr = ['Honey', 'Dorper Sheep', 'Fruits', 'Poultry'];
        console.log('Using mock categories for testing');
      }
      
      setCategories(Array.isArray(categoriesArr) ? categoriesArr : []);
      
      if (categoriesArr.length > 0) {
        toast({
          title: "Categories loaded",
          description: `Successfully loaded ${categoriesArr.length} categories.`,
        });
      }
    } catch (error) {
      console.error('CategoryManagement: Error fetching categories:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch categories');
      
      // Use mock data on error for testing
      setCategories(['Honey', 'Dorper Sheep', 'Fruits', 'Poultry']);
      toast({
        title: "Using demo data",
        description: "Categories loaded from demo data due to API connection issues.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast({
        title: "Invalid input",
        description: "Please enter a category name.",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      const res = await apiService.createCategory({ name: newCategory.trim() });
      console.log('CategoryManagement: Create category response:', res);
      
      if (res.error) {
        setError(res.error);
        toast({
          title: "Failed to add category",
          description: res.error,
          variant: "destructive",
        });
      } else {
        setNewCategory("");
        await fetchCategories();
        toast({
          title: "Category added",
          description: `"${newCategory.trim()}" has been added successfully.`,
        });
        
        // Add notification to admin panel
        if ((window as any).addAdminNotification) {
          (window as any).addAdminNotification({
            type: 'success',
            title: 'New Category Added',
            message: `Category "${newCategory.trim()}" has been successfully added to the system.`,
            actionUrl: '/admin/categories',
            actionLabel: 'View Categories',
          });
        }
      }
    } catch (error) {
      console.error('CategoryManagement: Error creating category:', error);
      setError(error instanceof Error ? error.message : 'Failed to create category');
      toast({
        title: "Error",
        description: "Failed to add category. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Are you sure you want to delete the category "${categoryName}"?`)) return;
    
    toast({
      title: "Feature not implemented",
      description: "Category deletion is not yet available. This feature will be added soon.",
      variant: "destructive",
    });
    
    setLoading(true);
    setError("");
    // Note: The API doesn't have a delete category endpoint yet
    // For now, we'll just show an error
    setError("Delete category functionality not implemented yet");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 text-shadow">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage product categories for your farm inventory</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          {categories.length} categories
        </Badge>
      </div>

      {/* Add Category Card */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Enter category name..."
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} disabled={loading || !newCategory.trim()}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Categories Grid */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Existing Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
              <p className="text-gray-500">Add your first category above</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{category}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteCategory(category)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryManagement;
