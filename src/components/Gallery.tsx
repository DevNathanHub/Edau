
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Share2, Eye, EyeOff, Trash2, Upload, Heart, MessageCircle, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
import MasonryLayout from '@/components/ui/masonry';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GalleryImage {
  id: string;
  _id?: string;
  url: string;
  public_id: string;
  original_name: string;
  uploaded_by?: string;
  created_at: string;
  isPublic?: boolean;
}

const Gallery = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [columnCount, setColumnCount] = useState(3);
  
  // Responsive column count
  useEffect(() => {
    const updateColumnCount = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setColumnCount(1); // Mobile: 1 column for larger images
      } else if (width < 1024) {
        setColumnCount(2); // Tablet: 2 columns
      } else {
        setColumnCount(3); // Desktop: 3 columns
      }
    };

    updateColumnCount();
    window.addEventListener('resize', updateColumnCount);
    return () => window.removeEventListener('resize', updateColumnCount);
  }, []);
  
  // Fetch gallery images
  const { data: galleryImages = [], isLoading, error, refetch } = useQuery<GalleryImage[]>({
    queryKey: ['galleryImages'],
    queryFn: async (): Promise<GalleryImage[]> => {
      try {
        setFetchError(null);
        const response = await apiService.getGallery();
        if (response.error) {
          setFetchError(response.error);
          return [];
        }
        return (response.data as GalleryImage[]) || [];
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        setFetchError(error instanceof Error ? error.message : 'Failed to load gallery');
        return [];
      }
    },
    enabled: true,
  });
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !isAdmin) {
      toast({
        title: "Access denied",
        description: "Only administrators can upload images",
        variant: "destructive",
      });
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiService.uploadGalleryImage(formData);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Upload successful",
        description: "Image has been uploaded to the gallery",
      });

      // Reset file input
      e.target.value = '';

      // Refresh gallery
      refetch();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteImage = async (id: string) => {
    if (!isAdmin) {
      toast({
        title: "Access denied",
        description: "Only administrators can delete images",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await apiService.deleteGalleryImage(id);

      if (response.error) {
        throw new Error(response.error);
      }

      toast({
        title: "Image deleted",
        description: "The image has been removed from the gallery",
      });

      // Refresh gallery
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async (image: GalleryImage) => {
    // Note: This would require an additional API endpoint to update image visibility
    // For now, we'll show a placeholder message
    toast({
      title: "Feature coming soon",
      description: "Image visibility toggle will be available in the next update",
    });
  };
  
  const handleShareImage = (url: string) => {
    // Copy URL to clipboard
    navigator.clipboard.writeText(url);
    
    toast({
      title: "URL copied",
      description: "Image URL has been copied to your clipboard",
    });
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }
  
  if (fetchError) {
    return (
      <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 mb-2">Failed to load gallery images</p>
        <p className="text-red-500 text-sm">{fetchError}</p>
        <Button 
          onClick={() => refetch()} 
          className="mt-4 bg-red-600 hover:bg-red-700"
        >
          Try Again
        </Button>
      </div>
    );
  }
  
  return (
    <div className="py-6 md:py-8 px-4 md:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl md:text-2xl font-bold">Farm Gallery</h2>
        
        {isAdmin && (
          <div className="relative w-full sm:w-auto">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleUpload}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button 
              className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              disabled={isUploading}
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Image"}
            </Button>
          </div>
        )}
      </div>
      
      {galleryImages.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No images in the gallery yet.</p>
          {isAdmin && (
            <p className="mt-2 text-gray-400">Upload images to populate the gallery.</p>
          )}
        </div>
      ) : (
        <MasonryLayout columnCount={columnCount} gap={16}>
          {galleryImages.map((image) => (
            <Card key={image.id || image._id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-0 shadow-md">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative cursor-pointer overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.original_name || 'Gallery image'}
                      className="object-cover w-full h-auto transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {/* Pinterest-style overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white text-gray-800 rounded-full h-10 w-10 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShareImage(image.url);
                          }}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white text-gray-800 rounded-full h-10 w-10 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Add to favorites functionality could be added here
                          }}
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="bg-white/90 hover:bg-white text-gray-800 rounded-full h-10 w-10 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Comment functionality could be added here
                          }}
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {/* Image info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-sm font-medium truncate">
                        {image.original_name || 'Gallery Image'}
                      </p>
                      <p className="text-white/80 text-xs">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-auto p-4 md:p-6">
                  <DialogHeader className="space-y-2 md:space-y-3">
                    <DialogTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-lg md:text-xl">
                      <span className="truncate">{image.original_name || 'Gallery Image'}</span>
                      <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShareImage(image.url)}
                          className="flex-1 sm:flex-none"
                        >
                          <Share2 className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                          Share
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(image.url, '_blank')}
                          className="flex-1 sm:flex-none"
                        >
                          <ExternalLink className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                          View Full Size
                        </Button>
                      </div>
                    </DialogTitle>
                    <DialogDescription className="text-sm md:text-base">
                      Uploaded on {new Date(image.created_at).toLocaleDateString()}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col space-y-4 mt-4">
                    <div className="overflow-hidden rounded-md">
                      <img
                        src={image.url}
                        alt={image.original_name || 'Gallery image'}
                        className="object-contain max-h-[60vh] md:max-h-[70vh] w-full"
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Admin controls - only show for admin users */}
              {isAdmin && (
                <CardContent className="p-3 bg-white">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-gray-800">
                        {image.original_name || 'Gallery Image'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(image.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleShareImage(image.url)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleVisibility(image)}>
                          {image.isPublic ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" />
                              Make Private
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" />
                              Make Public
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteImage(image.id || image._id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </MasonryLayout>
      )}
    </div>
  );
};

export default Gallery;
