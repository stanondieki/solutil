import { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CloudinaryUploadProps {
  onUploadComplete: (urls: string[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  folder?: string;
  className?: string;
  children?: React.ReactNode;
}

export default function CloudinaryUpload({
  onUploadComplete,
  maxFiles = 1,
  allowedTypes = ['image'],
  folder = 'services',
  className = "",
  children
}: CloudinaryUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      
      if (maxFiles === 1) {
        formData.append('image', files[0]);
      } else {
        Array.from(files).forEach((file) => {
          formData.append('images', file);
        });
      }

      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const endpoint = maxFiles === 1 ? '/api/upload/profile-picture' : '/api/upload/service-images';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const data = await response.json();
      
      if (data.status === 'success') {
        if (maxFiles === 1) {
          onUploadComplete([data.data.image.url]);
          toast.success('Image uploaded successfully!');
        } else {
          const urls = data.data.images.map((img: any) => img.url);
          onUploadComplete(urls);
          toast.success(`${urls.length} images uploaded successfully!`);
        }
      } else {
        throw new Error(data.message || 'Upload failed');
      }

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  return (
    <div
      className={`relative ${className}`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
    >
      <input
        type="file"
        accept="image/*"
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        disabled={uploading}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
      />
      
      {children || (
        <div className={`
          border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
          hover:border-orange-500 transition-colors duration-200
          ${uploading ? 'bg-gray-100' : 'hover:bg-orange-50'}
        `}>
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-sm text-gray-600">Uploading...</p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="text-sm text-gray-600">
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500 mt-1">
                  {maxFiles > 1 ? `Up to ${maxFiles} images` : 'Single image'}
                  {' • '}PNG, JPG, WebP up to 10MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Utility function to delete images
export const deleteCloudinaryImage = async (publicId: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`/api/upload/${publicId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Delete failed');
    }

    const data = await response.json();
    if (data.status === 'success') {
      toast.success('Image deleted successfully');
      return true;
    } else {
      throw new Error(data.message || 'Delete failed');
    }
  } catch (error: any) {
    console.error('Delete error:', error);
    toast.error(error.message || 'Failed to delete image');
    return false;
  }
};

// Image display component with optimization
interface OptimizedImageProps {
  src: string;
  alt: string;
  size?: 'thumbnail' | 'medium' | 'large' | 'original';
  className?: string;
  variants?: {
    original: string;
    thumbnail: string;
    medium: string;
    large: string;
  };
}

export function OptimizedImage({ 
  src, 
  alt, 
  size = 'medium', 
  className = "",
  variants 
}: OptimizedImageProps) {
  // Use optimized variant if available
  const imageUrl = variants ? variants[size] : src;

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={(e) => {
        // Fallback to original if optimized version fails
        if (variants && imageUrl !== variants.original) {
          (e.target as HTMLImageElement).src = variants.original;
        }
      }}
    />
  );
}