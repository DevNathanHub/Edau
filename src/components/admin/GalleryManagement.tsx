import React, { useEffect, useState, useRef } from "react";
import { apiService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const GalleryManagement: React.FC = () => {
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchImages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiService.getGallery();
      if (res.error) {
        setError(res.error);
        setImages([]);
      } else {
        setImages((res.data as any)?.data || []);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
      setError(error instanceof Error ? error.message : 'Failed to load gallery images');
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);
      const res = await apiService.uploadGalleryImage(formData);
      if (res.error) {
        setError(res.error);
      } else {
        await fetchImages();
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this image? This action cannot be undone.")) return;
    setLoading(true);
    setError("");
    try {
      const res = await apiService.deleteGalleryImage(id);
      if (res.error) {
        setError(res.error);
      } else {
        await fetchImages();
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Gallery Management</h2>
      <p className="mb-4">Upload, view, and delete gallery images. Images are stored in Cloudinary.</p>
      <div className="mb-6 flex gap-4 items-center">
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          disabled={uploading} 
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
        />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </div>
      {error && (
        <Card className="border-red-200 bg-red-50 mb-4">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      ) : images.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-gray-500 mb-2">No images in the gallery yet.</p>
            <p className="text-gray-400 text-sm">Upload images to populate the gallery.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(img => (
            <Card key={img.id || img._id}>
              <CardHeader>
                <CardTitle className="text-lg">{img.original_name || 'Gallery Image'}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={img.url} alt={img.original_name} className="w-full h-48 object-cover rounded mb-2" />
                <div className="text-xs text-gray-500 mb-2">
                  Uploaded: {new Date(img.created_at).toLocaleString()}
                </div>
                <Badge variant="secondary" className="text-xs">
                  {img.public_id?.substring(0, 20)}...
                </Badge>
              </CardContent>
              <CardFooter className="justify-end">
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleDelete(img.id || img._id)}
                  disabled={loading}
                >
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
