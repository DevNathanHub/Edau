
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Share2, Eye, EyeOff, Trash2, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/lib/api';
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
  url: string;
  public_id: string;
  original_name: string;
  uploaded_by?: string;
  created_at: string;
}

const Gallery = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  // Fetch gallery images
  const { data: galleryImages = [], isLoading, refetch } = useQuery({
    queryKey: ['galleryImages'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/gallery', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        return data.data || [];
      } catch (error) {
        console.error('Error fetching gallery images:', error);
        return [];
      }
    },
    enabled: true,
  });
  
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to upload images",
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

      const response = await fetch('/api/gallery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

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
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteImage = async (publicId: string) => {
    if (!confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/gallery/${publicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
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
        description: "Please try again later",
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
  
  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Farm Gallery</h2>
        
        {user && (
          <div className="relative">
            <input
              type="file"
              id="image-upload"
              accept="image/*"
              onChange={handleUpload}
              className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
            <Button 
              className="bg-green-600 hover:bg-green-700"
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
          {user && (
            <p className="mt-2 text-gray-400">Upload images to populate the gallery.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <Dialog>
                <DialogTrigger asChild>
                  <div className="relative aspect-square cursor-pointer">
                    <img
                      src={image.url}
                      alt={image.original_name || 'Gallery image'}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Image Preview</DialogTitle>
                    <DialogDescription>
                      View and share this gallery image
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col space-y-4">
                    <div className="overflow-hidden rounded-md">
                      <img
                        src={image.url}
                        alt={image.original_name || 'Gallery image'}
                        className="object-contain max-h-[60vh] w-full"
                      />
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">
                        Uploaded: {new Date(image.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShareImage(image.url)}
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <p className="text-sm font-medium truncate">
                    {image.original_name || 'Gallery Image'}
                  </p>
                  
                  {user && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
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
                          onClick={() => handleDeleteImage(image.public_id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
