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
    const res = await apiService.getGallery();
    if (res.error) setError(res.error);
    setImages((res.data as any)?.data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    const res = await apiService.uploadGalleryImage(formData);
    if (res.error) setError(res.error);
    await fetchImages();
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this image?")) return;
    setLoading(true);
    setError("");
    const res = await apiService.deleteGalleryImage(id);
    if (res.error) setError(res.error);
    await fetchImages();
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-2">Gallery Management</h2>
      <p className="mb-4">Upload, view, and delete gallery images. Images are stored in Cloudinary.</p>
      <div className="mb-6 flex gap-4 items-center">
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleUpload} disabled={uploading} />
        <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload Image"}
        </Button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div>Loading gallery...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map(img => (
            <Card key={img.id || img._id}>
              <CardHeader>
                <CardTitle>{img.original_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={img.url} alt={img.original_name} className="w-full h-48 object-cover rounded mb-2" />
                <div className="text-xs text-gray-500 mb-2">Uploaded: {new Date(img.created_at).toLocaleString()}</div>
                <Badge variant="secondary">{img.public_id}</Badge>
              </CardContent>
              <CardFooter className="justify-end">
                <Button size="sm" variant="destructive" onClick={() => handleDelete(img.id || img._id)}>
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
