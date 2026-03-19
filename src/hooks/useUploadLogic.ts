import { useState } from "react";
import supabase from "@/config/supabase";
import api from "@/lib/api";
import { toast } from "sonner";

export const useUploadLogic = (onSuccess?: () => void) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; url: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, materialType: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let newUploads: { name: string; url: string }[] = [];

    // Simulate progress while actually uploading sequentially
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => (prev >= 90 ? 90 : prev + 10));
    }, 200);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // PDF restriction for specific types
      const pdfOnlyTypes = ['Notes', 'Book', 'Past Paper'];
      if (pdfOnlyTypes.includes(materialType) && file.type !== 'application/pdf') {
        toast.error(`File ${file.name} must be a PDF for ${materialType}`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`File ${file.name} is larger than 50MB`);
        continue;
      }

      const fd = new FormData();
      fd.append('file', file);

      try {
        const res = await api.post('/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newUploads.push({ name: file.name, url: res.data.url });
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    clearInterval(progressInterval);
    setUploadProgress(100);
    setUploading(false);
    setTimeout(() => setUploadProgress(0), 1000);

    if (newUploads.length > 0) {
      setUploadedFiles(prev => [...prev, ...newUploads]);
      toast.success(`${newUploads.length} file(s) uploaded successfully`);
      return newUploads;
    }
    return [];
  };

  return {
    uploading,
    uploadProgress,
    uploadedFiles,
    setUploadedFiles,
    isSubmitting,
    setIsSubmitting,
    handleFileUpload,
  };
};
